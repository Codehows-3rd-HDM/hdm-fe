import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { 
  SummarySection, 
  MonthlyScopeSection, 
  PartnerMapSection, 
  YearlyHistorySection,
  PurposePieSection, 
  ReductionListSection 
} from './DashboardWidgets';
import { getBusinessYear } from '../../utils/dateUtils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage: React.FC = () => {
  const currentYear = getBusinessYear();
  const navigate = useNavigate();

  const initialLayouts = {
    lg: [
      // 좌상단 - 2025년 탄소 배출량
      { i: 'section1', x: 0, y: 0, w: 6, h: 14 },
      // 우상단 - 올해 월별 탄소 배출량
      { i: 'section2', x: 6, y: 0, w: 6, h: 14 },
      // 우하단 - 협력사 지역별 배출량 현황
      { i: 'section3', x: 6, y: 14, w: 6, h: 16 },
      // 좌하단 상 - 최근 5년 탄소 배출량
      { i: 'section4', x: 0, y: 14, w: 6, h: 8 },
      // 좌하단 중 - 운행 목적별 배출량 (절반 너비)
      { i: 'section5', x: 0, y: 22, w: 3, h: 8 },
      // 좌하단 하 - 최근 저감 활동 5건 (절반 너비)
      { i: 'section6', x: 3, y: 22, w: 3, h: 8 },
    ],
    md: [
      // md에서도 상단은 좌7:우5 비율 유지
      { i: 'section1', x: 0, y: 0, w: 7, h: 14 },
      { i: 'section2', x: 7, y: 0, w: 5, h: 14 },
      // 하단 동일 비율 유지: 좌측 3개, 우측 지도
      { i: 'section3', x: 7, y: 14, w: 5, h: 16 },
      { i: 'section4', x: 0, y: 14, w: 7, h: 8 },
      { i: 'section5', x: 0, y: 22, w: 3, h: 8 },
      { i: 'section6', x: 3, y: 22, w: 4, h: 8 },
    ],
  };

  const [layouts, _setLayouts] = useState(initialLayouts);

  return (
    <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen box-border text-white">
      {/* 메인 페이지 스타일의 큰 타이틀 */}
      <div className="relative flex items-center justify-center mb-8">
        <button
          onClick={() => navigate('/main')}
          className="absolute left-0 flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm text-white rounded-md shadow-sm hover:bg-white/20 font-bold text-sm border border-white/20"
        >
          <ArrowLeft size={16} className="mr-1" /> 메인으로
        </button>
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          HDM Carbon Monitor
        </h1>
      </div>
      <div className="text-center mb-8">
        <p className="text-2xl text-gray-300">
          실시간 탄소 배출량 현황 및 분석 데이터 ({currentYear}년)
        </p>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={50}
        draggableHandle=".grid-drag-handle"
        isDraggable={true}
        isResizable={true}
        margin={[10, 10]}
      >
        {/* 좌상단 - 2025년 탄소 배출량 (요약) */}
        <div key="section1">
          <SummarySection />
        </div>

        {/* 우상단 - 올해 월별 탄소 배출량 (Scope) */}
        <div key="section2">
          <MonthlyScopeSection />
        </div>

        {/* 우하단 - 협력사 지역별 배출량 현황 */}
        <div key="section3">
          <PartnerMapSection theme="dark" />
        </div>

        {/* 우하단 상 - 최근 5년 탄소 배출량 */}
        <div key="section4">
          <YearlyHistorySection />
        </div>

        {/* 우하단 중 - 운행 목적별 배출량 */}
        <div key="section5">
          <PurposePieSection />
        </div>

        {/* 우하단 하 - 최근 저감 활동 */}
        <div key="section6">
          <ReductionListSection />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardPage;
