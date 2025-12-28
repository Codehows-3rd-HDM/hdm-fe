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
 * 경상남도 창원 위치 기준으로 경상도 지역 높게 설정
 */
const getRegionalDummyData = (): MapData[] => [
  { region: '경상남도', value: 28000 },  // 최고값 - 창원 위치
  { region: '경상북도', value: 22000 },  // 2위
  { region: '부산광역시', value: 18000 },  // 3위 - 인근 지역
  { region: '울산광역시', value: 16000 },  // 4위 - 인근 지역
  { region: '대구광역시', value: 14000 },  // 5위 - 경상권
  { region: '경기도', value: 12000 },
  { region: '충청남도', value: 10000 },
  { region: '인천광역시', value: 8500 },
  { region: '전라남도', value: 7500 },
  { region: '서울특별시', value: 6800 },
  { region: '전라북도', value: 5500 },
  { region: '충청북도', value: 5000 },
  { region: '강원도', value: 4200 },
  { region: '광주광역시', value: 3500 },
  { region: '대전광역시', value: 2800 },
  { region: '세종특별자치시', value: 1500 },
  { region: '제주특별자치도', value: 800 },
];
