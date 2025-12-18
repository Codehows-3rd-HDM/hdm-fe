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
    operationPurposeName: '출퇴근', 
    defaultScope: 'Scope1',
    companyName: '현대정밀', 
    driverMemberId: '30', 
    operationDistance: '4.7', 
    parentCategoryName: '승용차',
    carCategoryName: '중형',
    carModelName: '쏘나타',
    fuelType: '가솔린',
    remark: '기본 등록 데이터' 
  },
  { 
    id: 2, 
    carNumber: '58너1234', 
    operationPurposeName: '납품', 
    defaultScope: 'Scope3',
    companyName: 'Volvo KOREA', 
    driverMemberId: '102', 
    operationDistance: '15.2', 
    parentCategoryName: '상용트럭',
    carCategoryName: '대형',
    carModelName: '볼보트럭',
    fuelType: '디젤',
    remark: '장거리 운행' 
  },
  // ... 추가 더미 데이터 생성
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 3,
    carNumber: `${100 + i}허${9000 + i}`,
    operationPurposeName: i % 2 === 0 ? '업무' : '방문',
    defaultScope: 'Scope3',
    companyName: i % 3 === 0 ? '삼성전자' : 'LG화학',
    driverMemberId: String(200 + i),
    operationDistance: String(Math.floor(Math.random() * 50) + 5),
    parentCategoryName: '승용차',
    carCategoryName: '소형',
    carModelName: '아반떼',
    fuelType: '가솔린',
    remark: '-'
  }))
];

const MOCK_COMPANY_DATA: CompanyData[] = [
  { 
    id: 1, 
    companyName: '현대정밀', 
    supplyTypeName: '조립', 
    supplyCustomerName: '1000',
    oneWayDistance: 12.5,
    region: '경상남도',
    detailAddress: '창원시', 
    remark: '' 
  },
  { 
    id: 2, 
    companyName: 'Volvo KOREA', 
    supplyTypeName: '도장', 
    supplyCustomerName: 'clark',
    oneWayDistance: 45.0,
    region: '경상남도',
    detailAddress: '창원시 성산구',
    remark: '메인 협력사' 
  },
  // 더미 데이터
  ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 3,
    companyName: `협력사_${i + 1}`,
    supplyTypeName: i % 2 === 0 ? '프레스' : '차체',
    supplyCustomerName: i % 3 === 0 ? '2000' : '3000',
    oneWayDistance: Math.floor(Math.random() * 100),
    region: '경기도',
    detailAddress: `평택시 포승읍 ${i + 1}번길`,
    remark: '-'
  }))
];


const MOCK_CAR_MODEL_DATA: CarModelData[] = [
  { id: 1, parentCategoryName: '승용차', carCategoryName: '중형', fuelType: '가솔린', customEfficiency: '12.3' },
  { id: 2, parentCategoryName: '승용차', carCategoryName: '소형', fuelType: '디젤', customEfficiency: '16.5' },
  { id: 3, parentCategoryName: '상용트럭', carCategoryName: '대형', fuelType: '디젤', customEfficiency: '4.5' },
  { id: 4, parentCategoryName: '승용차', carCategoryName: '경차', fuelType: 'LPG', customEfficiency: '10.2' },
  // 더미 데이터
  ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 5,
      parentCategoryName: '승용차',
      carCategoryName: '대형',
      fuelType: '전기',
      customEfficiency: '5.2' // km/kWh 등 단위 통일 필요할 수 있음
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
