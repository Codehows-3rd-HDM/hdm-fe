import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { getBusinessYear } from '../../utils/dateUtils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// ----------------------------------------------------------------------
// [Mock Data 생성]
// ----------------------------------------------------------------------

const currentYear = getBusinessYear();

const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  name: `${i + 1}월`,
  total: Math.floor(Math.random() * 500) + 500,
  target: Math.floor(Math.random() * 200) + 1000,
  scope1: Math.floor(Math.random() * 300) + 200,
  scope3: Math.floor(Math.random() * 300) + 200,
  lastYear: Math.floor(Math.random() * 500) + 400,
}));

const yearlyHistoryData = Array.from({ length: 5 }, (_, i) => ({
  year: currentYear - 5 + i,
  scope1: Math.floor(Math.random() * 1000) + 500,
  scope3: Math.floor(Math.random() * 1000) + 800,
}));

const rawPieData = [
  { name: '출퇴근', value: 35 },
  { name: '납품', value: 25 },
  { name: '출장', value: 20 },
  { name: '공정운영', value: 15 },
  { name: '기타', value: 5 },
];
const pieData = rawPieData.sort((a, b) => b.value - a.value);
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// ----------------------------------------------------------------------
// [Section 컴포넌트들]
// ----------------------------------------------------------------------

export const SummarySection = () => {
  const totalEmission = 8000;
  const targetEmission = 10000;
  const diff = ((targetEmission - totalEmission) / targetEmission) * 100;
  const simpleBarData = [
    { name: '2025년 탄소 배출량', value: totalEmission, fill: '#2c68ff' },
    { name: '목표 배출량', value: targetEmission, fill: '#e0e0e0' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-5 h-full flex flex-col overflow-hidden border border-white/20">
      {/* 상단 요약 */}
      <div className="flex justify-around mb-2.5 p-2.5 bg-white/10 rounded-lg">
        <div className="text-center">
          <div className="text-xs text-gray-300">올해의 총 배출량</div>
          <div className="text-xl font-bold text-green-400">
            {totalEmission.toLocaleString()} <span className="text-[11px]">tCO2eq</span>
          </div>
          <div className="text-[11px] text-green-400">▼ {diff.toFixed(0)}% (목표 대비)</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-300">올해의 목표 배출량</div>
          <div className="text-xl font-bold text-white">
            {targetEmission.toLocaleString()} <span className="text-[11px]">tCO2eq</span>
          </div>
        </div>
      </div>

      {/* 바 차트 */}
      <div className="flex-1 min-h-[180px] mb-2.5">
        <h4 className="text-[13px] text-center my-1.5 text-white">{currentYear}년 탄소 배출량</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={simpleBarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={11} interval={0} tick={{ dy: 5 }} />
            <YAxis hide />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
              <LabelList dataKey="value" position="top" fill="#333" fontSize={12}
                formatter={(val: any) => (typeof val === 'number' ? val.toLocaleString() : '')} />
              {simpleBarData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 월별 추이 */}
      <div className="flex-2 min-h-[200px]">
        <h4 className="text-[13px] text-center my-1.5 text-white">{currentYear}년 월별 배출량</h4>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            <Bar dataKey="total" name="월별 배출량" fill="#4a90e2" barSize={15} radius={[3, 3, 0, 0]} />
            <Line type="monotone" dataKey="target" name="목표 배출량" stroke="#ff7300" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ScopeAnalysisSection = () => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-5 h-full flex flex-col overflow-hidden border border-white/20">
    <h3 className="text-lg font-bold mb-2.5 text-white text-center">올해의 월별 탄소 배출량 (Scope)</h3>
    <div className="flex-1 min-h-[220px] mb-5">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#0056b3" barSize={20} />
          <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#fd7e14" barSize={20} />
          <Line type="monotone" dataKey="target" name="목표 배출량" stroke="#8884d8" strokeWidth={3} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>

    <h3 className="text-lg font-bold mb-2.5 text-white text-center">연간 탄소 배출량 (최근 5년)</h3>
    <div className="flex-1 min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yearlyHistoryData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#0056b3" barSize={30}>
            <LabelList dataKey="scope1" position="center" fill="#fff" fontSize={10} />
          </Bar>
          <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#fd7e14" barSize={30}>
            <LabelList dataKey="scope3" position="center" fill="#fff" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// [위젯 3] 비교 분석
export const ComparisonSection = () => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-5 h-full flex flex-col overflow-hidden border border-white/20">
    <h3 className="text-lg font-bold mb-2.5 text-white text-center">전년 대비 및 목표 비교</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={monthlyData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" fontSize={11} />
        <YAxis fontSize={11} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        <Line type="monotone" dataKey="total" name="올해 배출량" stroke="#28a745" strokeWidth={2} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="lastYear" name="전년도 배출량" stroke="#007bff" strokeWidth={2} />
        <Line type="monotone" dataKey="target" name="목표 배출량" stroke="#ffc107" strokeWidth={2} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// [위젯 4] 운행 목적 파이 차트
export const PurposePieSection = () => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-5 h-full flex flex-col overflow-hidden border border-white/20">
    <h3 className="text-lg font-bold mb-2.5 text-white text-center">{currentYear}년 운행 목적별 배출량</h3>
    <div className="flex-1 relative w-full h-full">
      {/* 중앙 텍스트 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] text-center pointer-events-none z-10 -mt-3.5">
        <div className="text-2xl font-bold text-white">100%</div>
        <div className="text-xs text-gray-300">Total</div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            fill="#8884d8"
            paddingAngle={3}
            dataKey="value"
          >
            {pieData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            layout="vertical"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: '15px', width: '100%' }}
            formatter={(value, entry: any) => (
              <span className="text-white ml-1.5">
                {value} : <b>{entry.payload.value}%</b>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);
