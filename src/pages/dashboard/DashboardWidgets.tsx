import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Line, ComposedChart, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { useState, useEffect } from 'react';
import { getBusinessYear } from '../../utils/dateUtils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import KoreaMapChart from '../../components/analysis/KoreaMapChart';
import {
  fetchDashboardSummary,
  fetchMonthlyData,
  fetchYearlyData,
  fetchRegionalData,
  fetchPurposeData,
  fetchReductionActivities,
  type DashboardSummaryData,
  type MonthlyData,
  type YearlyData,
} from '../../apis/dashboardApi';

// 상수 정의
const currentYear = getBusinessYear();
const COLORS = ['#60a5fa', '#22d3ee', '#fbbf24', '#fb7185', '#c084fc'];

const cardBase = 'bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-6 h-full flex flex-col overflow-hidden border border-white/30';
const axisStyle = { stroke: '#fff', strokeWidth: 3 };
const tickStyle = { fill: '#fff', fontSize: 16, fontWeight: 700 };
const legendStyle = { fontSize: 16, color: '#fff', fontWeight: 600 };
const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 8, border: '2px solid #334155' };

// 숫자 포맷터 (천 단위 구분)
const formatNumber = (v: number) => {
  try {
    return Number(v).toLocaleString();
  } catch {
    return String(v);
  }
};

// -----------------------------------------------------------------------
// [Summary Section - 2025년 탄소 배출량]
// -----------------------------------------------------------------------
export const SummarySection = () => {
  const [data, setData] = useState<DashboardSummaryData | null>(null);

  useEffect(() => {
    fetchDashboardSummary().then(setData);
  }, []);

  if (!data) return <div className={cardBase}>로딩 중...</div>;

  const total = data.scope1Current + data.scope3Current;
  const target = data.scope1Target + data.scope3Target;
  const diff = target - total;
  const diffPercent = ((diff / target) * 100).toFixed(1);
  const isGood = diff > 0;

  const summaryBarData = [
    { name: '올해', scope1: data.scope1Current, scope3: data.scope3Current },
    { name: '목표', scope1: data.scope1Target, scope3: data.scope3Target },
  ];

  return (
    <div className={`${cardBase}`}>
      {/* 텍스트 비교 영역 - 색상 변화 */}
      <div className="flex justify-between gap-4 mb-6 bg-white/10 rounded-lg p-5">
        <div className="flex-1 text-center">
          <div className="text-base text-gray-300 font-semibold mb-2">올해 총 배출량</div>
          <div className="text-4xl font-extrabold text-white leading-tight">
            {total.toLocaleString()} <span className="text-2xl">tCO₂eq</span>
          </div>
        </div>
        <div className="border-l border-white/20"></div>
        <div className="flex-1 text-center">
          <div className="text-base text-gray-300 font-semibold mb-2">목표 배출량</div>
          <div className="text-4xl font-extrabold text-white leading-tight">
            {target.toLocaleString()} <span className="text-2xl">tCO₂eq</span>
          </div>
        </div>
        <div className="border-l border-white/20"></div>
        <div className="flex-1 text-center">
          <div className="text-base text-gray-300 font-semibold mb-2">목표 달성도</div>
          <div className={`text-4xl font-extrabold leading-tight ${isGood ? 'text-emerald-300' : 'text-red-300'}`}>
            {isGood ? '▼' : '▲'} {Math.abs(Number(diffPercent))}%
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[260px]">
        <h4 className="text-3xl font-extrabold text-white text-center mb-5">{currentYear}년 배출량 현황</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summaryBarData} barCategoryGap={100} barSize={90} margin={{ top: 15, right: 30, left: 30, bottom: 15 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 20, fontWeight: 700 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 18, fontWeight: 700 }} axisLine={axisStyle} tickLine={axisStyle} width={60} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }}
              itemStyle={{ color: '#fff', fontWeight: 700, fontSize: 15 }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 17, color: '#fff', fontWeight: 700, paddingTop: 15 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 700 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" radius={[8, 8, 3, 3]}>
              <LabelList dataKey="scope1" position="insideTop" fill="#0f172a" fontSize={16} fontWeight={700} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" radius={[8, 8, 3, 3]}>
              <LabelList dataKey="scope3" position="insideTop" fill="#0f172a" fontSize={16} fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// [Monthly Scope Section - 올해 월별 배출량]
// -----------------------------------------------------------------------
export const MonthlyScopeSection = () => {
  const [data, setData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    fetchMonthlyData().then(setData);
  }, []);

  if (data.length === 0) return <div className={cardBase}>로딩 중...</div>;

  const monthlyChartData = data.map(d => ({
    name: `${d.month}월`,
    scope1: d.scope1,
    scope3: d.scope3,
    target: d.target,
  }));

  return (
    <div className={cardBase}>
      <h3 className="text-3xl font-extrabold mb-5 text-white text-center">올해 월별 배출량 (Scope)</h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyChartData} margin={{ top: 15, right: 15, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 16, fontWeight: 700 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 16, fontWeight: 700 }} axisLine={axisStyle} tickLine={axisStyle} width={55} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }}
              itemStyle={{ color: '#fff', fontWeight: 700, fontSize: 15 }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 17, color: '#fff', fontWeight: 700, paddingTop: 15 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 700 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={48} radius={[8, 8, 3, 3]} />
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={48} radius={[8, 8, 3, 3]} />
            <Line type="monotone" dataKey="target" name="목표" stroke="#fbbf24" strokeWidth={6} dot={{ r: 6, fill: '#fbbf24' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// [Partner Map Section - 협력사 지역별 현황]
// -----------------------------------------------------------------------
export const PartnerMapSection = () => (
  <div className={`${cardBase} max-h-full`}>
    <h3 className="text-3xl font-extrabold mb-5 text-white text-center">협력사 지역별 현황</h3>
    <div className="flex-1 h-full">
      <KoreaMapChart large defaultFitAll />
    </div>
  </div>
);

// -----------------------------------------------------------------------
// [Yearly History Section - 최근 5년 탄소 배출량]
// -----------------------------------------------------------------------
export const YearlyHistorySection = () => {
  const [data, setData] = useState<YearlyData[]>([]);

  useEffect(() => {
    fetchYearlyData().then(setData);
  }, []);

  if (data.length === 0) return <div className={cardBase}>로딩 중...</div>;

  return (
    <div className={cardBase}>
      <h4 className="text-3xl font-extrabold text-white text-center mb-5">연간 탄소 배출량 (최근 5년)</h4>
      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="year" tick={{ fill: '#fff', fontSize: 18, fontWeight: 700 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 18, fontWeight: 700 }} axisLine={axisStyle} tickLine={axisStyle} width={60} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }}
              itemStyle={{ color: '#fff', fontWeight: 700, fontSize: 15 }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 17, color: '#fff', fontWeight: 700, paddingTop: 12 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 700 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={56} radius={[8, 8, 3, 3]}>
              <LabelList dataKey="scope1" position="insideTop" fill="#0f172a" fontSize={15} fontWeight={700} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={56} radius={[8, 8, 3, 3]}>
              <LabelList dataKey="scope3" position="insideTop" fill="#0f172a" fontSize={15} fontWeight={700} />
            </Bar>
            <Line type="monotone" dataKey="target" name="목표" stroke="#fbbf24" strokeWidth={6} dot={{ r: 6, fill: '#fbbf24' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// [Purpose Pie Section - 운행 목적별 배출량]
// -----------------------------------------------------------------------
export const PurposePieSection = () => {
  const [pieData, setPieData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    fetchPurposeData().then(setPieData);
  }, []);

  if (pieData.length === 0) return <div className={cardBase}>로딩 중...</div>;

  return (
    <div className={cardBase}>
      <h3 className="text-3xl font-extrabold mb-5 text-white text-center">{currentYear}년 운행 목적별 배출량</h3>
      <div className="flex-1 relative w-full h-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] text-center pointer-events-none z-10 -mt-3.5">
          <div className="text-5xl font-extrabold text-white">100%</div>
          <div className="text-xl text-gray-200 font-bold">Total</div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="36%"
              cy="50%"
              innerRadius={95}
              outerRadius={160}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 16 }} itemStyle={{ color: '#fff', fontWeight: 700, fontSize: 15 }} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: 18, color: '#fff', fontWeight: 700, padding: '10px 0' }}
              formatter={(value, entry: any) => (
                <span className="text-white ml-2 font-extrabold text-lg">
                  {value} : <b>{entry.payload.value}%</b>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// [Reduction List Section - 최근 저감 활동]
// -----------------------------------------------------------------------
export const ReductionListSection = () => {
  const [activities, setActivities] = useState<Array<{ id: string; description: string; }>>([]);

  useEffect(() => {
    fetchReductionActivities().then(setActivities);
  }, []);

  if (activities.length === 0) return <div className={cardBase}>로딩 중...</div>;

  return (
    <div className={cardBase}>
      <h3 className="text-3xl font-extrabold mb-5 text-white text-center">최근 저감 활동 5건</h3>
      <ul className="space-y-4 text-white text-xl font-bold">
        {activities.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <span className="mt-2 block w-4 h-4 rounded-full bg-emerald-300 flex-shrink-0" />
            <div className="flex-1">
              <span>{item.description}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
