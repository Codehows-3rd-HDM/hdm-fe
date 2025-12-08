import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { login } from '../apis/auth'; // API 함수 임포트

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. API 호출
      const response = await login({ userName, password });
      
      console.log('로그인 성공:', response);

      // 2. 토큰 및 사용자 정보 저장 (Local Storage)
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('role', response.role);
      sessionStorage.setItem('userName', response.userName);

      // 3. 페이지 이동
      alert(`환영합니다, ${response.userName}님! (${response.role})`);
      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-5 font-sans">
      <h2 className="text-3xl font-bold mb-12 text-gray-800">로그인</h2>

      <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
        {/* 아이디 입력 */}
        <div className="flex items-center w-full max-w-[400px] h-[55px] border border-gray-300 px-4 mb-4 bg-white box-border rounded-sm">
          <User size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Username"
            className="border-none outline-none flex-1 h-full text-[15px] ml-3 text-gray-800 bg-transparent"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="flex items-center w-full max-w-[400px] h-[55px] border border-gray-300 px-4 mb-4 bg-white box-border rounded-sm">
          <Lock size={20} className="text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="border-none outline-none flex-1 h-full text-[15px] ml-3 text-gray-800 bg-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button"
            className="bg-none border-none cursor-pointer text-gray-400 text-[11px] font-bold ml-2"
            onClick={() => setShowPassword(!showPassword)}
          >
            SHOW
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button 
          type="submit"
          disabled={isLoading}
          className={`w-full max-w-[400px] h-[60px] bg-[#1f253b] text-white border-none text-base font-bold cursor-pointer flex items-center justify-between px-6 mt-2 box-border rounded-sm transition-opacity hover:opacity-90 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <span className="flex-1 text-center ml-6">
            {isLoading ? '로그인 중...' : '로그인'}
          </span>
          <ArrowRight size={20} color="#fff" />
        </button>
      </form>
    </div>
  );
};

export default LoginPage;