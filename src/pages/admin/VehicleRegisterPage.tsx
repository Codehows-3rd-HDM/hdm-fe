import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
// [API] 분리된 API 모듈 임포트
import { 
  fetchRegistrationOptions, 
  registerVehicle, 
  registerCompany, 
  registerCarModel, 
  registerSupplyType, 
  registerPurpose, 
  registerSupplyCustomer,
  type OptionsData, 
  type IntegratedFormData 
} from '../../apis/registerApi';

// -------------------------
// 1. 상수 정의
// -------------------------
const PAGE_OPTIONS = [
  '출입 차량 기준정보 등록',
  '협력사명과 주소지 기본정보 등록',
  '차종과 연비 기본정보 등록',
  '공급 유형 기본정보 등록',
  '운행목적 기본정보 등록',
  '공급 고객 기본정보 등록',
];

const INITIAL_FORM_DATA: IntegratedFormData = {
  carNumber: '',
  purposeName: '',
  companyName: '',
  employeeId: '',
  distance: '',
  categoryLarge: '',
  categorySmall: '',
  fuelType: '',
  carModel: '',
  note: '',
  supplyType: '',
  supplyCustomer: '',
  region: '', 
  addressDetail: '',
  fuelEfficiency: '',
  defaultScope: '',
};

const INITIAL_OPTIONS: OptionsData = {
  PURPOSE_OPTIONS: [],
  COMPANY_OPTIONS: [],
  CAT_LARGE_OPTIONS: [],
  CAT_SMALL_OPTIONS: [],
  FUEL_OPTIONS: [],
  SUPPLY_CUSTOMER_OPTIONS: [],
  SCOPE_OPTIONS: [],
  SUPPLY_TYPE_OPTIONS: [],
  REGION_OPTIONS: []
};

// -------------------------
// 3. UI 컴포넌트 (RequiredLabel)
// -------------------------
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
// 4. 메인 컴포넌트
// -------------------------
const VehicleBasicRegisterPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(PAGE_OPTIONS[0]);
  const [formData, setFormData] = useState<IntegratedFormData>(INITIAL_FORM_DATA);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [options, setOptions] = useState<OptionsData>(INITIAL_OPTIONS);

  // [API] 컴포넌트 마운트 시 옵션 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const fetchedOptions: any = await fetchRegistrationOptions();
        // API 응답 키를 로컬 키로 매핑 (명칭 변경 대응)
        setOptions({
          PURPOSE_OPTIONS: fetchedOptions.PURPOSE_OPTIONS || [],
          COMPANY_OPTIONS: fetchedOptions.VENDOR_OPTIONS || [], 
          CAT_LARGE_OPTIONS: fetchedOptions.CAT_LARGE_OPTIONS || [],
          CAT_SMALL_OPTIONS: fetchedOptions.CAT_SMALL_OPTIONS || [],
          FUEL_OPTIONS: fetchedOptions.FUEL_OPTIONS || [],
          SUPPLY_CUSTOMER_OPTIONS: fetchedOptions.PRODUCT_CLASS_OPTIONS || [], 
          SCOPE_OPTIONS: fetchedOptions.SCOPE_OPTIONS || [],
          SUPPLY_TYPE_OPTIONS: fetchedOptions.PROCESS_OPTIONS || [], 
          REGION_OPTIONS: fetchedOptions.REGION_OPTIONS || [],
        });
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(e.target.value);
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors([]); 
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const num = parseFloat(value);
      if (num < 0) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // -------------------------
  // 유효성 검사 로직
  // -------------------------
  const validateForm = (): boolean => {
    const errors: string[] = [];
    let requiredFields: Array<{ key: keyof IntegratedFormData; name: string }> = [];

    // 페이지 제목에 따른 필수값 설정
    switch (currentPage) {
      case '출입 차량 기준정보 등록':
        requiredFields = [
          { key: 'carNumber', name: '차량번호' }, { key: 'purposeName', name: '운행목적' },
          { key: 'companyName', name: '협력사명' }, { key: 'distance', name: '편도거리' },
          { key: 'categoryLarge', name: '차종 대분류' }, { key: 'categorySmall', name: '차종 소분류' },
          { key: 'carModel', name: '모델명' }, { key: 'fuelType', name: '연료종류' }
        ];
        break;
      case '협력사명과 주소지 기본정보 등록':
        requiredFields = [
          { key: 'companyName', name: '협력사명' }, { key: 'supplyType', name: '공급 유형' },
          { key: 'distance', name: '편도거리' }, { key: 'supplyCustomer', name: '공급 고객' },
          { key: 'region', name: '지역' }, { key: 'addressDetail', name: '상세주소' }
        ];
        break;
      case '차종과 연비 기본정보 등록':
        requiredFields = [
          { key: 'categoryLarge', name: '차종 대분류' }, { key: 'categorySmall', name: '차종 소분류' },
          { key: 'fuelType', name: '연료종류' }, { key: 'fuelEfficiency', name: '연비' }
        ];
        break;
      case '공급 유형 기본정보 등록':
        requiredFields = [{ key: 'supplyType', name: '공급 유형명' }];
        break;
      case '운행목적 기본정보 등록':
        requiredFields = [{ key: 'purposeName', name: '운행목적' }, { key: 'defaultScope', name: 'Scope' }];
        break;
      case '공급 고객 기본정보 등록':
        requiredFields = [{ key: 'supplyCustomer', name: '공급 고객명' }];
        break;
    }

    requiredFields.forEach(field => {
      if (!formData[field.key] || String(formData[field.key]).trim() === '') {
        errors.push(`${field.name}을(를) 입력해 주세요.`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 500);
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors([]);
  };

  function convertScope(scope: string | number | undefined): number | undefined {
    if (scope === undefined || scope === null || String(scope).trim() === '') return undefined;
    const s = String(scope).trim();
    if (s === "Scope1" || s === "1") return 1;
    if (s === "Scope3" || s === "3") return 3;
    return 4; // 기타 (기본값)
  }

  // -------------------------
  // [API] 제출 핸들러
  // -------------------------
    const handleSubmit = async () => {
    if (!validateForm()) {
      console.error('필수 입력 필드를 확인해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 폼 상태는 string 타입 유지 → 전송 직전에 숫자로 변환해서 payloadToSend 생성
      const payloadToSend: any = { ...formData };

      // 운행목적 페이지일 때만 defaultScope를 숫자로 변환하여 담아 보냄
      if (currentPage === '운행목적 기본정보 등록') {
        const converted = convertScope(formData.defaultScope as any);
        // 서버가 defaultScope 필드를 필수 숫자형으로 받는다면 반드시 숫자 또는 명확히 undefined 처리
        if (converted !== undefined) {
          payloadToSend.defaultScope = converted;
        } else {
          // 변환 불가(빈값 등)이면 아예 필드 제거하거나 null로 보낼 수 있음 — 여기선 제거
          delete payloadToSend.defaultScope;
        }
      }

      if (currentPage === '출입 차량 기준정보 등록') {
        await registerVehicle(payloadToSend);
      } else if (currentPage === '협력사명과 주소지 기본정보 등록') {
        await registerCompany(payloadToSend);
      } else if (currentPage === '차종과 연비 기본정보 등록') {
        await registerCarModel(payloadToSend);
      } else if (currentPage === '공급 유형 기본정보 등록') {
        await registerSupplyType(payloadToSend);
      } else if (currentPage === '운행목적 기본정보 등록') {
        await registerPurpose(payloadToSend);
      } else if (currentPage === '공급 고객 기본정보 등록') {
        await registerSupplyCustomer(payloadToSend);
      }

      alert(`${currentPage}이(가) 정상적으로 등록되었습니다.`);
      handleReset();
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------
  // 렌더링 도우미 (Tailwind)
  // -------------------------
  const twInput = 'h-11 px-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors w-full';
  const twSelectBase = twInput + ' cursor-pointer appearance-none bg-white';
  
  const SelectField: React.FC<{ name: keyof IntegratedFormData; label: string; options: string[]; isRequired?: boolean; value: string; }> = ({ name, label, options, isRequired = false, value }) => (
    <div className="flex flex-col gap-1">
      <RequiredLabel isRequired={isRequired}>{label}</RequiredLabel>
      <div className="relative">
        <select name={name} value={value} onChange={handleChange} className={twSelectBase} disabled={isLoading}>
          <option value="">선택</option>
          {options.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </div>
  );

  const renderFields = () => {
    if (isLoading) {
      return (
        <div className="col-span-3 text-center py-10 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto mb-3"></div>
          옵션 데이터 불러오는 중...
        </div>
      );
    }

    switch (currentPage) {
      // 1. 출입 차량
      case '출입 차량 기준정보 등록':
        return (
          <>
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>차량번호</RequiredLabel><input name="carNumber" value={formData.carNumber} onChange={handleChange} className={twInput} /></div>
            <SelectField name="purposeName" label="운행목적" options={options.PURPOSE_OPTIONS} isRequired value={formData.purpose} />
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>협력사명</RequiredLabel><input list="company-list" name="companyName" value={formData.companyName} onChange={handleChange} className={twInput} /><datalist id="company-list">{options.COMPANY_OPTIONS.map(v => <option key={v} value={v}/>)}</datalist></div>
            <div className="flex flex-col gap-1"><RequiredLabel>사원번호</RequiredLabel><input type="number" name="employeeId" value={formData.employeeId} onChange={handleChange} className={twInput} /></div>
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>편도거리(km)</RequiredLabel><input type="number" name="distance" value={formData.distance} onChange={handleChange} className={twInput} /></div>
            <SelectField name="categoryLarge" label="차종 대분류" options={options.CAT_LARGE_OPTIONS} isRequired value={formData.categoryLarge} />
            <SelectField name="categorySmall" label="차종 소분류" options={options.CAT_SMALL_OPTIONS} isRequired value={formData.categorySmall} />
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>모델명</RequiredLabel><input name="carModel" value={formData.carModel} onChange={handleChange} className={twInput} /></div>
            <SelectField name="fuelType" label="연료종류" options={options.FUEL_OPTIONS} isRequired value={formData.fuelType} />
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel>비고</RequiredLabel><textarea name="note" value={formData.note} onChange={handleChange} className="w-full h-28 p-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none" /></div>
          </>
        );

      // 2. 협력사명과 주소지
      case '협력사명과 주소지 기본정보 등록':
        return (
          <>
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>협력사명</RequiredLabel><input name="companyName" value={formData.companyName} onChange={handleChange} className={twInput} /></div>
            <SelectField name="supplyType" label="공급 유형" options={options.SUPPLY_TYPE_OPTIONS} isRequired value={formData.supplyType} />
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>편도거리(km)</RequiredLabel><input type="number" name="distance" value={formData.distance} onChange={handleChange} className={twInput} /></div>
            <SelectField name="supplyCustomer" label="공급 고객" options={options.SUPPLY_CUSTOMER_OPTIONS} isRequired value={formData.supplyCustomer} />
            <SelectField name="region" label="지역 (도/시)" options={options.REGION_OPTIONS} isRequired value={formData.region} />
            <div className="col-span-2 flex flex-col gap-1"><RequiredLabel isRequired>상세주소</RequiredLabel><input name="addressDetail" value={formData.addressDetail} onChange={handleChange} className={twInput} placeholder="나머지 상세 주소" /></div>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel>비고</RequiredLabel><textarea name="note" value={formData.note} onChange={handleChange} className="w-full h-28 p-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none" /></div>
          </>
        );

      // 3. 차종과 연비
      case '차종과 연비 기본정보 등록':
        return (
          <>
            <SelectField name="categoryLarge" label="차종 대분류" options={options.CAT_LARGE_OPTIONS} isRequired value={formData.categoryLarge} />
            <SelectField name="categorySmall" label="차종 소분류" options={options.CAT_SMALL_OPTIONS} isRequired value={formData.categorySmall} />
            <SelectField name="fuelType" label="연료종류" options={options.FUEL_OPTIONS} isRequired value={formData.fuelType} />
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>연비(km/L)</RequiredLabel><input type="number" name="fuelEfficiency" value={formData.fuelEfficiency} onChange={handleChange} className={twInput} /></div>
          </>
        );

      // 4. 공급 유형
      case '공급 유형 기본정보 등록':
        return (
          <>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel isRequired>공급 유형명</RequiredLabel><input name="supplyType" value={formData.supplyType} onChange={handleChange} className={twInput} /></div>
          </>
        );

      // 5. 운행목적
      case '운행목적 기본정보 등록':
        return (
          <>
            <div className="col-span-2 flex flex-col gap-1"><RequiredLabel isRequired>운행목적</RequiredLabel><input name="purposeName" value={formData.purposeName} onChange={handleChange} className={twInput} /></div>
            <SelectField name="defaultScope" label="Scope" options={options.SCOPE_OPTIONS} isRequired value={formData.defaultScope} />
          </>
        );

      // 6. 공급 고객
      case '공급 고객 기본정보 등록':
        return (
          <>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel isRequired>공급 고객명</RequiredLabel><input name="supplyCustomer" value={formData.supplyCustomer} onChange={handleChange} className={twInput} /></div>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel>비고</RequiredLabel><textarea name="note" value={formData.note} onChange={handleChange} className="w-full h-28 p-3 border border-gray-300 bg-gray-100 rounded text-sm outline-none" /></div>
          </>
        );

      default:
        return <div>페이지를 선택해 주세요.</div>;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex items-center gap-4 mb-10 p-4 bg-white rounded-lg shadow-md">
        <div className="relative min-w-[300px]">
          <select 
            value={currentPage} 
            onChange={handlePageChange} 
            className="text-lg font-bold p-3 border border-gray-300 rounded-lg shadow-sm w-full bg-white text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer appearance-none pr-10"
            disabled={isLoading}
          >
            {PAGE_OPTIONS.map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
            <button
            onClick={handleReset}
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500 transition-all duration-500 ease-in-out ${isResetting ? 'rotate-[360deg] scale-110' : ''}`}
            title="초기화 버튼"
            >
            <RefreshCw size={20} /> 
            </button>
            <span className="text-sm font-medium text-gray-600">초기화</span>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
          <p className="font-bold mb-2">필수 입력 항목을 채워주세요.</p>
          <ul className="list-disc ml-5 space-y-1 text-sm">
            {validationErrors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">{renderFields()}</div>
      </div>

      <div className="flex justify-center mt-10">
        <button 
          onClick={handleSubmit} 
          disabled={isLoading || isSubmitting}
          className={`w-48 h-12 text-white font-bold rounded-lg shadow-lg transition-colors transform hover:scale-105 ${
            isLoading || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'
          }`}
        >
          {isSubmitting ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  );
};

export default VehicleBasicRegisterPage;