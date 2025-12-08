import React, { useState } from 'react';
import { User, Lock } from 'lucide-react'; 
import { createAccount } from '../../apis/auth'; // API 함수 임포트

const RegisterPage: React.FC = () => {
  // 상태 관리
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER'); // 기본값 ADMIN
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  // 계정 생성 핸들러
  const handleRegister = async () => {
    if (!userName || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. API 호출 (토큰은 api 함수 내부에서 sessionStorage에서 가져옴)
      await createAccount({
        userName,
        password,
        role
      });
      
      alert(`[성공] 계정이 생성되었습니다.\nID: ${userName}\nRole: ${role}`);
      
      // 초기화
      setUserName('');
      setPassword('');
      
    } catch (error: any) {
      console.error(error);
      // 에러 메시지 표시 (403 Forbidden 등)
      if (error.message.includes('token')) {
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        alert('계정 생성 실패: 서버 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-10 bg-white max-w-[500px] mx-auto font-sans">
      <h2 className="text-2xl font-bold mb-10 text-gray-800">계정 등록</h2>

      {/* 아이디 입력칸 */}
      <div className="flex items-center w-full h-[50px] border border-gray-300 px-4 mb-4 bg-white rounded-sm">
        <User size={20} className="text-gray-400" />
        <input
          type="text"
          placeholder="Username (예: 양현진)"
          className="border-none outline-none flex-1 h-full text-[15px] ml-3 text-gray-600 bg-transparent"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      {/* 비밀번호 입력칸 */}
      <div className="flex items-center w-full h-[50px] border border-gray-300 px-4 mb-4 bg-white rounded-sm">
        <Lock size={20} className="text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="border-none outline-none flex-1 h-full text-[15px] ml-3 text-gray-600 bg-transparent"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          className="bg-none border-none cursor-pointer text-gray-400 text-xs font-bold"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "HIDE" : "SHOW"}
        </button>
      </div>

      {/* 권한 선택 (라디오 버튼) */}
      <div className="flex items-center justify-center w-full h-[50px] border border-gray-300 mb-2.5 rounded-sm text-gray-800 font-bold bg-white">
        <label className="flex items-center cursor-pointer mx-5">
          <input
            type="radio"
            name="role"
            value="ADMIN"
            checked={role === 'ADMIN'}
            onChange={() => setRole('ADMIN')}
            className="mr-2 cursor-pointer w-[18px] h-[18px] accent-gray-800"
          />
          관리자 (ADMIN)
        </label>
        
        <label className="flex items-center cursor-pointer mx-5">
          <input
            type="radio"
            name="role"
            value="VIEWER"
            checked={role === 'VIEWER'}
            onChange={() => setRole('VIEWER')}
            className="mr-2 cursor-pointer w-[18px] h-[18px] accent-gray-800"
          />
          사원 (VIEWER)
        </label>
      </div>

      <p className="text-red-500 text-[13px] mb-5 w-full text-center">
        *계정생성 시 권한설정 체크 후 생성해주세요.
      </p>

      {/* 생성 버튼 */}
      <button 
        onClick={handleRegister}
        disabled={isLoading}
        className={`w-full h-[50px] bg-[#4a9d9c] text-white border-none text-base font-bold cursor-pointer rounded-sm transition-colors hover:bg-[#3b8686] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? '생성 중...' : '계정생성'}
      </button>
    </div>
  );
};

export default RegisterPage;