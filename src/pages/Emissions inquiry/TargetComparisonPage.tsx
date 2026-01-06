import React, { useState, useEffect, useMemo } from "react";
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
  ComposedChart,
  Line,
  LabelList,
  Legend,
} from "recharts";
import { ChevronDown, TrendingUp, TrendingDown } from "lucide-react";
import Breadcrumb from "../../components/Breadcrumb";
import { getBreadcrumbItems } from "../../utils/breadcrumbHelper";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// --- 타입 정의 ---
type ScopeType = "total" | "scope1" | "scope3";

interface MonthlyComparisonDto {
  month: number;
  target: number; // 목표
  actual: number; // 실제
  achievementRate: number; // 증감률
}

interface ViewEmissionTargetDto {
  totalTarget: number;
  totalActual: number;
  totalAchievementRate: number;
  monthlyData: MonthlyComparisonDto[];
  latestMonth: number;
}

// 차트에 바인딩할 데이터 구조 (month를 문자열로 변환 후 사용)
interface ChartData extends ViewEmissionTargetDto {
  processedMonthlyData: {
    month: string;
    target: number;
    actual: number;
  }[];
  lastReportingMonth: number; // 데이터가 존재하는 마지막 월 (1~12)
}

// --- 상수 정의 ---
const RECHARTS_COLORS = {
  red: "#ef4444", // 목표 초과 (Tailwind red-500)
  green: "#22c55e", // 목표 달성 (Tailwind green-500)
  blue: "#3b82f6", // 일반 (Tailwind blue-500)
  targetLine: "#f97316", // 목표 선 (Tailwind orange-500)
};

// const DB_START_YEAR = 1979;

const TargetComparisonPage: React.FC = () => {
  // --- 상태 관리 ---
  const [selectedScope, setSelectedScope] = useState<ScopeType>("total");

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // 연도 목록을 State로 관리 (서버에서 받아옴)
  // 초기값은 일단 현재 연도 하나만 넣어둠
  const [years, setYears] = useState<string[]>([currentYear.toString()]);

  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );

  // 서버에서 받아온 데이터 저장용 State
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // --- API 호출 (useEffect) ---
  // 화면 켜지면 '연도 목록'부터 가져오기
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get<number[]>(
          `${BASE_URL}/view/common/years`
        );
        const yearList = response.data;

        if (yearList && yearList.length > 0) {
          // 최신 연도가 위로 오게 내림차순 정렬 (2025, 2024, 2023...)
          const sortedYears = yearList.sort((a, b) => b - a).map(String);
          setYears(sortedYears);

          // 만약 현재 선택된 연도가 목록에 없으면, 가장 최신 연도로 자동 선택
          // (예: 나는 2025 보고 있었는데 DB엔 2024까지만 있을 경우)
          if (!sortedYears.includes(selectedYear)) {
            setSelectedYear(sortedYears[0]);
          }
        } else {
          // DB에 데이터가 하나도 없으면 그냥 현재 연도만 표시
          setYears([currentYear.toString()]);
        }
      } catch (error) {
        console.error("연도 목록 로딩 실패:", error);
      }
    };

    fetchYears();
  }, []); // 빈 배열([]): 처음 한 번만 실행

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. 파라미터 준비 (프론트 'total' -> 백엔드 'Total' 대문자 변환 필요 시 처리)
        // 백엔드가 대소문자 무관하게 처리하면 그대로 보내도 됨. 여기선 확실하게 매핑.
        let typeParam = "Total";
        if (selectedScope === "scope1") typeParam = "Scope1";
        if (selectedScope === "scope3") typeParam = "Scope3";

        // 2. API 호출
        const response = await axios.get<ViewEmissionTargetDto>(
          `${BASE_URL}/view/target`,
          {
            params: {
              year: selectedYear,
              type: typeParam,
            },
          }
        );

        const data = response.data;

        // 3. 데이터 가공 (month: 1 -> "1월")
        const processedMonthly = data.monthlyData.map((d) => ({
          month: `${d.month}월`,
          target: d.target,
          actual: d.actual,
        }));

        // 4. 기준 월 계산 (선택 연도가 현재 연도면 현재 월, 과거면 12월)
        // const isCurrentYear = parseInt(selectedYear) === currentYear;
        // const lastMonth = isCurrentYear ? currentMonth : 12;

        // [수정] 백엔드에서 준 값을 사용 (값이 없으면 기본값 0)
        const lastMonth =
          data.latestMonth && data.latestMonth > 0 ? data.latestMonth : 0;

        setChartData({
          ...data,
          processedMonthlyData: processedMonthly,
          lastReportingMonth: lastMonth,
        });
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedScope, currentYear, currentMonth]);

  // --- 로딩 중이거나 데이터 없을 때 처리 ---
  if (loading || !chartData) {
    return (
      <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>
    );
  }

  // --- 계산 로직 ---
  const diff = chartData.totalActual - chartData.totalTarget;
  // 목표는 연간 목표이므로, 퍼센트 계산 시에도 연간 목표를 사용
  // const percent = ((Math.abs(diff) / data.totalTarget) * 100).toFixed(1);
  const isExceeded = diff > 0; // 목표 초과 여부

  // 백엔드에서 주는 totalAchievementRate를 써도 되고, 여기서 다시 계산해도 됨.
  // 여기선 UI 표시용으로 직접 계산된 퍼센트 문자열 생성
  const percentStr = (
    (Math.abs(diff) / (chartData.totalTarget || 1)) *
    100
  ).toFixed(1);

  const statusColorClass = isExceeded ? "text-red-500" : "text-green-500";
  const statusRechartsColor = isExceeded
    ? RECHARTS_COLORS.red
    : RECHARTS_COLORS.green;

  // 기준 월 텍스트
  const monthCriterionText = `${chartData.lastReportingMonth}월까지 기준`;

  // 연간 비교 차트용 데이터 배열 생성
  const annualChartData = [
    { name: `${selectedYear}년 총 배출량`, value: chartData.totalActual },
    { name: "목표 배출량", value: chartData.totalTarget },
  ];

  //   const handleDownloadExcel = () => {
  //     const headers = "Month,Actual Emission,Target Emission\n";
  //     const rows = data.monthlyData.map(d => `${d.month},${d.actual},${d.target}`).join("\n");
  //     const csvContent = `\ufeffYear: ${selectedYear}, Scope: ${selectedScope}\n${headers}${rows}`;

  //     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //     const link = document.createElement('a');
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `Target_vs_Emission_${selectedYear}.csv`;
  //     link.click();
  //   };

  return (
    <div className="min-h-full font-sans bg-gray-50" style={{ padding: 'var(--padding-container)' }}>
      {/* 브레드크럼 */}
      <Breadcrumb items={getBreadcrumbItems('/view/target')} />
      
      {/* 헤더 */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2 className="font-bold text-gray-800" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
          목표 대비 탄소 배출량
        </h2>
      </div>

      {/* Scope 탭 */}
      <div className="flex flex-wrap border-b border-gray-200" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {["total", "scope1", "scope3"].map((scope) => (
          <button
            key={scope}
            onClick={() => setSelectedScope(scope as ScopeType)}
            className={`
              border-b-2 font-medium transition-colors
              ${
                selectedScope === scope
                  ? "border-blue-600 text-blue-600 font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }
            `}
            style={{ 
              padding: 'var(--spacing-sm) var(--spacing-lg)',
              fontSize: 'var(--text-sm)'
            }}
          >
            {scope === "total"
              ? "총 배출량"
              : scope === "scope1"
              ? "Scope 1"
              : "Scope 3"}
          </button>
        ))}
      </div>

      {/* 필터 영역 - 연도 선택 및 KPI */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
        <div className="flex flex-col md:flex-row" style={{ gap: 'var(--spacing-lg)' }}>
          {/* 연도 선택 */}
          <div className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
            <label className="font-bold text-gray-500" style={{ fontSize: 'var(--text-xs)' }}>▼ 연도 선택</label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-gray-300 rounded-md outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                style={{ width: 'clamp(7rem, 10vw, 8rem)', padding: 'var(--spacing-sm)', paddingRight: 'var(--spacing-xl)', fontSize: 'var(--text-sm)' }}
              >
                {years.map((y) => (
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

          {/* KPI 표시 */}
          <div className="flex-1 flex flex-col md:flex-row" style={{ gap: 'var(--spacing-lg)' }}>
            {/* 총 배출량 (실적) */}
            <div className="flex-1 border-r border-gray-200" style={{ paddingRight: 'var(--spacing-lg)' }}>
              <div className="text-gray-600" style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--text-sm)' }}>
                {selectedYear}년도 총 배출량
              </div>
              <div className={`font-extrabold ${statusColorClass}`} style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                {chartData.totalActual.toLocaleString()}{" "}
                <span className="text-gray-700" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)' }}>tCO2eq</span>
              </div>
              <div className={`flex items-center font-bold ${statusColorClass}`} style={{ fontSize: 'var(--text-sm)' }}>
                {isExceeded ? (
                  <TrendingUp size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
                ) : (
                  <TrendingDown size={16} style={{ marginRight: 'var(--spacing-xs)' }} />
                )}
                {diff > 0 ? "+" : ""}
                {diff.toLocaleString()} tCO2eq ({percentStr}%)
              </div>
              <div className="text-right text-gray-500" style={{ marginTop: 'var(--spacing-xs)', fontSize: 'var(--text-xs)' }}>
                *{monthCriterionText}
              </div>
            </div>

            {/* 목표 배출량 */}
            <div className="flex-1">
              <div className="text-gray-600" style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--text-sm)' }}>
                {selectedYear}년 목표 배출량
              </div>
              <div className="font-extrabold text-gray-800" style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                {chartData.totalTarget.toLocaleString()}{" "}
                <span className="text-gray-700" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)' }}>tCO2eq</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="flex flex-col" style={{ gap: 'var(--spacing-lg)' }}>
        {/* 연간 비교 차트 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100" style={{ padding: 'var(--spacing-lg)', height: 'clamp(20rem, 40vh, 25rem)' }}>
          <h3 className="text-center text-gray-800 font-bold" style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--text-lg)' }}>
            {selectedYear}년 탄소 배출량 비교 (실적 vs 목표)
          </h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            data={annualChartData}
            margin={{ top: 30, right: 30, left: 30, bottom: 20 }}
            barSize={100}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-gray-200"
            />
            <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: "bold" }} />
            <YAxis
              label={{
                value: "tCO2eq",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
                offset: 0,
                dx: -10,
              }}
              width={80}
            />
            <Tooltip
              formatter={(val: any) => [`${val?.toLocaleString()} tCO2eq`, ""]}
              labelFormatter={(name) => name}
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #ccc",
                padding: "10px",
                fontSize: "14px",
              }}
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
            />

            <Bar dataKey="value">
              <LabelList
                dataKey="value"
                position="top"
                fill="#374151"
                fontSize={14}
                fontWeight="bold"
                formatter={(val: any) => {
                  if (typeof val === "number") {
                    return val.toLocaleString();
                  }
                  return "";
                }}
              />
              {annualChartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === 0 ? statusRechartsColor : RECHARTS_COLORS.blue
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

        {/* 월별 추이 차트 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100" style={{ padding: 'var(--spacing-lg)', height: 'clamp(25rem, 50vh, 31.25rem)' }}>
          <h3 className="text-center text-gray-800 font-bold" style={{ marginBottom: 'var(--spacing-xs)', fontSize: 'var(--text-lg)' }}>
            {selectedYear}년 월별 탄소 배출량 추이
          </h3>
          <div className="text-right text-gray-500" style={{ marginBottom: 'var(--spacing-md)', fontSize: 'var(--text-xs)' }}>
            *{monthCriterionText}
          </div>

        <ResponsiveContainer width="100%" height="85%">
          <ComposedChart
            data={chartData.processedMonthlyData}
            margin={{ top: 30, right: 30, bottom: 20, left: 30 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-gray-200"
            />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              label={{
                value: "tCO2eq",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
                offset: 5,
                dx: -10,
              }}
              width={70}
            />
            <Tooltip
              formatter={(val: any) => [`${val?.toLocaleString()} tCO2eq`, ""]}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />

            {/* 실적 (막대) */}
            <Bar
              dataKey="actual"
              name={`${selectedYear}년 실적`}
              fill={RECHARTS_COLORS.blue}
              barSize={40}
              radius={[4, 4, 0, 0]}
            />

            {/* 목표 (선) */}
            <Line
              type="monotone"
              dataKey="target"
              name="목표 배출량"
              stroke={RECHARTS_COLORS.targetLine}
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
};

export default TargetComparisonPage;
