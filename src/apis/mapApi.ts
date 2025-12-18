import type { MapData } from '../types/analysis';

/**
 * 지역별 탄소 배출량 데이터를 조회합니다.
 */
export const fetchRegionalEmissionData = async (): Promise<MapData[]> => {
  try {
    // 실제 API 연결 시: const { data } = await axios.get(`${BASE_URL}/emissions/region`);
    // return data;
    
    // 현재는 더미 데이터 반환
    return getRegionalDummyData();
  } catch (error) {
    console.error('Failed to fetch regional emission data:', error);
    return getRegionalDummyData();
  }
};

/**
 * 더미 데이터: 지역별 탄소 배출량
 */
const getRegionalDummyData = (): MapData[] => [
  { region: '서울', value: 5000 },
  { region: '부산', value: 8100 },
  { region: '대구', value: 4200 },
  { region: '인천', value: 6500 },
  { region: '광주', value: 2100 },
  { region: '대전', value: 1800 },
  { region: '울산', value: 18000 },
  { region: '세종', value: 900 },
  { region: '경기', value: 25400 },
  { region: '강원', value: 3900 },
  { region: '충북', value: 4800 },
  { region: '충남', value: 9200 },
  { region: '전북', value: 5100 },
  { region: '전남', value: 6300 },
  { region: '경북', value: 7800 },
  { region: '경남', value: 15000 },
  { region: '제주', value: 500 },
];
