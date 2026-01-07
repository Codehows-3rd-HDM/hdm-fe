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
import Breadcrumb from "../../components/Breadcrumb";
import { getBreadcrumbItems } from "../../utils/breadcrumbHelper";

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
    <div className="min-h-full font-sans bg-gray-50" style={{ padding: 'var(--padding-responsive)' }}>
      {/* 브레드크럼 */}
      <Breadcrumb items={getBreadcrumbItems('/view/period')} />
      
      {/* 헤더 */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 className="font-bold text-gray-800" style={{ fontSize: 'clamp(1.5rem, 2vw, 1.75rem)' }}>
          기간별 탄소 총 배출량
        </h2>
      </div>

      {/* 필터 영역 - 기간 선택 */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="flex flex-wrap items-end" style={{ gap: 'var(--spacing-lg)' }}>
          {/* Start Date */}
          <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
            <label className="font-bold text-gray-500" style={{ fontSize: 'var(--text-sm)' }}>▼ 시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-300 rounded-md outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
              style={{ width: 'clamp(9rem, 15vw, 10rem)', padding: 'var(--spacing-sm)', fontSize: 'var(--text-base)' }}
            />
          </div>

          <span className="font-bold text-gray-500" style={{ paddingBottom: 'var(--spacing-sm)' }}>~</span>

          {/* End Date */}
          <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
            <label className="font-bold text-gray-500" style={{ fontSize: 'var(--text-sm)' }}>▼ 종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-gray-300 rounded-md outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
              style={{ width: 'clamp(9rem, 15vw, 10rem)', padding: 'var(--spacing-sm)', fontSize: 'var(--text-base)' }}
            />
          </div>

          {/* 조회 버튼 */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center font-bold text-white transition-colors bg-green-600 rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400"
            style={{ gap: 'var(--spacing-xs)', padding: 'var(--spacing-sm) var(--spacing-md)' }}
          >
            <Search size={16} />
            조회
          </button>
        </div>
      </div>

      {/* 차트 및 통계 영역 */}
      <div className="flex flex-col lg:flex-row" style={{ gap: 'var(--spacing-lg)' }}>
        {/* 차트 */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col" style={{ padding: 'var(--spacing-md)', minHeight: 'clamp(20rem, 40vh, 25rem)' }}>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : hasSearched && chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-600">조회된 데이터가 없습니다</p>
              </div>
            </div>
          ) : hasSearched && chartData[0]?.total === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-600">선택기간의 조회된 데이터가 없습니다</p>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-center text-gray-600" style={{ marginBottom: 'var(--spacing-lg)', fontSize: 'clamp(1.25rem, 2vw, 1.875rem)' }}>
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
        <div className="flex flex-col" style={{ width: 'clamp(18rem, 25vw, 26rem)', gap: 'var(--spacing-lg)' }}>
          {/* 카드 1 - 배출량 비교 */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-xl" style={{ padding: 'var(--spacing-md)' }}>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div className="text-gray-600 font-semibold" style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--text-base)' }}>
                전년도 동기간 배출량
              </div>
              <div className="font-bold text-gray-800 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                {formatEmissionWithComma(summary.prevTotal)}
              </div>
              <div className="font-medium text-gray-500" style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--text-lg)' }}>tCO2eq</div>
            </div>
            <div>
              <div className="text-gray-600 font-semibold" style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--text-base)' }}>
                선택기간 총 배출량
              </div>
              <div
                className={`font-bold leading-tight ${
                  isDecreased ? "text-green-600" : "text-red-600"
                }`}
                style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}
              >
                {formatEmissionWithComma(summary.currentTotal)}
              </div>
              <div className="font-medium text-gray-500" style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--text-lg)' }}>tCO2eq</div>
              <div
                className={`flex items-center font-bold ${
                  isDecreased ? "text-green-600" : "text-red-600"
                }`}
                style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--text-lg)' }}
              >
                {isDecreased ? (
                  <TrendingDown size={20} style={{ marginRight: 'var(--spacing-xs)' }} />
                ) : (
                  <TrendingUp size={20} style={{ marginRight: 'var(--spacing-xs)' }} />
                )}
                <span>{formatEmissionWithComma(Math.abs(diff))} tCO2eq</span>
                <span style={{ marginLeft: 'var(--spacing-xs)' }}>({percent}%)</span>
              </div>
            </div>
          </div>

          {/* 카드 2 - 운행거리 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center" style={{ padding: 'var(--spacing-md)' }}>
            <div className="text-gray-600 font-semibold" style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--text-base)' }}>
              선택기간 총 운행거리
            </div>
            <div className="font-bold text-gray-800 leading-tight" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}>
              {formatEmissionWithComma(summary.distance)}
            </div>
            <div className="font-medium text-gray-500" style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--text-lg)' }}>km</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodEmissionPage;
