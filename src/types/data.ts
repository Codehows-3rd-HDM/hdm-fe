// src/types/data.ts

// --- 공통 인터페이스 (ColumnDefinition) ---
export interface ColumnDefinition<T> {
  id: keyof T | 'actions';
  header: string;
  searchable: boolean;
  sortable: boolean;
  editable: boolean;
  width?: string;
  inputType?: 'text' | 'number' | 'select' | 'search-select'; 
  selectOptions?: string[]; 
}

// ----------------------------------------------------------------------
// [공통 옵션 상수] (등록 페이지와 동일한 상수)
// ----------------------------------------------------------------------
const PURPOSE_OPTIONS = ['납품', '출퇴근', '고객', '기타'];
const VENDOR_OPTIONS = ['Volvo KOREA', 'Volvo COE', 'Volvo CE', '현대제철', '삼성전자', 'LG화학'];
const CAT_LARGE_OPTIONS = ['승용차', '상용트럭'];
const CAT_SMALL_OPTIONS = ['대형', '중형', '소형', '경차'];
const FUEL_OPTIONS = ['가솔린', '디젤', 'LPG','CNG', '전기', '수소','중유','등유','도시가스'];
const PRODUCT_CLASS_OPTIONS = ['1000', '2000', '3000', 'clark', '기타']; 
const SCOPE_OPTIONS = ['Scope1', 'Scope3', '기타'];
const PROCESS_OPTIONS = ['가공', '단조', '주물', '소재', '조립', '구매', '열처리', '표면처리', '구매' , '폐기', 'IT','FA', '기타'];

// ----------------------------------------------------------------------
// [데이터 타입 인터페이스]
// ----------------------------------------------------------------------

// 1. 출입 차량 기준정보 데이터 타입
export interface VehicleData {
  id: number;
  carNumber: string;      // 차량번호
  purpose: string;        // 운행목적
  vendorName: string;     // 업체명
  employeeId: string;     // 사원번호
  distance: string;       // 편도거리
  categoryLarge: string;  // 차종 대분류
  categorySmall: string;  // 차종 소분류
  carModel: string;       // 차종 (모델명)
  fuelType: string;       // 연료종류
  note: string;           // 비고
  scope?: string;         // Scope (운행목적 연동)
  isEditing?: boolean;
}

// 2. 업체명 및 주소지 정보 데이터 타입
export interface CompanyData {
  id: number;
  vendorName: string;   // 업체명
  processName: string;  // 생산공정
  distance: string;     // 편도거리
  productClass: string; // 생산품목 구분
  address: string;      // 주소
  note: string;         // 비고
  isEditing?: boolean;
}

// 3. 차종 및 연비 정보 데이터 타입
export interface CarModelData {
  id: number;
  categoryLarge: string; // 차종 대분류
  categorySmall: string; // 차종 소분류
  fuelType: string;      // 연료종류
  fuelEfficiency: string;// 연비
  isEditing?: boolean;
}

// 4. 생산 공정 정보 데이터 타입
export interface ProcessData {
  id: number;
  processName: string; // 공정명
  isEditing?: boolean;
}

// 5. 운행 목적 정보 데이터 타입
export interface PurposeData {
  id: number;
  purpose: string; // 운행 목적
  scope: string;   // Scope
  isEditing?: boolean;
}

// 6. 생산 품목 구분 정보 데이터 타입
export interface ProductData {
  id: number;
  productClass: string; // 품목 구분명
  note: string;         // 비고
  isEditing?: boolean;
}

// ----------------------------------------------------------------------
// [컬럼 정의]
// ----------------------------------------------------------------------

// 1. 출입 차량 컬럼
export const VEHICLE_COLUMNS: ColumnDefinition<VehicleData>[] = [
  { id: 'carNumber', header: '차량번호', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'text' },
  { id: 'purpose', header: '운행목적', searchable: true, sortable: true, editable: true, width: '8%', inputType: 'select', selectOptions: PURPOSE_OPTIONS },
  { id: 'scope', header: 'Scope', searchable: false, sortable: true, editable: false, width: '8%' }, 
  { id: 'vendorName', header: '업체명', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'search-select', selectOptions: VENDOR_OPTIONS },
  { id: 'employeeId', header: '사원번호', searchable: true, sortable: true, editable: true, width: '8%', inputType: 'number' },
  { id: 'distance', header: '편도거리(km)', searchable: false, sortable: true, editable: true, width: '8%', inputType: 'number' },
  { id: 'categoryLarge', header: '대분류', searchable: true, sortable: true, editable: true, width: '8%', inputType: 'select', selectOptions: CAT_LARGE_OPTIONS },
  { id: 'categorySmall', header: '소분류', searchable: true, sortable: true, editable: true, width: '8%', inputType: 'select', selectOptions: CAT_SMALL_OPTIONS },
  { id: 'carModel', header: '모델명', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'text' },
  { id: 'fuelType', header: '연료', searchable: true, sortable: true, editable: true, width: '8%', inputType: 'select', selectOptions: FUEL_OPTIONS },
  { id: 'note', header: '비고', searchable: false, sortable: false, editable: true, width: '10%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '10%' },
];

// 2. 업체명 및 주소지 컬럼
export const COMPANY_COLUMNS: ColumnDefinition<CompanyData>[] = [
  { id: 'vendorName', header: '업체명', searchable: true, sortable: true, editable: true, width: '15%', inputType: 'search-select', selectOptions: VENDOR_OPTIONS },
  { id: 'processName', header: '생산공정', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'select', selectOptions: PROCESS_OPTIONS },
  { id: 'productClass', header: '생산품목구분', searchable: true, sortable: true, editable: true, width: '10%', inputType: 'select', selectOptions: PRODUCT_CLASS_OPTIONS },
  { id: 'distance', header: '편도거리(km)', searchable: false, sortable: true, editable: true, width: '10%', inputType: 'number' },
  { id: 'address', header: '주소', searchable: true, sortable: false, editable: true, width: '30%', inputType: 'text' },
  { id: 'note', header: '비고', searchable: false, sortable: false, editable: true, width: '15%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '10%' },
];

// 3. 차종 및 연비 컬럼
export const CAR_MODEL_COLUMNS: ColumnDefinition<CarModelData>[] = [
  { id: 'categoryLarge', header: '차종 대분류', searchable: true, sortable: true, editable: true, width: '25%', inputType: 'select', selectOptions: CAT_LARGE_OPTIONS },
  { id: 'categorySmall', header: '차종 소분류', searchable: true, sortable: true, editable: true, width: '25%', inputType: 'select', selectOptions: CAT_SMALL_OPTIONS },
  { id: 'fuelType', header: '연료 종류', searchable: true, sortable: true, editable: true, width: '20%', inputType: 'select', selectOptions: FUEL_OPTIONS },
  { id: 'fuelEfficiency', header: '연비 (km/L)', searchable: false, sortable: true, editable: true, width: '20%', inputType: 'number' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '10%' },
];

// 4. 생산 공정 컬럼
export const PROCESS_COLUMNS: ColumnDefinition<ProcessData>[] = [
  { id: 'processName', header: '생산 공정명', searchable: true, sortable: true, editable: true, width: '80%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '20%' },
];

// 5. 운행 목적 컬럼
export const PURPOSE_COLUMNS: ColumnDefinition<PurposeData>[] = [
  { id: 'purpose', header: '운행 목적', searchable: true, sortable: true, editable: true, width: '50%', inputType: 'text' }, // 단순 텍스트 입력 가능하도록
  { id: 'scope', header: 'Scope', searchable: true, sortable: true, editable: true, width: '30%', inputType: 'select', selectOptions: SCOPE_OPTIONS },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '20%' },
];

// 6. 생산 품목 구분 컬럼
export const PRODUCT_COLUMNS: ColumnDefinition<ProductData>[] = [
  { id: 'productClass', header: '생산 품목 구분명', searchable: true, sortable: true, editable: true, width: '50%', inputType: 'text' },
  { id: 'note', header: '비고', searchable: false, sortable: false, editable: true, width: '30%', inputType: 'text' },
  { id: 'actions', header: '액션', searchable: false, sortable: false, editable: false, width: '20%' },
];