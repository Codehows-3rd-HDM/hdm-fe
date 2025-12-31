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
import axiosInstance from '../../apis/axiosInstance';

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

const labelFormatter = (value: unknown) => {
  if (typeof value === 'number') return formatNumber(value);
  const parsed = Number(value);
  return Number.isNaN(parsed) ? String(value ?? '') : formatNumber(parsed);
};

// 작은 막대에서는 레이블을 숨겨 겹침을 방지
const renderStackLabel = (props: any) => {
  const { x = 0, y = 0, width = 0, height = 0, value } = props;
  const minHeight = 26;
  if (height < minHeight) return null;
  const labelX = x + width / 2;
  const labelY = y + Math.min(22, height - 6);
  return (
    <text
      x={labelX}
      y={labelY}
      fill="#0f172a"
      fontSize={20}
      fontWeight={800}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {labelFormatter(value)}
    </text>
  );
};

// -----------------------------------------------------------------------
// [Text Summary Section - 목표/올해/달성도 텍스트]
// -----------------------------------------------------------------------
export const TextSummarySection = () => {
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

  return (
    <div className={`${cardBase}`}>
      <div className="flex justify-around items-center gap-6 h-full px-4">
        {/* 목표 배출량 */}
        <div className="text-center flex-1 border-r-2 border-emerald-400/30 py-4">
          <div className="text-5xl text-emerald-300 font-bold mb-2 tracking-wide uppercase">목표 배출량</div>
          <div className="text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
            {target.toLocaleString()}
          </div>
          <div className="text-3xl text-emerald-200 mt-2 font-semibold">tCO₂eq</div>
        </div>

        {/* 올해 총 배출량 */}
        <div className="text-center flex-1 border-r-2 border-emerald-400/30 py-4">
          <div className="text-5xl text-gray-300 font-bold mb-2 tracking-wide uppercase">올해 총 배출량</div>
          <div className={`text-7xl font-extrabold leading-tight drop-shadow-lg transition-all ${isGood ? 'text-emerald-300' : 'text-rose-400'}`}>
            {total.toLocaleString()}
          </div>
          <div className="text-3xl text-gray-300 mt-2 font-semibold">tCO₂eq</div>
        </div>

        {/* 목표 달성도 */}
        <div className="text-center flex-1 py-4">
          <div className="text-5xl text-gray-300 font-bold mb-2 tracking-wide uppercase">목표 달성도</div>
          <div className={`text-7xl font-extrabold leading-tight drop-shadow-lg transition-all ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isGood ? '✓' : '✕'} {Math.abs(Number(diffPercent))}%
          </div>
          <div className={`text-3xl mt-2 font-semibold ${isGood ? 'text-emerald-300' : 'text-rose-300'}`}>
            {isGood ? '목표 달성 정도' : '목표 초과'}
          </div>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------
// [Chart Summary Section - 2025년 배출량 현황 막대그래프]
// -----------------------------------------------------------------------
export const ChartSummarySection = () => {
  const [data, setData] = useState<DashboardSummaryData | null>(null);

  useEffect(() => {
    fetchDashboardSummary().then(setData);
  }, []);

  if (!data) return <div className={cardBase}>로딩 중...</div>;

  const summaryBarData = [
    { name: '목표', scope1: data.scope1Target, scope3: data.scope3Target },
    { name: '올해', scope1: data.scope1Current, scope3: data.scope3Current },
  ];

  return (
    <div className={cardBase}>
      <h3 className="text-4xl font-extrabold text-white text-center mb-0">{currentYear}년 배출량 현황</h3>
      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={summaryBarData} barCategoryGap={60} barSize={160} margin={{ top: 8, right: 30, left: 30, bottom:0 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} width={90} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 18 }}
              itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 16 }}
              formatter={(value: number | undefined, name: string | undefined) => [
                value !== undefined ? formatNumber(value) : '0',
                name ?? ''
              ]}
            />
            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 24, color: '#fff', fontWeight: 800, paddingLeft: '40px' }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 800 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope1" content={renderStackLabel} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope3" content={renderStackLabel} />
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
      <h3 className="text-4xl font-extrabold mb-5 text-white text-center">올해 월별 배출량 (Scope)</h3>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyChartData} margin={{ top: 15, right: 15, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} width={70} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 20 }}
              itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 19 }}
              formatter={(value: number | undefined, name: string | undefined) => [
                value !== undefined ? formatNumber(value) : '0',
                name ?? ''
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 24, color: '#fff', fontWeight: 800, paddingTop: 15 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 800 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={72} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope1" position="insideTop" fill="#0f172a" fontSize={24} fontWeight={800} formatter={labelFormatter} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={72} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope3" position="insideTop" fill="#0f172a" fontSize={24} fontWeight={800} formatter={labelFormatter} />
            </Bar>
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
// -----------------------------------------------------------------------
// [Partner Map Section - 협력사 지역별 현황]
// -----------------------------------------------------------------------
export const PartnerMapSection = ({ theme }: { theme?: 'dark' | 'light' }) => {
  const [mapData, setMapData] = useState<{ region: string; value: number }[]>([]);
  const businessYear = getBusinessYear();

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const response = await axiosInstance.get('/view/company', {
          params: { year: businessYear, month: 0 },
        });

        const payload = Array.isArray(response.data) ? response.data : [];

        const regionEmissionMap = new Map<string, number>();

        payload.forEach((company: any) => {
          const address = company.address || '';
          const regionMatch = address.match(/^([가-힣]+도|[가-힣]+시|세종)/);
          if (regionMatch) {
            const region = regionMatch[0];
            const current = regionEmissionMap.get(region) || 0;
            const emission = Number(company.totalEmission || company.value || 0);
            regionEmissionMap.set(region, current + emission);
          }
        });

        const aggregatedData = Array.from(regionEmissionMap, ([region, value]) => ({
          region,
          value: Math.round(value * 100) / 100,
        }));

        setMapData(aggregatedData);
      } catch (error) {
        console.warn('Company data 조회 실패:', error);
        // 실패 시 기본값
        setMapData([
          { region: '경기', value: 15000 },
          { region: '서울', value: 8000 },
          { region: '경북', value: 6000 },
        ]);
      }
    };

    loadCompanyData();
  }, []);

  return (
    <div className={`${cardBase} max-h-full`}>
      <h3 className="text-4xl font-extrabold mb-5 text-white text-center">협력사 지역별 배출량 현황</h3>
      <div className="flex-1 h-full">
        <KoreaMapChart data={mapData} large defaultFitAll theme={theme} />
      </div>
    </div>
  );
};

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
      <div className="flex-1 min-h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="5 5" stroke="#ffffff22" strokeWidth={2} />
            <XAxis dataKey="year" tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={{ fill: '#fff', fontSize: 24, fontWeight: 800 }} axisLine={axisStyle} tickLine={axisStyle} width={100} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={{ color: '#fff', fontWeight: 800, fontSize: 20 }}
              itemStyle={{ color: '#fff', fontWeight: 800, fontSize: 19 }}
              formatter={(value: number | undefined, name: string | undefined) => [
                value !== undefined ? formatNumber(value) : '0',
                name ?? ''
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 24, color: '#fff', fontWeight: 800, paddingTop: 12 }} formatter={(v) => <span style={{ color: '#fff', fontWeight: 800 }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={120} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope1" position="insideTop" fill="#0f172a" fontSize={24} fontWeight={800} formatter={labelFormatter} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={120} radius={[2, 2, 0, 0]}>
              <LabelList dataKey="scope3" position="insideTop" fill="#0f172a" fontSize={24} fontWeight={800} formatter={labelFormatter} />
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
  const pieCX = 55; // 퍼센트 값으로 파이 중심을 화면 우측으로 이동

  const renderCenterLabel = ({ cx, cy }: { cx?: number; cy?: number }) => {
    if (cx === undefined || cy === undefined) return null;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" pointerEvents="none">
        <tspan fill="#fff" fontSize={48} fontWeight={800}>100%</tspan>
        <tspan x={cx} dy={28} fill="#e5e7eb" fontSize={16} fontWeight={700}>Total</tspan>
      </text>
    );
  };

  useEffect(() => {
    fetchPurposeData().then((arr) => {
      // 값 내림차순으로 정렬하여 표시
      const sorted = [...arr].sort((a, b) => b.value - a.value);
      setPieData(sorted);
    });
  }, []);

  if (pieData.length === 0) return <div className={cardBase}>로딩 중...</div>;

  const legendItems = pieData.map((item, idx) => ({
    label: item.name,
    value: item.value,
    color: COLORS[idx % COLORS.length],
  }));

  const renderLegend = () => (
    <div className="flex flex-col gap-3 pr-4">
      {legendItems.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-3 text-white text-2xl font-extrabold">
          <span className="w-4 h-4 rounded-sm border border-white/30" style={{ backgroundColor: item.color }} />
          <span>
            {item.label} : <b>{item.value}%</b>
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cardBase}>
      <h3 className="text-4xl font-extrabold mb-5 text-white text-center">{currentYear}년 운행 목적별 배출량</h3>
      <div className="flex-1 relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx={`${pieCX}%`}
              cy="50%"
              innerRadius="45%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              label={renderCenterLabel}
              labelLine={false}
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
              content={renderLegend}
              wrapperStyle={{ fontSize: 24, color: '#fff', fontWeight: 800, paddingRight: '20px' }}
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
      setActivities(arr);
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
      <h3 className="text-4xl font-extrabold mb-10 text-white text-center">최근 저감 활동 {activities.length}건</h3>
      <ul className="space-y-0 text-white h-full flex flex-col justify-center">
        {activities.map((item) => (
          <li key={item.id} className="flex items-start gap-3 py-8 px-4 border-b border-white/10 hover:bg-white/5 transition-colors rounded">
            <span className="mt-1 block w-4 h-4 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 shrink-0 shadow-lg" />
            <div className="flex-1">
              <div className="font-bold text-white leading-snug text-2xl">
                {item.date && <span className="text-gray-400 mr-3">{formatDate(item.date)}</span>}
                {item.description}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
