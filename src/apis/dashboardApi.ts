import { getBusinessYear } from '../utils/dateUtils';
import axiosInstance from './axiosInstance';

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
  try {
    // TODO: 실제 API 호출로 변경
    const response = await axiosInstance.get('/api/dashboard/summary', {
      params: {
        year: currentYear
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Dashboard summary API 실패, Mock 데이터 반환:', error);
    return Promise.resolve({
      currentYear,
      scope1Current: 28000,
      scope3Current: 95000,
      scope1Target: 30000,
      scope3Target: 100000,
    });
  }
};

export const fetchMonthlyData = async (): Promise<MonthlyData[]> => {
  try {
    const response = await axiosInstance.get('/api/dashboard/monthly', {
      params: {
        year: currentYear
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Monthly data API 실패, Mock 데이터 반환:', error);
    // 1년 약 13~15만: 월평균 10,833~12,500 (scope1+scope3)
    return Promise.resolve(
      Array.from({ length: 12 }, (_, i) => {
        const base = 11000 + Math.random() * 1500; // 11,000 ~ 12,500
        const scope1 = Math.floor(base * 0.2); // 약 20%
        const scope3 = Math.floor(base * 0.8); // 약 80%
        return {
          month: i + 1,
          scope1,
          scope3,
          target: Math.floor(base * 1.05),
        };
      })
    );
  }
};

export const fetchYearlyData = async (): Promise<YearlyData[]> => {
  try {
    const response = await axiosInstance.get('/api/dashboard/yearly', {
      params: {
        years: 5 // 최근 5년
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Yearly data API 실패, Mock 데이터 반환:', error);
    // 1년 약 13~15만
    return Promise.resolve(
      Array.from({ length: 5 }, (_, i) => {
        const base = 130000 + Math.random() * 20000; // 130,000 ~ 150,000
        const scope1 = Math.floor(base * 0.2); // 약 20%
        const scope3 = Math.floor(base * 0.8); // 약 80%
        return {
          year: currentYear - 4 + i,
          scope1,
          scope3,
          target: Math.floor(base * 1.05),
        };
      })
    );
  }
};

export const fetchPurposeData = async (): Promise<PurposeData[]> => {
  try {
    const response = await axiosInstance.get('/api/dashboard/purpose', {
      params: {
        year: currentYear
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Purpose data API 실패, Mock 데이터 반환:', error);
    // TODO: 실제 API 호출로 변경
    return Promise.resolve([
      { name: '출퇴근', value: 35 },
      { name: '납품', value: 25 },
      { name: '출장', value: 20 },
      { name: '공정운영', value: 15 },
      { name: '기타', value: 5 },
    ]);
  }
};

export const fetchReductionActivities = async (): Promise<ReductionActivity[]> => {
  try {
    const response = await axiosInstance.get('/api/dashboard/reduction-activities', {
      params: {
        year: currentYear,
        limit: 5 // 최근 5개
      }
    });
    return response.data;
  } catch (error) {
    console.warn('Reduction activities API 실패, Mock 데이터 반환:', error);
    const today = new Date();
    return Promise.resolve([
      { id: '1', description: '물류 동선 최적화로 연료 절감', date: new Date(today.getTime() - 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { id: '2', description: '야간 공정 전력 피크 컷 적용', date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { id: '3', description: '폐열 회수 보일러 시범 운영', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { id: '4', description: '사내 EV 충전 인센티브 도입', date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { id: '5', description: '친환경 포장재 전환 파일럿 착수', date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ]);
  }
};
