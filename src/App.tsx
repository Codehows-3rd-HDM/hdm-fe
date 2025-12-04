import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RegisterPage from './pages/admin/RegisterPage';
import LoginPage from './pages/LoginPage';
import DataUploadPage from './pages/admin/DataUploadPage';
import VehicleRegisterPage from './pages/admin/VehicleRegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import VehicleManagementPage from './pages/admin/VehicleManagementPage';
import CompanyManagementPage from './pages/admin/CompanyManagementPage';
import CarModelManagementPage from './pages/admin/CarModelManagementPage';
import ProcessManagementPage from './pages/admin/ProcessManagementPage';
import PurposeManagementPage from './pages/admin/OperationPurposeManagementPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import CompanyEmissionPage from './pages/Emissions inquiry/CompanyEmissionPage';
import OperationPurposeEmissionPage from './pages/Emissions inquiry/OperationPurposeEmissionPage';
import ProcessEmissionPage from './pages/Emissions inquiry/ProcessEmissionPage';
import ProductEmissionPage from './pages/Emissions inquiry/ProductEmissionPage';
import FuelEmissionPage from './pages/Emissions inquiry/FuelEmissionPage';
import './App.css'
import TargetComparisonPage from './pages/Emissions inquiry/TargetComparisonPage';
import PeriodEmissionPage from './pages/Emissions inquiry/PeriodEmissionPage';
import ActivityInquiryPage from './pages/activities/ActivityInquiryPage';
import ActivityManagementPage from './pages/admin/ActivityManagementPage';

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
      <main className="ml-[300px] p-6 flex-1 h-full overflow-y-auto bg-hd-gray relative main-content">
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 등 사이드바가 없는 페이지가 있다면 MainLayout 밖에 정의 기본 경로 로그인으로*/}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 사이드바가 포함된 메인 레이아웃 */}
        <Route element={<MainLayout />}>
          
          {/* 1. 대시보드 (HDM-001) */}
          <Route path="dashboard" element={<DashboardPage/>} />

          {/* 2. 배출량 조회 그룹 */}
          <Route path="emissions">
            <Route path="period" element={<PeriodEmissionPage/>} />
            <Route path="company" element={<CompanyEmissionPage />} />
            <Route path="purpose" element={<OperationPurposeEmissionPage />} />
            <Route path="process" element={<ProcessEmissionPage />} />
            <Route path="product-class" element={<ProductEmissionPage />} />
            <Route path="fuel" element={<FuelEmissionPage />} />
            <Route path="target" element={<TargetComparisonPage />} />
          </Route>

          {/* 3. 저감 활동 */}
          <Route path="activities" element={<ActivityInquiryPage />} />

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
            <Route path="process/manage" element={<ProcessManagementPage />} />
            <Route path="purpose/manage" element={<PurposeManagementPage />} />
            <Route path="product-class/manage" element={<ProductManagementPage />} />

            {/* 4-3. 배출 관련 설정 */}
            <Route path="emission-factor" element={<PagePlaceholder title="탄소 배출계수 관리 (HDM-027)" />} />
            <Route path="calc-method" element={<PagePlaceholder title="탄소 배출량 계산 설정 (HDM-028)" />} />
            <Route path="target-view" element={<PagePlaceholder title="탄소 배출 목표 관리 (HDM-029)" />} />
            
            {/* 4-4. 기타 관리 */}
            <Route path="dashboard-setting" element={<PagePlaceholder title="대시보드 관리" />} />
            <Route path="activity-manage" element={<ActivityManagementPage />} />
            <Route path="data-upload" element={<DataUploadPage/>} />
          </Route>

          {/* 5. 계정 */}
          <Route path="register" element={<RegisterPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;