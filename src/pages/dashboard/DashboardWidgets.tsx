import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, ComposedChart, PieChart, Pie, Cell, LabelList 
} from 'recharts';
import { getBusinessYear } from '../../utils/dateUtils';

// ----------------------------------------------------------------------
// [공통 스타일 및 유틸]
// ----------------------------------------------------------------------

// 카드 스타일: 모든 위젯의 기본 컨테이너
const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  padding: '20px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  overflow: 'hidden', // 내부 차트가 넘치지 않도록 방지
};

const titleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '10px',
  color: '#333',
  textAlign: 'center',
};

// ----------------------------------------------------------------------
// [Mock Data 생성]
// ----------------------------------------------------------------------

const currentYear = getBusinessYear();

// 월별 목표 배출량을 매월 다르게 설정
// Array.from을 이용해 1~12월 데이터를 생성합니다.
const monthlyData = Array.from({ length: 12 }, (_, i) => ({
  name: `${i + 1}월`,
  // 실제 배출량 (랜덤)
  total: Math.floor(Math.random() * 500) + 500, 
  // [수정] 목표 배출량 (월마다 다르게 랜덤하게 변동)
  target: Math.floor(Math.random() * 200) + 1000, 
  // Scope1, 3 데이터
  scope1: Math.floor(Math.random() * 300) + 200,
  scope3: Math.floor(Math.random() * 300) + 200,
  // 전년도 데이터
  lastYear: Math.floor(Math.random() * 500) + 400,
}));

// 최근 10년 연간 데이터
const yearlyHistoryData = Array.from({ length: 10 }, (_, i) => ({
  year: currentYear - 9 + i,
  scope1: Math.floor(Math.random() * 1000) + 500,
  scope3: Math.floor(Math.random() * 1000) + 800,
}));

// 파이차트 데이터: 값이 높은 순으로 정렬
const rawPieData = [
  { name: '출퇴근', value: 35 },
  { name: '납품', value: 25 },
  { name: '출장', value: 20 },
  { name: '공정운영', value: 15 },
  { name: '기타', value: 5 },
];
// value 기준 내림차순 정렬 (높은게 먼저 오도록)
const pieData = rawPieData.sort((a, b) => b.value - a.value);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];


// ----------------------------------------------------------------------
// [위젯 1] 종합 요약 & 월별 추이 (그래프 짤림 수정 & 값 표시 추가)
// ----------------------------------------------------------------------
export const SummarySection = () => {
  const totalEmission = 8000;
  const targetEmission = 10000;
  const diff = ((targetEmission - totalEmission) / targetEmission) * 100;

  // 1번 영역 상단 막대그래프 데이터
  const simpleBarData = [
    { name: '2025년 탄소 배출량', value: totalEmission, fill: '#2c68ff' },
    { name: '목표 배출량', value: targetEmission, fill: '#e0e0e0' }
  ];

  return (
    <div style={cardStyle}>
      {/* 1-1. 텍스트 요약 정보 */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>올해의 총 배출량</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
            {totalEmission.toLocaleString()} <span style={{fontSize:'11px'}}>tCO2eq</span>
          </div>
          <div style={{ fontSize: '11px', color: '#28a745' }}>▼ {diff.toFixed(0)}% (목표 대비)</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>올해의 목표 배출량</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            {targetEmission.toLocaleString()} <span style={{fontSize:'11px'}}>tCO2eq</span>
          </div>
        </div>
      </div>

      {/* 1-2. 단순 비교 막대 차트 */}
      <div style={{ flex: 1, minHeight: '180px', marginBottom: '10px' }}>
        <h4 style={{ fontSize: '13px', textAlign: 'center', margin: '5px 0' }}>{currentYear}년 탄소 배출량</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={simpleBarData} 
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }} // [수정 2] 마진 확보 (라벨 짤림 방지)
            barSize={40} // 막대 두께
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
                dataKey="name" 
                fontSize={11} 
                interval={0} // 모든 라벨 표시 강제
                tick={{ dy: 5 }} // 라벨 위치 살짝 아래로
            />
            <YAxis hide /> {/* Y축 숨김 (깔끔하게) */}
            <Tooltip cursor={{fill: 'transparent'}} />
            
            <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {/* [수정 5] 값 텍스트 표시 (막대 위) */}
                <LabelList dataKey="value" position="top" fill="#333" fontSize={12} formatter={(val: number) => val.toLocaleString()} />
                {
                  simpleBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))
                }
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 1-3. 월별 추이 (하단) */}
      <div style={{ flex: 2, minHeight: '200px' }}>
        <h4 style={{ fontSize: '13px', textAlign: 'center', margin: '5px 0' }}>{currentYear}년 월별 배출량</h4>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={monthlyData}
            margin={{ top: 20, right: 10, left: -20, bottom: 10 }} // [수정 2] 마진 조절
          >
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


// ----------------------------------------------------------------------
// [위젯 2] Scope 분석 & 10년 추이 (그래프 짤림 & 값 표시)
// ----------------------------------------------------------------------
export const ScopeAnalysisSection = () => {
  return (
    <div style={cardStyle}>
      {/* 2-1. 월별 Scope 분석 */}
      <h3 style={titleStyle}>올해의 월별 탄소 배출량 (Scope)</h3>
      <div style={{ flex: 1, minHeight: '220px', marginBottom: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={monthlyData}
            margin={{ top: 20, right: 10, left: -20, bottom: 0 }} // 마진 확보
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            
            {/* 스택형 바 차트 */}
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#0056b3" barSize={20} />
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#fd7e14" barSize={20} />
            
            <Line type="monotone" dataKey="target" name="목표 배출량" stroke="#8884d8" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 2-2. 10년 추이 */}
      <h3 style={titleStyle}>연간 탄소 배출량 (최근 10년)</h3>
      <div style={{ flex: 1, minHeight: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={yearlyHistoryData}
            margin={{ top: 30, right: 10, left: -20, bottom: 0 }} // [수정 2] 상단 마진을 넉넉히 줘서 합계 라벨 공간 확보
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px' }} />

            {/* [수정 5] 값 텍스트 표시: Scope1 (내부), Scope3 (내부) */}
            <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="#0056b3" barSize={30}>
                 {/* 바 내부에 값 표시 (흰색) */}
                <LabelList dataKey="scope1" position="center" fill="#fff" fontSize={10} />
            </Bar>
            <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="#fd7e14" barSize={30}>
                 {/* 바 내부에 값 표시 (흰색) */}
                <LabelList dataKey="scope3" position="center" fill="#fff" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// [위젯 3] 비교 분석 (기존 유지, 마진만 살짝 수정)
// ----------------------------------------------------------------------
export const ComparisonSection = () => {
  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>전년 대비 및 목표 비교</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
            data={monthlyData}
            margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
        >
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
};


// ----------------------------------------------------------------------
// [위젯 4] 운행 목적 파이 차트 (중앙 텍스트 정렬 & 데이터 정렬)
// ----------------------------------------------------------------------

export const PurposePieSection = () => {
  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>{currentYear}년 운행 목적별 배출량</h3>
      
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        {/* transform: translate(-50%, -50%)를 사용해 정확히 부모 div의 중앙에 배치 */}
        <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -120%)', 
            textAlign: 'center', 
            pointerEvents: 'none', 
            zIndex: 10,
            marginTop: '-15px' // 범례 높이 고려하여 약간 위로 보정
        }}>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333' }}>100%</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total</div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData} // 이미 value 기준으로 정렬된 데이터 사용
              cx="50%"
              cy="50%"
              innerRadius={70} // 도넛 안쪽 반지름
              outerRadius={110} // 도넛 바깥쪽 반지름
              fill="#8884d8"
              paddingAngle={3} // 조각 사이 간격
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
                layout="vertical"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '15px', width: '100%' }}
                payload={pieData.map((item, index) => ({
                    id: item.name,
                    type: "square",
                    value: item.name,
                    color: COLORS[index % COLORS.length],
                    payload: item
                }))}
                formatter={(value, entry: any) => (
                    <span style={{ color: '#333', marginLeft: '5px' }}>
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