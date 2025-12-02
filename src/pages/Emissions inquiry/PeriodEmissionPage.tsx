import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList 
} from 'recharts';
import { Printer, Calendar as CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { commonStyles } from '../../styles/commonStyles'; // 공통 스타일 임포트

// --- 타입 및 Mock Data ---
const COLORS = {
  scope1: '#4a90e2', // 파랑
  scope3: '#f58220', // 주황
};

const PeriodEmissionPage: React.FC = () => {
  // 1. 기간 선택 상태 (기본값 설정)
  const [startDate, setStartDate] = useState('2024-01-12');
  const [endDate, setEndDate] = useState('2025-01-11');

  // --- Mock Data 생성 로직 (날짜 바뀌면 데이터 변하는 척) ---
  const data = useMemo(() => {
    // 실제로는 API에 startDate, endDate를 보내서 받아와야 함
    
    // 선택 기간 데이터
    const currentScope1 = Math.floor(Math.random() * 5000) + 10000;
    const currentScope3 = Math.floor(Math.random() * 5000) + 15000;
    const currentTotal = currentScope1 + currentScope3;

    // 전년도 동기간 데이터 (비교용)
    const prevScope1 = Math.floor(Math.random() * 5000) + 12000;
    const prevScope3 = Math.floor(Math.random() * 5000) + 16000;
    const prevTotal = prevScope1 + prevScope3;

    // 차트 데이터 배열
    const chartData = [
      {
        name: '선택기간',
        scope1: currentScope1,
        scope3: currentScope3,
        total: currentTotal,
      },
      {
        name: '전년도 동기간',
        scope1: prevScope1,
        scope3: prevScope3,
        total: prevTotal,
      },
    ];

    // 운행 거리 (Mock)
    const distance = Math.floor(Math.random() * 500000) + 1000000;

    return { chartData, currentTotal, prevTotal, distance };
  }, [startDate, endDate]);

  // --- 증감 계산 ---
  const diff = data.currentTotal - data.prevTotal;
  const percent = ((Math.abs(diff) / data.prevTotal) * 100).toFixed(1);
  const isDecreased = diff < 0; // 감소했는지 (좋은 것)

  // --- 이벤트 핸들러 ---
  const handlePrint = () => window.print();

  return (
    <div style={commonStyles.pageContainer}>
      
      {/* 4. 헤더 (타이틀 + 프린트 버튼) */}
      <div style={commonStyles.header}>
        <h2 style={commonStyles.title}>기간별 탄소 총 배출량 (Scope 1, Scope 3)</h2>
        <button onClick={handlePrint} style={commonStyles.button('white')}>
          <Printer size={16} style={{ marginRight: '5px' }} /> Print
        </button>
      </div>

      {/* 1. 기간 선택 영역 */}
      <div style={{ ...commonStyles.card, marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          <CalendarIcon size={18} style={{ marginRight: '8px' }} /> 기간 선택
        </h3>
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-end' }}>
          {/* Start Date */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          
          <span style={{ paddingBottom: '10px', fontWeight: 'bold', color: '#666' }}>to</span>

          {/* End Date */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* 하단 콘텐츠 영역 (좌: 차트, 우: 정보 카드) */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        
        {/* 2. 막대 그래프 영역 */}
        <div style={{ ...commonStyles.card, flex: 1, minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#555' }}>기간별 탄소배출량</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 'bold' }} />
              <YAxis />
              <Tooltip formatter={(val: number) => val.toLocaleString()} cursor={{fill: 'transparent'}} />
              <Legend />
              
              {/* Stacked Bar */}
              <Bar dataKey="scope1" name="Scope 1" stackId="a" fill={COLORS.scope1}>
                 {/* 내부 값 표시 */}
                 <LabelList dataKey="scope1" position="center" fill="white" fontSize={12} />
              </Bar>
              <Bar dataKey="scope3" name="Scope 3" stackId="a" fill={COLORS.scope3}>
                <LabelList dataKey="scope3" position="center" fill="white" fontSize={12} />
                <LabelList 
                    dataKey="total" 
                    position="top" 
                    fill="#333" 
                    fontWeight="bold" 
                    formatter={(val: any) => { // 타입을 any로 변경
                        // val이 유효한 숫자인지 확인 후 포맷팅
                        if (typeof val === 'number') {
                            return val.toLocaleString();
                        }
                        return ''; // 숫자가 아니면 빈 문자열 반환
                    }} 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. 정보 카드 영역 (우측) */}
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 카드 1: 배출량 비교 정보 */}
          <div style={{ ...commonStyles.card, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* 전년도 */}
            <div style={{ marginBottom: '30px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>전년도 동기간 배출량</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>
                    {data.prevTotal.toLocaleString()} <span style={{ fontSize: '16px' }}>tCO2eq</span>
                </div>
            </div>

            {/* 선택기간 */}
            <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>선택기간 총 배출량</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: isDecreased ? '#28a745' : '#dc3545' }}>
                    {data.currentTotal.toLocaleString()} <span style={{ fontSize: '16px', color: '#333' }}>tCO2eq</span>
                </div>
                {/* 증감률 */}
                <div style={{ 
                    display: 'flex', alignItems: 'center', marginTop: '5px', fontWeight: 'bold', fontSize: '14px',
                    color: isDecreased ? '#28a745' : '#dc3545' 
                }}>
                    {isDecreased ? <TrendingDown size={18} style={{ marginRight: '5px' }} /> : <TrendingUp size={18} style={{ marginRight: '5px' }} />}
                    {Math.abs(diff).toLocaleString()} tCO2eq ({percent}%)
                </div>
            </div>
          </div>

          {/* 카드 2: 운행거리 */}
          <div style={{ ...commonStyles.card, height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>선택기간 총 운행거리</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
                {data.distance.toLocaleString()} <span style={{ fontSize: '18px' }}>km</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- 컴포넌트 내부 전용 스타일 ---
const inputStyle: React.CSSProperties = {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  backgroundColor: '#f9f9f9',
  width: '160px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export default PeriodEmissionPage;