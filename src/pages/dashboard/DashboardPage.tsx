import React, { useEffect, useRef, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  TextSummarySection,
  ChartSummarySection,
  MonthlyScopeSection,
  PartnerMapSection,
  YearlyHistorySection,
  PurposePieSection,
  ReductionListSection,
} from "./DashboardWidgets";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);

  const initialLayouts = {
    lg: [
      { i: "textSummary", x: 0, y: 0, w: 6, h: 6 },
      { i: "chartSummary", x: 6, y: 0, w: 6, h: 6 },

      { i: "yearly", x: 0, y: 8, w: 6, h: 12 },
      { i: "monthly", x: 6, y: 8, w: 6, h: 12 },

      { i: "purpose", x: 0, y: 20, w: 3, h: 14 },
      { i: "reduction", x: 3, y: 20, w: 3, h: 14 },
      { i: "map", x: 6, y: 20, w: 6, h: 14 },
    ],
    md: [
      { i: "textSummary", x: 0, y: 0, w: 6, h: 6 },
      { i: "chartSummary", x: 6, y: 0, w: 6, h: 6 },

      { i: "yearly", x: 0, y: 8, w: 6, h: 12 },
      { i: "monthly", x: 6, y: 8, w: 6, h: 12 },

      { i: "purpose", x: 0, y: 20, w: 3, h: 14 },
      { i: "reduction", x: 3, y: 20, w: 3, h: 14 },
      { i: "map", x: 6, y: 20, w: 6, h: 14 },
    ],
  };

  const [layouts] = useState(initialLayouts);
  const [rowHeight, setRowHeight] = useState<number>(40);

  /** 화면 높이에 맞춰 grid 높이 계산 */
  useEffect(() => {
    const computeRowHeight = () => {
      const layout = initialLayouts.lg;

      const totalRows = Math.max(...layout.map(item => item.y + item.h));
      const headerHeight = headerRef.current?.offsetHeight ?? 120;
      const margin = 10;
      const padding = 16; // var(--padding-responsive) 추정값
      
      // 전체 사용 가능한 높이 계산
      // window.innerHeight - 헤더높이 - 헤더하단마진(2) - 패딩(위아래) - 마진(y축)
      const totalMarginY = margin * (totalRows + 1); // 행 사이 + 위아래
      const available =
        window.innerHeight -
        headerHeight -
        8 - // 헤더 mb-2
        padding * 2 - // 그리드 패딩
        totalMarginY;

      const computed = Math.max(24, Math.floor(available / totalRows));
      setRowHeight(computed);
    };

    computeRowHeight();
    window.addEventListener("resize", computeRowHeight);
    return () => window.removeEventListener("resize", computeRowHeight);
  }, []);

  return (
    <div className="bg-linear-to-br bg-tr from-gray-900 to-gray-800 h-screen flex flex-col overflow-hidden text-white w-full">
      {/* ================= 헤더 ================= */}
      <div
        ref={headerRef}
        className="relative flex items-center justify-center mb-2 flex-shrink-0"
        style={{ padding: "var(--padding-responsive)" }}
      >
        <img
          src="/rogo.png"
          alt="HDM Logo"
          draggable={false}
          className="absolute left-[clamp(1rem,3vw,2rem)] top-[60%] -translate-y-1/2 h-[clamp(3rem,5vw,5rem)] select-none object-contain"
        />

        <h1
          className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-teal-400 leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
        >
          HDM Carbon Monitor
        </h1>

        <button
          onClick={() => navigate("/main")}
          className="absolute right-[clamp(1rem,3vw,2rem)] top-1/2 -translate-y-1/2 flex items-center bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-sm hover:bg-white/20 font-bold border border-white/20 px-4 py-2"
        >
          <Home size={22} className="mr-2" /> 메인으로
        </button>
      </div>

      {/* ================= GRID ================= */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          padding: "0 var(--padding-responsive)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ResponsiveGridLayout
          className="w-full h-full"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={rowHeight}
          isDraggable={false}
          isResizable={false}
          margin={[10, 10]}
        >
          <div key="textSummary"><TextSummarySection /></div>
          <div key="chartSummary"><ChartSummarySection /></div>
          <div key="yearly"><YearlyHistorySection /></div>
          <div key="monthly"><MonthlyScopeSection /></div>
          <div key="purpose"><PurposePieSection /></div>
          <div key="reduction"><ReductionListSection /></div>
          <div key="map"><PartnerMapSection theme="dark" /></div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default DashboardPage;
