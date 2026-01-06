import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/admin/RegisterPage";
import VehicleRegisterPage from "./pages/admin/VehicleRegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import VehicleManagementPage from "./pages/admin/VehicleManagementPage";
import CompanyManagementPage from "./pages/admin/CompanyManagementPage";
import CarModelManagementPage from "./pages/admin/CarModelManagementPage";
import ProcessManagementPage from "./pages/admin/SupplyTypeManagementPage";
import PurposeManagementPage from "./pages/admin/OperationPurposeManagementPage";
import ProductManagementPage from "./pages/admin/SupplyCustomerManagementPage";
import CompanyEmissionPage from "./pages/Emissions inquiry/CompanyEmissionPage";
import OperationPurposeEmissionPage from "./pages/Emissions inquiry/OperationPurposeEmissionPage";
import FuelEmissionPage from "./pages/Emissions inquiry/FuelEmissionPage";
import TargetComparisonPage from "./pages/Emissions inquiry/TargetComparisonPage";
import PeriodEmissionPage from "./pages/Emissions inquiry/PeriodEmissionPage";
import ActivityInquiryPage from "./pages/activities/ActivityInquiryPage";
import ActivityManagementPage from "./pages/admin/ActivityManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import SupplyTypeEmissionPage from "./pages/Emissions inquiry/SupplyTypeEmissionPage";
import SupplyCustomerEmissionPage from "./pages/Emissions inquiry/SupplyCustomerEmissionPage";
import MainPage from "./pages/MainPage";
import ExcelUpDownBaseInfoPage from "./pages/admin/excel/ExcelUpDownBaseInfo";
import ExcelUpS1NicePage from "./pages/admin/excel/ExcelUpS1Nice";
import EmissionFactorPage from "./pages/admin/EmissionFactorPage";
import CarbonTargetApp from "./pages/admin/CarbonTargetManagement";

// [임시] 페이지가 없을 때 보여줄 플레이스홀더 컴포넌트
const PagePlaceholder = ({ title }: { title: string }) => {
  const location = useLocation();
  return (
    <div style={{ padding: "40px", color: "#333" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>{title}</h2>
      <p style={{ color: "#666" }}>
        현재 경로:{" "}
        <code
          style={{
            backgroundColor: "#eee",
            padding: "4px",
            borderRadius: "4px",
          }}
        >
          {location.pathname}
        </code>
      </p>
      <p style={{ marginTop: "20px", fontSize: "14px", color: "#888" }}>
        화면설계서 및 API 명세서에 따라 개발 예정입니다.
      </p>
    </div>
  );
};

// 메인 레이아웃 (사이드바 + 컨텐츠 영역)
const MainLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  // 사이드바 토글 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* 대시보드 아닐 때만 사이드바 표시 */}
      {!isDashboard && (
        <div className={`print:hidden transition-all duration-300`}>
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
      )}

      {/* 메인 콘텐츠 영역: 사이드바 너비만큼 margin-left 조정 */}
      <main
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${
          isDashboard ? "ml-0" : isSidebarOpen ? "ml-65" : "ml-20"
        }`}
      >
        <div className={`${!isDashboard ? "" : ""}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  // [추가] 페이지 전체에 드래그 앤 드롭 방어
  useEffect(() => {
    // 방어 함수: 브라우저가 파일을 열거나 다운로드하는 걸 막음
    const preventGlobalDrag = (e: DragEvent) => {
      e.preventDefault();
    };

    // 1. 창 전체에 이벤트 리스너 등록
    window.addEventListener("dragover", preventGlobalDrag);
    window.addEventListener("drop", preventGlobalDrag);

    // 2. 컴포넌트가 사라질 때 리스너 청소 (메모리 누수 방지)
    return () => {
      window.removeEventListener("dragover", preventGlobalDrag);
      window.removeEventListener("drop", preventGlobalDrag);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 등 사이드바가 없는 페이지 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 사이드바가 포함된 메인 레이아웃 */}
        <Route element={<MainLayout />}>
          {/* ---------------------------------------------------------------- */}
          {/* [Group 1] 모든 권한 접근 가능 (VIEWER 이상) */}
          {/* ---------------------------------------------------------------- */}
          <Route
            element={
              <ProtectedRoute
                requiredRoles={["SUPERADMIN", "ADMIN", "VIEWER"]}
              />
            }
          >
            {/* 메인 페이지 */}
            <Route path="/main" element={<MainPage />} />

            {/* 1. 대시보드 (HDM-001) */}
            <Route path="dashboard" element={<DashboardPage />} />

            {/* 2. 배출량 조회 그룹 */}
            <Route path="view">
              <Route path="period" element={<PeriodEmissionPage />} />
              <Route path="company" element={<CompanyEmissionPage />} />
              <Route
                path="purpose"
                element={<OperationPurposeEmissionPage />}
              />
              <Route path="supply-type" element={<SupplyTypeEmissionPage />} />
              <Route
                path="supply-customer"
                element={<SupplyCustomerEmissionPage />}
              />
              <Route path="fuel" element={<FuelEmissionPage />} />
              <Route path="target" element={<TargetComparisonPage />} />
            </Route>

            {/* 3. 저감 활동 조회 */}
            <Route path="activities" element={<ActivityInquiryPage />} />
          </Route>

          {/* ---------------------------------------------------------------- */}
          {/* [Group 2] 관리자 접근 가능 (ADMIN 이상) */}
          {/* ---------------------------------------------------------------- */}
          <Route
            element={<ProtectedRoute requiredRoles={["SUPERADMIN", "ADMIN"]} />}
          >
            {/* 4. 관리자 설정 그룹 */}
            <Route path="admin">
              {/* 4-1. 차량 기본 데이터 관리 */}
              <Route path="vehicle">
                <Route path="register" element={<VehicleRegisterPage />} />
                <Route path="manage" element={<VehicleManagementPage />} />
              </Route>
              {/* 4-2. 기준 정보 관리 (업체, 공정, 목적, 품목 등) */}
              <Route
                path="company/manage"
                element={<CompanyManagementPage />}
              />
              <Route
                path="car-category/manage"
                element={<CarModelManagementPage />}
              />
              <Route
                path="supply-type/manage"
                element={<ProcessManagementPage />}
              />
              <Route
                path="purpose/manage"
                element={<PurposeManagementPage />}
              />
              <Route
                path="supply-customer/manage"
                element={<ProductManagementPage />}
              />
              <Route
                path="excel/base-info"
                element={<ExcelUpDownBaseInfoPage />}
              />
              {/* 4-3. 배출 관련 설정 */}
              <Route path="emission-factor" element={<EmissionFactorPage />} />
              <Route
                path="calc-method"
                element={
                  <PagePlaceholder title="탄소 배출량 계산 설정 (HDM-028)" />
                }
              />
              // 목표 관리
              <Route path="target-view" element={<CarbonTargetApp />} />
              {/* 4-4. 기타 관리 */}
              <Route
                path="dashboard-setting"
                element={<PagePlaceholder title="대시보드 관리" />}
              />
              <Route
                path="activity-manage"
                element={<ActivityManagementPage />}
              />
              <Route path="excel/s1-nice" element={<ExcelUpS1NicePage />} />
            </Route>
          </Route>

          {/* ---------------------------------------------------------------- */}
          {/* [Group 3] 슈퍼 관리자만 접근 가능 (SUPERADMIN) */}
          {/* ---------------------------------------------------------------- */}
          <Route element={<ProtectedRoute requiredRoles={["SUPERADMIN"]} />}>
            {/* 5. 계정 등록 */}
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
