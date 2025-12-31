import { getBusinessYear } from '../utils/dateUtils';
import axiosInstance from './axiosInstance';
import { fetchAnalysisData as fetchPurposeAnalysisData } from './emissionsApi';
import { fetchActivities as fetchActivityList } from './activityApi';

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

interface TargetApiResponse {
  totalTarget: number | string;
  totalActual: number | string;
  totalAchievementRate?: number | string;
  monthlyData: Array<{ month: number; target: number | string; actual: number | string }>;
}

interface DashboardYearlyApiResponse {
  year: number;
  scope1Actual?: number | string;
  scope3Actual?: number | string;
  scope1Target?: number | string;
  scope3Target?: number | string;
  totalTarget?: number | string;
}

const toNumber = (value: number | string | undefined | null) => {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(num) ? num : 0;
};

const fetchTarget = async (type: 'total' | 'Scope1' | 'Scope3', year: number): Promise<TargetApiResponse> => {
  const response = await axiosInstance.get('/view/target', { params: { year, type } });
  return response.data as TargetApiResponse;
};

export const fetchDashboardSummary = async (): Promise<DashboardSummaryData> => {
  const year = getBusinessYear();
  try {
    const [scope1, scope3] = await Promise.all([
      fetchTarget('Scope1', year),
      fetchTarget('Scope3', year),
    ]);

    return {
      currentYear: year,
      scope1Current: toNumber(scope1.totalActual),
      scope3Current: toNumber(scope3.totalActual),
      scope1Target: toNumber(scope1.totalTarget),
      scope3Target: toNumber(scope3.totalTarget),
    };
  } catch (error) {
    console.error('Dashboard summary API 실패:', error);
    throw error;
  }
};

export const fetchMonthlyData = async (): Promise<MonthlyData[]> => {
  const year = getBusinessYear();
  try {
    const [total, scope1, scope3] = await Promise.all([
      fetchTarget('total', year),
      fetchTarget('Scope1', year),
      fetchTarget('Scope3', year),
    ]);

    const byMonth: Record<number, MonthlyData> = {};
    for (let m = 1; m <= 12; m++) {
      byMonth[m] = { month: m, scope1: 0, scope3: 0, target: 0 };
    }

    const apply = (source: TargetApiResponse, key: 'scope1' | 'scope3' | 'target') => {
      source.monthlyData?.forEach((item) => {
        const month = item.month;
        if (month >= 1 && month <= 12) {
          if (key === 'target') byMonth[month].target = toNumber(item.target);
          if (key === 'scope1') byMonth[month].scope1 = toNumber(item.actual);
          if (key === 'scope3') byMonth[month].scope3 = toNumber(item.actual);
        }
      });
    };

    apply(total, 'target');
    apply(scope1, 'scope1');
    apply(scope3, 'scope3');

    return Object.values(byMonth).sort((a, b) => a.month - b.month);
  } catch (error) {
    console.error('Monthly data API 실패:', error);
    throw error;
  }
};

export const fetchYearlyData = async (): Promise<YearlyData[]> => {
  const year = getBusinessYear();
  try {
    const years = Array.from({ length: 5 }, (_, i) => year - 4 + i);

    const results = await Promise.allSettled(
      years.map(async (y) => {
        const [scope1, scope3, total] = await Promise.all([
          fetchTarget('Scope1', y),
          fetchTarget('Scope3', y),
          fetchTarget('total', y),
        ]);

        const scope1Actual = toNumber(scope1.totalActual);
        const scope3Actual = toNumber(scope3.totalActual);
        const targetFromTotal = toNumber(total.totalTarget);
        const targetFromScopes = toNumber(scope1.totalTarget) + toNumber(scope3.totalTarget);
        const target = targetFromTotal || targetFromScopes;

        return {
          year: y,
          scope1: scope1Actual,
          scope3: scope3Actual,
          target,
        } as YearlyData;
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<YearlyData> => r.status === 'fulfilled')
      .map((r) => r.value);
  } catch (error) {
    console.error('Yearly data API 실패:', error);
    return [];
  }
};

export const fetchPurposeData = async (): Promise<PurposeData[]> => {
  const year = getBusinessYear();
  try {
    const response = await fetchPurposeAnalysisData('operationpurpose', year.toString(), 'all', 'total');
    return response
      .map((item) => ({
        name: (item as any).purposeName ?? (item as any).name ?? '',
        value: Number((item as any).ratio ?? (item as any).totalEmission ?? 0),
      }))
      .filter((d) => d.name);
  } catch (error) {
    console.error('Purpose data API 실패:', error);
    throw error;
  }
};

export const fetchReductionActivities = async (): Promise<ReductionActivity[]> => {
  try {
    const activities = await fetchActivityList();

    const sorted = [...activities].sort((a, b) => {
      const aDate = new Date(a.periodEnd || a.periodStart || '').getTime() || 0;
      const bDate = new Date(b.periodEnd || b.periodStart || '').getTime() || 0;
      return bDate - aDate;
    });

    return sorted.slice(0, 5).map((activity) => ({
      id: String(activity.id),
      description: activity.activityName || activity.expectedEffect || activity.activityDetails,
      date: activity.periodEnd || activity.periodStart,
    }));
  } catch (error) {
    console.error('Reduction activities API 실패:', error);
    throw error;
  }
};
