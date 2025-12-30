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

// --- Mock Data ---
// Note: Map data is now fetched from mapApi automatically

// 2. 협력사 데이터 (전체 데이터)
// const MOCK_COMPANY_DATA = Array.from({ length: 30 }, (_, i) => ({
//   id: i + 1,
//   name: `협력사 ${String.fromCharCode(65 + (i % 26))}${i}`,
//   value: Math.floor(Math.random() * 5000) + 500,
//   address: i % 2 === 0 ? "경기도 성남시" : "울산광역시 북구",
//   ratio: 0,
// })).sort((a, b) => b.value - a.value);

// 3. 그래프용 Top5 데이터
//const TOP5_COMPANY_DATA = MOCK_COMPANY_DATA.slice(0, 5);

// 총합 → 비율 계산
// const totalEmission = MOCK_COMPANY_DATA.reduce(
//   (acc, curr) => acc + curr.value,
//   0
// );
// MOCK_COMPANY_DATA.forEach(
//   (d) => (d.ratio = parseFloat(((d.value / totalEmission) * 100).toFixed(1)))
// );

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
  const DB_START_YEAR = 2018;

  // --- 유틸리티 함수 ---
  // 탄소 배출량 반올림: 소수점 3째자리에서 반올림하여 2째 자리까지만 표시
  const roundEmission = (value: number | undefined | null): number => {
    if (value === undefined || value === null) return 0;
    return Math.round(value * 100) / 100;
  };

  // --- 연도 옵션 생성 ---
  const yearOptions = useMemo(() => {
    const options = [];
    for (let y = currentYear; y >= DB_START_YEAR; y--) {
      options.push(y.toString());
    }
    return options;
  }, [currentYear]);

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
    <div className="min-h-screen p-8 font-sans bg-gray-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          협력사별 탄소 배출량
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center px-4 py-2 font-bold text-white transition-colors bg-green-600 rounded-md shadow-sm hover:bg-green-700"
          >
            <Download size={16} className="mr-2" /> Excel
          </button>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="flex gap-6 p-5 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
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
            {/* <ChevronDown
              size={16}
              className="absolute text-gray-400 -translate-y-1/2 pointer-events-none right-2 top-1/2"
            /> */}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* 왼쪽: 지역별 탄소 배출량 지도 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[600px]">
          <h3 className="mb-2 text-lg font-bold text-gray-800">
            지역별 탄소 배출량
          </h3>
          <div className="h-[600px]">
            <KoreaMapChart data={regionData} />
          </div>
        </div>

        {/* 오른쪽: 협력사별 탄소 배출량 Top5 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[600px]">
          <h3 className="mb-15 text-lg font-bold text-gray-800">
            협력사별 탄소 배출량 Top5
          </h3>
          <div className="h-[500px]">
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
                    parseFloat(
                      roundEmission(val as number).toFixed(2)
                    ).toLocaleString(undefined, {
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
      <div className="flex items-center gap-3 p-4 mb-6 border border-blue-100 bg-blue-50 rounded-xl">
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    데이터를 불러오는 중입니다...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
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
                      {parseFloat(
                        roundEmission(row.value).toFixed(2)
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
