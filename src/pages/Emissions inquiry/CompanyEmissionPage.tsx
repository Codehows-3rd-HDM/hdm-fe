import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
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
import { Download, ChevronDown, Search } from "lucide-react";
import KoreaMapChart from "../../components/analysis/KoreaMapChart";
import Breadcrumb from "../../components/Breadcrumb";
import { getBreadcrumbItems } from "../../utils/breadcrumbHelper";

//==================================================================
// 타입 정의 (DTO와 프론트 맞춤)
interface CompanyData {
  id: number;
  name: string; // 백엔드: companyName
  value: number; // 백엔드: totalEmission
  address: string; // 백엔드: address
  ratio: number; // 비율
}

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const CompanyEmissionPage: React.FC = () => {
  const [companyData, setCompanyData] = useState<CompanyData[]>([]); // API 원본 데이터
  const [loading, setLoading] = useState(false);

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
  const [years, setYears] = useState<string[]>([]); // 서버에서 받아올 진짜 목록

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get<number[]>(
          `${BASE_URL}/view/common/years`
        );
        const yearList = response.data;
        if (yearList && yearList.length > 0) {
          const sortedYears = yearList.sort((a, b) => b - a).map(String);
          setYears(sortedYears);
          // 목록에 현재 선택된 연도가 없으면 최신 연도로 강제 변경
          if (!sortedYears.includes(selectedYear)) {
            setSelectedYear(sortedYears[0]);
          }
        }
      } catch (error) {
        console.error("연도 로드 실패", error);
      }
    };
    fetchYears();
  }, [selectedYear]);

  // --- 유틸리티 함수 ---
  // 탄소 배출량 반올림: 소수점 3째자리에서 반올림하여 2째 자리까지만 표시
  const roundEmission = (value: number | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    return Math.round(value * 100) / 100;
  };

  // =================================================================
  // [1] API 데이터 호출 (백엔드 연동)
  // =================================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: { year: number; month?: number } = {
          year: parseInt(selectedYear),
        };
        // 백엔드 로직: 'all'이면 0, 아니면 해당 월 숫자 전송
        if (selectedMonth !== "all") {
          params.month = parseInt(selectedMonth);
        } else {
          params.month = 0;
        }

        console.log("API 요청 시작:", "/view/company", params);

        // ★ API 호출 (본인 서버 주소/포트 확인 필요, 프록시 설정 되어있으면 /view/company 만 써도 됨)
        const response = await axios.get(`${BASE_URL}/view/company`, {
          params,
        });

        console.log("API 응답 성공:", response.data);

        // 백엔드 DTO -> 프론트엔드 형식 매핑
        interface CompanyResponse {
          id?: number;
          companyName: string;
          totalEmission: number;
          address: string;
          ratio: number;
        }
        interface MappedData {
          id: number;
          name: string;
          value: number;
          address: string;
          ratio: number;
        }
        const mappedData: MappedData[] = response.data.map(
          (item: CompanyResponse, index: number) => ({
            id: item.id || index,
            name: item.companyName, // 백엔드 변수명 매핑
            value: roundEmission(item.totalEmission), // 반올림 적용
            address: item.address,
            ratio: item.ratio,
          })
        );

        // 값이 큰 순으로 정렬
        mappedData.sort((a: MappedData, b: MappedData) => b.value - a.value);

        setCompanyData(mappedData);

        // 기본 정렬 설정 (값이 큰 순서)
        setSortConfig({
          key: "value",
          direction: "desc",
        });
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setCompanyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  // =================================================================
  // [2] 지역별 합계 계산 (지도용 데이터 가공)
  // 주소(address)를 쪼개서 'region' 키값으로 만듦 -> KoreaMapChart로 전달
  // =================================================================
  const regionData = useMemo(() => {
    const regionMap: { [key: string]: number } = {};

    companyData
      .filter((item) => !item.name.includes("현대정밀"))
      .forEach((item) => {
        if (!item.address) return;

        // 주소의 첫 어절만 추출 (예: "경기도 성남시" -> "경기도")
        const region = item.address.split(" ")[0];

        if (regionMap[region]) {
          regionMap[region] += item.value;
        } else {
          regionMap[region] = item.value;
        }
      });

    // 지도 컴포넌트가 원하는 { region, value } 형태로 변환
    return Object.keys(regionMap).map((key) => ({
      region: key,
      value: regionMap[key],
    }));
  }, [companyData]);

  // =================================================================
  // [3] 필터링 & 정렬 (테이블용)
  // =================================================================
  const filteredData = useMemo(() => {
    let processed = [...companyData];

    // 검색
    if (searchQuery) {
      processed = processed.filter((d) => {
        const q = searchQuery.toLowerCase();
        if (searchColumn === "all") {
          return (
            d.name.toLowerCase().includes(q) ||
            d.address.toLowerCase().includes(q)
          );
        } else if (searchColumn === "name") {
          return d.name.toLowerCase().includes(q);
        } else if (searchColumn === "address") {
          return d.address.toLowerCase().includes(q);
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
  }, [companyData, searchQuery, searchColumn, sortConfig]);

  // 가로 스크롤 차트 width 계산 (사용하지 않음)
  // const chartWidth = Math.max(filteredData.length * 60, 900);

  // Top 5 데이터 (전체 데이터 기준 상위 5개)
  // [수정] 전체 데이터 중 현대정밀을 제외한 순수 협력사들로만 Top 5 구성
  const top5Data = useMemo(() => {
    return companyData
      .filter((item) => !item.name.includes("현대정밀"))
      .slice(0, 5);
  }, [companyData]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleDownloadExcel = () => {
    if (filteredData.length === 0) return;
    const headers = [
      "No",
      "협력사명",
      "탄소배출량 (tCO2eq)",
      "비율 (%)",
      "주소",
    ].join(",");

    const escapeCsv = (val: string | number) =>
      `"${String(val).replace(/"/g, '""')}"`;

    const rows = filteredData
      .map((d, idx) => {
        const emission = roundEmission(d.value).toFixed(2); // thousands separator 없이 고정 소수점
        const ratio = Number(d.ratio ?? 0).toFixed(2);
        return [
          idx + 1,
          escapeCsv(d.name),
          emission,
          ratio,
          escapeCsv(d.address ?? ""),
        ].join(",");
      })
      .join("\n");
    const csvContent = `\ufeff${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `협력사별_탄소배출_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen font-sans bg-gray-50" style={{ padding: 'var(--padding-container)' }}>
      {/* 브레드크럼 */}
      <Breadcrumb items={getBreadcrumbItems('/view/company')} />
      
      {/* 헤더 */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 className="font-bold text-gray-800" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
          협력사별 탄소 배출량
        </h2>
        <div className="flex" style={{ gap: 'var(--spacing-md)' }}>
          <button
            onClick={handleDownloadExcel}
            className="flex items-center font-bold text-white transition-colors bg-green-600 rounded-md shadow-sm hover:bg-green-700"
            style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--text-sm)' }}
          >
            <Download size={16} style={{ marginRight: 'var(--spacing-xs)' }} /> Excel
          </button>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="flex bg-white border border-gray-100 shadow-sm rounded-xl" style={{ gap: 'var(--spacing-lg)', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        {/* 연도 선택 */}
        <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
          <label className="font-bold text-gray-500" style={{ fontSize: 'var(--text-xs)' }}>▼ 연도 선택</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                if (e.target.value === "all") setSelectedMonth("all");
              }}
              className="bg-white border border-gray-300 rounded-md outline-none cursor-pointer"
              style={{ width: 'clamp(7rem, 10vw, 8rem)', padding: 'var(--spacing-sm) 2rem var(--spacing-sm) var(--spacing-sm)', fontSize: 'var(--text-sm)' }}
            >
              <option value="all">전체</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            {/* <ChevronDown
              size={16}
              className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2"
            /> */}
          </div>
        </div>

        {/* 월 선택 */}
        {selectedYear !== "all" && (
          <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
            <label className="font-bold text-gray-500" style={{ fontSize: 'var(--text-xs)' }}>▼ 월 선택</label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-gray-300 rounded-md outline-none cursor-pointer"
                style={{ width: 'clamp(7rem, 10vw, 8rem)', padding: 'var(--spacing-sm) 2rem var(--spacing-sm) var(--spacing-sm)', fontSize: 'var(--text-sm)' }}
              >
                <option value="all">전체</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>
              {/* <ChevronDown
                size={16}
                className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2"
              /> */}
            </div>
          </div>
        )}
      </div>

      {/* ========================== */}
      {/* 좌우 배치: 왼쪽 지도, 오른쪽 Top5 차트 */}
      {/* ========================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-150" style={{ gap: 'var(--spacing-lg)', marginBottom: '2.5rem' }}>
        {/* 왼쪽: 지역별 탄소 배출량 지도 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-150" style={{ padding: 'var(--spacing-md)' }}>
          {/* <h3 className="text-lg font-bold text-gray-800" style={{ marginBottom: 'var(--spacing-sm)' }}>
            지역별 탄소 배출량
          </h3> */}
          <div className="h-150">
            <KoreaMapChart data={regionData} />
          </div>
        </div>

        {/* 오른쪽: 협력사별 탄소 배출량 Top5 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-150" style={{ padding: 'var(--spacing-lg)' }}>
          <h3 className="text-lg font-bold text-gray-800" style={{ marginBottom: '3.75rem' }}>
            협력사별 탄소 배출량 Top5
          </h3>
          <div className="h-125">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={top5Data}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <Tooltip
                  formatter={(val: string | number | undefined) =>
                    // [수정] 숫자로 확실히 변환 후 포맷팅
                    Number(val).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  }
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {top5Data.map((_, index) => (
                    <Cell
                      key={index}
                      // fill={index === 0 ? "#1E3A8A" : index === 1 ? "#ea580c" : index === 2 ? "#ca8a04" : ""}
                      fill={"#1E3A8A"}
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
      <div className="flex items-center border border-blue-100 bg-blue-50 rounded-xl" style={{ gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <span className="font-bold text-blue-700 whitespace-nowrap">
          협력사명 검색
        </span>

        <div className="relative">
          <select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            className="bg-white border border-blue-200 rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
            style={{ padding: 'var(--spacing-sm) 2rem var(--spacing-sm) var(--spacing-sm)', fontSize: 'var(--text-sm)' }}
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
            className="w-full border border-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            style={{ padding: 'var(--spacing-sm) 2.25rem var(--spacing-sm) 0.75rem', fontSize: 'var(--text-sm)' }}
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
          <table className="w-full text-gray-600" style={{ fontSize: 'var(--text-sm)' }}>
            <thead className="font-bold text-gray-700 uppercase border-b border-gray-200 bg-gray-50" style={{ fontSize: 'var(--text-xs)' }}>
              <tr>
                <th className="w-16 text-center" style={{ padding: 'var(--spacing-md) var(--spacing-md)' }}>No.</th>
                <th
                  onClick={() => handleSort("name")}
                  className="text-left transition-colors cursor-pointer hover:bg-gray-100"
                  style={{ padding: 'var(--spacing-md) var(--spacing-md)' }}
                >
                  <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                    협력사명
                    {sortConfig?.key === "name" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("value")}
                  className="text-center transition-colors cursor-pointer hover:bg-gray-100"
                  style={{ padding: 'var(--spacing-md) var(--spacing-md)' }}
                >
                  <div className="flex items-center justify-center" style={{ gap: 'var(--spacing-xs)' }}>
                    탄소배출량 (tCO2eq)
                    {sortConfig?.key === "value" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("ratio")}
                  className="text-center transition-colors cursor-pointer hover:bg-gray-100"
                  style={{ padding: 'var(--spacing-md)' }}
                >
                  <div className="flex items-center justify-center" style={{ gap: 'var(--spacing-xs)' }}>
                    비율 (%)
                    {sortConfig?.key === "ratio" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("address")}
                  className="text-left transition-colors cursor-pointer hover:bg-gray-100"
                  style={{ padding: 'var(--spacing-md)' }}
                >
                  <div className="flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
                    주소
                    {sortConfig?.key === "address" && (
                      <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="text-center text-gray-500" style={{ padding: 'var(--spacing-md)' }}>
                      {idx + 1}
                    </td>
                    <td className="font-medium text-left text-gray-800" style={{ padding: 'var(--spacing-md)' }}>
                      {row.name}
                    </td>
                    <td className="text-center text-gray-800" style={{ padding: 'var(--spacing-md)' }}>
                      {parseFloat(
                        roundEmission(row.value).toFixed(2)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center text-gray-800" style={{ padding: 'var(--spacing-md)' }}>
                      {row.ratio}%
                    </td>
                    <td className="text-left text-gray-600" style={{ padding: 'var(--spacing-md)' }}>
                      {row.address}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-gray-500"
                    style={{ padding: 'var(--spacing-xl) var(--spacing-lg)' }}
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
