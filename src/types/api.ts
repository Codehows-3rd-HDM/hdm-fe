// --- 1. 인증/계정 ---
export interface LoginResponse {
  token: string;
  role: 'admin' | 'viewer' | 'manager';
  username: string;
}

// --- 2. 대시보드 ---
export interface DashboardTotal {
  year: number;
  total_emission: number;
  target_emission: number;
  diff_percentage: number;
}

// --- 4. 업체별 (Company) ---
export interface CompanyEmissionSummary {
  companyId: number;
  companyName: string;
  totalEmission: number;
}

// ... 필요에 따라 API 명세서의 다른 인터페이스들을 여기에 추가합니다.