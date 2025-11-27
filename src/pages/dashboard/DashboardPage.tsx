import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { SummarySection, ScopeAnalysisSection, ComparisonSection, PurposePieSection } from './DashboardWidgets';
import { getBusinessYear } from '../../utils/dateUtils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// WidthProvider를 사용하여 브라우저 리사이징 시 그리드 너비 자동 조정
const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage: React.FC = () => {
  const currentYear = getBusinessYear();

  // --- 레이아웃 설정 (추후 DB 저장 가능) ---
  // w: 너비 (총 12칸 기준), h: 높이
  const initialLayouts = {
    lg: [
      { i: 'section1', x: 0, y: 0, w: 4, h: 10 }, // 1. 종합 요약 (좌측 상단)
      { i: 'section2', x: 4, y: 0, w: 8, h: 10 }, // 2. Scope & 10년 추이 (우측 상단 크게)
      { i: 'section3', x: 0, y: 10, w: 8, h: 8 }, // 3. 3개 라인 비교 (좌측 하단)
      { i: 'section4', x: 8, y: 10, w: 4, h: 8 }, // 4. 파이 차트 (우측 하단)
    ],
    // 태블릿/모바일 등 작은 화면 레이아웃도 정의 가능
    md: [
        { i: 'section1', x: 0, y: 0, w: 6, h: 10 },
        { i: 'section2', x: 6, y: 0, w: 6, h: 10 },
        { i: 'section3', x: 0, y: 10, w: 6, h: 8 },
        { i: 'section4', x: 6, y: 10, w: 6, h: 8 },
    ]
  };

  const [layouts, setLayouts] = useState(initialLayouts);

  // 레이아웃 변경 시 호출 (위치 이동 후 저장 로직을 여기에 추가)
  const onLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    console.log('📌 [레이아웃 변경됨]', allLayouts);
    // TODO: 변경된 레이아웃을 LocalStorage나 DB에 저장하여 사용자 설정 유지 가능
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f9', minHeight: '100%' ,boxSizing: 'border-box' as const}}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', color: '#333', fontWeight: 'bold' }}>
          통합 대시보드 ({currentYear}년)
        </h2>
        {/* <span style={{ fontSize: '13px', color: '#666', backgroundColor: '#e9ecef', padding: '5px 10px', borderRadius: '4px' }}>
            ℹ️ 위젯을 드래그하여 위치를 변경할 수 있습니다.
        </span> */}
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        // 그리드 설정
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={50} // 그리드 한 칸의 높이 (px)
        draggableHandle=".grid-drag-handle" // 특정 영역(핸들)을 잡아야만 드래그 되게 할 수도 있음 (현재는 전체)
        isDraggable={true}
        isResizable={true}
        onLayoutChange={onLayoutChange}
        margin={[15, 15]} // 아이템 간 간격
      >
        {/* 1. 영역 1: 종합 요약 */}
        <div key="section1">
          <SummarySection />
        </div>

        {/* 2. 영역 2: Scope & 10년 추이 */}
        <div key="section2">
          <ScopeAnalysisSection />
        </div>

        {/* 3. 영역 3: 비교 분석 */}
        <div key="section3">
          <ComparisonSection />
        </div>

        {/* 4. 영역 4: 운행 목적 파이차트 */}
        <div key="section4">
          <PurposePieSection />
        </div>

      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardPage;