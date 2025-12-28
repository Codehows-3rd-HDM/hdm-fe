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
// [Summary Section - 2025년 배출량 현황 (좌우 1:2 분할)]
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
  const isGood = diff >= 0;

  // 데이터 순서: '목표' 먼저, 그 다음 '올해'
  const summaryBarData = [
    { name: '목표', scope1: data.scope1Target, scope3: data.scope3Target },
    { name: '올해', scope1: data.scope1Current, scope3: data.scope3Current },
  ];

  return (
    <div className={`${cardBase}`}>
      <h3 className="text-4xl font-extrabold text-white text-center mb-6">2025년 배출량 현황</h3>
      
      {/* 좌우 1:2 비율 분할 */}
      <div className="grid grid-cols-3 gap-8 flex-1 h-full">
        {/* 좌측 (col-span-1) - 텍스트 영역 */}
        <div className="col-span-1 flex flex-col justify-around gap-0 pr-8 border-r-2 border-emerald-400/50">
          {/* 목표 배출량 */}
          <div className="text-center py-6 border-b-2 border-emerald-400/30">
            <div className="text-lg text-emerald-300 font-bold mb-2 tracking-wide uppercase">목표 배출량</div>
            <div className="text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              {target.toLocaleString()}
            </div>
            <div className="text-sm text-emerald-200 mt-2 font-semibold">tCO₂eq</div>
          </div>

          {/* 올해 총 배출량 */}
          <div className="text-center py-6 border-b-2 border-emerald-400/30">
            <div className="text-lg text-gray-300 font-bold mb-2 tracking-wide uppercase">올해 총 배출량</div>
            <div className={`text-5xl font-extrabold leading-tight drop-shadow-lg transition-all ${isGood ? 'text-emerald-300' : 'text-rose-400'}`}>
              {total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-300 mt-2 font-semibold">tCO₂eq</div>
          </div>

          {/* 목표 달성도 */}
          <div className="text-center py-6">
            <div className="text-lg text-gray-300 font-bold mb-2 tracking-wide uppercase">목표 달성도</div>
            <div className={`text-5xl font-extrabold leading-tight drop-shadow-lg transition-all ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isGood ? '✓' : '✕'} {Math.abs(Number(diffPercent))}%
            </div>
            <div className={`text-sm mt-2 font-semibold ${isGood ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isGood ? '목표 달성 경로' : '목표 초과'}
            </div>
          </div>
        </div>

        {/* 우측 (col-span-2) - 막대그래프 */}
        <div className="col-span-2 flex flex-col">
          <h4 className="text-3xl font-extrabold text-white text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">배출량 비교</h4>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryBarData} barCategoryGap={60} barSize={120} margin={{ top: 15, right: 30, left: 30, bottom: 15 }}>
                <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
                <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} />
                <YAxis tick={{ fill: '#fff', fontSize: 20, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} width={60} tickFormatter={formatNumber} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 18 }}
                  itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 16 }}
                  formatter={(value: number, name: string) => [formatNumber(value), name]}
                />
                <Legend wrapperStyle={{ fontSize: 18, color: '#fff', fontWeight: 800, paddingTop: 12 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 800 }}>{v}</span>} />
                <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" radius={[2, 2, 0, 0]}>
                  <LabelList dataKey="scope1" position="insideTop" fill="#0f172a" fontSize={16} fontWeight={800} />
                </Bar>
                <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" radius={[2, 2, 0, 0]}>
                  <LabelList dataKey="scope3" position="insideTop" fill="#0f172a" fontSize={16} fontWeight={800} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
      <h3 className="text-4xl font-extrabold mb-5 text-white text-center">올해 월별 배출량 (Scope)</h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyChartData} margin={{ top: 15, right: 15, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 22, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 22, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} width={70} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 20 }}
              itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 19 }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 22, color: '#fff', fontWeight: 800, paddingTop: 15 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 800 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={52} radius={[2, 2, 0, 0]} />
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={52} radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="target" name="목표" stroke="#fbbf24" strokeWidth={6} dot={{ r: 8, fill: '#fbbf24' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// [Partner Map Section - 협력사 지역별 현황]
// -----------------------------------------------------------------------
export const PartnerMapSection = ({ theme }: { theme?: 'dark' | 'light' }) => (
  <div className={`${cardBase} max-h-full`}>
    <h3 className="text-4xl font-extrabold mb-5 text-white text-center">협력사 지역별 배출량 현황</h3>
    <div className="flex-1 h-full">
      <KoreaMapChart large defaultFitAll theme={theme} />
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
      <h4 className="text-4xl font-extrabold text-white text-center mb-5">연간 탄소 배출량 (최근 5년)</h4>
      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="year" tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} width={70} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 20 }}
              itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 19 }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 22, color: '#fff', fontWeight: 800, paddingTop: 12 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 800 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={60} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope1" position="insideTop" fill="#0f172a" fontSize={18} fontWeight={800} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={60} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope3" position="insideTop" fill="#0f172a" fontSize={18} fontWeight={800} />
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
    fetchPurposeData().then((arr) => {
      // 값 내림차순으로 정렬하여 표시
      const sorted = [...arr].sort((a, b) => b.value - a.value);
      setPieData(sorted);
    });
  }, []);

  if (pieData.length === 0) return <div className={cardBase}>로딩 중...</div>;

  return (
    <div className={cardBase}>
      <h3 className="text-4xl font-extrabold mb-5 text-white text-center">{currentYear}년 운행 목적별 배출량</h3>
      <div className="flex-1 relative w-full h-full">
        <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
          <div className="text-6xl font-extrabold text-white">100%</div>
          <div className="text-2xl text-gray-200 font-bold">Total</div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="40%"
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
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 20 }} itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 19 }} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ fontSize: 20, color: '#fff', fontWeight: 800, paddingRight: '20px' }}
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
  const [activities, setActivities] = useState<Array<{ id: string; description: string; date?: string; }>>([]);

  useEffect(() => {
    fetchReductionActivities().then((arr) => {
      // 최신 항목이 위로 오도록 역순 배열
      const reversed = [...arr].reverse();
      setActivities(reversed);
    });
  }, []);

  if (activities.length === 0) return <div className={cardBase}>로딩 중...</div>;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className={cardBase}>
      <h3 className="text-4xl font-extrabold mb-6 text-white text-center">최근 저감 활동 5건</h3>
      <ul className="space-y-0 text-white text-2xl font-bold h-full flex flex-col justify-between">
        {activities.map((item) => (
          <li key={item.id} className="flex items-start gap-4 py-3 px-4 border-b border-white/10 hover:bg-white/5 transition-colors rounded">
            <span className="mt-1 block w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0 shadow-lg" />
            <div className="flex-1">
              <div className="font-bold text-white leading-snug text-lg">{item.description}</div>
              {item.date && <div className="text-xs text-gray-400 mt-1 font-semibold">{formatDate(item.date)}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
