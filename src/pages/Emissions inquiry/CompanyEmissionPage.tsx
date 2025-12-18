import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Printer, Download, ChevronDown, Search } from "lucide-react";
import KoreaMapChart from "../../components/analysis/KoreaMapChart";

// --- Mock Data ---
// 1. 지도 데이터 (지역별 합계)
const MOCK_MAP_DATA = [
  { region: "경기", value: 25400 },
  { region: "울산", value: 18000 },
  { region: "경상남도", value: 20000 },
  { region: "충청남도", value: 9200 },
  { region: "부산", value: 8100 },
  { region: "서울", value: 5000 },
  { region: "인천", value: 6500 },
  { region: "대구", value: 4200 },
  { region: "경상북도", value: 7800 },
  { region: "전라남도", value: 6300 },
  { region: "전라북도", value: 5100 },
  { region: "충청북도", value: 4800 },
  { region: "강원도", value: 3900 },
];

// 2. 협력사 데이터 (수십 개 시뮬레이션)
const MOCK_COMPANY_DATA = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `협력사 ${String.fromCharCode(65 + (i % 26))}${i}`,
  value: Math.floor(Math.random() * 5000) + 500,
  address: i % 2 === 0 ? "경기도 성남시" : "울산광역시 북구",
  ratio: 0,
})).sort((a, b) => b.value - a.value);

// 총합 → 비율 계산
const totalEmission = MOCK_COMPANY_DATA.reduce(
  (acc, curr) => acc + curr.value,
  0
);
MOCK_COMPANY_DATA.forEach(
  (d) => (d.ratio = parseFloat(((d.value / totalEmission) * 100).toFixed(1)))
);

const CompanyEmissionPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchColumn, setSearchColumn] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );
  const DB_START_YEAR = 2018;

  // --- 연도 옵션 생성 ---
  const yearOptions = useMemo(() => {
    const options = [];
    for (let y = currentYear; y >= DB_START_YEAR; y--) {
      options.push(y.toString());
    }
    return options;
  }, [currentYear]);

  // 필터링 및 정렬
  const filteredData = useMemo(() => {
    let processed = [...MOCK_COMPANY_DATA];

    // 검색
    if (searchQuery) {
      processed = processed.filter((d) => {
        if (searchColumn === "all") {
          return (
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.address.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else if (searchColumn === "name") {
          return d.name.toLowerCase().includes(searchQuery.toLowerCase());
        } else if (searchColumn === "address") {
          return d.address.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      });
    }

    // 정렬
    if (sortConfig) {
      processed.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aVal = (a as any)[sortConfig.key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bVal = (b as any)[sortConfig.key];

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
  }, [searchQuery, searchColumn, sortConfig]);

  // 가로 스크롤 차트 width 계산
  const chartWidth = Math.max(filteredData.length * 60, 900);

  // 정렬 핸들러
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Print & Download 핸들러
  const handlePrint = () => window.print();

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) return;
    const headers = [
      "No",
      "협력사명",
      "탄소배출량 (tCO2eq)",
      "비율 (%)",
      "주소",
    ].join(",");
    const rows = filteredData
      .map((d, idx) => [idx + 1, d.name, d.value, d.ratio, d.address].join(","))
      .join("\n");
    const csvContent = `\ufeff${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `협력사별_탄소배출_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen p-8 font-sans bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-800">
          협력사별 탄소 배출량
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 font-bold text-gray-700 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
          >
            <Printer size={16} className="mr-2" /> Print
          </button>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center px-4 py-2 font-bold text-white transition-colors bg-green-600 rounded-md shadow-sm hover:bg-green-700"
          >
            <Download size={16} className="mr-2" /> Excel
          </button>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="flex gap-6 p-5 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl print:hidden">
        {/* 연도 선택 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-500">▼ 연도 선택</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                if (e.target.value === "all") setSelectedMonth("all");
              }}
              className="w-32 p-2 pr-8 text-sm bg-white border border-gray-300 rounded-md outline-none cursor-pointer"
            >
              <option value="all">전체</option>
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
        {selectedYear !== "all" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-500">▼ 월 선택</label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-32 p-2 pr-8 text-sm bg-white border border-gray-300 rounded-md outline-none cursor-pointer"
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

      {/* ========================== */}
      {/* 1. 상단 지도 (전체폭 + 크게) */}
      {/* ========================== */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10 h-[1200px]">
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          지역별 탄소 배출량
        </h3>
        <KoreaMapChart data={MOCK_MAP_DATA} large />
      </div>

      {/* ========================== */}
      {/* 2. 가로 스크롤 막대 차트 */}
      {/* ========================== */}
      <div className="w-full p-6 mb-10 bg-white border border-gray-200 shadow-sm rounded-xl">
        <h3 className="mb-4 text-lg font-bold text-gray-800">
          협력사별 탄소 배출량 순위
        </h3>

        <div className="pb-4 overflow-x-auto overflow-y-hidden custom-scrollbar">
          <div style={{ width: `${chartWidth}px`, height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip
                  formatter={(val: number | undefined) => val?.toLocaleString()}
                />

                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {filteredData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index < 5 ? "#1d4ed8" : "#60a5fa"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================== */}
      {/* 3. 하단 검색 & 데이터 테이블 */}
      {/* ========================== */}

      {/* 검색바 */}
      <div className="flex items-center gap-3 p-4 mb-6 border border-blue-100 bg-blue-50 rounded-xl print:hidden">
        <span className="font-bold text-blue-700 whitespace-nowrap">
          협력사명 검색
        </span>

        <div className="relative">
          <select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            className="p-2 pr-8 text-sm bg-white border border-blue-200 rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 검색</option>
            <option value="name">협력사명</option>
            <option value="address">주소</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-2 top-1/2"
          />
        </div>

        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="검색어 입력"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-3 text-sm border border-blue-200 rounded-md outline-none pr-9 focus:ring-2 focus:ring-blue-500"
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
          <table className="w-full text-sm text-gray-600">
            <thead className="text-xs font-bold text-gray-700 uppercase border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-16 px-4 py-3 text-center">No.</th>
                <th
                  onClick={() => handleSort("name")}
                  className="px-4 py-3 text-left transition-colors cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    협력사명
                    {sortConfig?.key === "name" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("value")}
                  className="px-4 py-3 text-center transition-colors cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    탄소배출량 (tCO2eq)
                    {sortConfig?.key === "value" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ratio")}
                  className="px-4 py-3 text-center transition-colors cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    비율 (%)
                    {sortConfig?.key === "ratio" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("address")}
                  className="px-4 py-3 text-left transition-colors cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    주소
                    {sortConfig?.key === "address" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-center text-gray-500">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-left text-gray-800">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {row.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-800">
                      {row.ratio}%
                    </td>
                    <td className="px-4 py-3 text-left text-gray-600">
                      {row.address}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
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

export default CompanyEmissionPage;
