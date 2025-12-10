import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';

// -------------------------
// 1. 공통 상수 및 타입
// -------------------------
const PAGE_OPTIONS = [
  '출입 차량 기준정보 등록',
  '협력사명과 주소지 기본정보 등록',
  '차종과 연비 기본정보 등록',
  '공급 유형 기본정보 등록',
  '공급 고객 기본정보 등록',
  '생산품목 구분 기본정보 등록',
];

// 옵션 데이터 타입 정의
interface OptionsData {
  PURPOSE_OPTIONS: string[];
  VENDOR_OPTIONS: string[];
  CAT_LARGE_OPTIONS: string[];
  CAT_SMALL_OPTIONS: string[];
  FUEL_OPTIONS: string[];
  PRODUCT_CLASS_OPTIONS: string[];
  SCOPE_OPTIONS: string[];
  PROCESS_OPTIONS: string[];
  REGION_OPTIONS: string[]; // 지역 옵션
}

// 초기 로딩 시 사용할 빈 옵션 데이터
const INITIAL_OPTIONS: OptionsData = {
  PURPOSE_OPTIONS: [],
  VENDOR_OPTIONS: [],
  CAT_LARGE_OPTIONS: [],
  CAT_SMALL_OPTIONS: [],
  FUEL_OPTIONS: [],
  PRODUCT_CLASS_OPTIONS: [],
  SCOPE_OPTIONS: [],
  PROCESS_OPTIONS: [],
   REGION_OPTIONS: []
};

// 더미 데이터 (실제 API 응답으로 대체될 부분)
const DUMMY_OPTIONS: OptionsData = {
  PURPOSE_OPTIONS: ['납품', '출퇴근', '고객', '기타'],
  VENDOR_OPTIONS: ['Volvo KOREA', 'Volvo COE', 'Volvo CE', '현대제철', '삼성전자', 'LG화학'],
  CAT_LARGE_OPTIONS: ['승용차', '상용트럭'],
  CAT_SMALL_OPTIONS: ['대형', '중형', '소형', '경차'],
  FUEL_OPTIONS: ['가솔린', '디젤', 'LPG', 'CNG', '전기', '수소', '중유', '등유', '도시가스'],
  PRODUCT_CLASS_OPTIONS: ['1000', '2000', '3000', 'clark', '기타'],
  SCOPE_OPTIONS: ['Scope1', 'Scope3', '기타'],
  PROCESS_OPTIONS: ['가공', '단조', '주물', '소재', '조립', '구매', '열처리', '표면처리', '구매', '폐기', 'IT', 'FA', '기타'],
  REGION_OPTIONS: ['강원특별자치도','경기도','경상남도','경상북도','광주광역시','대구광역시','대전광역시','부산광역시','서울특별시','세종특별자치시','울산광역시','인천광역시','전라남도','전북특별자치도','제주특별자치도','충청남도','충청북도'
  ],
};


// -------------------------
// 2. 데이터 타입 및 초기 폼 데이터
// -------------------------
interface IntegratedFormData {
  carNumber: string;
  purpose: string;
  vendorName: string;
  employeeId: string;
  distance: string;
  categoryLarge: string;
  categorySmall: string;
  fuelType: string;
  carModel: string;
  note: string;
  processName: string;
  productClass: string;
  region: string;         // 도/광역시
  addressDetail: string;  // 상세주소
  fuelEfficiency: string;
  scope: string;
}

const INITIAL_FORM_DATA: IntegratedFormData = {
  carNumber: '',
  purpose: '',
  vendorName: '',
  employeeId: '',
  distance: '',
  categoryLarge: '',
  categorySmall: '',
  fuelType: '',
  carModel: '',
  note: '',
  processName: '',
  productClass: '',
  region: '', 
  addressDetail: '',
  fuelEfficiency: '',
  scope: '',
};

// -------------------------
// 3. 더미 API 호출 시뮬레이션
// -------------------------

// 모든 옵션 데이터를 한 번에 불러오는 시뮬레이션 함수
const fetchOptionsDataDummy = async (): Promise<OptionsData> => {
  return new Promise(resolve => {
    // 실제 API 호출로 대체될 부분
    setTimeout(() => {
      resolve(DUMMY_OPTIONS); 
    }, 100); // 0.5초 지연 시뮬레이션
  });
};

// -------------------------
// 4. 재사용 가능한 UI 컴포넌트
// -------------------------

// 필수 입력 표시 컴포넌트
const RequiredLabel: React.FC<{ children: React.ReactNode; isRequired?: boolean }> = ({
  children,
  isRequired = false,
}) => (
  <label className="font-semibold text-sm text-gray-700">
    {children}
    {isRequired && <span className="ml-1 text-red-500">*</span>}
  </label>
);

// -------------------------
// 5. 메인 컴포넌트
// -------------------------
const VehicleBasicRegisterPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(PAGE_OPTIONS[0]);
  const [formData, setFormData] = useState<IntegratedFormData>(INITIAL_FORM_DATA);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 옵션 로딩과 페이지 로딩 통합
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // 드롭다운 옵션 데이터를 관리하는 상태
  const [options, setOptions] = useState<OptionsData>(INITIAL_OPTIONS);

  // 컴포넌트 마운트 시 옵션 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // [핵심] 모든 옵션 데이터를 한 번에 API 호출하여 가져옴
        const fetchedOptions = await fetchOptionsDataDummy();
        setOptions(fetchedOptions);
        
        // 페이지 데이터 로딩 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        // 실제 운영 환경에서는 사용자에게 오류 메시지를 표시해야 함
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []); // 마운트 시 한 번만 실행

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(e.target.value);
    // 페이지가 변경될 때마다 폼 데이터 초기화
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors([]); 
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    // 숫자 입력 필드에 음수 방지
    if (type === 'number') {
      const num = parseFloat(value);
      if (num < 0) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // -------------------------
  // 유효성 검사 로직 (Validation)
  // -------------------------
  const validateForm = (): boolean => {
    const errors: string[] = [];
    let requiredFields: Array<{ key: keyof IntegratedFormData; name: string }> = [];

    // 페이지별 필수 필드 정의
    switch (currentPage) {
      case PAGE_OPTIONS[0]: // 출입 차량 기준정보 등록
        requiredFields = [
          { key: 'carNumber', name: '차량번호' },
          { key: 'purpose', name: '운행목적' },
          { key: 'vendorName', name: '업체명' },
          { key: 'distance', name: '편도거리(km)' },
          { key: 'categoryLarge', name: '차종 대분류' },
          { key: 'categorySmall', name: '차종 소분류' },
          { key: 'carModel', name: '모델명' },
          { key: 'fuelType', name: '연료종류' },
        ];
        break;
      case PAGE_OPTIONS[1]: // 업체명과 주소지 기본정보 등록
        requiredFields = [
          { key: 'vendorName', name: '업체명' },
          { key: 'processName', name: '생산공정' },
          { key: 'distance', name: '편도거리(km)' },
          { key: 'productClass', name: '품목구분' },
          { key: 'region', name: '지역(도/시)' },  
          { key: 'addressDetail', name: '상세주소' },
        ];
        break;
      case PAGE_OPTIONS[2]: // 차종과 연비 기본정보 등록
        requiredFields = [
          { key: 'categoryLarge', name: '차종 대분류' },
          { key: 'categorySmall', name: '차종 소분류' },
          { key: 'fuelType', name: '연료종류' },
          { key: 'fuelEfficiency', name: '연비(km/L)' },
        ];
        break;
      case PAGE_OPTIONS[3]: // 생산공정 기본정보 등록
        requiredFields = [{ key: 'processName', name: '생산공정명' }];
        break;
      case PAGE_OPTIONS[4]: // 운행목적 기본정보 등록
        requiredFields = [
          { key: 'purpose', name: '운행목적' },
          { key: 'scope', name: 'Scope' },
        ];
        break;
      case PAGE_OPTIONS[5]: // 생산품목 구분 기본정보 등록
        requiredFields = [{ key: 'productClass', name: '품목 구분명' }];
        break;
    }

    // 1. 필수 필드 검사
    requiredFields.forEach(field => {
      if (!formData[field.key] || String(formData[field.key]).trim() === '') {
        errors.push(`${field.name}을(를) 입력해 주세요.`);
      }
    });

    // 2. 숫자 형식 및 범위 검사
    const numericFields: Array<{ key: keyof IntegratedFormData; name: string }> = [
      { key: 'distance', name: '편도거리(km)' },
      { key: 'fuelEfficiency', name: '연비(km/L)' },
    ];

    numericFields.forEach(field => {
      // 해당 필드가 필수 필드이고, 값이 있고, 숫자 형식이 아니거나 0 미만인 경우
      if (
        requiredFields.some(req => req.key === field.key) && 
        formData[field.key] !== '' && 
        (isNaN(parseFloat(formData[field.key])) || parseFloat(formData[field.key]) < 0) 
      ) {
        errors.push(`${field.name}은(는) 0 이상의 유효한 숫자여야 합니다.`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 500); // 애니메이션 지속 시간
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors([]);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      console.error('필수 입력 필드를 확인해 주세요.');
      return;
    }

    // 서버로 보낼 때는 region과 addressDetail을 합쳐서 address로 만듦
    // const payload = { ...formData };
    
    if (currentPage === PAGE_OPTIONS[1]) {
        // 주소 합치기 로직
        const fullAddress = `${formData.region} ${formData.addressDetail}`;
        console.log(`[주소 병합] ${fullAddress}`);
        // payload.address = fullAddress; // 실제 전송 시 사용
    }

    console.log(`[등록 요청] ${currentPage} 데이터:`, formData);
    // TODO: 여기에 실제 API 호출 로직을 추가하여 데이터를 서버에 전송합니다.
    alert(`${currentPage}이(가) 정상적으로 등록되었습니다. (콘솔 확인)`); // 임시 알림
    handleReset();
  };

  // -------------------------
  // 6. 렌더링 도우미 및 필드 정의
  // -------------------------
  const twInput =
    'h-11 px-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors w-full';
  
  const twSelectBase = twInput + ' cursor-pointer appearance-none bg-white';
  
  // 드롭다운을 위한 래퍼 컴포넌트
  const SelectField: React.FC<{ 
    name: keyof IntegratedFormData; 
    label: string; 
    options: string[]; 
    isRequired?: boolean;
    value: string;
  }> = ({ name, label, options, isRequired = false, value }) => (
    <div className="flex flex-col gap-1">
      <RequiredLabel isRequired={isRequired}>{label}</RequiredLabel>
      <div className="relative">
        <select 
          name={name} 
          value={value} 
          onChange={handleChange} 
          className={twSelectBase}
          disabled={isLoading} // 로딩 중 비활성화
        >
          <option value="">선택</option>
          {options.map(v => (
            // 옵션 데이터는 서버에서 받은 options 상태를 사용
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </div>
  );

  const renderFields = () => {
    // 로딩 중일 경우 로딩 스피너 표시
    if (isLoading) {
      return (
        <div className="col-span-3 text-center py-10 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-3"></div>
          로딩 중...
        </div>
      );
    }

    switch (currentPage) {
      case PAGE_OPTIONS[0]:
        return (
          <>
            {/* 차량번호 */}
            <div className="flex flex-col gap-1">
              <RequiredLabel isRequired>차량번호</RequiredLabel>
              <input name="carNumber" value={formData.carNumber} onChange={handleChange} className={twInput} />
            </div>

            {/* 운행목적 */}
            <SelectField
              name="purpose"
              label="운행목적"
              options={options.PURPOSE_OPTIONS}
              isRequired
              value={formData.purpose}
            />

            {/* 업체명 */}
            <div className="flex flex-col gap-1">
              <RequiredLabel isRequired>업체명</RequiredLabel>
              <input list="vendor-list" name="vendorName" value={formData.vendorName} onChange={handleChange} className={twInput} />
              <datalist id="vendor-list">
                {options.VENDOR_OPTIONS.map(v => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>

            {/* 사원번호 */}
            <div className="flex flex-col gap-1">
              <RequiredLabel>사원번호</RequiredLabel>
              <input type="number" name="employeeId" value={formData.employeeId} onChange={handleChange} className={twInput} />
            </div>

            {/* 편도거리(km) */}
            <div className="flex flex-col gap-1">
              <RequiredLabel isRequired>편도거리(km)</RequiredLabel>
              <input type="number" name="distance" value={formData.distance} onChange={handleChange} className={twInput} />
            </div>

            {/* 차종 대분류 */}
            <SelectField
              name="categoryLarge"
              label="차종 대분류"
              options={options.CAT_LARGE_OPTIONS}
              isRequired
              value={formData.categoryLarge}
            />

            {/* 차종 소분류 */}
            <SelectField
              name="categorySmall"
              label="차종 소분류"
              options={options.CAT_SMALL_OPTIONS}
              isRequired
              value={formData.categorySmall}
            />

            {/* 모델명 */}
            <div className="flex flex-col gap-1">
              <RequiredLabel isRequired>모델명</RequiredLabel>
              <input name="carModel" value={formData.carModel} onChange={handleChange} className={twInput} />
            </div>

            {/* 연료종류 */}
            <SelectField
              name="fuelType"
              label="연료종류"
              options={options.FUEL_OPTIONS}
              isRequired
              value={formData.fuelType}
            />

            {/* 비고 */}
            <div className="col-span-3 flex flex-col gap-1">
              <RequiredLabel>비고</RequiredLabel>
              <textarea name="note" value={formData.note} onChange={handleChange} className="w-full h-28 p-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors" />
            </div>
          </>
        );

      case PAGE_OPTIONS[1]:
        return (
          <>
            {/* 협력사명 */}
            <div className="flex flex-col gap-1">
              <RequiredLabel isRequired>협력사명</RequiredLabel>
              <input name="vendorName" value={formData.vendorName} onChange={handleChange} className={twInput} />
            </div>

            {/* 생산공정 */}
            <SelectField
              name="processName"
              label="생산공정"
              options={options.PROCESS_OPTIONS}
              isRequired
              value={formData.processName}
            />

            {/* 편도거리(km) */}
            <div className="flex flex-col gap-1">
              <RequiredLabel isRequired>편도거리(km)</RequiredLabel>
              <input type="number" name="distance" value={formData.distance} onChange={handleChange} className={twInput} />
            </div>

            {/* 품목구분 */}
            <SelectField
              name="productClass"
              label="품목구분"
              options={options.PRODUCT_CLASS_OPTIONS}
              isRequired
              value={formData.productClass}
            />

            {/* 주소 입력 분리 (지역 선택 + 상세 주소) */}
            <SelectField 
                name="region" 
                label="지역 (도/시)" 
                options={options.REGION_OPTIONS} // 행정구역 옵션 사용
                isRequired 
                value={formData.region} 
            />
            <div className="col-span-2 flex flex-col gap-1">
              <RequiredLabel isRequired>상세주소</RequiredLabel>
              <input 
                name="addressDetail" 
                value={formData.addressDetail} 
                onChange={handleChange} 
                className={twInput} 
                placeholder="나머지 상세 주소를 입력하세요"
              />
            </div>

            {/* 비고 */}
            <div className="col-span-3 flex flex-col gap-1">
              <RequiredLabel>비고</RequiredLabel>
              <textarea name="note" value={formData.note} onChange={handleChange} className="w-full h-28 p-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors" />
            </div>
          </>
        );

      case PAGE_OPTIONS[2]:
        return (
          <>
            {/* 차종 대분류 */}
            <SelectField
              name="categoryLarge"
              label="차종 대분류"
              options={options.CAT_LARGE_OPTIONS}
              isRequired
              value={formData.categoryLarge}
            />

            {/* 차종 소분류 */}
            <SelectField
              name="categorySmall"
              label="차종 소분류"
              options={options.CAT_SMALL_OPTIONS}
              isRequired
              value={formData.categorySmall}
            />

            {/* 연료종류 */}
            <SelectField
              name="fuelType"
              label="연료종류"
              options={options.FUEL_OPTIONS}
              isRequired
              value={formData.fuelType}
            />

            {/* 연비(km/L) */}
            <div className="flex flex-col gap-1">
              <RequiredLabel isRequired>연비(km/L)</RequiredLabel>
              <input type="number" name="fuelEfficiency" value={formData.fuelEfficiency} onChange={handleChange} className={twInput} />
            </div>
          </>
        );

      case PAGE_OPTIONS[3]:
        return (
          <div className="col-span-3 flex flex-col gap-1">
            <RequiredLabel isRequired>생산공정명</RequiredLabel>
            <input name="processName" value={formData.processName} onChange={handleChange} className={twInput} />
          </div>
        );

      case PAGE_OPTIONS[4]:
        return (
          <>
            {/* 운행목적 */}
            <div className="col-span-2 flex flex-col gap-1">
              <RequiredLabel isRequired>운행목적</RequiredLabel>
              <input name="purpose" value={formData.purpose} onChange={handleChange} className={twInput} />
            </div>

            {/* Scope */}
            <SelectField
              name="scope"
              label="Scope"
              options={options.SCOPE_OPTIONS}
              isRequired
              value={formData.scope}
            />
          </>
        );

      case PAGE_OPTIONS[5]:
        return (
          <>
            {/* 품목 구분명 */}
            <div className="col-span-3 flex flex-col gap-1">
              <RequiredLabel isRequired>품목 구분명</RequiredLabel>
              <input name="productClass" value={formData.productClass} onChange={handleChange} className={twInput} />
            </div>

            {/* 비고 */}
            <div className="col-span-3 flex flex-col gap-1">
              <RequiredLabel>비고</RequiredLabel>
              <textarea name="note" value={formData.note} onChange={handleChange} className="w-full h-28 p-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors" />
            </div>
          </>
        );

      default:
        return <div>페이지를 선택해 주세요.</div>;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      {/* 헤더: 페이지 선택 드롭다운 */}
      <div className="flex items-center gap-4 mb-10 p-4 bg-white rounded-lg shadow-md">
        
        {/* 페이지 선택 드롭다운 */}
        <div className="relative min-w-[300px]">
          <select 
            value={currentPage} 
            onChange={handlePageChange} 
    
            className="text-lg font-bold p-3 border border-gray-300 rounded-lg shadow-sm w-full bg-white text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer appearance-none pr-10"
            disabled={isLoading}
          >
            {PAGE_OPTIONS.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
        </div>

        {/* 초기화 버튼과 텍스트 */}
        <div className="flex items-center gap-2">
            <button
            onClick={handleReset}
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500 transition-all duration-500 ease-in-out ${
                isResetting ? 'rotate-[360deg] scale-110' : ''
            }`}
            title="초기화 버튼"
            >
            <RefreshCw size={20} /> 
            </button>
            <span className="text-sm font-medium text-gray-600">초기화</span>
        </div>
      </div>

      {/* 유효성 검사 오류 메시지 */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
          <p className="font-bold mb-2">필수 입력 항목을 채워주세요.</p>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 폼 영역 */}
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">{renderFields()}</div>
      </div>

      {/* 등록 버튼 */}
      <div className="flex justify-center mt-10">
        <button 
          onClick={handleSubmit} 
          disabled={isLoading} // 로딩 중에는 버튼 비활성화
          className={`w-48 h-12 text-white font-bold rounded-lg shadow-lg transition-colors transform hover:scale-105 ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'
          }`}
        >
          {isLoading ? '로딩 중...' : '등록하기'}
        </button>
      </div>
    </div>
  );
};

export default VehicleBasicRegisterPage;