import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    console.log('🚀 [API 요청] 로그인 시도:', { username, password });

    alert(`환영합니다, ${username}님! 대시보드로 이동합니다.`);
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-white p-5">
      <h2 className="text-[28px] font-bold mb-12 text-gray-800">로그인</h2>

      <form
        onSubmit={handleLogin}
        className="w-full flex flex-col items-center"
      >
        {/* 아이디 입력 */}
        <div className="flex items-center w-full max-w-[400px] h-[55px] border border-gray-300 px-4 mb-4 bg-white">
          <User size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="현진 양"
            className="flex-1 h-full ml-3 text-[15px] text-gray-800 bg-transparent outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="flex items-center w-full max-w-[400px] h-[55px] border border-gray-300 px-4 mb-4 bg-white">
          <Lock size={20} className="text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="****"
            className="flex-1 h-full ml-3 text-[15px] text-gray-800 bg-transparent outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="ml-2 text-gray-400 text-[11px] font-bold cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            SHOW
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="w-full max-w-[400px] h-[60px] bg-[#1f253b] text-white text-[16px] font-bold cursor-pointer flex items-center justify-between px-6 mt-2 transition-opacity hover:opacity-90"
        >
          <span className="flex-1 text-center ml-6">로그인</span>
          <ArrowRight size={20} className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default LoginPage;