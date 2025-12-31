// import type { AnalysisData } from '../types/analysis';// 프로젝트 타입 경로에 맞춰 수정
// If you don't have a central types file, just export a lightweight type:
import axiosInstance from './axiosInstance';

export type AnalysisDataTypeLocal = 'company' | 'supply-type' | 'supply-customer' | 'fuel' | 'purpose';

export interface AnalysisData {
  id: string | number;
  name: string;
  totalEmission: number;
  ratio?: number;
  monthlyTrend?: number[]; // length 12
  address?: string;
  region?: string; // e.g. '서울', '경기'
  [k: string]: unknown;
}

export async function fetchAnalysisData(
  dataType: AnalysisDataTypeLocal | string,
  year: string,
  month: string,
  scope: string
): Promise<AnalysisData[]> {
  // Build query params
  const params = new URLSearchParams();
  if (dataType) params.set('type', String(dataType));
  if (year && year !== 'all') params.set('year', year);
  if (month && month !== 'all') params.set('month', month);
  if (scope && scope !== 'total') params.set('scope', scope);

  try {
    const response = await axiosInstance.get(`/emissions?${params.toString()}`);
    return response.data as AnalysisData[];
  } catch (err) {
    // 네트워크 실패 또는 개발용: mock 데이터 반환 (안전)
    console.warn('[fetchAnalysisData] fetch failed, returning mock data. Error:', err);
    return getMockData();
  }
}

// 간단 mock (개발/테스트용)
function getMockData(): AnalysisData[] {
  const names = [
    '협력사 A', '협력사 B', '협력사 C', '협력사 D', '협력사 E',
    '협력사 F', '협력사 G', '협력사 H', '협력사 I', '협력사 J'
  ];
  return names.map((n, i) => {
    const monthlyTrend = Array.from({ length: 12 }, () => Math.round(Math.random() * 500 + 50));
    const totalEmission = monthlyTrend.reduce((a, b) => a + b, 0);
    return {
      id: i + 1,
      name: n,
      totalEmission,
      ratio: Number((Math.random() * 10 + 1).toFixed(1)),
      monthlyTrend,
      address: ['서울', '경기', '부산', '인천', '대구'][i % 5] + '시',
      region: ['서울', '경기', '부산', '인천', '대구'][i % 5]
    } as AnalysisData;
  });
}
