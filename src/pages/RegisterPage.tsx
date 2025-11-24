import React, { useState } from 'react';
import { User, Lock } from 'lucide-react'; // 아이콘 임포트
// import { LoginResponse } from '../types/api'; 

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    // height: '800px',
    padding: '50px',
    backgroundColor: '#fff', // 배경색
    maxWidth: '500px', // 적당한 폭 제한
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '40px',
    color: '#333',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '50px',
    border: '1px solid #ccc',
    padding: '0 15px',
    marginBottom: '15px', // 인풋 사이 간격
    backgroundColor: '#fff',
    boxSizing: 'border-box' as const,
  },
  input: {
    border: 'none',
    outline: 'none',
    flex: 1,
    height: '90%',
    fontSize: '15px',
    marginLeft: '10px',
    color: '#555',
  },
  icon: {
    color: '#aaa',
  },
  showBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#aaa',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  radioGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // 가운데 정렬
    width: '100%',
    height: '50px',
    border: '1px solid #ccc',
    marginBottom: '10px',
    boxSizing: 'border-box' as const,
    color: '#333',
    fontWeight: 'bold',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    margin: '0 20px', // 라디오 버튼 간격
  },
  radioInput: {
    marginRight: '8px',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#333', // 라디오 버튼 색상 (검정)
  },
  warningText: {
    color: '#ff4d4f', // 붉은색
    fontSize: '13px',
    marginBottom: '20px',
    width: '100%',
    textAlign: 'center' as const,
  },
  submitBtn: {
    width: '100%',
    height: '50px',
    backgroundColor: '#4a9d9c', // 이미지의 청록색 계열
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

const RegisterPage: React.FC = () => {
  // 상태 관리
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('admin'); // 기본값 관리자
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 보이기 토글

  // 계정 생성 핸들러
  const handleRegister = async () => {
    // 유효성 검사 (형식 체크는 안하지만 빈값 체크)
    if (!username || !password) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    // 전송할 데이터 구성
    const payload = {
      username: username,
      password: password,
      role: role, // 'admin' or 'viewer' (사원용)
    };

    console.log('📌 [API 요청] 계정 생성:', payload);

    try {
      //계정 생성 API 호출 예시 (이전에 정의한 API 명세 참고: POST /users)
      /*
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert('계정이 성공적으로 생성되었습니다.');
        // 입력창 초기화
        setUsername('');
        setPassword('');
      } else {
        alert('계정 생성 실패: 중복된 아이디 등');
      }
      */
      
      // 테스트용 알림
      alert(`[전송 완료]\nID: ${payload.username}\nRole: ${payload.role === 'admin' ? '관리자' : '사원'}`);
      
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. 타이틀 */}
      <h2 style={styles.title}>계정 등록</h2>

      {/* 2. 아이디 입력칸 */}
      <div style={styles.inputGroup}>
        <User size={20} style={styles.icon} />
        <input
          type="text"
          placeholder="병재 강"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* 3. 비밀번호 입력칸 (+ SHOW 버튼) */}
      <div style={styles.inputGroup}>
        <Lock size={20} style={styles.icon} />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="****"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          style={styles.showBtn}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "HIDE" : "SHOW"}
        </button>
      </div>

      {/* 4. 권한 선택 (라디오 버튼) */}
      <div style={styles.radioGroup}>
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="role"
            value="admin"
            checked={role === 'admin'}
            onChange={() => setRole('admin')}
            style={styles.radioInput}
          />
          관리자용
        </label>
        
        <label style={styles.radioLabel}>
          <input
            type="radio"
            name="role"
            value="viewer"
            checked={role === 'viewer'}
            onChange={() => setRole('viewer')}
            style={styles.radioInput}
          />
          사원용
        </label>
      </div>

      {/* 5. 경고 문구 */}
      <p style={styles.warningText}>
        *계정생성 시 권한설정 체크 후 생성해주세요.
      </p>

      {/* 6. 생성 버튼 */}
      <button 
        style={styles.submitBtn}
        onClick={handleRegister}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b8686'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a9d9c'}
      >
        계정생성
      </button>
    </div>
  );
};

export default RegisterPage;