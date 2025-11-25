import React, { useState } from 'react';
import { RefreshCw, ChevronDown, Save } from 'lucide-react';

// --- 1. 상수 데이터 정의 ---

const PAGE_OPTIONS = [
  '출입 차량 기준정보 등록',           // 0
  '업체명과 주소지 기본정보 등록',     // 1
  '차종과 연비 기본정보 등록',         // 2
  '생산공정 기본정보 등록',            // 3
  '운행목적 기본정보 등록',            // 4
  '생산품목 구분 기본정보 등록',       // 5
];

// 공통 및 개별 드롭다운 옵션
const PURPOSE_OPTIONS = ['납품', '출퇴근', '고객', '기타'];
const VENDOR_OPTIONS = ['Volvo KOREA', 'Volvo COE', 'Volvo CE', '현대제철', '삼성전자', 'LG화학'];
const CAT_LARGE_OPTIONS = ['승용차', '상용트럭'];
const CAT_SMALL_OPTIONS = ['대형', '중형', '소형', '경차'];
const FUEL_OPTIONS = ['가솔린', '디젤', 'LPG','CNG', '전기', '수소','중유','등유','도시가스'];
const PRODUCT_CLASS_OPTIONS = ['1000', '2000', '3000', 'clark', '기타']; 
const SCOPE_OPTIONS = ['Scope1', 'Scope3', '기타'];
const PROCESS_OPTIONS = ['가공', '단조', '주물', '소재', '조립', '구매', '열처리', '표면처리', '구매' , '폐기', 'IT','FA', '기타'];

// --- 2. 통합 데이터 타입 정의 ---
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
  address: string;      
  fuelEfficiency: string; 
  scope: string; 
}

const INITIAL_DATA: IntegratedFormData = {
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
  address: '',
  fuelEfficiency: '',
  scope: '',
};

// --- 3. 스타일 정의 ---
const styles = {
  container: {
    padding: '30px',
    backgroundColor: '#fff',
    minHeight: '100%',
    // [수정] boxSizing 추가하여 padding이 높이에 포함되도록 설정 (스크롤바 해결)
    boxSizing: 'border-box' as const, 
    fontFamily: '"Malgun Gothic", sans-serif',
  },
  headerArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '40px',
  },
  pageSelect: {
    fontSize: '20px',
    fontWeight: 'bold',
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    minWidth: '350px',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffeeba',
    color: '#856404',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.5s',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '30px 40px',
    marginBottom: '30px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333',
  },
  input: {
    height: '45px',
    padding: '0 12px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f2f2f2',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
  },
  select: {
    height: '45px',
    padding: '0 12px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f2f2f2',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '12px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#f2f2f2',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    resize: 'none' as const,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '40px',
  },
  submitBtn: {
    width: '200px',
    height: '50px',
    backgroundColor: '#7dc4e3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
};

const VehicleBasicRegisterPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(PAGE_OPTIONS[0]);
  const [formData, setFormData] = useState<IntegratedFormData>(INITIAL_DATA);
  const [isResetting, setIsResetting] = useState(false);

  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentPage(e.target.value);
    setFormData(INITIAL_DATA);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // 숫자 입력 필드 음수 방지
    if (type === 'number') {
        const num = parseFloat(value);
        if (num < 0) return; 
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => setIsResetting(false), 500);
    setFormData(INITIAL_DATA);
  };

  const validateNumeric = (value: string, fieldName: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
        alert(`${fieldName}은(는) 0 이상의 숫자여야 합니다.`);
        return false;
    }
    return true;
  };

  const handleSubmit = () => {
    console.log(`🚀 [DB 등록 요청] 페이지: ${currentPage}, 데이터:`, formData);

    // 페이지별 상세 유효성 검사
    switch(currentPage) {
        case PAGE_OPTIONS[0]: // 출입 차량
            if (!formData.carNumber.trim()) return alert("차량번호를 입력해주세요.");
            if (!formData.purpose) return alert("운행목적을 선택해주세요.");
            if (!formData.vendorName) return alert("업체명을 입력해주세요.");
            // [수정] 필수값 유효성 검사 추가
            if (!formData.distance) return alert("편도거리를 입력해주세요.");
            if (!validateNumeric(formData.distance, "편도거리")) return;
            
            if (!formData.categoryLarge) return alert("차종 대분류를 선택해주세요.");
            if (!formData.categorySmall) return alert("차종 소분류를 선택해주세요.");
            if (!formData.carModel.trim()) return alert("차종(모델명)을 입력해주세요.");
            if (!formData.fuelType) return alert("연료종류를 선택해주세요.");
            
            if (formData.employeeId && !validateNumeric(formData.employeeId, "사원번호")) return;
            break;

        case PAGE_OPTIONS[1]: // 업체명/주소지
            if (!formData.vendorName.trim()) return alert("업체명을 입력해주세요.");
            if (!formData.processName) return alert("생산공정을 선택해주세요.");
            if (!formData.distance) return alert("편도거리를 입력해주세요.");
            if (!validateNumeric(formData.distance, "편도거리")) return;
            if (!formData.productClass) return alert("생산품목 구분을 선택해주세요.");
            if (!formData.address.trim()) return alert("주소를 입력해주세요.");
            break;

        case PAGE_OPTIONS[2]: // 차종/연비
            if (!formData.categoryLarge) return alert("차종 대분류를 선택해주세요.");
            if (!formData.categorySmall) return alert("차종 소분류를 선택해주세요.");
            if (!formData.fuelType) return alert("연료종류를 선택해주세요.");
            if (!formData.fuelEfficiency) return alert("연비를 입력해주세요.");
            if (!validateNumeric(formData.fuelEfficiency, "연비")) return;
            break;

        case PAGE_OPTIONS[3]: // 생산공정 (신규 등록)
            if (!formData.processName.trim()) return alert("등록할 공정명을 입력해주세요.");
            break;

        case PAGE_OPTIONS[4]: // 운행목적
            if (!formData.purpose.trim()) return alert("등록할 운행목적을 입력해주세요.");
            if (!formData.scope) return alert("Scope를 선택해주세요.");
            break;

        case PAGE_OPTIONS[5]: // 생산품목
            if (!formData.productClass.trim()) return alert("등록할 품목구분명을 입력해주세요.");
            break;
    }

    alert(`${currentPage} 정보가 정상적으로 등록되었습니다.`);
    // handleReset(); 
  };

  // --- 폼 렌더링 ---
  const renderFormFields = () => {
    switch (currentPage) {
      // 1. 출입 차량 기준정보 등록
      case PAGE_OPTIONS[0]:
        return (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>차량번호 <span style={{color:'red'}}>*</span> :</label>
              <input type="text" name="carNumber" value={formData.carNumber} onChange={handleChange} style={styles.input} placeholder="예: 12가3456" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>운행목적 <span style={{color:'red'}}>*</span> :</label>
              <select name="purpose" value={formData.purpose} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {PURPOSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>업체명 <span style={{color:'red'}}>*</span> :</label>
              <input list="vendor-list" name="vendorName" value={formData.vendorName} onChange={handleChange} style={styles.input} placeholder="검색 또는 입력" />
              <datalist id="vendor-list">{VENDOR_OPTIONS.map(opt => <option key={opt} value={opt} />)}</datalist>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>사원번호 :</label>
              <input type="number" name="employeeId" value={formData.employeeId} onChange={handleChange} style={styles.input} min="0" placeholder="숫자만 입력" />
            </div>
            {/* [수정] 필수값 표시 (*) 추가 */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>편도거리 (km) <span style={{color:'red'}}>*</span> :</label>
              <input type="number" name="distance" value={formData.distance} onChange={handleChange} style={styles.input} min="0" placeholder="0 이상의 숫자" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>차종 대분류 <span style={{color:'red'}}>*</span> :</label>
              <select name="categoryLarge" value={formData.categoryLarge} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {CAT_LARGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>차종 소분류 <span style={{color:'red'}}>*</span> :</label>
              <select name="categorySmall" value={formData.categorySmall} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {CAT_SMALL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>차종 (모델명) <span style={{color:'red'}}>*</span> :</label>
              <input type="text" name="carModel" value={formData.carModel} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>연료종류 <span style={{color:'red'}}>*</span> :</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {FUEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={{...styles.fieldGroup, ...styles.fullWidth}}>
              <label style={styles.label}>비고 :</label>
              <textarea name="note" value={formData.note} onChange={handleChange} style={styles.textarea} />
            </div>
          </>
        );

      // 2. 업체명과 주소지 기본정보 등록
      case PAGE_OPTIONS[1]:
        return (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>업체명 <span style={{color:'red'}}>*</span> :</label>
              <input type="text" name="vendorName" value={formData.vendorName} onChange={handleChange} style={styles.input} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>생산공정 <span style={{color:'red'}}>*</span> :</label>
              <select name="processName" value={formData.processName} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {PROCESS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>편도거리 (km) <span style={{color:'red'}}>*</span> :</label>
              <input type="number" name="distance" value={formData.distance} onChange={handleChange} style={styles.input} min="0" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>생산품목 구분 <span style={{color:'red'}}>*</span> :</label>
              <select name="productClass" value={formData.productClass} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {PRODUCT_CLASS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={{...styles.fieldGroup, gridColumn: '2 / -1'}}> 
              <label style={styles.label}>주소 <span style={{color:'red'}}>*</span> :</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} style={styles.input} placeholder="상세 주소 입력" />
            </div>
            <div style={{...styles.fieldGroup, ...styles.fullWidth}}>
              <label style={styles.label}>비고 :</label>
              <textarea name="note" value={formData.note} onChange={handleChange} style={styles.textarea} />
            </div>
          </>
        );

      // 3. 차종과 연비 기본정보 등록
      case PAGE_OPTIONS[2]:
        return (
          <>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>차종 대분류 <span style={{color:'red'}}>*</span> :</label>
              <select name="categoryLarge" value={formData.categoryLarge} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {CAT_LARGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>차종 소분류 <span style={{color:'red'}}>*</span> :</label>
              <select name="categorySmall" value={formData.categorySmall} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {CAT_SMALL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>연료종류 <span style={{color:'red'}}>*</span> :</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {FUEL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>연비 (km/L) <span style={{color:'red'}}>*</span> :</label>
              <input 
                type="number" 
                name="fuelEfficiency" 
                value={formData.fuelEfficiency} 
                onChange={handleChange} 
                style={styles.input} 
                step="0.1" 
                min="0"
                placeholder="예: 12.5" 
              />
            </div>
          </>
        );

      // 4. 생산공정 기본정보 등록
      case PAGE_OPTIONS[3]:
        return (
          <div style={{...styles.fieldGroup, ...styles.fullWidth}}>
            <label style={styles.label}>생산 공정명 <span style={{color:'red'}}>*</span> :</label>
            <input type="text" name="processName" value={formData.processName} onChange={handleChange} style={styles.input} placeholder="등록할 공정 이름을 입력하세요 (예: 도장, 조립)" />
          </div>
        );

      // 5. 운행목적 기본정보 등록
      case PAGE_OPTIONS[4]:
        return (
          <>
            <div style={{...styles.fieldGroup, gridColumn: '1 / span 2'}}>
              <label style={styles.label}>운행 목적 <span style={{color:'red'}}>*</span> :</label>
              <input type="text" name="purpose" value={formData.purpose} onChange={handleChange} style={styles.input} placeholder="예: 시운전, 자재운송" />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Scope <span style={{color:'red'}}>*</span> :</label>
              <select name="scope" value={formData.scope} onChange={handleChange} style={styles.select}>
                <option value="">선택해주세요</option>
                {SCOPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </>
        );

      // 6. 생산품목 구분 기본정보 등록
      case PAGE_OPTIONS[5]:
        return (
          <>
          <div style={{...styles.fieldGroup, ...styles.fullWidth}}>
            <label style={styles.label}>생산 품목 구분명 <span style={{color:'red'}}>*</span> :</label>
            <input type="text" name="productClass" value={formData.productClass} onChange={handleChange} style={styles.input} placeholder="예: 4000, NewModel 등" />
          </div>
          <div style={{...styles.fieldGroup, ...styles.fullWidth}}>
              <label style={styles.label}>비고 :</label>
              <textarea name="note" value={formData.note} onChange={handleChange} style={styles.textarea} />
            </div>
            </>
        );

      default:
        return <div>준비 중입니다.</div>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerArea}>
        <div style={{ position: 'relative' }}>
            <select 
                style={styles.pageSelect} 
                value={currentPage}
                onChange={handlePageChange}
            >
                {PAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>

        <button 
            style={{ 
                ...styles.resetBtn, 
                transform: isResetting ? 'rotate(360deg)' : 'none' 
            }}
            onClick={handleReset}
            title="입력값 초기화"
        >
            <RefreshCw size={20} />
        </button>
      </div>

      <div style={styles.formGrid}>
        {renderFormFields()}
      </div>

      <div style={styles.footer}>
        <button 
            style={styles.submitBtn}
            onClick={handleSubmit}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5ab0d5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#7dc4e3'}
        >
            등록
        </button>
      </div>
    </div>
  );
};

export default VehicleBasicRegisterPage;