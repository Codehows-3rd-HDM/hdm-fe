import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Clock, Monitor, Settings, UserPlus } from 'lucide-react';
import { getBusinessYear } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';

const MainPage: React.FC = () => {
  const currentYear = getBusinessYear();
  const navigate = useNavigate();
  const { role } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans" style={{ padding: 'var(--padding-container)' }}>
      <div className="text-center animate-fade-in-up">
        {/* 로고 영역 (이미지 대신 텍스트로 대체하거나 이미지 사용 가능) */}
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400" style={{ marginBottom: 'var(--spacing-md)' }}>
          HDM Carbon Monitor
        </h1>
        <p className="text-xl text-gray-300" style={{ marginBottom: '3rem' }}>
          현대정밀 차량 탄소 배출량 통합 관리 시스템에 오신 것을 환영합니다.
        </p>

        <div className="flex justify-center flex-wrap" style={{ gap: '1.5rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
            style={{ width: '16rem', height: '10rem' }}
          >
            <Monitor size={48} className="text-blue-400 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--spacing-md)' }} />
            <span className="text-xl font-bold"> 대시보드</span>
            <span className="text-sm text-gray-400" style={{ marginTop: 'var(--spacing-sm)' }}>실시간 현황 확인</span>
          </button>

          <button
            onClick={() => navigate('/view/target')}
            className="group flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
            style={{ width: '16rem', height: '10rem' }}
          >
            <BarChart2 size={48} className="text-sky-400 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--spacing-md)' }} />
            <span className="text-xl font-bold">배출량 분석</span>
            <span className="text-sm text-gray-400" style={{ marginTop: 'var(--spacing-sm)' }}>상세 데이터 조회</span>
          </button>

          <button
            onClick={() => navigate('/activities')}
            className="group flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
            style={{ width: '16rem', height: '10rem' }}
          >
            <Clock size={48} className="text-teal-400 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--spacing-md)' }} />
            <span className="text-xl font-bold">저감활동 분석</span>
            <span className="text-sm text-gray-400" style={{ marginTop: 'var(--spacing-sm)' }}>상세 데이터 조회</span>
          </button>

          {(role === 'SUPERADMIN' || role === 'ADMIN') && (
            <button
              onClick={() => navigate('/admin/vehicle/manage')}
              className="group flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
              style={{ width: '16rem', height: '10rem' }}
            >
              <Settings size={48} className="text-purple-400 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--spacing-md)' }} />
              <span className="text-xl font-bold">관리자 설정</span>
              <span className="text-sm text-gray-400" style={{ marginTop: 'var(--spacing-sm)' }}>시스템 관리</span>
            </button>
          )}

          {role === 'SUPERADMIN' && (
            <button
              onClick={() => navigate('/register')}
              className="group flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
              style={{ width: '16rem', height: '10rem' }}
            >
              <UserPlus size={48} className="text-green-400 group-hover:text-white transition-colors" style={{ marginBottom: 'var(--spacing-md)' }} />
              <span className="text-xl font-bold">계정등록</span>
              <span className="text-sm text-gray-400" style={{ marginTop: 'var(--spacing-sm)' }}>사용자 관리</span>
            </button>
          )}
        </div>
      </div>

      <div className="absolute text-gray-500 text-sm" style={{ bottom: '2.5rem' }}>
        © {currentYear} Hyundai Minuteness. All rights reserved.
      </div>
    </div>
  );
};

export default MainPage;