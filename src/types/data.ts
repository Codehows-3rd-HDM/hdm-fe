// --- 공통 인터페이스 (ColumnDefinition) ---
export interface ColumnDefinition<T> {
  id: keyof T | 'actions';
  header: string;
  searchable: boolean;
  sortable: boolean;
  editable: boolean;
  width?: string;
  inputType?: 'text' | 'number' | 'select' | 'search-select' | 'dynamic-select';
  selectOptions?: string[];
}

// ----------------------------------------------------------------------
// [공통 옵션 상수]
// ----------------------------------------------------------------------
export const REGION_OPTIONS = [
       "강원특별자치도", "경기도", "경상남도", "경상북도", "광주광역시", "대구광역시",
                "대전광역시", "부산광역시", "서울특별시", "세종특별자치시", "울산광역시",
                "인천광역시", "전라남도", "전북특별자치도", "제주특별자치도", "충청남도", "충청북도", "해외"
];

const CAT_LARGE_OPTIONS = ['승용차', '상용트럭'];
const CAT_SMALL_OPTIONS = ['대형', '중형', '소형', '경차'];
const FUEL_OPTIONS = ['가솔린', '디젤', 'LPG','CNG', '전기', '수소','중유','등유','도시가스'];
const SCOPE_OPTIONS = ['Scope1', 'Scope3', '기타'];

// 1. 출입 차량 정보 데이터 타입
export interface VehicleData {
  id: number;
  carNumber: string;      // 차량번호
  operationPurposeName: string;        // 운행목적
  companyName: string;     // 협력사명
  driverMemberId: string;     // 사원번호
  operationDistance: string;       // 편도거리
  parentCategoryName: string;  // 차종 대분류
  carCategoryName: string;  // 차종 소분류
  carModelName: string;       // 차종 (모델명)
  fuelType: string;       // 연료종류
  remark: string;           // 비고
  defaultScope?: string;         // Scope (운행목적 연동)
  isEditing?: boolean;
}

// 2. 협력사명 및 주소지 정보 데이터 타입
export interface CompanyData {
  id: number;
  companyName: string;   // 협력사명
  supplyTypeName: string;   // 공급 유형
  supplyCustomerName: string; // 공급 고객
  oneWayDistance: number; // 편도거리
  region: string;       // 지역 (시/도)
  addressDetail: string; // 상세주소
  remark: string;       // 비고
  isEditing?: boolean;
}

// 3. 차종 및 연비 정보 데이터 타입
export interface CarModelData {
  id: number;
  parentCategoryName: string; // 차종 대분류
  carCategoryName: string; // 차종 소분류
  fuelType: string;      // 연료종류
  customEfficiency: string;// 연비
  isEditing?: boolean;
}

// 4. 공급 유형 정보 데이터 타입
export interface ProcessData {
  id: number;
  supplyType: string; // 공급 유형
  isEditing?: boolean;
}

// 5. 운행 목적 정보 데이터 타입
export interface PurposeData {
  id: number;
  purpose: string; // 운행 목적
  scope: string;   // Scope
  isEditing?: boolean;
}

// 6. 공급 고객 정보 데이터 타입
export interface ProductData {
  id: number;
  supplyCustomer: string; // 품목 구분명
  note: string;         // 비고
  isEditing?: boolean;
}

// ----------------------------------------------------------------------
// [컬럼 정의]
// ----------------------------------------------------------------------

// 1. 출입 차량 컬럼
export const VEHICLE_COLUMNS: ColumnDefinition<VehicleData>[] = [
  { id: 'carNumber', header: '차량번호', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'text' },
  { id: 'carModelName', header: '모델명', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'text' },
  { id: 'driverMemberId', header: '사원번호', searchable: true, sortable: true, editable: true, width: '8%', inputType: 'number' },
  { id: 'companyName', header: '협력사명', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'dynamic-select' },
  { id: 'operationPurposeName', header: '운행목적', searchable: true, sortable: true, editable: true, width: '8%', inputType: 'dynamic-select' },
  { id: 'defaultScope', header: 'Scope', searchable: false, sortable: true, editable: false, width: '8%' }, 
  { id: 'operationDistance', header: '편도거리(km)', searchable: false, sortable: true, editable: true, width: '8%', inputType: 'number' },
  { id: 'parentCategoryName', header: '대분류', searchable: false, sortable: true, editable: true, width: '8%', inputType: 'dynamic-select' },
  { id: 'carCategoryName', header: '소분류', searchable: false, sortable: true, editable: false, width: '8%' },
  { id: 'fuelType', header: '연료', searchable: false, sortable: true, editable: true, width: '8%', inputType: 'dynamic-select' },
  { id: 'remark', header: '비고', searchable: false, sortable: false, editable: true, width: '10%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '10%' },
];

// 2. 협력사 및 주소지 컬럼
export const COMPANY_COLUMNS: ColumnDefinition<CompanyData>[] = [
  { id: 'companyName', header: '협력사명', searchable: true, sortable: true, editable: true, width: '15%', inputType: 'text' },
  { id: 'supplyTypeName', header: '공급 유형', searchable: true, sortable: true, editable: true, width: '12%', inputType: 'dynamic-select' },
  { id: 'supplyCustomerName', header: '공급 고객', searchable: true, sortable: true, editable: true, width: '12%', inputType: 'dynamic-select' },
  { id: 'oneWayDistance', header: '편도거리(km)', searchable: false, sortable: true, editable: true, width: '10%', inputType: 'number' },
  { id: 'region', header: '지역 (시/도)', searchable: true, sortable: true, editable: true, width: '12%', inputType: 'select', selectOptions: REGION_OPTIONS },
  { id: 'addressDetail', header: '상세주소', searchable: true, sortable: false, editable: true, width: '25%', inputType: 'text' },
  { id: 'remark', header: '비고', searchable: false, sortable: false, editable: true, width: '14%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '10%' },
];

// 3. 차종 및 연비 컬럼
export const CAR_MODEL_COLUMNS: ColumnDefinition<CarModelData>[] = [
  { id: 'parentCategoryName', header: '차종 대분류', searchable: true, sortable: true, editable: false, width: '25%', inputType: 'select', selectOptions: CAT_LARGE_OPTIONS },
  { id: 'carCategoryName', header: '차종 소분류', searchable: true, sortable: true, editable: false, width: '25%', inputType: 'select', selectOptions: CAT_SMALL_OPTIONS },
  { id: 'fuelType', header: '연료 종류', searchable: true, sortable: true, editable: false, width: '20%', inputType: 'select', selectOptions: FUEL_OPTIONS },
  { id: 'customEfficiency', header: '연비 (km/L)', searchable: false, sortable: true, editable: true, width: '20%', inputType: 'number' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '10%' },
];

// 4. 공급 유형 컬럼
export const PROCESS_COLUMNS: ColumnDefinition<ProcessData>[] = [
  { id: 'supplyType', header: '공급 유형명', searchable: true, sortable: true, editable: true, width: '80%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '20%' },
];

// 5. 운행 목적 컬럼
export const PURPOSE_COLUMNS: ColumnDefinition<PurposeData>[] = [
  { id: 'purpose', header: '운행 목적', searchable: true, sortable: true, editable: true, width: '50%', inputType: 'text' }, // 단순 텍스트 입력 가능하도록
  { id: 'scope', header: 'Scope', searchable: true, sortable: true, editable: true, width: '30%', inputType: 'select', selectOptions: SCOPE_OPTIONS },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '20%' },
];

// 6. 공급 고객 컬럼
export const PRODUCT_COLUMNS: ColumnDefinition<ProductData>[] = [
  { id: 'supplyCustomer', header: '공급 고객명', searchable: true, sortable: true, editable: true, width: '50%', inputType: 'text' },
  { id: 'note', header: '비고', searchable: false, sortable: false, editable: true, width: '30%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '20%' },
];