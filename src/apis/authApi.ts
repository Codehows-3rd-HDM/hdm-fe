
// [타입 정의]

import axiosInstance from './axiosInstance';

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

// 불필요한 상수 제거 (axiosInstance가 이미 baseURL을 설정함)

// ----------------------------------------------------------------------
// [API 함수]
/**
 * 로그인 API
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post('/login', credentials);
    return response.data;
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
  try {
    await axiosInstance.post('/superadmin/create', data);
    return true;
  } catch (error) {
    console.error('Create Account API Error:', error);
    throw error;
  }
};