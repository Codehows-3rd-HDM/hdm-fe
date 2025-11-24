import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f4f7f9' }}>
        <Outlet /> {/* 하위 라우트가 여기에 렌더링됨 */}
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
          <Route path="dashboard" element={<PagePlaceholder title="통합 대시보드" />} />

          {/* 2. 배출량 조회 그룹 */}
          <Route path="emissions">
            <Route path="period" element={<PagePlaceholder title="기간별 탄소 총 배출량 (HDM-002)" />} />
            <Route path="company" element={<PagePlaceholder title="납품 업체별 배출량 (HDM-003)" />} />
            <Route path="purpose" element={<PagePlaceholder title="운행 목적별 배출량 (HDM-005)" />} />
            <Route path="process" element={<PagePlaceholder title="생산 공정별 배출량 (HDM-007)" />} />
            <Route path="product-class" element={<PagePlaceholder title="생산 품목 구분별 배출량 (HDM-008)" />} />
            <Route path="fuel" element={<PagePlaceholder title="연료별 배출량 (HDM-009)" />} />
            <Route path="target" element={<PagePlaceholder title="목표 대비 탄소 배출량 (HDM-010)" />} />
          </Route>

          {/* 3. 저감 활동 */}
          <Route path="activities" element={<PagePlaceholder title="저감활동 기록 조회 (HDM-012)" />} />

          {/* 4. 관리자 설정 그룹 */}
          <Route path="admin">
            {/* 4-1. 차량 기본 데이터 관리 */}
            <Route path="vehicle">
              <Route path="register" element={<PagePlaceholder title="출입차량 기본정보 등록" />} />
              <Route path="manage" element={<PagePlaceholder title="출입차량 정보 관리" />} />
            </Route>
            
            {/* 4-2. 기준 정보 관리 (업체, 공정, 목적, 품목 등) */}
            <Route path="company/manage" element={<PagePlaceholder title="업체명/주소지 관리" />} />
            <Route path="car-category/manage" element={<PagePlaceholder title="차종/연비 정보 관리" />} />
            <Route path="process/manage" element={<PagePlaceholder title="생산공정 정보 관리" />} />
            <Route path="purpose/manage" element={<PagePlaceholder title="운행목적 정보 관리" />} />
            <Route path="product-class/manage" element={<PagePlaceholder title="생산품목 구분 정보 관리" />} />

            {/* 4-3. 배출 관련 설정 */}
            <Route path="emission-factor" element={<PagePlaceholder title="탄소 배출계수 관리 (HDM-027)" />} />
            <Route path="calc-method" element={<PagePlaceholder title="탄소 배출량 계산 설정 (HDM-028)" />} />
            <Route path="target-view" element={<PagePlaceholder title="탄소 배출 목표 관리 (HDM-029)" />} />
            
            {/* 4-4. 기타 관리 */}
            <Route path="dashboard-setting" element={<PagePlaceholder title="대시보드 관리" />} />
            <Route path="activity-manage" element={<PagePlaceholder title="저감활동 기록 관리" />} />
            <Route path="data-upload" element={<PagePlaceholder title="출입 데이터 업로드 (HDM-035)" />} />
          </Route>

          {/* 5. 계정 */}
          <Route path="register" element={<RegisterPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;