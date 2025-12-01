import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Upload, AlertCircle, Save } from 'lucide-react';

// --- 타입 정의 ---
interface NiceParkRow {
  carNumber: string;
  entryDate: string;
  entryTime: string;
}

interface S1Row {
  workDate: string;
  employeeId: string;
  employeeName: string; // 화면엔 안보여도 데이터엔 포함
}

// --- 스타일 정의 ---
const styles = {
  container: {
    padding: '30px',
    backgroundColor: '#fff',
    // minHeight: '100%',
    fontFamily: '"Malgun Gothic", sans-serif',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '10px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '5px',
  },
  select: {
    width: '120px',
    height: '35px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '0 10px',
    backgroundColor: '#f9f9f9',
    outline: 'none',
  },
  warningText: {
    color: '#ff4d4f',
    fontSize: '13px',
    fontWeight: 'bold',
    marginLeft: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  // 메인 2단 레이아웃
  contentGrid: {
    display: 'flex',
    gap: '30px',
    marginTop: '20px',
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '10px',
  },
  // 드래그 앤 드롭 영역
  dropZone: {
    border: '2px dashed #ddd',
    borderRadius: '8px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s',
    marginBottom: '10px',
    color: '#666',
    fontSize: '14px',
  },
  dropZoneActive: {
    borderColor: '#007bff',
    backgroundColor: '#eef6ff',
    color: '#007bff',
  },
  fileInput: {
    display: 'none',
  },
  // 데이터 로드됨 텍스트
  loadedText: {
    fontSize: '12px',
    color: '#28a745', // 초록색
    marginBottom: '10px',
    fontWeight: 600,
  },
  // 테이블 스타일
  tableContainer: {
    border: '1px solid #eee',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    backgroundColor: '#f4f4f4',
    padding: '10px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #ddd',
    color: '#555',
    fontWeight: 'bold',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #eee',
    color: '#333',
  },
  // 하단 등록 버튼
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '30px',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
  submitBtn: {
    backgroundColor: '#007bff', // 파란색 버튼
    color: '#fff',
    border: 'none',
    padding: '10px 30px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

const DataUploadPage: React.FC = () => {
  // --- 1. 상태 관리 ---
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('7'); // 예시로 7월
  
  const [niceParkData, setNiceParkData] = useState<NiceParkRow[]>([]);
  const [s1Data, setS1Data] = useState<S1Row[]>([]);
  
  const [isDataExisting, setIsDataExisting] = useState(false); // DB에 이미 데이터가 있는지 여부
  const [isDragOverNice, setIsDragOverNice] = useState(false);
  const [isDragOverS1, setIsDragOverS1] = useState(false);

  // 파일 인풋 참조
  const niceFileInputRef = useRef<HTMLInputElement>(null);
  const s1FileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. 연도 옵션 생성 (1979 ~ 현재) ---
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 1979;
    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // --- 3. 데이터 조회 시뮬레이션 (useEffect) ---
  // 연도/월이 바뀌면 DB를 조회한다고 가정
  useEffect(() => {
    // [API 연동 지점]: GET /upload/history?year=...&month=...
    console.log(`🔎 [API 조회] ${selectedYear}년 ${selectedMonth}월 데이터 조회 시도`);

    // 임시 로직: 2025년 7월일 때만 데이터가 이미 있다고 가정
    if (selectedYear === '2025' && selectedMonth === '7') {
      setIsDataExisting(true);
      // 예시 데이터 채워넣기
      setNiceParkData([
        { carNumber: '178구5586', entryDate: '2025-10-29', entryTime: '17:26:20' },
        { carNumber: '96구3789', entryDate: '2025-10-29', entryTime: '16:45:04' },
        { carNumber: '31조8043', entryDate: '2025-10-29', entryTime: '16:14:33' },
        { carNumber: '825너3484', entryDate: '2025-10-29', entryTime: '16:00:00' },
      ]);
      setS1Data([
        { workDate: '2025-07-01', employeeId: '1000', employeeName: '홍길동' },
        { workDate: '2025-07-02', employeeId: '1000', employeeName: '홍길동' },
        { workDate: '2025-07-03', employeeId: '1000', employeeName: '홍길동' },
      ]);
    } else {
      setIsDataExisting(false);
      setNiceParkData([]);
      setS1Data([]);
    }
  }, [selectedYear, selectedMonth]);


  // --- 4. 파일 업로드 핸들러 ---
  
  // 파일 읽기 및 가짜 파싱
  const handleFileUpload = (file: File, type: 'nice' | 's1') => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('엑셀 파일만 업로드 가능합니다.');
      return;
    }

    // [로직] 여기서 SheetJS(xlsx) 등을 써서 프론트에서 파싱하거나
    // 파일을 FormData에 담아 백엔드로 보내고 미리보기를 받을 수 있음.
    // 여기서는 화면 구현을 위해 "더미 데이터 생성"으로 대체합니다.

    console.log(`📂 [파일 선택] ${type} 데이터:`, file.name);

    if (type === 'nice') {
        // 나이스파크 더미 데이터 생성
        const newMockData: NiceParkRow[] = Array.from({ length: 10 }).map((_, i) => ({
            carNumber: `${Math.floor(Math.random()*100)}가${Math.floor(Math.random()*10000)}`,
            entryDate: '2025-10-30',
            entryTime: `1${i}:30:00`
        }));
        setNiceParkData(newMockData);
        alert(`[NicePark] ${file.name} 업로드 완료 (가상)`);
    } else {
        // 에스원 더미 데이터 생성
        const newMockData: S1Row[] = Array.from({ length: 10 }).map((_, i) => ({
            workDate: `2025-07-${i+1 < 10 ? '0'+(i+1) : i+1}`,
            employeeId: '2025001',
            employeeName: '김철수'
        }));
        setS1Data(newMockData);
        alert(`[S1] ${file.name} 업로드 완료 (가상)`);
    }
  };

  // Drag & Drop 이벤트 핸들러
  const onDragOver = (e: React.DragEvent, type: 'nice' | 's1') => {
    e.preventDefault();
    if (type === 'nice') setIsDragOverNice(true);
    else setIsDragOverS1(true);
  };

  const onDragLeave = (e: React.DragEvent, type: 'nice' | 's1') => {
    e.preventDefault();
    if (type === 'nice') setIsDragOverNice(false);
    else setIsDragOverS1(false);
  };

  const onDrop = (e: React.DragEvent, type: 'nice' | 's1') => {
    e.preventDefault();
    if (type === 'nice') setIsDragOverNice(false);
    else setIsDragOverS1(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0], type);
      e.dataTransfer.clearData();
    }
  };

  // 등록(Submit) 핸들러
  const handleSubmit = () => {
    if (niceParkData.length === 0 && s1Data.length === 0) {
        alert("업로드할 데이터가 없습니다.");
        return;
    }

    // [API 연동 지점]: POST /upload/nicepark, POST /upload/s1
    // 나이스파크 데이터 전송 시 entryDate와 entryTime을 합쳐서 보낼 수도 있음
    console.log("🚀 [데이터 등록 요청]");
    console.log(" - NicePark Count:", niceParkData.length);
    console.log(" - S1 Count:", s1Data.length);

    alert("데이터가 성공적으로 등록되었습니다.");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>출입 데이터 업로드</h2>

        {/* --- 1. 연도/월 선택 영역 --- */}
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <span style={styles.label}>연도 선택</span>
            <select 
              style={styles.select} 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.label}>월 선택</span>
            <select 
              style={styles.select} 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">전체</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>

          {/* 등록된 데이터 경고 메시지 */}
          {isDataExisting && (
            <div style={styles.warningText}>
              <AlertCircle size={16} />
              *이미 등록된 데이터입니다. 등록 시 기존 등록된 데이터는 사라집니다.
            </div>
          )}
        </div>
      </div>

      {/* --- 2단 레이아웃 (나이스파크 / 에스원) --- */}
      <div style={styles.contentGrid}>
        
        {/* --- [LEFT] 나이스파크 데이터 --- */}
        <div style={styles.column}>
          <h3 style={styles.sectionTitle}>나이스파크 데이터</h3>
          
          {/* 드래그 앤 드롭 영역 */}
          <div 
            style={{
                ...styles.dropZone, 
                ...(isDragOverNice ? styles.dropZoneActive : {})
            }}
            onDragOver={(e) => onDragOver(e, 'nice')}
            onDragLeave={(e) => onDragLeave(e, 'nice')}
            onDrop={(e) => onDrop(e, 'nice')}
            onClick={() => niceFileInputRef.current?.click()}
          >
            <Upload size={18} style={{ marginRight: '8px' }} />
            나이스파크 파일 업로드
            <input 
                type="file" 
                ref={niceFileInputRef} 
                style={styles.fileInput} 
                accept=".xlsx, .xls"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 'nice')}
            />
          </div>

          {/* 데이터 카운트 표시 */}
          {niceParkData.length > 0 && (
            <div style={styles.loadedText}>{niceParkData.length}개 데이터 로드됨</div>
          )}

          {/* 미리보기 테이블 */}
          <h4 style={{ ...styles.sectionTitle, fontSize: '14px', marginTop: '10px' }}>나이스파크 출입차량 데이터</h4>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>차량 번호</th>
                  <th style={styles.th}>입차 일자</th>
                  <th style={styles.th}>입차 시간</th>
                </tr>
              </thead>
              <tbody>
                {niceParkData.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '30px' }}>
                      데이터가 없습니다. 파일을 업로드해주세요.
                    </td>
                  </tr>
                ) : (
                  niceParkData.map((row, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{row.carNumber}</td>
                      <td style={styles.td}>{row.entryDate}</td>
                      <td style={styles.td}>{row.entryTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* --- [RIGHT] 에스원 데이터 --- */}
        <div style={styles.column}>
          <h3 style={styles.sectionTitle}>에스원 데이터</h3>
          
          {/* 드래그 앤 드롭 영역 */}
          <div 
            style={{
                ...styles.dropZone, 
                ...(isDragOverS1 ? styles.dropZoneActive : {})
            }}
            onDragOver={(e) => onDragOver(e, 's1')}
            onDragLeave={(e) => onDragLeave(e, 's1')}
            onDrop={(e) => onDrop(e, 's1')}
            onClick={() => s1FileInputRef.current?.click()}
          >
            <Upload size={18} style={{ marginRight: '8px' }} />
            에스원 파일 업로드
            <input 
                type="file" 
                ref={s1FileInputRef} 
                style={styles.fileInput} 
                accept=".xlsx, .xls"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 's1')}
            />
          </div>

          {/* 데이터 카운트 표시 */}
          {s1Data.length > 0 && (
            <div style={styles.loadedText}>{s1Data.length}개 데이터 로드됨</div>
          )}

          {/* 미리보기 테이블 */}
          <h4 style={{ ...styles.sectionTitle, fontSize: '14px', marginTop: '10px' }}>에스원 출입차량 데이터</h4>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>근무일자</th>
                  <th style={styles.th}>사원번호</th>
                  <th style={styles.th}>사원명</th>
                </tr>
              </thead>
              <tbody>
                {s1Data.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ ...styles.td, textAlign: 'center', color: '#999', padding: '30px' }}>
                      데이터가 없습니다. 파일을 업로드해주세요.
                    </td>
                  </tr>
                ) : (
                  s1Data.map((row, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{row.workDate}</td>
                      <td style={styles.td}>{row.employeeId}</td>
                      <td style={styles.td}>{row.employeeName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* --- 3. 하단 등록 버튼 --- */}
      <div style={styles.footer}>
        <button 
            style={styles.submitBtn} 
            onClick={handleSubmit}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
            <Save size={18} />
            등록 (6)
        </button>
      </div>

    </div>
  );
};

export default DataUploadPage;