import type { AnalysisData } from '../types/analysis';
import axiosInstance from './axiosInstance';

// 백엔드 응답 타입들
interface OperationPurposeInquiryResponse {
  purposeName: string;
  totalEmission: number;
  ratio: number;
  totalDistance: number;
  tripCount: number;
  avgEmission: number;
  monthlyTrend: number[];
}

interface SupplyTypeInquiryResponse {
  supplyTypeName: string;
  totalEmission: number;
  ratio: number;
  totalDistance: number;
  tripCount: number;
  avgEmission: number;
  monthlyTrend: number[];
}

interface SupplyCustomerInquiryResponse {
  customerName: string;
  totalEmission: number;
  ratio: number;
  totalDistance: number;
  tripCount: number;
  avgEmission: number;
  monthlyTrend: number[];
}

interface FuelTypeInquiryResponse {
  fuelType: string;
  totalEmission: number;
  ratio: number;
  monthlyTrend: number[];
}

// 백엔드 응답을 AnalysisData로 변환하는 함수들
const transformOperationPurposeData = (data: OperationPurposeInquiryResponse[], index: number): AnalysisData => ({
  id: index,
  name: data[index]?.purposeName || '',
  totalEmission: parseFloat(String(data[index]?.totalEmission || 0)),
  ratio: parseFloat(String(data[index]?.ratio || 0)),
  distance: parseFloat(String(data[index]?.totalDistance || 0)),
  count: data[index]?.tripCount || 0,
  avgEmission: parseFloat(String(data[index]?.avgEmission || 0)),
  monthlyTrend: data[index]?.monthlyTrend || Array(12).fill(0),
});

const transformSupplyTypeData = (data: SupplyTypeInquiryResponse[], index: number): AnalysisData => ({
  id: index,
  name: data[index]?.supplyTypeName || '',
  totalEmission: parseFloat(String(data[index]?.totalEmission || 0)),
  ratio: parseFloat(String(data[index]?.ratio || 0)),
  distance: parseFloat(String(data[index]?.totalDistance || 0)),
  count: data[index]?.tripCount || 0,
  avgEmission: parseFloat(String(data[index]?.avgEmission || 0)),
  monthlyTrend: data[index]?.monthlyTrend || Array(12).fill(0),
});

const transformSupplyCustomerData = (data: SupplyCustomerInquiryResponse[], index: number): AnalysisData => ({
  id: index,
  name: data[index]?.customerName || '',
  totalEmission: parseFloat(String(data[index]?.totalEmission || 0)),
  ratio: parseFloat(String(data[index]?.ratio || 0)),
  distance: parseFloat(String(data[index]?.totalDistance || 0)),
  count: data[index]?.tripCount || 0,
  avgEmission: parseFloat(String(data[index]?.avgEmission || 0)),
  monthlyTrend: data[index]?.monthlyTrend || Array(12).fill(0),
});

const transformFuelTypeData = (data: FuelTypeInquiryResponse[], index: number): AnalysisData => ({
  id: index,
  name: data[index]?.fuelType || '',
  totalEmission: parseFloat(String(data[index]?.totalEmission || 0)),
  ratio: parseFloat(String(data[index]?.ratio || 0)),
  monthlyTrend: data[index]?.monthlyTrend || Array(12).fill(0),
});

// Mock 더미 데이터 (API 실패 시 사용)
const getPurposeData = (): AnalysisData[] => [
  { id: 1, name: '출퇴근', totalEmission: 20000, ratio: 50, distance: 15000, count: 125, avgEmission: 160, monthlyTrend: [1500, 1600, 1550, 1700, 1800, 1750, 1600, 1500, 1650, 1700, 1800, 1850] },
  { id: 2, name: '납품3', totalEmission: 10000, ratio: 25, distance: 20000, count: 150, avgEmission: 66, monthlyTrend: [800, 850, 900, 800, 750, 800, 850, 900, 950, 900, 850, 800] },
  { id: 3, name: '납품1', totalEmission: 5000, ratio: 12.5, distance: 5000, count: 30, avgEmission: 200, monthlyTrend: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
  { id: 4, name: '기타', totalEmission: 5000, ratio: 12.5, distance: 3000, count: 50, avgEmission: 166, monthlyTrend: [400, 420, 410, 430, 400, 420, 410, 430, 400, 420, 410, 430] },
];

const getFuelData = (): AnalysisData[] => [
  { id: 1, name: '가솔린', totalEmission: 15000, ratio: 40, monthlyTrend: Array(12).fill(1250) },
  { id: 2, name: '디젤', totalEmission: 18000, ratio: 50, monthlyTrend: Array(12).fill(1500) },
  { id: 3, name: 'LPG', totalEmission: 3000, ratio: 8, monthlyTrend: Array(12).fill(250) },
  { id: 4, name: '전기', totalEmission: 750, ratio: 2, monthlyTrend: Array(12).fill(62.5) },
];

const getProcessData = (): AnalysisData[] => [
  { id: 1, name: '가공', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(400) },
  { id: 2, name: '단조', totalEmission: 8000, ratio: 32, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
  { id: 3, name: '주물', totalEmission: 7000, ratio: 28, distance: 1500, count: 70, avgEmission: 100, monthlyTrend: Array(12).fill(583) },
  { id: 4, name: '소재', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(450) },
];

const getProductData = (): AnalysisData[] => [
  { id: 1, name: '1000', totalEmission: 4000, ratio: 20, distance: 1000, count: 40, avgEmission: 100, monthlyTrend: Array(12).fill(333) },
  { id: 2, name: '2000', totalEmission: 6000, ratio: 30, distance: 1500, count: 60, avgEmission: 100, monthlyTrend: Array(12).fill(500) },
  { id: 3, name: '3000', totalEmission: 8000, ratio: 40, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
  { id: 4, name: 'clark', totalEmission: 2000, ratio: 10, distance: 500, count: 20, avgEmission: 100, monthlyTrend: Array(12).fill(166) },
];

// --------

export type AnalysisDataType = 'operationpurpose' | 'fuel' | 'company' | 'process' | 'product' | 'supplycustomer' | 'supplytype';

/**
 * 분석 데이터를 가져오는 API (실제 백엔드 API 호출)
 * @param type 데이터 종류
 * @param year 조회 연도
 * @param month 조회 월 ('all' 또는 '1'~'12')
 * @param scope Scope 필터 ('total', 'scope1', 'scope3' 등)
 */
export const fetchAnalysisData = async (
  type: AnalysisDataType,
  year: string,
  month: string,
  scope: string
): Promise<AnalysisData[]> => {
  try {
    const params = {
      year: parseInt(year),
      month: month === 'all' ? undefined : parseInt(month),
      defaultScope: scope === 'scope1' ? 1 : scope === 'scope3' ? 3 : scope === '기타' ? 4 : undefined,
    };

    let apiResponse: any;

    switch (type) {
      case 'operationpurpose': {
        const response = await axiosInstance.get('/view/operation-purpose', { params });
        apiResponse = response.data;
        return apiResponse.map((item: OperationPurposeInquiryResponse, idx: number) => ({
          id: idx,
          name: item.purposeName,
          totalEmission: parseFloat(String(item.totalEmission)),
          ratio: parseFloat(String(item.ratio)),
          distance: parseFloat(String(item.totalDistance)),
          count: item.tripCount,
          avgEmission: parseFloat(String(item.avgEmission)),
          monthlyTrend: item.monthlyTrend || Array(12).fill(0),
        }));
      }

      case 'supplytype': {
        const response = await axiosInstance.get('/view/supply-type', { params });
        apiResponse = response.data;
        return apiResponse.map((item: SupplyTypeInquiryResponse, idx: number) => ({
          id: idx,
          name: item.supplyTypeName,
          totalEmission: parseFloat(String(item.totalEmission)),
          ratio: parseFloat(String(item.ratio)),
          distance: parseFloat(String(item.totalDistance)),
          count: item.tripCount,
          avgEmission: parseFloat(String(item.avgEmission)),
          monthlyTrend: item.monthlyTrend || Array(12).fill(0),
        }));
      }

      case 'supplycustomer': {
        const response = await axiosInstance.get('/view/supply-customer', { params });
        apiResponse = response.data;
        return apiResponse.map((item: SupplyCustomerInquiryResponse, idx: number) => ({
          id: idx,
          name: item.customerName,
          totalEmission: parseFloat(String(item.totalEmission)),
          ratio: parseFloat(String(item.ratio)),
          distance: parseFloat(String(item.totalDistance)),
          count: item.tripCount,
          avgEmission: parseFloat(String(item.avgEmission)),
          monthlyTrend: item.monthlyTrend || Array(12).fill(0),
        }));
      }

      case 'fuel': {
        const response = await axiosInstance.get('/view/fuel', { params });
        apiResponse = response.data;
        return apiResponse.map((item: FuelTypeInquiryResponse, idx: number) => ({
          id: idx,
          name: item.fuelType,
          totalEmission: parseFloat(String(item.totalEmission)),
          ratio: parseFloat(String(item.ratio)),
          monthlyTrend: item.monthlyTrend || Array(12).fill(0),
        }));
      }

      case 'company':
      case 'process':
      case 'product':
      default:
        // 아직 구현되지 않은 타입은 더미 데이터 반환
        if (type === 'process') return getProcessData();
        if (type === 'product') return getProductData();
        return [];
    }
  } catch (error) {
    console.error('Failed to fetch analysis data:', error);
    
    // Fallback: 더미 데이터 반환
    switch (type) {
      case 'operationpurpose':
        return getPurposeData();
      case 'fuel':
        return getFuelData();
      case 'process':
        return getProcessData();
      case 'product':
        return getProductData();
      default:
        return [];
    }
  }
};

// 더미 예시

// const MOCK_DATA: AnalysisData[] = Array.from({ length: 10 }, (_, i) => ({
//     id: i + 1,
//     name: `협력업체 ${String.fromCharCode(65 + i)}`,
//     totalEmission: Math.floor(Math.random() * 10000) + 1000,
//     ratio: 10,
//     distance: Math.floor(Math.random() * 5000) + 500,
//     carCount: Math.floor(Math.random() * 20) + 1,
//     address: `경기도 성남시 분당구 판교로 ${i + 1}번길`,
//     monthlyTrend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000))
// }));


// const MOCK_DATA: AnalysisData[] = [
//   { id: 1, name: '출퇴근', totalEmission: 20000, ratio: 50, distance: 15000, count: 125, avgEmission: 160, monthlyTrend: [1500, 1600, 1550, 1700, 1800, 1750, 1600, 1500, 1650, 1700, 1800, 1850] },
//   { id: 2, name: '납품', totalEmission: 10000, ratio: 25, distance: 20000, count: 150, avgEmission: 66, monthlyTrend: [800, 850, 900, 800, 750, 800, 850, 900, 950, 900, 850, 800] },
//   { id: 3, name: '기타', totalEmission: 10000, ratio: 25, distance: 5000, count: 50, avgEmission: 200, monthlyTrend: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
//   { id: 4, name: '자재운송', totalEmission: 5000, ratio: 12.5, distance: 3000, count: 30, avgEmission: 166, monthlyTrend: [400, 420, 410, 430, 400, 420, 410, 430, 400, 420, 410, 430] },
// ];


// const MOCK_DATA: AnalysisData[] = [
//     { id: 1, name: '프레스', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(416) },
//     { id: 2, name: '도장', totalEmission: 8000, ratio: 32, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
//     { id: 3, name: '조립', totalEmission: 7000, ratio: 28, distance: 1500, count: 70, avgEmission: 100, monthlyTrend: Array(12).fill(583) },
//     { id: 4, name: '검수', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(416) },
// ];

// const MOCK_DATA: AnalysisData[] = [
//     { id: 1, name: '1000', totalEmission: 4000, ratio: 20, distance: 1000, count: 40, avgEmission: 100, monthlyTrend: Array(12).fill(333) },
//     { id: 2, name: '2000', totalEmission: 6000, ratio: 30, distance: 1500, count: 60, avgEmission: 100, monthlyTrend: Array(12).fill(500) },
//     { id: 3, name: '3000', totalEmission: 8000, ratio: 40, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
//     { id: 4, name: 'clark', totalEmission: 2000, ratio: 10, distance: 500, count: 20, avgEmission: 100, monthlyTrend: Array(12).fill(166) },
// ];

// const MOCK_DATA: AnalysisData[] = [
//   { id: 1, name: '휘발유', totalEmission: 15000, ratio: 40, monthlyTrend: Array(12).fill(1250) },
//   { id: 2, name: '경유', totalEmission: 18000, ratio: 50, monthlyTrend: Array(12).fill(1500) },
//   { id: 3, name: 'LPG', totalEmission: 3000, ratio: 8, monthlyTrend: Array(12).fill(250) },
//   { id: 4, name: '전기', totalEmission: 750, ratio: 2, monthlyTrend: Array(12).fill(62.5) },
// ];