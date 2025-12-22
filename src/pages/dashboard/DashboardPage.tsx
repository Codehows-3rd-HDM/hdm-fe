import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { SummarySection, ScopeAnalysisSection, ComparisonSection, PurposePieSection } from './DashboardWidgets';
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
      { i: 'section1', x: 0, y: 0, w: 4, h: 10 },
      { i: 'section2', x: 4, y: 0, w: 8, h: 10 },
      { i: 'section3', x: 0, y: 10, w: 8, h: 8 },
      { i: 'section4', x: 8, y: 10, w: 4, h: 8 },
    ],
    md: [
      { i: 'section1', x: 0, y: 0, w: 6, h: 10 },
      { i: 'section2', x: 6, y: 0, w: 6, h: 10 },
      { i: 'section3', x: 0, y: 10, w: 6, h: 8 },
      { i: 'section4', x: 6, y: 10, w: 6, h: 8 },
    ],
  };

  const [layouts, _setLayouts] = useState(initialLayouts);

  return (
    <div className="p-5 bg-gray-100 min-h-screen box-border">
      {/* 메인 페이지 스타일의 큰 타이틀 */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
          HDM Carbon Monitor
        </h1>
        <p className="text-lg text-gray-600">
          실시간 탄소 배출량 현황 및 분석 데이터 ({currentYear}년)
        </p>
      </div>

      <div className="mb-5 flex justify-start">
        <button 
                onClick={() => navigate('/main')} 
                className="flex items-center px-3 py-2 bg-white text-gray-600 rounded-md shadow-sm hover:bg-gray-100 font-bold text-sm border border-gray-200"
            >
                <ArrowLeft size={16} className="mr-1" /> 메인으로
            </button>
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
        margin={[15, 15]}
      >
        <div key="section1">
          <SummarySection />
        </div>

        <div key="section2">
          <ScopeAnalysisSection />
        </div>

        <div key="section3">
          <ComparisonSection />
        </div>

        <div key="section4">
          <PurposePieSection />
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardPage;