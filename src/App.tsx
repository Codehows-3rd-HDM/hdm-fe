import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DataUploadPage from './pages/DataUploadPage';
import VehicleRegisterPage from './pages/admin/VehicleRegisterPage';
import DashboardPage from './pages/DashboardPage';
import VehicleManagementPage from './pages/admin/VehicleManagementPage';
import CompanyManagementPage from './pages/admin/CompanyManagementPage';
import CarModelManagementPage from './pages/admin/CarModelManagementPage';
import ProcessManagementPage from './pages/admin/ProcessManagementPage';
import PurposeManagementPage from './pages/admin/PurposeManagementPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import CompanyEmissionPage from './pages/Emissions inquiry/CompanyEmissionPage';
import OperationPurposeEmissionPage from './pages/Emissions inquiry/OperationPurposeEmissionPage';
import ProcessEmissionPage from './pages/Emissions inquiry/ProcessEmissionPage';
import ProductEmissionPage from './pages/Emissions inquiry/ProductEmissionPage';
import FuelEmissionPage from './pages/Emissions inquiry/FuelEmissionPage';

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
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* 사이드바: 고정 너비, 자체적으로 내용이 많으면 스크롤(auto) */}
      <Sidebar />
      {/* 메인 영역: 
          - flex: 1 (남은 공간 다 차지)
          - height: '100%' 추가 (부모 높이인 100vh를 인지하도록)
          - overflow-y: auto (내용이 길어지면 **여기서만** 스크롤바 생성)
      */}
      <main style={{ 
          flex: 1, 
          height: '100%', // 높이 100% 설정으로 스크롤 영역 명확화
          overflowY: 'auto', 
          backgroundColor: '#f4f7f9',
          position: 'relative' 
      }}>
        {/* Outlet은 실제 페이지 컴포넌트가 렌더링되는 위치 */}
        <Outlet />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 등 사이드바가 없는 페이지가 있다면 MainLayout 밖에 정의 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 사이드바가 포함된 메인 레이아웃 */}
        <Route element={<MainLayout />}>
          
          {/* 1. 대시보드 (HDM-001) */}
          <Route path="dashboard" element={<DashboardPage/>} />

          {/* 2. 배출량 조회 그룹 */}
          <Route path="emissions">
            <Route path="period" element={<PagePlaceholder title="기간별 탄소 총 배출량 (HDM-002)" />} />
            <Route path="company" element={<CompanyEmissionPage />} />
            <Route path="purpose" element={<OperationPurposeEmissionPage />} />
            <Route path="process" element={<ProcessEmissionPage />} />
            <Route path="product-class" element={<ProductEmissionPage />} />
            <Route path="fuel" element={<FuelEmissionPage />} />
            <Route path="target" element={<PagePlaceholder title="목표 대비 탄소 배출량 (HDM-010)" />} />
          </Route>

          {/* 3. 저감 활동 */}
          <Route path="activities" element={<PagePlaceholder title="저감활동 기록 조회 (HDM-012)" />} />

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
            <Route path="activity-manage" element={<PagePlaceholder title="저감활동 기록 관리" />} />
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