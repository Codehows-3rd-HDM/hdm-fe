/**
 * 사용자 인증 및 권한(Role-Based Access Control) 관리를 위한 훅.
 * 토큰 및 사용자 권한은 sessionStorage에서 직접 가져옵니다.

 */

interface AuthInfo {
  isAuthenticated: boolean;
  role: string | null;
  hasRole: (requiredRoles: string | string[]) => boolean;
}

export const useAuth = (): AuthInfo => {
  // sessionStorage에서 토큰과 역할 정보 가져오기
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role') || 'VIEWER';

  const isAuthenticated = !!token;

  /**
   * 사용자가 요구되는 권한을 가지고 있는지 확인하는 함수.
   * @param requiredRoles 필요한 권한 (단일 문자열 또는 배열).
   * @returns 권한이 있으면 true, 없으면 false.
   */
  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!isAuthenticated) return false;

    const required = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // 사용자의 현재 역할이 요구되는 권한 목록에 포함되어 있는지 확인
    return required.includes(role);
  };

  return {
    isAuthenticated,
    role,
    hasRole,
  };
};