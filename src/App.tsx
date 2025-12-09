import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/admin/RegisterPage'; 
import DataUploadPage from './pages/admin/DataUploadPage';
import VehicleRegisterPage from './pages/admin/VehicleRegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import VehicleManagementPage from './pages/admin/VehicleManagementPage';
import CompanyManagementPage from './pages/admin/CompanyManagementPage';
import CarModelManagementPage from './pages/admin/CarModelManagementPage';
import ProcessManagementPage from './pages/admin/SupplyTypeManagementPage';
import PurposeManagementPage from './pages/admin/OperationPurposeManagementPage';
import ProductManagementPage from './pages/admin/SupplyCustomerManagementPage';
import CompanyEmissionPage from './pages/Emissions inquiry/CompanyEmissionPage';
import OperationPurposeEmissionPage from './pages/Emissions inquiry/OperationPurposeEmissionPage';
import ProductEmissionPage from './pages/Emissions inquiry/SupplyCustomerEmissionPage';
import FuelEmissionPage from './pages/Emissions inquiry/FuelEmissionPage';
import TargetComparisonPage from './pages/Emissions inquiry/TargetComparisonPage';
import PeriodEmissionPage from './pages/Emissions inquiry/PeriodEmissionPage';
import ActivityInquiryPage from './pages/activities/ActivityInquiryPage';
import ActivityManagementPage from './pages/admin/ActivityManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import SupplyTypeEmissionPage from './pages/Emissions inquiry/SupplyTypeEmissionPage';
import SupplyCustomerEmissionPage from './pages/Emissions inquiry/SupplyCustomerEmissionPage';

// [임시] 페이지가 없을 때 보여줄 플레이스홀더 컴포넌트
const PagePlaceholder = ({ title }: { title: string }) => {
  const location = useLocation();
  return (
    <div style={{ padding: '40px', color: '#333' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{title}</h2>
      <p style={{ color: '#666' }}>
        현재 경로: <code style={{ backgroundColor: '#eee', padding: '4px', borderRadius: '4px' }}>{location.pathname}</code>
      </p>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
        ⚠️ 화면설계서 및 API 명세서에 따라 개발 예정입니다.
      </p>
    </div>
  );
};

// 메인 레이아웃 (사이드바 + 컨텐츠 영역)
const MainLayout = () => {
  return (
    <div className="flex min-h-screen overflow-hidden">
      
      {/* 사이드바: 프린트 시 숨길 대상 */}
      <div className="sidebar print:hidden">
        <Sidebar />
      </div>
      
      {/* 메인 영역: flex-1, h-full, overflow-y-auto, bg-hd-gray(설정파일색), relative */}
      {/* ml-[300px]은 Sidebar 너비만큼 여백을 주는 것입니다 (Sidebar가 fixed일 경우 필요) */}
      <main className="ml-[260px] flex-1 h-full overflow-y-auto bg-hd-gray relative main-content w-full">
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
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
          <Route element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMIN', 'VIEWER']} />}>
            
            {/* 1. 대시보드 (HDM-001) */}
            <Route path="dashboard" element={<DashboardPage/>} />

            {/* 2. 배출량 조회 그룹 */}
            <Route path="view">
              <Route path="period" element={<PeriodEmissionPage/>} />
              <Route path="company" element={<CompanyEmissionPage />} />
              <Route path="purpose" element={<OperationPurposeEmissionPage />} />
              <Route path="supply-type" element={<SupplyTypeEmissionPage />} />
              <Route path="supply-customer" element={<SupplyCustomerEmissionPage />} />
              <Route path="fuel" element={<FuelEmissionPage />} />
              <Route path="target" element={<TargetComparisonPage />} />
            </Route>

            {/* 3. 저감 활동 조회 */}
            <Route path="activities" element={<ActivityInquiryPage />} />
          </Route>


          {/* ---------------------------------------------------------------- */}
          {/* [Group 2] 관리자 접근 가능 (ADMIN 이상) */}
          {/* ---------------------------------------------------------------- */}
          <Route element={<ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMIN']} />}>
            
            {/* 4. 관리자 설정 그룹 */}
            <Route path="admin">
              {/* 4-1. 차량 기본 데이터 관리 */}
              <Route path="vehicle">
                <Route path="register" element={<VehicleRegisterPage/>} />
                <Route path="manage" element={<VehicleManagementPage />} />
              </Route>
              
              {/* 4-2. 기준 정보 관리 (업체, 공정, 목적, 품목 등) */}
              <Route path="company/manage" element={<CompanyManagementPage />} />
              <Route path="car-category/manage" element={<CarModelManagementPage />} />
              <Route path="supply-type/manage" element={<ProcessManagementPage />} />
              <Route path="purpose/manage" element={<PurposeManagementPage />} />
              <Route path="supply-customer/manage" element={<ProductManagementPage />} />

              {/* 4-3. 배출 관련 설정 */}
              <Route path="emission-factor" element={<PagePlaceholder title="탄소 배출계수 관리 (HDM-027)" />} />
              <Route path="calc-method" element={<PagePlaceholder title="탄소 배출량 계산 설정 (HDM-028)" />} />
              <Route path="target-view" element={<PagePlaceholder title="탄소 배출 목표 관리 (HDM-029)" />} />
              
              {/* 4-4. 기타 관리 */}
              <Route path="dashboard-setting" element={<PagePlaceholder title="대시보드 관리" />} />
              <Route path="activity-manage" element={<ActivityManagementPage />} />
              <Route path="data-upload" element={<DataUploadPage/>} />
            </Route>
          </Route>


          {/* ---------------------------------------------------------------- */}
          {/* [Group 3] 슈퍼 관리자만 접근 가능 (SUPERADMIN) */}
          {/* ---------------------------------------------------------------- */}
          <Route element={<ProtectedRoute requiredRoles={['SUPERADMIN']} />}>
            {/* 5. 계정 등록 */}
            <Route path="register" element={<RegisterPage/>} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;