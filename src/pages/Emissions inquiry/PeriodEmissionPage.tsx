import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
  Search,
} from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// --- 타입 및 Mock Data ---
const COLORS = {
  scope1: "#4a90e2", // 파랑
  scope3: "#f58220", // 주황
};

// 탄소 배출량 포맷: 소수점 3째자리에서 반올림하여 2째자리까지 표시
const formatEmission = (value: number): string => {
  return value.toFixed(2);
};

// 탄소 배출량을 천단위 구분자 + 소수점 2자리로 표시
const formatEmissionWithComma = (value: number): string => {
  const formatted = value.toFixed(2);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

type ChartDatum = {
  name: string;
  scope1: number;
  scope3: number;
  total: number;
};

type LabelFormatterValue =
  | string
  | number
  | boolean
  | readonly (string | number | boolean)[]
  | null
  | undefined;

const extractNumeric = (val: LabelFormatterValue): number => {
  if (Array.isArray(val)) return Number(val[0] ?? 0);
  return Number(val ?? 0);
};

const formatPositiveLabel = (val: LabelFormatterValue): string => {
  const numeric = extractNumeric(val);
  return numeric > 0 ? formatEmissionWithComma(numeric) : "";
};

const formatTotalLabel = (val: LabelFormatterValue): string => {
  const numeric = extractNumeric(val);
  return Number.isFinite(numeric) ? formatEmissionWithComma(numeric) : "";
};

const PeriodEmissionPage: React.FC = () => {
  // 1. 날짜 상태 관리
  // 현재 날짜 기준 기본값 (1개월 전 ~ 오늘)
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(oneMonthAgo));
  const [endDate, setEndDate] = useState(formatDate(today));

  // 2. 차트 및 통계 데이터 상태 관리
  const [chartData, setChartData] = useState<ChartDatum[]>([]);
  const [summary, setSummary] = useState({
    currentTotal: 0,
    prevTotal: 0,
    distance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // const distance = Math.floor(Math.random() * 500000) + 1000000;

  // 3. API 호출 (수동 버튼 클릭)
  const fetchData = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      // DTO 변수명(startDate, endDate)과 파라미터 키값을 정확히 일치시킴
      const response = await axios.get(`${BASE_URL}/view/period`, {
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      });

      const { current, lastYear } = response.data;

      // ✅ 백엔드 데이터를 차트용 포맷으로 변환
      // (Recharts는 배열 형태의 데이터를 좋아함)
      const mappedChartData: ChartDatum[] = [
        {
          name: "선택기간",
          scope1: parseFloat(formatEmission(current.scope1 || 0)),
          scope3: parseFloat(formatEmission(current.scope3 || 0)),
          total: parseFloat(formatEmission(current.totalEmission || 0)),
        },
        {
          name: "전년도 동기간",
          scope1: parseFloat(formatEmission(lastYear.scope1 || 0)),
          scope3: parseFloat(formatEmission(lastYear.scope3 || 0)),
          total: parseFloat(formatEmission(lastYear.totalEmission || 0)),
        },
      ];

      setChartData(mappedChartData);

      // 하단 카드용 요약 데이터 저장 (소수점 2자리 반올림)
      setSummary({
        currentTotal: parseFloat(formatEmission(current.totalEmission || 0)),
        prevTotal: parseFloat(formatEmission(lastYear.totalEmission || 0)),
        distance: parseFloat(formatEmission(current.totalDistance || 0)),
      });
    } catch (error) {
      console.error("탄소배출량 데이터 조회 실패:", error);
      // 에러 시 0으로 초기화하거나 알림 처리
      setChartData([]);
      setSummary({ currentTotal: 0, prevTotal: 0, distance: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 4. 증감률 계산 (summary 상태값 기준)
  const diff = summary.currentTotal - summary.prevTotal;
  // 분모가 0이면 계산 불가하므로 0 처리
  const percent =
    summary.prevTotal === 0
      ? summary.currentTotal > 0
        ? "100"
        : "0"
      : ((Math.abs(diff) / summary.prevTotal) * 100).toFixed(1);

  const isDecreased = diff < 0;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          기간별 탄소 총 배출량 (Scope 1, Scope 3)
        </h2>
      </div>

      {/* 기간 선택 */}
      <div className="p-5 mb-6 bg-white shadow-md rounded-xl">
        <h3 className="flex items-center mb-4 text-lg font-bold text-gray-800">
          <CalendarIcon size={18} className="mr-2" /> 기간 선택
        </h3>

        <div className="flex items-end gap-8">
          {/* Start Date */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 px-3 py-2 text-sm font-bold border rounded-md cursor-pointer bg-gray-50"
            />
          </div>

          <span className="pb-2 font-bold text-gray-600">to</span>

          {/* End Date */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs text-gray-600">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40 px-3 py-2 text-sm font-bold border rounded-md cursor-pointer bg-gray-50"
            />
          </div>

          {/* 조회 버튼 */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer transition"
          >
            <Search size={18} />
            조회
          </button>
        </div>
      </div>

      {/* 하단 콘텐츠 */}
      <div className="flex items-stretch gap-6">
        {/* 차트 */}
        <div className="bg-white rounded-xl shadow-md p-6 flex-1 min-h-200 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : hasSearched && chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-600">조회된 데이터가 없습니다</p>
              </div>
            </div>
          ) : hasSearched && chartData[0]?.total === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-600">선택기간의 조회된 데이터가 없습니다</p>
              </div>
            </div>
          ) : (
            <>
              <h3 className="mb-6 text-3xl font-semibold text-center text-gray-600">
                기간별 탄소배출량
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  barSize={122}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 21, fontWeight: "bold" }}
                  />
                  <YAxis tick={{ fontSize: 18 }} />
                  <Tooltip
                    formatter={(val?: number | string) => [formatEmissionWithComma(Number(val ?? 0)), ""]}
                    cursor={{ fill: "transparent" }}
                  />
                  <Legend wrapperStyle={{ fontSize: '19px' }} />
                  <Bar
                    dataKey="scope1"
                    name="Scope 1"
                    stackId="a"
                    fill={COLORS.scope1}
                  >
                    <LabelList
                      dataKey="scope1"
                      position="center"
                      fill="white"
                      fontSize={19}
                      fontWeight="bold"
                      formatter={formatPositiveLabel}
                    />
                  </Bar>
                  <Bar
                    dataKey="scope3"
                    name="Scope 3"
                    stackId="a"
                    fill={COLORS.scope3}
                  >
                    <LabelList
                      dataKey="scope3"
                      position="center"
                      fill="white"
                      fontSize={19}
                      fontWeight="bold"
                      formatter={formatPositiveLabel}
                    />
                    <LabelList
                      dataKey="total"
                      position="top"
                      fill="#333"
                      fontSize={20}
                      fontWeight="bold"
                      formatter={formatTotalLabel}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* 정보 카드 */}
        <div className="w-105 flex flex-col gap-6">
          {/* 카드 1 */}
          <div className="flex flex-col justify-center p-6 bg-white shadow-md rounded-xl">
            <div className="mb-8">
              <div className="mb-3 text-lg font-semibold text-gray-700">
                전년도 동기간 배출량
              </div>
              <div className="text-5xl font-bold text-gray-800 leading-tight">
                {formatEmissionWithComma(summary.prevTotal)}
              </div>
              <div className="mt-2 text-2xl font-medium text-gray-500">tCO2eq</div>
            </div>
            <div>
              <div className="mb-3 text-lg font-semibold text-gray-700">
                선택기간 총 배출량
              </div>
              <div
                className={`text-6xl font-bold leading-tight ${
                  isDecreased ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatEmissionWithComma(summary.currentTotal)}
              </div>
              <div className="mt-2 text-2xl font-medium text-gray-500">tCO2eq</div>
              <div
                className={`flex items-center mt-4 font-bold text-xl ${
                  isDecreased ? "text-green-600" : "text-red-600"
                }`}
              >
                {isDecreased ? (
                  <TrendingDown size={24} className="mr-2" />
                ) : (
                  <TrendingUp size={24} className="mr-2" />
                )}
                <span>{formatEmissionWithComma(Math.abs(diff))} tCO2eq</span>
                <span className="ml-2">({percent}%)</span>
              </div>
            </div>
          </div>

          {/* 카드 2 */}
          <div className="bg-white rounded-xl shadow-md p-6 h-50 flex flex-col justify-center">
            <div className="mb-3 text-lg font-semibold text-gray-700">
              선택기간 총 운행거리
            </div>
            <div className="text-6xl font-bold text-gray-800 leading-tight">
              {formatEmissionWithComma(summary.distance)}
            </div>
            <div className="mt-2 text-2xl font-medium text-gray-500">km</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodEmissionPage;
