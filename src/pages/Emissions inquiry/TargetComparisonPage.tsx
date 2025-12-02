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

// --- 스타일 상수 ---
const COLORS = {
  red: '#dc3545',   // 목표 초과 (위험)
  green: '#28a745', // 목표 달성 (안전)
  blue: '#4a90e2',  // 일반 (목표 그래프용)
};

const TargetComparisonPage: React.FC = () => {
  // --- 상태 관리 ---
  const [selectedScope, setSelectedScope] = useState<ScopeType>('total');
  
  // 연도 선택: 1979년 ~ 현재 연도까지 동적 생성
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
      const yearList = [];
      for (let y = currentYear; y >= 1979; y--) {
          yearList.push(y.toString());
      }
      return yearList;
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  // --- Mock Data 생성 ---
  const data = useMemo(() => {
    // 1. 연간 총 데이터 계산 (Mock)
    // 짝수 해는 초과, 홀수 해는 달성으로 시뮬레이션
    const yearNum = parseInt(selectedYear);
    const isBadYear = yearNum % 2 === 0; 
    
    const baseTarget = selectedScope === 'total' ? 10000 : (selectedScope === 'scope1' ? 4000 : 6000);
    const totalTarget = baseTarget;
    
    const totalActual = isBadYear 
        ? baseTarget + Math.floor(Math.random() * 2000) + 500 
        : baseTarget - Math.floor(Math.random() * 1000);

    // 2. 월별 데이터 생성
    const monthlyData: MonthlyTargetData[] = Array.from({ length: 12 }, (_, i) => {
        const baseMonthTarget = Math.floor(totalTarget / 12);
        
        // 월별 목표치에도 변동(Variance) 부여
        // 목표치도 계절성이나 상황에 따라 조금씩 다를 수 있음을 표현
        const targetVariance = Math.floor(Math.random() * 150) - 75; 
        const actualVariance = Math.floor(Math.random() * 400) - 200; 
        
        return {
            month: `${i + 1}월`,
            target: baseMonthTarget + targetVariance, // 목표값도 흔들리게 설정
            actual: Math.floor(totalActual / 12) + actualVariance
        };
    });

    return {
        totalActual,
        totalTarget,
        monthlyData
    };
  }, [selectedYear, selectedScope]);

  // --- 계산 로직 ---
  const diff = data.totalActual - data.totalTarget;
  const percent = ((Math.abs(diff) / data.totalTarget) * 100).toFixed(1);
  const isExceeded = diff > 0; // 목표 초과 여부
  const statusColor = isExceeded ? COLORS.red : COLORS.green;

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
    <div style={{ padding: '30px', fontFamily: 'Malgun Gothic, sans-serif', minHeight: '100%' }}>
      
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>목표 대비 탄소 배출량</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handlePrint} style={btnStyle('white', '#333', true)}>
            <Printer size={16} style={{ marginRight: '5px' }} /> Print
          </button>
          <button onClick={handleDownloadExcel} style={btnStyle('white', '#28a745', true)}>
            <Download size={16} style={{ marginRight: '5px' }} /> Excel
          </button>
        </div>
      </div>

      {/* 1. 탭 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        {['total', 'scope1', 'scope3'].map((scope) => (
            <button
                key={scope}
                onClick={() => setSelectedScope(scope as ScopeType)}
                style={{
                    padding: '10px 20px',
                    borderRadius: '20px',
                    border: selectedScope === scope ? `1px solid #333` : '1px solid #eee',
                    backgroundColor: selectedScope === scope ? '#333' : '#fff',
                    color: selectedScope === scope ? '#fff' : '#666',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {scope === 'total' ? '✓ 총 배출량' : scope === 'scope1' ? 'Scope 1' : 'Scope 3'}
            </button>
        ))}
      </div>

      {/* 2. KPI 카드 (연도 선택 포함) */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1, display: 'flex', gap: '20px', backgroundColor: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #ffc107', position: 'relative' }}>
            {/* 총 배출량 */}
            <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid #eee' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{selectedYear}년도 총 배출량</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: statusColor, marginBottom: '5px' }}>
                    {data.totalActual.toLocaleString()} <span style={{ fontSize: '16px', color: '#333' }}>tCO2eq</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: statusColor, fontWeight: 'bold', fontSize: '14px' }}>
                    {isExceeded ? <TrendingUp size={16} style={{ marginRight: '5px' }} /> : <TrendingDown size={16} style={{ marginRight: '5px' }} />}
                    {diff > 0 ? '+' : ''}{diff.toLocaleString()} tCO2eq ({percent}%)
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '5px', textAlign: 'right' }}>*12월까지 기준</div>
            </div>

            {/* 목표 배출량 */}
            <div style={{ flex: 1, paddingLeft: '20px' }}>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>{selectedYear}년 목표 배출량</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
                    {data.totalTarget.toLocaleString()} <span style={{ fontSize: '16px', color: '#333' }}>tCO2eq</span>
                </div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '30px', textAlign: 'right' }}>*12월까지 기준</div>
            </div>

            {/* 연도 선택 드롭다운 (동적 생성된 years 사용) */}
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        style={{ 
                            padding: '8px 30px 8px 15px', 
                            borderRadius: '20px', 
                            border: '1px solid #333', 
                            appearance: 'none', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: '#fff'
                        }}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}년</option>
                        ))}
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
            </div>
        </div>
      </div>

      {/* 연간 비교 차트 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #ffc107', marginBottom: '30px', height: '350px' }}>
        <h3 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            {selectedYear}년 탄소 배출량 비교
        </h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={annualChartData}
                margin={{ top: 30, right: 30, left: 30, bottom: 20 }} // 라벨 공간 확보를 위한 마진 설정
                barSize={80}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                <YAxis />
                <Tooltip formatter={(val: number) => val.toLocaleString()} cursor={{ fill: 'transparent' }} />
                
                <Bar dataKey="value">
                    {/* 막대 위 텍스트 값 표시 (진한 색상) */}
                    <LabelList 
                        dataKey="value" 
                        position="top" 
                        fill="#333" 
                        fontSize={14} 
                        fontWeight="bold" 
                        formatter={(val: any) => { // 타입을 any로 변경
                            // val이 유효한 숫자인지 확인 후 포맷팅
                            if (typeof val === 'number') {
                                return val.toLocaleString();
                            }
                            return ''; // 숫자가 아니면 빈 문자열 반환
                        }} 
                    />
                    {
                        annualChartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? statusColor : COLORS.blue} />
                        ))
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 4. 월별 추이 차트 */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #ffc107', height: '450px' }}>
        <h3 style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            {selectedYear}년 월별 탄소 배출량 추이
        </h3>
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#999', marginBottom: '10px' }}>*12월까지 기준</div>
        
        <ResponsiveContainer width="100%" height="90%">
            <ComposedChart data={data.monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(val: number) => val.toLocaleString()} />
                <Legend />
                <Bar dataKey="actual" name={`${selectedYear}년 실적`} fill="#4a90e2" barSize={30} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="target" name="목표 배출량" stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

const btnStyle = (bg: string, color: string, border: boolean) => ({
    padding: '8px 15px',
    backgroundColor: bg,
    color: color,
    border: border ? `1px solid ${color === '#333' ? '#ccc' : color}` : 'none',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px'
});

export default TargetComparisonPage;