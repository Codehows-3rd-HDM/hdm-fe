import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import Modal from '../../components/Modal';
import Breadcrumb from '../../components/Breadcrumb';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
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
  purposeId: null,
  purposeName: '',
  companyId: null,
  companyName: '',
  employeeId: '',
  distance: 0,
  categoryLargeId: null,
  categoryLarge: '',
  categorySmallId: null,
  categorySmall: '',
  fuelTypeId: null,
  fuelType: '',
  carModel: '',
  remark: '',
  calcBaseDate: '',
  supplyTypeId: null,
  supplyTypeName: '',
  customerId: null,
  customerName: '',
  region: '', 
  addressDetail: '',
  fuelEfficiency: '',
  defaultScopeId: null,
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
  <label className="font-semibold text-base text-gray-700">
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalIsSuccess, setModalIsSuccess] = useState(false);
  
  const [options, setOptions] = useState<OptionsData>(INITIAL_OPTIONS);

  // [API] 옵션 데이터 로딩 함수 (재사용 가능하도록 분리)
  const fetchOptions = async () => {
    setIsLoading(true);
    try {
      const fetchedOptions: any = await fetchRegistrationOptions();
      // API 응답 키를 로컬 키로 매핑
      setOptions({
        PURPOSE_OPTIONS: fetchedOptions.PURPOSE_OPTIONS || [],
        COMPANY_OPTIONS: fetchedOptions.COMPANY_OPTIONS || [], 
        COMPANY_LIST: fetchedOptions.COMPANY_LIST || [],
        CAT_LARGE_OPTIONS: fetchedOptions.CAT_LARGE_OPTIONS || [],
        CAT_SMALL_OPTIONS: fetchedOptions.CAT_SMALL_OPTIONS || [],
        FUEL_OPTIONS: fetchedOptions.FUEL_OPTIONS || [],
        SUPPLY_CUSTOMER_OPTIONS: fetchedOptions.SUPPLY_CUSTOMER_OPTIONS || [], 
        SCOPE_OPTIONS: fetchedOptions.SCOPE_OPTIONS || [],
        SUPPLY_TYPE_OPTIONS: fetchedOptions.SUPPLY_TYPE_OPTIONS || [], 
        REGION_OPTIONS: fetchedOptions.REGION_OPTIONS || [],
        CAR_CATEGORY_MAP: fetchedOptions.CAR_CATEGORY_MAP || {},
      });
    } catch (error) {
      console.error("데이터 로딩 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(e.target.value);
    setFormData(INITIAL_FORM_DATA);
    setValidationErrors([]);
    // 페이지 전환 시에도 최신 옵션을 불러옵니다.
    fetchOptions().catch(console.error);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const num = parseFloat(value);
      if (num < 0) return;
    }
    setFormData(prev => {
      const next = { ...prev, [name]: value } as IntegratedFormData;
      // 대분류를 변경하면 소분류를 초기화
      if (name === 'categoryLarge') next.categorySmall = '';
      return next;
    });
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
          { key: 'companyName', name: '협력사명' }, { key: 'supplyTypeName', name: '공급 유형' },
          { key: 'distance', name: '편도거리' }, { key: 'customerName', name: '공급 고객' },
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
        requiredFields = [{ key: 'supplyTypeName', name: '공급 유형명' }];
        break;
      case '운행목적 기본정보 등록':
        requiredFields = [{ key: 'purposeName', name: '운행목적' }, { key: 'defaultScope', name: 'Scope' }];
        break;
      case '공급 고객 기본정보 등록':
        requiredFields = [{ key: 'customerName', name: '공급 고객명' }];
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
      // 각 페이지별로 필요한 필드만 추출해서 전송
      if (currentPage === '출입 차량 기준정보 등록') {
        // Vehicle 등록 - carNumber, carModel, company, Purpose, operationDistance, driverMemberId
        const payload = {
          carNumber: formData.carNumber, // 차이름 = 차량번호
          carModel: formData.carModel, // 모델 이름
          categorySmallId: formData.categorySmallId,
          fuelType: formData.fuelType,
          companyName: formData.companyName,
          purposeId: formData.purposeId,
          distance: formData.distance,
          employeeId: formData.employeeId,
          calcBaseDate: formData.calcBaseDate,
          remark: formData.remark,
        };
        console.log('Vehicle payload:', payload);
        await registerVehicle(payload as unknown as IntegratedFormData);
        // 등록 성공 시 옵션을 재조회해서 드롭다운 반영
        await fetchOptions();
      } else if (currentPage === '협력사명과 주소지 기본정보 등록') {
        // Company 등록
        const payload = {
          companyName: formData.companyName,
          distance: formData.distance,
          region: formData.region,
          addressDetail: formData.addressDetail,
          supplyTypeId: formData.supplyTypeId,
          customerId: formData.customerId,
          remark: formData.remark,
        } as any;
        console.log('Company payload:', payload);
        await registerCompany(payload as unknown as IntegratedFormData);
        await fetchOptions();
      } else if (currentPage === '차종과 연비 기본정보 등록') {
        // CarModel 등록
        const payload = {
          categorySmallId: formData.categorySmallId,
          fuelType: formData.fuelType,
          fuelEfficiency: formData.fuelEfficiency,
        } as any;
        await registerCarModel(payload as unknown as IntegratedFormData);
        await fetchOptions();
      } else if (currentPage === '공급 유형 기본정보 등록') {
        // SupplyType 등록
        const payload = {
          supplyTypeName: formData.supplyTypeName,
        } as any;
        await registerSupplyType(payload as unknown as IntegratedFormData);
        await fetchOptions();
      } else if (currentPage === '운행목적 기본정보 등록') {
        // OperationPurpose 등록
        const payload = {
          purposeName: formData.purposeName,
          defaultScope: formData.defaultScopeId,
        } as any;
        await registerPurpose(payload as unknown as IntegratedFormData);
        await fetchOptions();
      } else if (currentPage === '공급 고객 기본정보 등록') {
        // SupplyCustomer 등록
        const payload = {
          customerName: formData.customerName,
          remark: formData.remark,
        } as any;
        await registerSupplyCustomer(payload as unknown as IntegratedFormData);
        await fetchOptions();
      }

      setModalTitle('등록 완료');
      setModalMessage(`${currentPage}이(가) 정상적으로 등록되었습니다.`);
      setModalIsSuccess(true);
      setIsModalOpen(true);
      handleReset();
    } catch (error) {
      console.error("등록 실패:", error);
      setModalTitle('등록 오류');
      setModalMessage(error instanceof Error ? error.message : "등록 중 오류가 발생했습니다.");
      setModalIsSuccess(false);
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------
  // 렌더링 도우미 (Tailwind)
  // -------------------------
  const twInput = 'h-11 px-3 border border-gray-300 bg-gray-100 rounded text-base outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-colors w-full';
  const twSelectBase = twInput + ' cursor-pointer appearance-none bg-white';
  
  const SelectField: React.FC<{ name: keyof IntegratedFormData; idName?: keyof IntegratedFormData; label: string; options: string[] | {id: number, name: string}[]; isRequired?: boolean; value: string; }> = ({ name, idName, label, options, isRequired = false, value }) => (
    <div className="flex flex-col gap-1">
      <RequiredLabel isRequired={isRequired}>{label}</RequiredLabel>
      <div className="relative">
        <select name={name} value={value} onChange={(e) => {
          if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'id' in options[0]) {
            const selected = (options as {id: number, name: string}[]).find(opt => opt.name === e.target.value);
            if (selected && idName) {
              setFormData(prev => ({ ...prev, [name]: selected.name, [idName]: selected.id }));
            } else {
              handleChange(e);
            }
          } else {
            handleChange(e);
          }
        }} className={twSelectBase} disabled={isLoading}>
          <option value="">선택</option>
          {Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'id' in options[0]
            ? (options as {id: number, name: string}[]).map(opt => <option key={opt.id} value={opt.name}>{opt.name}</option>)
            : (options as string[]).map(v => <option key={v} value={v}>{v}</option>)
          }
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
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>모델명</RequiredLabel><input name="carModel" value={formData.carModel} onChange={handleChange} className={twInput} /></div>
            <div className="flex flex-col gap-1"><RequiredLabel>사원번호</RequiredLabel><input type="number" name="employeeId" value={formData.employeeId} onChange={handleChange} className={twInput} /></div>
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>협력사명</RequiredLabel><input list="company-list" name="companyName" value={formData.companyName} onChange={(e) => {
              const company = options.COMPANY_LIST?.find(c => c.name === e.target.value);
              if (company) {
                setFormData(prev => ({ ...prev, companyName: company.name, companyId: company.id, distance: company.oneWayDistance }));
              } else {
                handleChange(e);
              }
            }} className={twInput} /><datalist id="company-list">{options.COMPANY_LIST?.map(c => <option key={c.id} value={c.name}/>)}</datalist></div>
            <SelectField name="purposeName" idName="purposeId" label="운행목적" options={options.PURPOSE_OPTIONS} isRequired value={formData.purposeName} />
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>편도거리(km)</RequiredLabel><input type="number" name="distance" value={formData.distance} onChange={handleChange} className={twInput} /></div>
            <div className="flex flex-col gap-1"><RequiredLabel>차량등록일</RequiredLabel><input type="date" name="calcBaseDate" value={formData.calcBaseDate} onChange={handleChange} className={twInput} /></div>
            <SelectField name="categoryLarge" idName="categoryLargeId" label="차종 대분류" options={options.CAT_LARGE_OPTIONS} isRequired value={formData.categoryLarge} />
            <SelectField name="categorySmall" idName="categorySmallId" label="차종 소분류" options={options.CAR_CATEGORY_MAP?.[formData.categoryLarge] ?? options.CAT_SMALL_OPTIONS} isRequired value={formData.categorySmall} />
            <SelectField name="fuelType" idName="fuelTypeId" label="연료종류" options={options.FUEL_OPTIONS} isRequired value={formData.fuelType} />
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel>비고</RequiredLabel><textarea name="remark" value={formData.remark} onChange={handleChange} className="w-full h-28 p-2 border border-gray-300 bg-gray-100 rounded text-base outline-none" /></div>
          </>
        );

      // 2. 협력사명과 주소지
      case '협력사명과 주소지 기본정보 등록':
        return (
          <>
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>협력사명</RequiredLabel><input name="companyName" value={formData.companyName} onChange={handleChange} className={twInput} /></div>
            <SelectField name="supplyTypeName" idName="supplyTypeId" label="공급 유형" options={options.SUPPLY_TYPE_OPTIONS} isRequired value={formData.supplyTypeName} />
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>편도거리(km)</RequiredLabel><input type="number" name="distance" value={formData.distance} onChange={handleChange} className={twInput} /></div>
            <SelectField name="customerName" idName="customerId" label="공급 고객" options={options.SUPPLY_CUSTOMER_OPTIONS} isRequired value={formData.customerName} />
            <SelectField name="region" label="지역 (도/시)" options={options.REGION_OPTIONS} isRequired value={formData.region} />
            <div className="col-span-2 flex flex-col gap-1"><RequiredLabel isRequired>상세주소</RequiredLabel><input name="addressDetail" value={formData.addressDetail} onChange={handleChange} className={twInput} placeholder="나머지 상세 주소" /></div>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel>비고</RequiredLabel><textarea name="remark" value={formData.remark} onChange={handleChange} className="w-full h-28 p-2 border border-gray-300 bg-gray-100 rounded text-base outline-none" /></div>
          </>
        );

      // 3. 차종과 연비
      case '차종과 연비 기본정보 등록':
        return (
          <>
            <SelectField name="categoryLarge" label="차종 대분류" options={options.CAT_LARGE_OPTIONS} isRequired value={formData.categoryLarge} />
            <SelectField name="categorySmall" idName="categorySmallId" label="차종 소분류" options={options.CAR_CATEGORY_MAP?.[formData.categoryLarge] ?? options.CAT_SMALL_OPTIONS} isRequired value={formData.categorySmall} />
            <SelectField name="fuelType" label="연료종류" options={options.FUEL_OPTIONS} isRequired value={formData.fuelType} />
            <div className="flex flex-col gap-1"><RequiredLabel isRequired>연비(km/L)</RequiredLabel><input type="number" name="fuelEfficiency" value={formData.fuelEfficiency} onChange={handleChange} className={twInput} /></div>
          </>
        );

      // 4. 공급 유형
      case '공급 유형 기본정보 등록':
        return (
          <>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel isRequired>공급 유형명</RequiredLabel><input name="supplyTypeName" value={formData.supplyTypeName} onChange={handleChange} className={twInput} /></div>
          </>
        );

      // 5. 운행목적
      case '운행목적 기본정보 등록':
        return (
          <>
            <div className="col-span-2 flex flex-col gap-1"><RequiredLabel isRequired>운행목적</RequiredLabel><input name="purposeName" value={formData.purposeName} onChange={handleChange} className={twInput} /></div>
            <SelectField name="defaultScope" idName="defaultScopeId" label="Scope" options={options.SCOPE_OPTIONS} isRequired value={formData.defaultScope} />
          </>
        );

      // 6. 공급 고객
      case '공급 고객 기본정보 등록':
        return (
          <>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel isRequired>공급 고객명</RequiredLabel><input name="customerName" value={formData.customerName} onChange={handleChange} className={twInput} /></div>
            <div className="col-span-3 flex flex-col gap-1"><RequiredLabel>비고</RequiredLabel><textarea name="remark" value={formData.remark} onChange={handleChange} className="w-full h-28 p-2 border border-gray-300 bg-gray-100 rounded text-base outline-none" /></div>
          </>
        );

      default:
        return <div>페이지를 선택해 주세요.</div>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* 브레드크럼 */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <Breadcrumb items={getBreadcrumbItems('/admin/vehicle/register')} />
      </div>
      
      <div className="flex items-center gap-4 mb-10 p-4 bg-white rounded-lg shadow-md">
        <div className="relative min-w-[300px]">
          <select 
            value={currentPage} 
            onChange={handlePageChange} 
            className="text-xl font-bold p-2 border border-gray-300 rounded-lg shadow-sm w-full bg-white text-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer appearance-none pr-10"
            disabled={isLoading}
          >
            {PAGE_OPTIONS.map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
            <button
            onClick={handleReset}
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500 transition-all duration-500 ease-in-out ${isResetting ? 'rotate-360 scale-110' : ''}`}
            title="초기화 버튼"
            >
            <RefreshCw size={20} /> 
            </button>
            <span className="text-base font-medium text-gray-600">초기화</span>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
          <p className="font-bold mb-2">필수 입력 항목을 채워주세요.</p>
          <ul className="list-disc ml-5 space-y-1 text-base">
            {validationErrors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">{renderFields()}</div>
      </div>

      <div className="flex justify-center mt-10">
        <button 
          onClick={handleSubmit} 
          disabled={isLoading || isSubmitting}
          className={`w-48 h-12 text-white text-lg font-bold rounded-lg shadow-lg transition-colors transform hover:scale-105 ${
            isLoading || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'
          }`}
        >
          {isSubmitting ? '등록 중...' : '등록하기'}
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
        title={modalTitle}
        isSuccess={modalIsSuccess}
      />
    </div>
  );
};

export default VehicleBasicRegisterPage;