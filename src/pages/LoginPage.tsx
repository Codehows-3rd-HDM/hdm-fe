import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react'; // 화살표 아이콘 추가

const styles = {
  // 화면 중앙 정렬을 위한 컨테이너 (스크롤바 문제 해결을 위해 height 100% 제거)
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh', // 화면 전체 높이 사용
    backgroundColor: '#fff',
    padding: '20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '50px',
    color: '#333',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '400px', // 너비 제한
    height: '55px',
    border: '1px solid #ccc',
    padding: '0 15px',
    marginBottom: '15px',
    backgroundColor: '#fff',
    boxSizing: 'border-box' as const,
  },
  input: {
    border: 'none',
    outline: 'none',
    flex: 1,
    height: '100%',
    fontSize: '15px',
    marginLeft: '12px',
    color: '#333',
    backgroundColor: 'transparent',
  },
  icon: {
    color: '#aaa',
  },
  showBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#aaa',
    fontSize: '11px',
    fontWeight: 'bold',
    marginLeft: '10px',
  },
  // 이미지의 짙은 네이비 버튼 스타일
  loginBtn: {
    width: '100%',
    maxWidth: '400px',
    height: '60px',
    backgroundColor: '#1f253b', // 이미지와 유사한 다크 네이비
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between', // 텍스트와 화살표 양끝 정렬
    padding: '0 25px',
    marginTop: '10px',
    boxSizing: 'border-box' as const,
    transition: 'opacity 0.2s',
  },
  btnText: {
    flex: 1,
    textAlign: 'center' as const, // 텍스트는 중앙에 오도록 꼼수
    marginLeft: '24px', // 화살표 크기만큼 밀어서 시각적 중앙 정렬
  },
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // [임시] 로그인 로직
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); // 폼 전송 방지

    // 1. 유효성 검사 (간단히)
    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    // 2. 가짜 API 호출 (API 명세서: POST /login)
    console.log('🚀 [API 요청] 로그인 시도:', { username, password });

    /* // 실제 연동 시 예시 코드
    fetch('/api/login', {
       method: 'POST',
       body: JSON.stringify({ username, password })
    }).then(...)
    */

    // 3. 성공 시나리오 (가정)
    // 토큰 저장 로직 등은 나중에 추가
    // localStorage.setItem('token', 'fake-jwt-token'); 
    
    alert(`환영합니다, ${username}님! 대시보드로 이동합니다.`);
    navigate('/dashboard'); // 대시보드로 이동
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>로그인</h2>

      <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 아이디 입력 */}
        <div style={styles.inputGroup}>
          <User size={20} style={styles.icon} />
          <input
            type="text"
            placeholder="Johnson Doe"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div style={styles.inputGroup}>
          <Lock size={20} style={styles.icon} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="*********"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            type="button"
            style={styles.showBtn}
            onClick={() => setShowPassword(!showPassword)}
          >
            SHOW
          </button>
        </div>

        {/* 로그인 버튼 */}
        <button 
          type="submit"
          style={styles.loginBtn}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <span style={styles.btnText}>로그인</span>
          <ArrowRight size={20} color="#fff" />
        </button>
      </form>
    </div>
  );
};

export default LoginPage;