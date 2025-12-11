import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Clock, Monitor } from 'lucide-react';
import { getBusinessYear } from '../utils/dateUtils';

const MainPage: React.FC = () => {
  const currentYear = getBusinessYear();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans">
      <div className="text-center animate-fade-in-up">
        {/* 로고 영역 (이미지 대신 텍스트로 대체하거나 이미지 사용 가능) */}
        <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          HDM Carbon Monitor
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          현대정밀 차량 탄소 배출량 통합 관리 시스템에 오신 것을 환영합니다.
        </p>

        <div className="flex gap-6 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex flex-col items-center justify-center w-64 h-40 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
          >
            <Monitor size={48} className="mb-4 text-blue-400 group-hover:text-white transition-colors" />
            <span className="text-xl font-bold"> 대시보드</span>
            <span className="text-sm text-gray-400 mt-2">실시간 현황 확인</span>
          </button>

          <button
            onClick={() => navigate('/view/target')}
            className="group flex flex-col items-center justify-center w-64 h-40 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
          >
            <BarChart2 size={48} className="mb-4 text-sky-400 group-hover:text-white transition-colors" />
            <span className="text-xl font-bold">배출량 분석</span>
            <span className="text-sm text-gray-400 mt-2">상세 데이터 조회</span>
          </button>

          <button
            onClick={() => navigate('/activities')}
            className="group flex flex-col items-center justify-center w-64 h-40 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
          >
            <Clock size={48} className="mb-4 text-teal-400 group-hover:text-white transition-colors" />
            <span className="text-xl font-bold">배출량 분석</span>
            <span className="text-sm text-gray-400 mt-2">상세 데이터 조회</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 text-gray-500 text-sm">
        © {currentYear} Hyundai Minuteness. All rights reserved.
      </div>
    </div>
  );
};

export default MainPage;