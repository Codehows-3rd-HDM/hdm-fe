import axiosInstance from './axiosInstance';

export type EmissionCategory = 'Total' | 'Scope1' | 'Scope3';

export interface MonthlyData { month: number; value: number; }

export interface TargetData { total: number; monthly: MonthlyData[]; }

export interface FullTargetState {
  Total: TargetData;
  Scope1: TargetData;
  Scope3: TargetData;
}

export interface MonthlyActualResponse {
  year: number;
  monthly: MonthlyData[];
  total: number;
}

const carbonTargetApi = {
  async fetchTargets(year: number): Promise<FullTargetState> {
    const { data } = await axiosInstance.get(`/admin/emission-targets/${year}`);
    console.log('[carbonTargetApi] fetchTargets', { year, data });
    return data;
  },

  async fetchAvailableBaseYears(): Promise<number[]> {
    const { data } = await axiosInstance.get('/admin/emission-targets/base-years');
    console.log('[carbonTargetApi] fetchAvailableBaseYears', data);
    return data;
  },

  async fetchActualsByYear(year: number): Promise<MonthlyActualResponse> {
    const { data } = await axiosInstance.get(`/admin/emission-targets/actuals/${year}`);
    console.log('[carbonTargetApi] fetchActualsByYear', { year, data });
    return data;
  },

  async saveTargets(year: number, payload: FullTargetState) {
    const { data } = await axiosInstance.post(`/admin/emission-targets/${year}`, payload);
    console.log('[carbonTargetApi] saveTargets', { year, payload, data });
    return data;
  },
};

export default carbonTargetApi;
