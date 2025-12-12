const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 1. 옵션 데이터 타입
export interface OptionsData {
  PURPOSE_OPTIONS: string[];
  COMPANY_OPTIONS: string[];
  CAT_LARGE_OPTIONS: string[];
  CAT_SMALL_OPTIONS: string[];
  FUEL_OPTIONS: string[];
  SUPPLY_CUSTOMER_OPTIONS: string[];
  SCOPE_OPTIONS: string[];
  SUPPLY_TYPE_OPTIONS: string[];
  REGION_OPTIONS: string[];
}

// 2. 통합 폼 데이터 (페이지에서 사용하는 전체 필드)
// 필요하다면 각 등록 API별로 Pick<IntegratedFormData, 'key1' | 'key2'> 로 쪼개서 정의할 수도 있습니다.
export interface IntegratedFormData {
  carNumber: string;
  purposeName: string;
  companyName: string;
  employeeId: string;
  distance: string;
  categoryLarge: string;
  categorySmall: string;
  fuelType: string;
  carModel: string;
  remark: string;
  supplyTypeName: string;
  customerName: string;
  region: string;
  addressDetail: string;
  fuelEfficiency: string;
  defaultScope: string;
}

// ----------------------------------------------------------------------
// [Mock Data] 더미 데이터 - 추후 페이지 접속시 데이터 가져와야함
// ----------------------------------------------------------------------
const DUMMY_OPTIONS: OptionsData = {
  PURPOSE_OPTIONS: ['납품', '출퇴근', '고객', '기타'],
  COMPANY_OPTIONS: ['Volvo KOREA', 'Volvo COE', 'Volvo CE', '현대제철', '삼성전자', 'LG화학'],
  CAT_LARGE_OPTIONS: ['승용차', '상용트럭'],
  CAT_SMALL_OPTIONS: ['대형', '중형', '소형', '경차'],
  FUEL_OPTIONS: ['가솔린', '디젤', 'LPG', 'CNG', '전기', '수소', '중유', '등유', '도시가스'],
  SUPPLY_CUSTOMER_OPTIONS: ['1000', '2000', '3000', 'clark', '기타'],
  SCOPE_OPTIONS: ['Scope1', 'Scope3', '기타'],
  SUPPLY_TYPE_OPTIONS: ['가공', '단조', '주물', '소재', '조립', '구매', '열처리', '표면처리', '구매', '폐기', 'IT', 'FA', '기타'],
  REGION_OPTIONS: [
    '강원특별자치도','경기도','경상남도','경상북도','광주광역시','대구광역시','대전광역시',
    '부산광역시','서울특별시','세종특별자치시','울산광역시','인천광역시','전라남도','전북특별자치도',
    '제주특별자치도','충청남도','충청북도'
  ],
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
        carName: data.carModel, // carName = carModel
        carModel: data.carModel,
        operationPurposeName: data.purposeName,
        companyNameForCreation: data.companyName,
        driverMemberId: data.employeeId,
        operationDistance: parseFloat(data.distance),
        fuelType: data.fuelType,
        remark: data.remark,
      }),
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

// (2) 협력사명과 주소지 등록
export const registerCompany = async (data: IntegratedFormData) => {

  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const fullAddress = `${data.region} ${data.addressDetail}`;
    const payload = {
      companyName: data.companyName,
      oneWayDistance: data.distance,
      address: fullAddress,
      supplyType: { id: data.supplyTypeName }, // supplyType은 ID 필요
      supplyCustomer: { id: data.customerName }, // supplyCustomer는 ID 필요
      remark: data.remark,
    };

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

    const response = await fetch(`${BASE_URL}/admin/supply-customer`, {
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