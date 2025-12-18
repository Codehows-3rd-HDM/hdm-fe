// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // 권한 훅 임포트

interface ProtectedRouteProps {
  requiredRoles: string[]; // 이 라우트에 접근하기 위해 필요한 권한 목록
  redirectPath?: string; // 권한 없을 시 리디렉션할 경로 (기본값: /login)
}

/**
 * 권한이 필요한 라우트를 감싸는 컴포넌트
 * 1. 인증되었는지 확인
 * 2. 요구되는 권한을 가지고 있는지 확인
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRoles, 
  redirectPath = '/login' 
}) => {
  const { isAuthenticated, role } = useAuth();
  
  // 1. 인증 확인
  if (!isAuthenticated) {
    // 로그인이 되어있지 않으면 로그인 페이지로 이동
    console.log('접근 거부: 인증되지 않음');
    return <Navigate to={redirectPath} replace />;
  }

  // 2. 권한 확인 (사용자의 role이 requiredRoles에 포함되어 있는지 확인)
  const isAuthorized = requiredRoles.includes(role || 'GUEST');

  if (!isAuthorized) {
    // 권한이 없으면 "접근 거부" 메시지를 보여줍니다.
    return (
        <div className="p-10 text-center bg-white min-h-screen">
            <h1 className="text-4xl font-extrabold text-red-700 mb-4">403 Forbidden</h1>
            <h2 className="text-2xl font-bold text-gray-800">접근 거부</h2>
            <p className="text-gray-600 mt-2">이 페이지에 접근할 권한이 없습니다.</p>
            <p className="text-sm text-gray-500">필요 권한: {requiredRoles.join(', ')}</p>
            <p className="mt-6">
                <a href="/dashboard" className="text-blue-500 hover:text-blue-700 underline font-semibold">
                    대시보드로 돌아가기
                </a>
            </p>
        </div>
    );
  }

  // 인증 및 권한 모두 통과하면 자식 라우트를 렌더링
  return <Outlet />;
};

export default ProtectedRoute;