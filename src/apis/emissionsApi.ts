import type { AnalysisData } from '../types/analysis';

// ----------------------------------------------------------------------
// [Mock Data Generators] 더미 데이터 생성기
// ----------------------------------------------------------------------

// 1. 운행 목적별 데이터
const getPurposeData = (): AnalysisData[] => [
  { id: 1, name: '출퇴근', totalEmission: 20000, ratio: 50, distance: 15000, count: 125, avgEmission: 160, monthlyTrend: [1500, 1600, 1550, 1700, 1800, 1750, 1600, 1500, 1650, 1700, 1800, 1850] },
  { id: 2, name: '납품', totalEmission: 10000, ratio: 25, distance: 20000, count: 150, avgEmission: 66, monthlyTrend: [800, 850, 900, 800, 750, 800, 850, 900, 950, 900, 850, 800] },
  { id: 3, name: '기타', totalEmission: 10000, ratio: 25, distance: 5000, count: 50, avgEmission: 200, monthlyTrend: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
  { id: 4, name: '자재운송', totalEmission: 5000, ratio: 12.5, distance: 3000, count: 30, avgEmission: 166, monthlyTrend: [400, 420, 410, 430, 400, 420, 410, 430, 400, 420, 410, 430] },
];

// 2. 연료별 데이터
const getFuelData = (): AnalysisData[] => [
  { id: 1, name: '휘발유', totalEmission: 15000, ratio: 40, monthlyTrend: Array(12).fill(1250) },
  { id: 2, name: '경유', totalEmission: 18000, ratio: 50, monthlyTrend: Array(12).fill(1500) },
  { id: 3, name: 'LPG', totalEmission: 3000, ratio: 8, monthlyTrend: Array(12).fill(250) },
  { id: 4, name: '전기', totalEmission: 750, ratio: 2, monthlyTrend: Array(12).fill(62.5) },
];

// 3. 업체별 데이터 (랜덤 생성)
const getVendorData = (): AnalysisData[] => Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `협력사 ${String.fromCharCode(65 + i)}`,
    totalEmission: Math.floor(Math.random() * 10000) + 1000,
    ratio: 10,
    distance: Math.floor(Math.random() * 5000) + 500,
    carCount: Math.floor(Math.random() * 20) + 1,
    address: `경기도 성남시 분당구 판교로 ${i + 1}번길`,
    monthlyTrend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000))
}));

// 4. 공정별 데이터
const getProcessData = (): AnalysisData[] => [
    { id: 1, name: '프레스', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(416) },
    { id: 2, name: '도장', totalEmission: 8000, ratio: 32, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
    { id: 3, name: '조립', totalEmission: 7000, ratio: 28, distance: 1500, count: 70, avgEmission: 100, monthlyTrend: Array(12).fill(583) },
    { id: 4, name: '검수', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(416) },
];

// 5. 품목별 데이터
const getProductData = (): AnalysisData[] => [
    { id: 1, name: '1000', totalEmission: 4000, ratio: 20, distance: 1000, count: 40, avgEmission: 100, monthlyTrend: Array(12).fill(333) },
    { id: 2, name: '2000', totalEmission: 6000, ratio: 30, distance: 1500, count: 60, avgEmission: 100, monthlyTrend: Array(12).fill(500) },
    { id: 3, name: '3000', totalEmission: 8000, ratio: 40, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
    { id: 4, name: 'clark', totalEmission: 2000, ratio: 10, distance: 500, count: 20, avgEmission: 100, monthlyTrend: Array(12).fill(166) },
];

// ----------------------------------------------------------------------
// [API Function]
// ----------------------------------------------------------------------

export type AnalysisDataType = 'operationpurpose' | 'fuel' | 'company' | 'process' | 'product';

/**
 * 분석 데이터를 가져오는 API
 * @param type 데이터 종류 (운행목적, 연료, 업체 등)
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
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[API 예시] Fetch Analysis: Type=${type}, Year=${year}, Month=${month}, Scope=${scope}`);
      
      let data: AnalysisData[] = [];
      
      // 타입에 따른 데이터 로드
      switch(type) {
        case 'operationpurpose': data = getPurposeData(); break;
        case 'fuel': data = getFuelData(); break;
        case 'company': data = getVendorData(); break;
        case 'process': data = getProcessData(); break;
        case 'product': data = getProductData(); break;
        default: data = [];
      }

      // [Mock Logic] 필터 조건에 따라 데이터 수치 조작 (실제 백엔드 로직 흉내)
      // 연도가 바뀌거나 Scope가 바뀌면 값이 달라지는 것을 보여주기 위함
      if (year !== '2025') {
         data = data.map(d => ({ ...d, totalEmission: Math.floor(d.totalEmission * 0.9) }));
      }
      if (scope === 'scope1') {
         data = data.map(d => ({ ...d, totalEmission: Math.floor(d.totalEmission * 0.4) }));
      } else if (scope === 'scope3') {
         data = data.map(d => ({ ...d, totalEmission: Math.floor(d.totalEmission * 0.6) }));
      }

      resolve(data);
    }, 100); // 0.1초 딜레이
  });
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