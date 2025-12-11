
// [타입 정의]

// 로그인 요청 데이터
export interface LoginRequest {
  userName: string;
  password: string;
}

// 로그인 응답 데이터
export interface LoginResponse {
  token: string;
  userName: string;
  role: string; // "SUPERADMIN" | "ADMIN" | "USER" 등
}

// 계정 생성 요청 데이터
export interface RegisterRequest {
  userName: string;
  password: string;
  role: string; // "ADMIN" 등
}

// ----------------------------------------------------------------------
// [설정]

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ----------------------------------------------------------------------
// [API 함수]
/**
 * 로그인 API
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      // 에러 처리 (401 Unauthorized 등)
      throw new Error(`로그인 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};

/**
 * 계정 생성 API (슈퍼 관리자 전용)
 * POST /superadmin/create
 * Header: Authorization: Bearer <token>
 */
export const createAccount = async (data: RegisterRequest): Promise<boolean> => {
  // 세션 스토리지에서 토큰 가져오기 (로그인 시 저장했다고 가정)
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const response = await fetch(`${BASE_URL}/superadmin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Bearer 토큰 추가
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`계정 생성 실패: ${errorText || response.statusText}`);
    }

    // 성공 시 true 반환 (백엔드 리턴값이 명확하지 않다면 상태코드 200/201 확인)
    return true; 
  } catch (error) {
    console.error('Create Account API Error:', error);
    throw error;
  }
};