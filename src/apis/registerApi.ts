const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 1. 옵션 데이터 타입
export interface OptionsData {
  PURPOSE_OPTIONS: { id: number; name: string }[];
  COMPANY_OPTIONS: { id: number; name: string }[];
  CAT_LARGE_OPTIONS: { id: number; name: string }[];
  CAT_SMALL_OPTIONS: { id: number; name: string }[];
  CAR_CATEGORY_MAP?: Record<string, { id: number; name: string }[]>;
  FUEL_OPTIONS: { id: number; name: string }[];
  SUPPLY_CUSTOMER_OPTIONS: { id: number; name: string }[];
  SCOPE_OPTIONS: { id: number; name: string }[];
  SUPPLY_TYPE_OPTIONS: { id: number; name: string }[];
  REGION_OPTIONS: string[];
}

// 2. 통합 폼 데이터 (페이지에서 사용하는 전체 필드)
// 필요하다면 각 등록 API별로 Pick<IntegratedFormData, 'key1' | 'key2'> 로 쪼개서 정의할 수도 있습니다.
export interface IntegratedFormData {
  carNumber: string;
  purposeId: number | null;
  purposeName: string;
  companyId: number | null;
  companyName: string;
  employeeId: string;
  distance: number;
  categoryLargeId: number | null;
  categoryLarge: string;
  categorySmallId: number | null;
  categorySmall: string;
  fuelTypeId: number | null;
  fuelType: string;
  carModel: string;
  remark: string;
  supplyTypeId: number | null;
  supplyTypeName: string;
  customerId: number | null;
  customerName: string;
  region: string;
  addressDetail: string;
  fuelEfficiency: string;
  defaultScopeId: number | null;
  defaultScope: string;
}

// ----------------------------------------------------------------------
// [Mock Data] 더미 데이터
// ----------------------------------------------------------------------
const DUMMY_OPTIONS: OptionsData = {
  PURPOSE_OPTIONS: [
    { id: 1, name: '납품' },
    { id: 2, name: '출퇴근' },
    { id: 3, name: '고객' },
    { id: 4, name: '기타' }
  ],
  COMPANY_OPTIONS: [
    { id: 1, name: 'Volvo KOREA' },
    { id: 2, name: 'Volvo COE' },
    { id: 3, name: 'Volvo CE' },
    { id: 4, name: '현대제철' },
    { id: 5, name: '삼성전자' },
    { id: 6, name: 'LG화학' }
  ],
  CAT_LARGE_OPTIONS: [
    { id: 1, name: '승용차' },
    { id: 2, name: '상용트럭' }
  ],
  CAT_SMALL_OPTIONS: [
    { id: 1, name: '대형' },
    { id: 2, name: '중형' },
    { id: 3, name: '소형' },
    { id: 4, name: '경차' },
    { id: 5, name: '1t 급' },
    { id: 6, name: '5t 급' },
    { id: 7, name: '8t 이상' }
  ],
  FUEL_OPTIONS: [
    { id: 1, name: '가솔린' },
    { id: 2, name: '디젤' },
    { id: 3, name: 'LPG' },
    { id: 4, name: 'CNG' },
    { id: 5, name: '전기' },
    { id: 6, name: '수소' },
    { id: 7, name: '중유' },
    { id: 8, name: '등유' },
    { id: 9, name: '도시가스' }
  ],
  SUPPLY_CUSTOMER_OPTIONS: [
    { id: 1, name: '1000' },
    { id: 2, name: '2000' },
    { id: 3, name: '3000' },
    { id: 4, name: 'clark' },
    { id: 5, name: '기타' }
  ],
  SCOPE_OPTIONS: [
    { id: 1, name: 'Scope1' },
    { id: 2, name: 'Scope3' },
    { id: 3, name: '기타' }
  ],
  SUPPLY_TYPE_OPTIONS: [
    { id: 1, name: '가공' },
    { id: 2, name: '단조' },
    { id: 3, name: '주물' },
    { id: 4, name: '소재' },
    { id: 5, name: '조립' },
    { id: 6, name: '구매' },
    { id: 7, name: '열처리' },
    { id: 8, name: '표면처리' },
    { id: 9, name: '폐기' },
    { id: 10, name: 'IT' },
    { id: 11, name: 'FA' },
    { id: 12, name: '기타' }
  ],
  REGION_OPTIONS: [
    '강원특별자치도','경기도','경상남도','경상북도','광주광역시','대구광역시','대전광역시',
    '부산광역시','서울특별시','세종특별자치시','울산광역시','인천광역시','전라남도','전북특별자치도',
    '제주특별자치도','충청남도','충청북도'
  ],
  CAR_CATEGORY_MAP: {
    '승용차': [
      { id: 1, name: '대형' },
      { id: 2, name: '중형' },
      { id: 3, name: '소형' },
      { id: 4, name: '경차' }
    ],
    '상용트럭': [
      { id: 5, name: '1t 급' },
      { id: 6, name: '5t 급' },
      { id: 7, name: '8t 이상' }
    ]
  }
};

// ----------------------------------------------------------------------
// [API Functions]
// ----------------------------------------------------------------------

// 1. 초기 옵션 데이터 조회
export const fetchRegistrationOptions = async (): Promise<OptionsData> => {
  const token = sessionStorage.getItem('token');

  if (!token) {
    console.warn('인증 토큰이 없습니다. 더미 데이터를 사용합니다.');
    return DUMMY_OPTIONS;
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/options`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn('옵션 조회 실패, 더미 데이터를 사용합니다.');
      return DUMMY_OPTIONS;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('옵션 조회 API 오류:', error);
    return DUMMY_OPTIONS;
  }
};

// 2. 개별 등록 API 함수들
// (1) 출입 차량 등록
export const registerVehicle = async (data: IntegratedFormData) => {
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.'); 
  }
  console.log('Register Company Payload:', data); //여기까지도 ㅇㅋ
  try {
    // Vehicle 엔드포인트는 이름 기반으로 처리
    // 실제 ID 매핑은 백엔드에서 처리되어야 함
    const response = await fetch(`${BASE_URL}/admin/vehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        carNumber: data.carNumber,
        carName: data.carModel, 
        childCategoryId: data.categorySmallId,
        fuelType: data.fuelType,
        purposeName: data.purposeName,
        companyNameForCreation: data.companyName,
        driverMemberId: data.employeeId,
        operationDistance: data.distance,
        remark: data.remark,
      }),
    });
    
    console.log('Register Company Payload:', response);

    if (!response.ok) {
      throw new Error(`등록 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// (2) 협력사명과 주소지 등록
export const registerCompany = async (data: IntegratedFormData) => {

  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }
  console.log('Register Company Payload:', data); //여기까지도 ㅇㅋ
  try {
    const fullAddress = `${data.region} ${data.addressDetail}`;
    const payload = {
      companyName: data.companyName,
      oneWayDistance: data.distance,
      address: fullAddress,
      supplyTypeName: data.supplyTypeName , // supplyType은 ID 필요
      customerName: data.customerName , // Customer는 ID 필요
      remark: data.remark,
    };

    console.log('Register Company Payload:', payload);

    const response = await fetch(`${BASE_URL}/admin/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`등록 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// (3) 차종과 연비 등록
export const registerCarModel = async (data: IntegratedFormData) => {

  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const payload = {
      parentCategoryName: data.categoryLarge,
      childCategoryName: data.categorySmall,
      fuelType: data.fuelType,
      customEfficiency: parseFloat(data.fuelEfficiency),
    };

    const response = await fetch(`${BASE_URL}/admin/car-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`등록 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// (4) 공급 유형 등록
export const registerSupplyType = async (data: IntegratedFormData) => {

  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const payload = {
      supplyTypeName: data.supplyTypeName,
    };

    const response = await fetch(`${BASE_URL}/admin/supply-type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`등록 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// (5) 운행 목적 등록
export const registerPurpose = async (data: IntegratedFormData) => {

  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const payload = {
      purposeName: data.purposeName,
      defaultScope: data.defaultScope ? parseInt(data.defaultScope, 10) : undefined,
    };

    const response = await fetch(`${BASE_URL}/admin/operation-purpose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`등록 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// (6) 공급 고객 등록 
export const registerSupplyCustomer = async (data: IntegratedFormData) => {

  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const payload = {
      customerName: data.customerName,
      remark: data.remark,
    };
    console.log('Register SupplyCustomer Payload:', payload);
    const response = await fetch(`${BASE_URL}/admin/supply-customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    console.log('Register SupplyCustomer Payload:', payload);

    if (!response.ok) {
      throw new Error(`등록 실패: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};