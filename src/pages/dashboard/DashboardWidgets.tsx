import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Line, ComposedChart, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { getBusinessYear } from '../../utils/dateUtils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import KoreaMapChart from '../../components/analysis/KoreaMapChart';

// ----------------------------------------------------------------------
// [Mock Data 생성]
// ----------------------------------------------------------------------

const currentYear = getBusinessYear();

const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  name: `${i + 1}월`,
  target: Math.floor(Math.random() * 200) + 1200,
  scope1: Math.floor(Math.random() * 400) + 400,
  scope3: Math.floor(Math.random() * 400) + 350,
}));

const yearlyHistoryData = Array.from({ length: 5 }, (_, i) => ({
  year: currentYear - 5 + i,
  scope1: Math.floor(Math.random() * 1200) + 600,
  scope3: Math.floor(Math.random() * 1200) + 700,
  target: Math.floor(Math.random() * 2400) + 1500,
}));

const rawPieData = [
  { name: '출퇴근', value: 35 },
  { name: '납품', value: 25 },
  { name: '출장', value: 20 },
  { name: '공정운영', value: 15 },
  { name: '기타', value: 5 },
];
const pieData = rawPieData.sort((a, b) => b.value - a.value);
const COLORS = ['#60a5fa', '#22d3ee', '#fbbf24', '#fb7185', '#c084fc'];

const reductionItems = [
  '물류 동선 최적화로 연료 8% 절감',
  '야간 공정 전력 피크 컷 적용',
  '폐열 회수 보일러 시범 운영',
  '사내 EV 충전 인센티브 도입',
  '친환경 포장재 전환 파일럿 착수',
];

const cardBase = 'bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-5 h-full flex flex-col overflow-hidden border border-white/30';
const axisStyle = { stroke: '#fff', strokeWidth: 2 };
const tickStyle = { fill: '#fff', fontSize: 12, fontWeight: 600 };
const legendStyle = { fontSize: 13, color: '#fff' };
const tooltipStyle = { backgroundColor: 'rgba(15,23,42,0.9)', borderRadius: 8, border: '1px solid #334155' };

// ----------------------------------------------------------------------
// [Section 컴포넌트들]
// ----------------------------------------------------------------------

export const SummarySection = () => {
  const scope1 = 4200;
  const scope3 = 3800;
  const targetScope1 = 5000;
  const targetScope3 = 5000;
  const total = scope1 + scope3;
  const target = targetScope1 + targetScope3;
  const diff = ((target - total) / target) * 100;

  const scopeBarData = [
    { name: 'Scope 1', value: scope1, fill: '#60a5fa' },
    { name: 'Scope 3', value: scope3, fill: '#22d3ee' },
  ];

  return (
    <div className={`${cardBase}`}>
      <div className="flex justify-between gap-4 mb-4 bg-white/10 rounded-lg p-4">
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-200">올해 총 배출량</div>
          <div className="text-3xl font-extrabold text-white leading-tight">
            {total.toLocaleString()} <span className="text-base">tCO₂eq</span>
          </div>
          <div className="text-sm text-emerald-300 font-semibold">▼ {diff.toFixed(0)}% (목표 대비)</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-200">목표 배출량</div>
          <div className="text-3xl font-extrabold text-white leading-tight">
            {target.toLocaleString()} <span className="text-base">tCO₂eq</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] mb-4">
        <h4 className="text-lg font-bold text-white text-center mb-3">{currentYear}년 배출량 (Scope)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scopeBarData} barCategoryGap={30} barSize={48} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#ffffff22" />
            <XAxis dataKey="name" tick={tickStyle} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={tickStyle} axisLine={axisStyle} tickLine={axisStyle} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff', fontWeight: 700 }} itemStyle={{ color: '#fff' }} />
            <Bar dataKey="value" radius={[8, 8, 4, 4]}>
              <LabelList dataKey="value" position="top" fill="#fff" fontSize={14} fontWeight={700} formatter={(val: number) => val.toLocaleString()} />
              {scopeBarData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 min-h-[200px]">
        <h4 className="text-lg font-bold text-white text-center mb-3">연간 탄소 배출량 (최근 5년)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyHistoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#ffffff22" />
            <XAxis dataKey="year" tick={tickStyle} axisLine={axisStyle} tickLine={axisStyle} />
            <YAxis tick={tickStyle} axisLine={axisStyle} tickLine={axisStyle} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff', fontWeight: 700 }} itemStyle={{ color: '#fff' }} />
            <Legend wrapperStyle={legendStyle} formatter={(v) => <span style={{ color: '#fff' }}>{v}</span>} />
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={32}>
              <LabelList dataKey="scope1" position="insideTop" fill="#0f172a" fontSize={12} fontWeight={700} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={32}>
              <LabelList dataKey="scope3" position="insideTop" fill="#0f172a" fontSize={12} fontWeight={700} />
            </Bar>
            <Line type="monotone" dataKey="target" name="목표" stroke="#fbbf24" strokeWidth={4} dot={{ r: 4 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const MonthlyScopeSection = () => (
  <div className={cardBase}>
    <h3 className="text-xl font-bold mb-3 text-white text-center">올해 월별 배출량 (Scope)</h3>
    <div className="flex-1 min-h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#ffffff22" />
          <XAxis dataKey="name" tick={tickStyle} axisLine={axisStyle} tickLine={axisStyle} />
          <YAxis tick={tickStyle} axisLine={axisStyle} tickLine={axisStyle} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff', fontWeight: 700 }} itemStyle={{ color: '#fff' }} />
          <Legend wrapperStyle={legendStyle} formatter={(v) => <span style={{ color: '#fff' }}>{v}</span>} />
          <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#60a5fa" barSize={26} radius={[6, 6, 2, 2]} />
          <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#22d3ee" barSize={26} radius={[6, 6, 2, 2]} />
          <Line type="monotone" dataKey="target" name="목표" stroke="#fbbf24" strokeWidth={4} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const PartnerMapSection = () => (
  <div className={`${cardBase} min-h-[420px]`}>
    <h3 className="text-xl font-bold mb-3 text-white text-center">협력사 지역별 현황</h3>
    <div className="flex-1 h-full">
      <KoreaMapChart large />
    </div>
  </div>
);

// [위젯 4] 운행 목적 파이 차트
export const PurposePieSection = () => (
  <div className={cardBase}>
    <h3 className="text-xl font-bold mb-3 text-white text-center">{currentYear}년 운행 목적별 배출량</h3>
    <div className="flex-1 relative w-full h-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] text-center pointer-events-none z-10 -mt-3.5">
        <div className="text-3xl font-bold text-white">100%</div>
        <div className="text-sm text-gray-200">Total</div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="45%"
            cy="50%"
            innerRadius={80}
            outerRadius={130}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff', fontWeight: 700 }} itemStyle={{ color: '#fff' }} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ ...legendStyle, padding: '8px 0', color: '#fff' }}
            formatter={(value, entry: any) => (
              <span className="text-white ml-1.5 font-semibold">
                {value} : <b>{entry.payload.value}%</b>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const ReductionListSection = () => (
  <div className={cardBase}>
    <h3 className="text-xl font-bold mb-3 text-white text-center">최근 저감 활동 5건</h3>
    <ul className="space-y-3 text-white text-base font-semibold">
      {reductionItems.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-1 block w-2 h-2 rounded-full bg-emerald-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
