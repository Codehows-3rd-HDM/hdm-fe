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
      // 상단 좌측 - 목표/올해/달성도 텍스트
      { i: "textSummary", x: 0, y: 0, w: 6, h: 6 },
      // 상단 우측 - 2025년 배출량 현황 그래프
      { i: "chartSummary", x: 6, y: 0, w: 6, h: 6 },
      // 중단 좌측 - 연간 탄소 배출량 (최근 5년)
      { i: "yearly", x: 0, y: 8, w: 6, h: 12 },
      // 중단 우측 - 올해 월별 배출량
      { i: "monthly", x: 6, y: 8, w: 6, h: 12 },
      // 하단 좌측 상 - 운행 목적별 배출량
      { i: "purpose", x: 0, y: 20, w: 3, h: 11 },
      // 하단 좌측 하 - 최근 저감 활동
      { i: "reduction", x: 3, y: 20, w: 3, h: 11 },
      // 하단 우측 - 협력사 지역별 배출량
      { i: "map", x: 6, y: 20, w: 6, h: 11 },
    ],
    md: [
      { i: "textSummary", x: 0, y: 0, w: 6, h: 6 },
      { i: "chartSummary", x: 6, y: 0, w: 6, h: 6 },
      { i: "yearly", x: 0, y: 8, w: 6, h: 12 },
      { i: "monthly", x: 6, y: 8, w: 6, h: 12 },
      { i: "purpose", x: 0, y: 20, w: 3, h: 11 },
      { i: "reduction", x: 3, y: 20, w: 3, h: 11 },
      { i: "map", x: 6, y: 20, w: 6, h: 11 },
    ],
  };

  const [layouts] = useState(initialLayouts);
  const [rowHeight, setRowHeight] = useState<number>(50);

  // Compute dynamic rowHeight so all widgets fit within one screen height
  useEffect(() => {
    const computeRowHeight = () => {
      // Total grid rows = max(y + h) across layout; from initialLayouts.lg it is 31
      const totalRows = 31;
      const headerHeight = headerRef.current?.offsetHeight ?? 120;
      const verticalMargin = 10;
      const available = window.innerHeight - headerHeight - verticalMargin * (totalRows - 1) - 16; // extra padding
      const computed = Math.max(20, Math.floor(available / totalRows));
      setRowHeight(computed);
    };

    computeRowHeight();
    window.addEventListener("resize", computeRowHeight);
    return () => window.removeEventListener("resize", computeRowHeight);
  }, []);

  return (
    <div className="bg-linear-to-br bg-tr from-gray-900 to-gray-800 min-h-screen box-border text-white w-full">
      {/* 메인 페이지 스타일의 큰 타이틀 */}
      <div
        className="relative flex items-center justify-center mb-2"
        style={{ padding: "var(--padding-responsive)" }}
        ref={headerRef}
      >
        {/* 로고: 왼쪽 절대 배치, 투명 배경 유지 */}
        <img
          src="/rogo.png"
          alt="HDM Logo"
          style={{
            position: "absolute",
            left: "clamp(1rem, 3vw, 2rem)",
            top: "60%",
            transform: "translateY(-50%)",
            height: "clamp(3rem, 5vw, 5rem)",
            width: "auto",
          }}
          className="bg-transparent select-none object-contain"
          draggable={false}
        />
        {/* 중앙 제목 */}
        <h1
          className="font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-teal-400 text-center leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
        >
          HDM Carbon Monitor
        </h1>
        {/* 우측 메인 버튼 */}
        <button
          onClick={() => navigate("/main")}
          style={{
            position: "absolute",
            right: "clamp(1rem, 3vw, 2rem)",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "clamp(0.5rem, 1vw, 1rem) clamp(1rem, 2vw, 1.5rem)",
            fontSize: "clamp(0.875rem, 1.2vw, 1.125rem)",
          }}
          className="flex items-center bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-sm hover:bg-white/20 font-bold border border-white/20"
        >
          <Home size={24} className="mr-2" /> 메인으로
        </button>
      </div>

      <div style={{ padding: "0 var(--padding-responsive)" }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={rowHeight}
          isDraggable={false}
          isResizable={false}
          margin={[10, 10]}
        >
          {/* 상단 좌측 - 목표/올해/달성도 */}
          <div key="textSummary">
            <TextSummarySection />
          </div>

          {/* 상단 우측 - 2025년 배출량 현황 */}
          <div key="chartSummary">
            <ChartSummarySection />
          </div>

          {/* 중단 좌측 - 연간 탄소 배출량 */}
          <div key="yearly">
            <YearlyHistorySection />
          </div>

          {/* 중단 우측 - 올해 월별 배출량 */}
          <div key="monthly">
            <MonthlyScopeSection />
          </div>

          {/* 하단 좌측 상 - 운행 목적별 배출량 */}
          <div key="purpose">
            <PurposePieSection />
          </div>

          {/* 하단 좌측 하 - 최근 저감 활동 */}
          <div key="reduction">
            <ReductionListSection />
          </div>

          {/* 하단 우측 - 협력사 지역별 배출량 */}
          <div key="map">
            <PartnerMapSection theme="dark" />
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
};

export default DashboardPage;
