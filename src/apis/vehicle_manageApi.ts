import type { VehicleData, CompanyData, CarModelData, ProcessData, PurposeData, ProductData } from '../types/data';

// ----------------------------------------------------------------------
// [API Functions] 컴포넌트에서 호출할 함수들
// ----------------------------------------------------------------------
// 1. 조회 (GET)
// endpoint 파라미터에 따라 다른 데이터를 반환하도록 분기 처리 (Router 역할)
export const fetchManagementData = async (endpoint: string): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[API] GET request to ${endpoint}`);
      
      // 엔드포인트에 따라 다른 더미 데이터 반환
      if (endpoint.includes('vehicles')) resolve(MOCK_VEHICLE_DATA);
      else if (endpoint.includes('companies')) resolve(MOCK_COMPANY_DATA);
      else if (endpoint.includes('car-models')) resolve(MOCK_CAR_MODEL_DATA);
      else if (endpoint.includes('process')) resolve(MOCK_PROCESS_DATA);
      else if (endpoint.includes('purpose')) resolve(MOCK_PURPOSE_DATA);
      else if (endpoint.includes('product')) resolve(MOCK_PRODUCT_DATA);
      else resolve([]); // 기본 빈 배열
      
    }, 500); // 0.5초 네트워크 딜레이 시뮬레이션
  });
};

// 2. 삭제 (DELETE)
export const deleteManagementItem = async (endpoint: string, id: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[API] DELETE request to ${endpoint}/${id}`);
      resolve(true); // 성공 가정
    }, 300);
  });
};

// 3. 수정 (PUT)
export const updateManagementItem = async (endpoint: string, id: number, data: any): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[API] PUT request to ${endpoint}/${id}`, data);
      resolve(true);
    });
  });
};

// 4. 일괄 삭제 (Batch DELETE)
export const deleteBatchManagementItems = async (endpoint: string, ids: number[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[API] Batch DELETE request to ${endpoint}`, ids);
      resolve(true);
    });
  });
};

// ----------------------------------------------------------------------
// [Mock Data] 실제 DB 대신 사용할 더미 데이터들
// ----------------------------------------------------------------------
const MOCK_VEHICLE_DATA: VehicleData[] = [
  { 
    id: 1, 
    carNumber: '123가4567', 
    purpose: '출퇴근', 
    scope: 'Scope1',
    vendorName: '현대정밀', 
    employeeId: '30', 
    distance: '4.7', 
    categoryLarge: '승용차',
    categorySmall: '중형',
    carModel: '쏘나타',
    fuelType: '가솔린',
    note: '기본 등록 데이터' 
  },
  { 
    id: 2, 
    carNumber: '58너1234', 
    purpose: '납품', 
    scope: 'Scope3',
    vendorName: 'Volvo KOREA', 
    employeeId: '102', 
    distance: '15.2', 
    categoryLarge: '상용트럭',
    categorySmall: '대형',
    carModel: '볼보트럭',
    fuelType: '디젤',
    note: '장거리 운행' 
  },
  // ... 추가 더미 데이터 생성
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 3,
    carNumber: `${100 + i}허${9000 + i}`,
    purpose: i % 2 === 0 ? '업무' : '방문',
    scope: 'Scope3',
    vendorName: i % 3 === 0 ? '삼성전자' : 'LG화학',
    employeeId: String(200 + i),
    distance: String(Math.floor(Math.random() * 50) + 5),
    categoryLarge: '승용차',
    categorySmall: '소형',
    carModel: '아반떼',
    fuelType: '가솔린',
    note: '-'
  }))
];

const MOCK_COMPANY_DATA: CompanyData[] = [
  { 
    id: 1, 
    vendorName: '현대정밀', 
    supplyType: '조립', 
    distance: '12.5', 
    supplyCustomer: '1000', 
    address: '경상남도 창원시', 
    note: '' 
  },
  { 
    id: 2, 
    vendorName: 'Volvo KOREA', 
    supplyType: '도장', 
    distance: '45.0', 
    supplyCustomer: 'clark', 
    address: '경상남도 창원시 성산구', 
    note: '메인 협력사' 
  },
  // 더미 데이터
  ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 3,
    vendorName: `협력업체_${i + 1}`,
    supplyType: i % 2 === 0 ? '프레스' : '차체',
    distance: String(Math.floor(Math.random() * 100)),
    supplyCustomer: i % 3 === 0 ? '2000' : '3000',
    address: `경기도 평택시 포승읍 ${i + 1}번길`,
    note: '-'
  }))
];


const MOCK_CAR_MODEL_DATA: CarModelData[] = [
  { id: 1, categoryLarge: '승용차', categorySmall: '중형', fuelType: '가솔린', fuelEfficiency: '12.3' },
  { id: 2, categoryLarge: '승용차', categorySmall: '소형', fuelType: '디젤', fuelEfficiency: '16.5' },
  { id: 3, categoryLarge: '상용트럭', categorySmall: '대형', fuelType: '디젤', fuelEfficiency: '4.5' },
  { id: 4, categoryLarge: '승용차', categorySmall: '경차', fuelType: 'LPG', fuelEfficiency: '10.2' },
  // 더미 데이터
  ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 5,
      categoryLarge: '승용차',
      categorySmall: '대형',
      fuelType: '전기',
      fuelEfficiency: '5.2' // km/kWh 등 단위 통일 필요할 수 있음
  }))
];


const MOCK_PROCESS_DATA: ProcessData[] = [
  { id: 1, supplyType: '프레스' },
  { id: 2, supplyType: '차체' },
  { id: 3, supplyType: '도장' },
  { id: 4, supplyType: '조립' },
  { id: 5, supplyType: '엔진' },
  { id: 6, supplyType: '변속기' },
  { id: 7, supplyType: '시트' },
  { id: 8, supplyType: '기타' },
];

const MOCK_PURPOSE_DATA: PurposeData[] = [
  { id: 1, purpose: '납품', scope: 'Scope3' },
  { id: 2, purpose: '출퇴근', scope: 'Scope1' }, // 사내 차량인 경우 Scope1일 수도 있음 (예시)
  { id: 3, purpose: '고객', scope: 'Scope3' },
  { id: 4, purpose: '기타', scope: '기타' },
  { id: 5, purpose: '자재운송', scope: 'Scope3' },
];


const MOCK_PRODUCT_DATA: ProductData[] = [
  { id: 1, supplyCustomer: '1000', note: '기본 부품류' },
  { id: 2, supplyCustomer: '2000', note: '전자 장비' },
  { id: 3, supplyCustomer: '3000', note: '내장재' },
  { id: 4, supplyCustomer: 'clark', note: '지게차 부품' },
  { id: 5, supplyCustomer: '기타', note: '소모품 등' },
];
