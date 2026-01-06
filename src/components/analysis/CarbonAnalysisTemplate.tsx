import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Search,
  Download,
  CheckSquare,
  Square,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Breadcrumb, { type BreadcrumbItem } from "../Breadcrumb";
import type {
  AnalysisColumn,
  AnalysisData,
  ScopeType,
} from "../../types/analysis";
import {
  fetchAnalysisData,
  fetchAvailableYears,
  type AnalysisDataType,
} from "../../apis/emissionsApi";
/* eslint-disable @typescript-eslint/no-explicit-any */

// --- 상수 ---
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];
const LEGEND_MAX_ITEMS = 5;
const LEGEND_ITEM_HEIGHT = 22; // px per legend row
const LEGEND_HEIGHT = LEGEND_MAX_ITEMS * LEGEND_ITEM_HEIGHT; // keep pie chart height stable

// --- 유틸리티 함수 ---
// 탄소 배출량 반올림: 소수점 3째자리에서 반올림하여 2째 자리까지만 표시
const roundEmission = (value: number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  return Math.round(value * 100) / 100;
};

const SCOPE_TABS: { id: ScopeType; label: string }[] = [
  { id: "total", label: "총 배출량" },
  { id: "scope1", label: "Scope 1" },
  { id: "scope3", label: "Scope 3" },
  { id: "기타", label: "기타" },
];

interface CarbonAnalysisTemplateProps {
  title: string;
  hasScopeTabs?: boolean;
  columns: AnalysisColumn[];
  dataType: AnalysisDataType;
  breadcrumbItems?: BreadcrumbItem[];
}

const CarbonAnalysisTemplate: React.FC<CarbonAnalysisTemplateProps> = ({
  title,
  hasScopeTabs = false,
  columns,
  dataType,
  breadcrumbItems,
}) => {
  // --- 상태 관리 ---
  const [data, setData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(false);
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [isYearsLoaded, setIsYearsLoaded] = useState(false); // 연도 로드 완료 플래그

  // 현재 연도를 기본값으로 설정
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string | null>(null); // 초기값을 null로 설정

  const [selectedScope, setSelectedScope] = useState<ScopeType>("total");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchColumn, setSearchColumn] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // 차트 선택 상태 (체크박스)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [chartSearchQuery, setChartSearchQuery] = useState("");

  const componentRef = useRef<HTMLDivElement>(null);

  // --- [API] 연도 목록 로딩 (초기 로드만) ---
  useEffect(() => {
    const loadYears = async () => {
      try {
        const years = await fetchAvailableYears();
        const yearStrings = years
          .sort((a, b) => b - a)
          .map((y) => y.toString());
        setYearOptions(yearStrings);
        // 첫 번째(최신) 연도로 selectedYear 초기화
        if (yearStrings.length > 0) {
          setSelectedYear(yearStrings[0]);
        } else {
          setSelectedYear(currentYear.toString());
        }
      } catch (error) {
        console.error("Failed to load available years:", error);
        // 실패 시 현재 연도만 표시
        setYearOptions([currentYear.toString()]);
        setSelectedYear(currentYear.toString());
      } finally {
        setIsYearsLoaded(true); // 연도 로드 완료 표시
      }
    };
    loadYears();
  }, []); // 마운트 시 한 번만 실행

  // --- [API] 데이터 로딩 ---
  useEffect(() => {
    // selectedYear이 설정될 때까지 대기
    if (!selectedYear || !isYearsLoaded) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // API 호출 (타입, 연도, 월, 스코프 전달)
        const result = await fetchAnalysisData(
          dataType,
          selectedYear,
          selectedMonth,
          selectedScope
        );
        setData(result);

        // 데이터 로드 후 기본 정렬 (totalEmission 기준 내림차순)
        setSortConfig({
          key: "totalEmission",
          direction: "desc",
        });

        // 데이터 로드 후 차트 체크박스 초기화 (상위 3개 자동 선택)
        const top3 = [...result]
          .sort((a, b) => b.totalEmission - a.totalEmission)
          .slice(0, 3)
          .map((d) => d.name);
        setCheckedItems(new Set(top3));
      } catch (error) {
        console.error("Failed to load analysis data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dataType, selectedYear, selectedMonth, selectedScope, isYearsLoaded]); // 필터 변경 시 재호출

  // --- 데이터 필터링 (클라이언트 측 검색/정렬) ---
  const processedData = useMemo(() => {
    let processed = [...data];

    // 검색
    if (searchQuery) {
      processed = processed.filter((item) => {
        if (searchColumn === "all") {
          return Object.entries(item).some(([key, val]) => {
            if (key === "monthlyTrend") return false; // 배열 제외
            if (typeof val === "string" || typeof val === "number") {
              return String(val)
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            }
            return false;
          });
        } else {
          return String((item as any)[searchColumn])
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        }
      });
    }

    // 정렬
    if (sortConfig) {
      processed.sort((a, b) => {
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];

        // 숫자/문자 구분 정렬
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        const strA = String(aVal);
        const strB = String(bVal);
        return sortConfig.direction === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      });
    }

    return processed;
  }, [data, searchQuery, searchColumn, sortConfig]);

  // --- 차트 데이터 가공 ---
  const pieChartData = useMemo(() => {
    return [...processedData].sort((a, b) => b.totalEmission - a.totalEmission);
  }, [processedData]);

  const lineChartData = useMemo(() => {
    if (selectedMonth !== "all") return [];

    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
    return months.map((month, idx) => {
      const row: any = { name: month };
      processedData.forEach((item) => {
        if (checkedItems.has(item.name)) {
          row[item.name] = item.monthlyTrend ? item.monthlyTrend[idx] : 0;
        }
      });
      return row;
    });
  }, [processedData, selectedMonth, checkedItems]);

  // --- 핸들러 ---
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDownloadExcel = () => {
    if (processedData.length === 0) return;
    const headers = columns.map((c) => c.header).join(",");
    const rows = processedData
      .map((d) => columns.map((c) => (d as any)[c.id]).join(","))
      .join("\n");
    const csvContent = `\ufeff${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title}_${selectedYear}.csv`;
    link.click();
  };

  const toggleChartItem = (name: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setCheckedItems(newSet);
  };

  const toggleAllChartItems = (check: boolean) => {
    if (check) setCheckedItems(new Set(processedData.map((d) => d.name)));
    else setCheckedItems(new Set());
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    const sorted = [...payload]
      .sort((a, b) => b.payload.totalEmission - a.payload.totalEmission)
      .slice(0, LEGEND_MAX_ITEMS);

    return (
      <ul
        className="w-full p-0 m-0 text-sm list-none"
        style={{ minHeight: LEGEND_HEIGHT }}
      >
        {sorted.map((entry: any, index: number) => (
          <li
            key={`legend-item-${index}`}
            className="flex items-center gap-2 mb-1.5"
          >
            <span
              style={{ backgroundColor: entry.color }}
              className="block w-3 h-3 rounded-sm"
            />
            <span className="text-gray-700">
              {entry.value} : <b>{entry.payload.ratio}%</b>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // --- 렌더링 ---
  return (
    <div
      ref={componentRef}
      className="min-h-full font-sans bg-gray-50"
      style={{ padding: "var(--padding-responsive)" }}
    >
      {/* 브레드크럼 */}
      {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}

      {/* 헤더 */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "var(--spacing-lg)" }}
      >
        <h2
          className="font-bold text-gray-800"
          style={{ fontSize: "clamp(1.5rem, 2vw, 1.75rem)" }}
        >
          {title}
        </h2>
        <div className="flex" style={{ gap: "var(--spacing-sm)" }}>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center font-bold text-white transition-colors bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            style={{
              padding: "var(--spacing-xs) var(--spacing-sm)",
              fontSize: "var(--text-base)",
            }}
          >
            <Download size={16} style={{ marginRight: "var(--spacing-xs)" }} />{" "}
            Excel
          </button>
        </div>
      </div>

      {/* Scope 탭 */}
      {hasScopeTabs && (
        <div
          className="flex border-b border-gray-200"
          style={{ marginBottom: "var(--spacing-lg)" }}
        >
          {SCOPE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedScope(tab.id)}
              className={`
                border-b-2 font-medium transition-colors
                ${
                  selectedScope === tab.id
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }
              `}
              style={{
                padding: "var(--spacing-xs) var(--spacing-md)",
                fontSize: "var(--text-base)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 필터 영역 */}
      <div
        className="flex flex-wrap bg-white border border-gray-100 shadow-sm rounded-xl"
        style={{
          gap: "var(--spacing-md)",
          padding: "var(--spacing-md)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        {/* 연도 선택 */}
        <div className="flex flex-col" style={{ gap: "var(--spacing-xs)" }}>
          <label
            className="font-bold text-gray-500"
            style={{ fontSize: "var(--text-sm)" }}
          >
            ▼ 연도 선택
          </label>
          <div className="relative">
            <select
              value={selectedYear || ""}
              onChange={(e) => {
                setSelectedYear(e.target.value);
              }}
              className="bg-white border border-gray-300 rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
              style={{
                width: "clamp(7rem, 10vw, 8rem)",
                padding: "var(--spacing-xs)",
                paddingRight: "var(--spacing-lg)",
                fontSize: "var(--text-base)",
              }}
            >
              {/* <option value="">선택 중...</option> */}
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2"
            />
          </div>
        </div>

        {/* 월 선택 */}
        {selectedYear && (
          <div className="flex flex-col" style={{ gap: "var(--spacing-xs)" }}>
            <label
              className="font-bold text-gray-500"
              style={{ fontSize: "var(--text-sm)" }}
            >
              ▼ 월 선택
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-gray-300 rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                style={{
                  width: "clamp(7rem, 10vw, 8rem)",
                  padding: "var(--spacing-xs)",
                  paddingRight: "var(--spacing-lg)",
                  fontSize: "var(--text-base)",
                }}
              >
                <option value="all">전체</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2"
              />
            </div>
          </div>
        )}
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={40} className="text-blue-500 animate-spin" />
        </div>
      )}

      {/* 차트 영역 */}
      {!loading && processedData.length > 0 && (
        <div
          className="flex flex-col lg:flex-row items-stretch"
          style={{
            gap: "var(--spacing-lg)",
            marginBottom: "var(--spacing-xl)",
            height: "32rem",
            maxHeight: "32rem",
            minHeight: "32rem",
          }}
        >
          {/* 파이 차트 */}
          <div
            className={`
                ${selectedMonth === "all" ? "lg:flex-1" : "w-full"} 
                bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative h-full
            `}
            style={{ padding: "var(--spacing-lg)" }}
          >
            <h4 className="absolute text-lg font-bold text-gray-800 top-5 left-5">
              {selectedYear === "all" ? "전체" : selectedYear}년{" "}
              {selectedMonth === "all" ? "연간" : `${selectedMonth}월`} {title}
            </h4>

            {/* 중앙 텍스트 */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-2xl font-bold text-gray-800">100%</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="totalEmission"
                  nameKey="name"
                  cx="50%"
                  cy="52.5%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                >
                  {pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ height: LEGEND_HEIGHT, paddingTop: 8 }}
                  content={<CustomLegend />}
                />
                <RechartsTooltip
                  formatter={(value: any) => [
                    `${parseFloat(
                      roundEmission(value).toFixed(2)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} tCO2eq`,
                    "",
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 라인 차트 */}
          {selectedMonth === "all" && (
            <div className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
              <h4 className="mb-6 text-lg font-bold text-gray-800">
                {selectedYear}년 월별 추이
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#666" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#666" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(value: any) => [
                      parseFloat(
                        roundEmission(value).toFixed(2)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }),
                      "",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  {Array.from(checkedItems).map((key) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={
                        COLORS[
                          data.findIndex((d) => d.name === key) % COLORS.length
                        ]
                      }
                      activeDot={{ r: 6 }}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 차트 컨트롤 사이드바 */}
          {selectedMonth === "all" && (
            <div className="flex flex-col w-full h-full p-4 bg-white border border-gray-100 shadow-sm lg:w-64 rounded-xl">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="항목 검색"
                  value={chartSearchQuery}
                  onChange={(e) => setChartSearchQuery(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search
                  size={16}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-100 rounded-md custom-scrollbar">
                <div
                  className="flex items-center p-2 border-b border-gray-100 cursor-pointer bg-gray-50 hover:bg-gray-100"
                  onClick={() =>
                    toggleAllChartItems(
                      checkedItems.size !== processedData.length
                    )
                  }
                >
                  {checkedItems.size === processedData.length ? (
                    <CheckSquare size={18} className="text-blue-600" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                  <span className="ml-2 text-sm font-bold text-gray-700">
                    전체 선택
                  </span>
                </div>
                {processedData
                  .filter((d) =>
                    d.name
                      .toLowerCase()
                      .includes(chartSearchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <div
                      key={item.name}
                      onClick={() => toggleChartItem(item.name)}
                      className="flex items-center p-2 transition-colors border-b cursor-pointer border-gray-50 hover:bg-gray-50"
                    >
                      {checkedItems.has(item.name) ? (
                        <CheckSquare
                          size={18}
                          style={{
                            color: COLORS[data.indexOf(item) % COLORS.length],
                          }}
                        />
                      ) : (
                        <Square size={18} className="text-gray-300" />
                      )}
                      <span className="ml-2 text-sm text-gray-600">
                        {item.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 데이터 없음 메시지 */}
      {!loading && processedData.length === 0 && (
        <div className="flex items-center justify-center h-125 mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">
              선택기간의 조회된 데이터가 없습니다.
            </p>
          </div>
        </div>
      )}

      {/* 메인 검색바 */}
      <div
        className="flex flex-wrap items-center border border-blue-100 bg-blue-50 rounded-xl"
        style={{
          gap: "var(--spacing-xs)",
          padding: "var(--spacing-sm)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        <span
          className="font-bold text-blue-700 whitespace-nowrap"
          style={{ fontSize: "var(--text-lg)" }}
        >
          {title.split(" ")[0]} {title.split(" ")[1]}
        </span>

        <div className="relative">
          <select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            className="bg-white border border-blue-200 rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
            style={{
              padding: "var(--spacing-xs)",
              paddingRight: "var(--spacing-lg)",
              fontSize: "var(--text-base)",
            }}
          >
            <option value="all">전체 검색</option>
            {columns
              .filter((c) => c.format !== "number" && c.format !== "percent")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.header}
                </option>
              ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-2 top-1/2"
          />
        </div>

        <div className="relative flex-1" style={{ maxWidth: "28rem" }}>
          <input
            type="text"
            placeholder="검색어 입력"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              padding: "var(--spacing-xs)",
              paddingLeft: "var(--spacing-xs)",
              paddingRight: "2.25rem",
              fontSize: "var(--text-base)",
            }}
          />
          <Search
            size={18}
            className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2"
          />
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="overflow-x-auto">
          <table
            className="w-full text-gray-600"
            style={{ fontSize: "var(--text-base)" }}
          >
            <thead
              className="font-bold text-gray-700 uppercase border-b border-gray-200 bg-gray-50"
              style={{ fontSize: "var(--text-sm)" }}
            >
              <tr>
                <th
                  className="text-center"
                  style={{
                    width: "4rem",
                    padding: "var(--spacing-xs) var(--spacing-sm)",
                  }}
                >
                  No.
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    onClick={() => col.sortable && handleSort(col.id)}
                    style={{
                      padding: "var(--spacing-xs) var(--spacing-sm)",
                      width: col.width,
                    }}
                    className={`${
                      col.align === "left" ? "text-left" : "text-center"
                    } ${
                      col.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1 ${
                        col.align === "left"
                          ? "justify-start"
                          : "justify-center"
                      }`}
                    >
                      {col.header}
                      {col.sortable && sortConfig?.key === col.id && (
                        <span>
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processedData.length > 0 ? (
                processedData.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td
                      className="text-center text-gray-500"
                      style={{ padding: "var(--spacing-xs) var(--spacing-sm)" }}
                    >
                      {idx + 1}
                    </td>
                    {columns.map((col) => {
                      const val = (row as any)[col.id];
                      let displayVal = val;

                      // 탄소 배출량 관련 필드 반올림 처리
                      if (
                        col.format === "number" &&
                        (col.id === "totalEmission" || col.id === "avgEmission")
                      ) {
                        const rounded = roundEmission(val);
                        displayVal = parseFloat(
                          rounded.toFixed(2)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        });
                      } else if (col.format === "number") {
                        displayVal = val?.toLocaleString();
                      } else if (col.format === "percent") {
                        displayVal = `${val}%`;
                      }

                      return (
                        <td
                          key={col.id}
                          className={`${
                            col.align === "left" ? "text-left" : "text-center"
                          } text-gray-800`}
                          style={{
                            padding: "var(--spacing-xs) var(--spacing-sm)",
                          }}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarbonAnalysisTemplate;
