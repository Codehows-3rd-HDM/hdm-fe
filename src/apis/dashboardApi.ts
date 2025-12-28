import { getBusinessYear } from '../utils/dateUtils';

export interface DashboardSummaryData {
  currentYear: number;
  scope1Current: number;
  scope3Current: number;
  scope1Target: number;
  scope3Target: number;
}

export interface MonthlyData {
  month: number;
  scope1: number;
  scope3: number;
  target: number;
}

export interface YearlyData {
  year: number;
  scope1: number;
  scope3: number;
  target: number;
}

export interface PurposeData {
  name: string;
  value: number;
}

export interface ReductionActivity {
  id: string;
  description: string;
  date?: string; // 날짜 (YYYY-MM-DD 형식)
  reduction?: number; // % (optional for mock data)
}

// 더미 데이터 반환 함수들
const currentYear = getBusinessYear();

export const fetchDashboardSummary = async (): Promise<DashboardSummaryData> => {
  // TODO: 실제 API 호출로 변경
  return Promise.resolve({
    currentYear,
    scope1Current: 4200,
    scope3Current: 3800,
    scope1Target: 5000,
    scope3Target: 5000,
  });
};

export const fetchMonthlyData = async (): Promise<MonthlyData[]> => {
  // TODO: 실제 API 호출로 변경
  return Promise.resolve(
    Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      scope1: Math.floor(Math.random() * 400) + 350,
      scope3: Math.floor(Math.random() * 400) + 300,
      target: Math.floor(Math.random() * 200) + 1150,
    }))
  );
};

export const fetchYearlyData = async (): Promise<YearlyData[]> => {
  // TODO: 실제 API 호출로 변경
  return Promise.resolve(
    Array.from({ length: 5 }, (_, i) => ({
      year: currentYear - 5 + i,
      scope1: Math.floor(Math.random() * 1200) + 600,
      scope3: Math.floor(Math.random() * 1200) + 700,
      target: Math.floor(Math.random() * 2400) + 1500,
    }))
  );
};

export const fetchPurposeData = async (): Promise<PurposeData[]> => {
  // TODO: 실제 API 호출로 변경
  return Promise.resolve([
    { name: '출퇴근', value: 35 },
    { name: '납품', value: 25 },
    { name: '출장', value: 20 },
    { name: '공정운영', value: 15 },
    { name: '기타', value: 5 },
  ]);
};

export const fetchReductionActivities = async (): Promise<ReductionActivity[]> => {
  // TODO: 실제 API 호출로 변경
  const today = new Date();
  return Promise.resolve([
    { id: '1', description: '물류 동선 최적화로 연료 절감', date: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: '2', description: '야간 공정 전력 피크 컷 적용', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: '3', description: '폐열 회수 보일러 시범 운영', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: '4', description: '사내 EV 충전 인센티브 도입', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    { id: '5', description: '친환경 포장재 전환 파일럿 착수', date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  ]);
};
