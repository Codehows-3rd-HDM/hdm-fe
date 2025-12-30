export interface AnalysisColumn {
  id: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'number' | 'percent' | 'string'; // 데이터 포맷팅용
}

export interface AnalysisData {
  id: number;
  name: string; // 항목명 (예: 출퇴근, 휘발유, 업체A 등) -> 차트의 Key로 사용
  totalEmission: number; // 탄소배출량
  ratio: number; // 비율 (%)
  [key: string]: any; // <-- 어떤 문자열 키든 허용합니다.
  
  // 추가 필드 (페이지별로 있을 수도 없을 수도 있음)
  distance?: number; // 운행거리
  count?: number; // 운행횟수
  avgEmission?: number; // 평균 탄소배출량
  carCount?: number; // 차량등록수 (업체별 페이지용)
  address?: string; // 주소 (업체별 페이지용)
  
  // 차트용 월별 데이터 (Mocking)
  monthlyTrend?: number[]; // 1월~12월 배출량 배열
}

// 지역별 데이터 (지도 시각화용)
export interface MapData {
  region: string;
  value: number;
}

// 탭 옵션 타입
export type ScopeType = 'total' | 'scope1' | 'scope3' | '기타';