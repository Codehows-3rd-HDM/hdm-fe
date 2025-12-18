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
      <div className="mb-5 flex justify-between items-center">
        <button 
                onClick={() => navigate('/main')} 
                className="flex items-center px-3 py-2 bg-white text-gray-600 rounded-md shadow-sm hover:bg-gray-100 font-bold text-sm border border-gray-200"
            >
                <ArrowLeft size={16} className="mr-1" /> 메인으로
            </button>
        <h2 className="text-2xl font-bold text-gray-800">
          대시보드 ({currentYear}년)
        </h2>
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