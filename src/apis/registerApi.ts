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
  note: string;
  supplyTypeName: string;
  supplyCustomer: string;
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
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[API] 옵션 데이터 로드 완료');
      resolve(DUMMY_OPTIONS);
    }, 300);
  });
};

// 2. 개별 등록 API 함수들
// 추후 axios.post('/api/vehicle', data) 형태로 변경

// (1) 출입 차량 등록
export const registerVehicle = async (data: IntegratedFormData) => {
  console.log('[API] 차량 등록 요청:', data);
  // 실제로는 필요한 필드만 추려서 보낼 수 있음
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
};

// (2) 협력사명과 주소지 등록
export const registerCompany = async (data: IntegratedFormData) => {
  // 주소 합치기 로직이 필요하면 여기서 처리해서 보냄
  const fullAddress = `${data.region} ${data.addressDetail}`;
  console.log('[API] 협력사 등록 요청:', { ...data, fullAddress });
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
};

// (3) 차종과 연비 등록
export const registerCarModel = async (data: IntegratedFormData) => {
  console.log('[API] 차종/연비 등록 요청:', data);
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
};

// (4) 공급 유형 등록
export const registerSupplyType = async (data: IntegratedFormData) => {

  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
  }

  try {
    const response = await fetch(`${BASE_URL}/admin/supply-type `, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // 에러 처리 (401 Unauthorized 등)
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
    const response = await fetch(`${BASE_URL}/admin/operation-purpose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // 에러 처리 (401 Unauthorized 등)
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
  console.log('[API] 공급 고객(품목) 등록 요청:', data);
  return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
};