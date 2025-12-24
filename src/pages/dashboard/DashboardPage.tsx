import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { SummarySection, MonthlyScopeSection, PartnerMapSection, PurposePieSection, ReductionListSection } from './DashboardWidgets';
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
      { i: 'section1', x: 0, y: 0, w: 7, h: 12 },
      { i: 'section2', x: 7, y: 0, w: 5, h: 12 },
      { i: 'section3', x: 0, y: 12, w: 7, h: 12 },
      { i: 'section4', x: 7, y: 12, w: 5, h: 10 },
      { i: 'section5', x: 7, y: 22, w: 5, h: 6 },
    ],
    md: [
      { i: 'section1', x: 0, y: 0, w: 12, h: 12 },
      { i: 'section2', x: 0, y: 12, w: 12, h: 12 },
      { i: 'section3', x: 0, y: 24, w: 12, h: 12 },
      { i: 'section4', x: 0, y: 36, w: 12, h: 10 },
      { i: 'section5', x: 0, y: 46, w: 12, h: 6 },
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
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          HDM Carbon Monitor
        </h1>
      </div>
      <div className="text-center mb-8">
        <p className="text-lg text-gray-300">
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
        <div key="section1">
          <SummarySection />
        </div>

        <div key="section2">
          <MonthlyScopeSection />
        </div>

        <div key="section3">
          <PartnerMapSection />
        </div>

        <div key="section4">
          <PurposePieSection />
        </div>

        <div key="section5">
          <ReductionListSection />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardPage;