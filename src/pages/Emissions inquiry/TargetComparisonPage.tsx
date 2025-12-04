import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, ComposedChart, Line, LabelList, 
  Legend
} from 'recharts';
import { Printer, Download, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

// --- 타입 정의 ---
type ScopeType = 'total' | 'scope1' | 'scope3';

interface MonthlyTargetData {
  month: string;
  actual: number; // 실적
  target: number; // 목표
}

// useMemo에서 반환할 데이터 구조 확장
interface ChartData {
  totalActual: number;
  totalTarget: number;
  monthlyData: MonthlyTargetData[];
  lastReportingMonth: number; // 데이터가 존재하는 마지막 월 (1~12)
}

// --- 상수 정의 ---
const RECHARTS_COLORS = {
  red: '#ef4444',   // 목표 초과 (Tailwind red-500)
  green: '#22c55e', // 목표 달성 (Tailwind green-500)
  blue: '#3b82f6',  // 일반 (Tailwind blue-500)
  targetLine: '#f97316', // 목표 선 (Tailwind orange-500)
};

const DB_START_YEAR = 1979;

const TargetComparisonPage: React.FC = () => {
  // --- 상태 관리 ---
  const [selectedScope, setSelectedScope] = useState<ScopeType>('total');
  
  // 연도 선택: 1979년 ~ 현재 연도까지 동적 생성
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  
  const years = useMemo(() => {
      const yearList = [];
      for (let y = currentYear; y >= DB_START_YEAR; y--) {
        yearList.push(y.toString());
      }
      return yearList;
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  // --- Mock Data 생성 및 동적 월 기준 설정 ---
  const data: ChartData = useMemo(() => {
    const reportingYear = parseInt(selectedYear);
    const currentMonth = today.getMonth() + 1; // 1월: 1, 12월: 12
    
    // [개선] 데이터가 존재하는 마지막 월을 동적으로 설정
    // 현재 연도: 현재 월까지. 과거 연도: 12월까지.
    const lastReportingMonth = reportingYear < currentYear ? 12 : currentMonth; 
    
    // 1. 연간 총 데이터 계산 (Mock)
    const yearNum = parseInt(selectedYear);
    const isBadYear = yearNum % 2 === 0; 
    
    const baseTarget = selectedScope === 'total' ? 10000 : (selectedScope === 'scope1' ? 4000 : 6000);
    const totalTarget = baseTarget;
    
    // 실적은 보고된 월 수에 비례하여 조정될 수 있도록 Mockup
    const totalActualBase = isBadYear 
        ? baseTarget + Math.floor(Math.random() * 2000) + 500 
        : baseTarget - Math.floor(Math.random() * 1000);
    
    // 보고 월수에 따른 총 실적 조정 (단순화를 위해, 실제는 월별 합산)
    const totalActual = Math.floor(totalActualBase * (lastReportingMonth / 12)); 

    // 2. 월별 데이터 생성 (lastReportingMonth까지만 생성)
    const monthlyData: MonthlyTargetData[] = Array.from({ length: lastReportingMonth }, (_, i) => {
      const baseMonthTarget = Math.floor(totalTarget / lastReportingMonth); // 보고 월수로 나눔
      
      const targetVariance = Math.floor(Math.random() * 100) - 50; 
      const actualVariance = Math.floor(Math.random() * 200) - 100; 
      
      return {
          month: `${i + 1}월`,
          target: baseMonthTarget + targetVariance, 
          actual: Math.floor(totalActual / lastReportingMonth) + actualVariance // 총 실적을 보고 월수로 나눔
      };
    });

    return {
        totalActual,
        totalTarget,
        monthlyData,
        lastReportingMonth, // 동적으로 계산된 마지막 월 반환
    };
  }, [selectedYear, selectedScope, currentYear, today]); // 의존성 추가

  // --- 계산 로직 ---
  const diff = data.totalActual - data.totalTarget;
  // 목표는 연간 목표이므로, 퍼센트 계산 시에도 연간 목표를 사용
  const percent = ((Math.abs(diff) / data.totalTarget) * 100).toFixed(1); 
  const isExceeded = diff > 0; // 목표 초과 여부
  
  const statusColorClass = isExceeded ? 'text-red-500' : 'text-green-500';
  const statusRechartsColor = isExceeded ? RECHARTS_COLORS.red : RECHARTS_COLORS.green;
  
  // 기준 월 텍스트
  const monthCriterionText = `${data.lastReportingMonth}월까지 기준`;

  // 차트용 데이터
  const annualChartData = [
      { name: `${selectedYear}년 총 배출량`, value: data.totalActual },
      { name: '목표 배출량', value: data.totalTarget }
  ];

  // --- 이벤트 핸들러 ---
  const handlePrint = () => window.print();
  
  const handleDownloadExcel = () => {
    const headers = "Month,Actual Emission,Target Emission\n";
    const rows = data.monthlyData.map(d => `${d.month},${d.actual},${d.target}`).join("\n");
    const csvContent = `\ufeffYear: ${selectedYear}, Scope: ${selectedScope}\n${headers}${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Target_vs_Emission_${selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* 헤더 */}
      <header className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-800">목표 대비 탄소 배출량</h2>
        <div className="flex gap-3">
          {/* Print 버튼 */}
          <button 
            onClick={handlePrint} 
            className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition duration-150"
          >
            <Printer size={16} className="mr-2" />
            인쇄
          </button>
          {/* Excel 다운로드 버튼 */}
          {/* <button 
            onClick={handleDownloadExcel} 
            className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-500 border border-green-500 rounded-lg shadow-md hover:bg-green-600 transition duration-150"
          >
            <Download size={16} className="mr-2" /> 
            Excel 다운로드
          </button> */}
        </div>
      </header>

      {/* 1. 탭 (Scope 선택) */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-3">
        {['total', 'scope1', 'scope3'].map((scope) => (
            <button
                key={scope}
                onClick={() => setSelectedScope(scope as ScopeType)}
                className={`
                    px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200 
                    ${selectedScope === scope 
                        ? 'bg-gray-800 text-white border-gray-800 shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                    }
                    flex items-center
                `}
            >
                {scope === 'total' ? '✓ 총 배출량' : scope === 'scope1' ? 'Scope 1' : 'Scope 3'}
            </button>
        ))}
      </div>

      {/* 2. KPI 카드 (연도 선택 포함) */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex flex-1 gap-5 bg-white p-6 rounded-xl shadow-lg border-l-4 border-amber-500 relative">
            
            {/* 총 배출량 (실적) */}
            <div className="flex-1 pr-5 border-r border-gray-200">
                <div className="text-sm text-gray-600 mb-1">{selectedYear}년도 총 배출량</div>
                <div className={`text-4xl font-extrabold mb-1 ${statusColorClass}`}>
                    {data.totalActual.toLocaleString()} <span className="text-xl text-gray-700">tCO2eq</span>
                </div>
                {/* 차이 및 증감률 */}
                <div className={`flex items-center font-bold text-sm ${statusColorClass}`}>
                    {isExceeded ? 
                      <TrendingUp size={16} className="mr-1" /> : 
                      <TrendingDown size={16} className="mr-1" />
                    }
                    {diff > 0 ? '+' : ''}{diff.toLocaleString()} tCO2eq ({percent}%)
                </div>
                {/* 동적 월 기준 적용 */}
                <div className="text-xs text-gray-500 mt-2 text-right">*{monthCriterionText}</div>
            </div>

            {/* 목표 배출량 */}
            <div className="flex-1 pl-5">
                <div className="text-sm text-gray-600 mb-1">{selectedYear}년 목표 배출량</div>
                <div className="text-4xl font-extrabold text-gray-800 mb-1">
                    {data.totalTarget.toLocaleString()} <span className="text-xl text-gray-700">tCO2eq</span>
                </div>
                {/* 동적 월 기준 적용 */}
                <div className="text-xs text-gray-500 mt-9 text-right">*{monthCriterionText}</div>
            </div>

            {/* 연도 선택 드롭다운 */}
            <div className="absolute top-5 right-5">
                <div className="relative">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="pl-4 pr-8 py-2 text-sm rounded-full border border-gray-400 font-semibold cursor-pointer appearance-none bg-white focus:ring-2 focus:ring-sky-500"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}년</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-600" />
                </div>
            </div>
        </div>
      </div>

      {/* 3. 연간 비교 차트 */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-sky-500 mb-8 h-[400px]">
        <h3 className="text-center text-xl font-bold text-gray-800 mb-2">
            {selectedYear}년 탄소 배출량 비교 (실적 vs 목표)
        </h3>
        <ResponsiveContainer width="100%" height="90%">
            <BarChart
                data={annualChartData}
                margin={{ top: 30, right: 30, left: 30, bottom: 20 }}
                barSize={100}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                <Tooltip 
                  formatter={(val: number) => `${val.toLocaleString()} tCO2eq`} 
                  labelFormatter={(name) => name}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: '1px solid #ccc', 
                    padding: '10px', 
                    fontSize: '14px' 
                  }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                />
                
                <Bar dataKey="value">
                    <LabelList 
                        dataKey="value" 
                        position="top" 
                        fill="#374151" 
                        fontSize={14} 
                        fontWeight="bold" 
                        formatter={(val: any) => { 
                            if (typeof val === 'number') {
                                return val.toLocaleString();
                            }
                            return ''; 
                        }} 
                    />
                    {
                        annualChartData.map((_entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={index === 0 ? statusRechartsColor : RECHARTS_COLORS.blue} 
                            />
                        ))
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. 월별 추이 차트 */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-sky-500 h-[500px]">
        <h3 className="text-center text-xl font-bold text-gray-800 mb-2">
            {selectedYear}년 월별 탄소 배출량 추이
        </h3>
        {/* [개선] 동적 월 기준 적용 */}
        <div className="text-xs text-gray-500 text-right mb-4">*{monthCriterionText}</div>
        
        <ResponsiveContainer width="100%" height="85%">
            <ComposedChart data={data.monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis label={{ value: 'tCO2eq', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                <Tooltip formatter={(val: number) => `${val.toLocaleString()} tCO2eq`} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                
                {/* 실적 (막대) */}
                <Bar dataKey="actual" name={`${selectedYear}년 실적`} fill={RECHARTS_COLORS.blue} barSize={40} radius={[4, 4, 0, 0]} />
                
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
  );
};

export default TargetComparisonPage;