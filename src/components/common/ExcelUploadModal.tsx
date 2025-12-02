import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Save, FileSpreadsheet, AlertCircle } from 'lucide-react';

// --- 타입 정의 ---
export interface ColumnDef {
  header: string; // 테이블 헤더에 보일 이름 (예: '차량 번호')
  key: string;    // 데이터 객체의 키 (예: 'carNumber')
}

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: ColumnDef[]; // 페이지마다 다른 컬럼 정의를 받음
  onUpload: (data: any[]) => void; // 최종 데이터 부모에게 전달
}

// --- 스타일 정의 ---
const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검은 배경
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '800px', // 넉넉한 너비
    maxWidth: '95%',
    maxHeight: '90vh', // 화면 꽉 차지 않게
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  header: {
    padding: '20px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  body: {
    padding: '20px',
    overflowY: 'auto' as const,
    flex: 1,
  },
  // 드래그 앤 드롭 영역 (이전 페이지 스타일 재사용)
  dropZone: {
    border: '2px dashed #ddd',
    borderRadius: '8px',
    height: '100px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s',
    marginBottom: '20px',
    color: '#666',
  },
  dropZoneActive: {
    borderColor: '#007bff',
    backgroundColor: '#eef6ff',
    color: '#007bff',
  },
  // 테이블 스타일
  tableContainer: {
    border: '1px solid #eee',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px',
  },
  th: {
    backgroundColor: '#f4f4f4',
    padding: '12px',
    textAlign: 'left' as const,
    borderBottom: '1px solid #ddd',
    color: '#555',
    fontWeight: 'bold',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    color: '#333',
  },
  footer: {
    padding: '20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    backgroundColor: '#fff',
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#666',
  },
  saveBtn: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  columns, 
  onUpload 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 닫힐 때 데이터 초기화
  useEffect(() => {
    if (!isOpen) {
      setPreviewData([]);
      setFileName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 파일 처리 및 Mock Data 생성
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('엑셀 파일만 업로드 가능합니다.');
      return;
    }
    setFileName(file.name);

    // [로직] 여기서 실제 파일 파싱을 해야함, UI 구현을 위해
    // columns Props를 기반으로 더미 데이터를 생성합니다.
    // const mockRows = Array.from({ length: 5 }).map((_, i) => {
    //   const row: any = {};
    //   // columns.forEach((col) => {
    //   //   // 예: header가 '차량번호'면 값은 '차량번호_Data_1' 식
    //   //   if (col.key.includes('date')) row[col.key] = `2025-07-0${i + 1}`;
    //   //   else row[col.key] = `${col.header}_데이터_${i + 1}`;
    //   // });
    //   return row;
    // });

    // setPreviewData(mockRows);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    if (previewData.length === 0) {
      alert('업로드된 데이터가 없습니다.');
      return;
    }
    onUpload(previewData);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            <FileSpreadsheet size={24} color="#28a745" />
            {title}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} color="#999" />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Dropzone */}
          <div
            style={{ ...styles.dropZone, ...(isDragOver ? styles.dropZoneActive : {}) }}
            onDragOver={onDragOver}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={30} style={{ marginBottom: '10px', color: isDragOver ? '#007bff' : '#ccc' }} />
            <span style={{ fontWeight: 'bold' }}>클릭하여 엑셀 파일 업로드</span>
            <span style={{ fontSize: '12px', marginTop: '5px' }}>또는 파일을 여기로 드래그하세요</span>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".xlsx, .xls"
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </div>

          {/* Preview Area */}
          {previewData.length > 0 ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#007bff' }}>
                  📄 {fileName} (미리보기 5건)
                </span>
                <span style={{ fontSize: '12px', color: '#666' }}>총 {previewData.length}개 데이터 감지됨</span>
              </div>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key} style={styles.th}>{col.header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx}>
                        {columns.map((col) => (
                          <td key={col.key} style={styles.td}>{row[col.key]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
               <AlertCircle size={40} style={{ marginBottom: '10px', opacity: 0.3 }} />
               <p>엑셀 파일을 업로드하면<br/>데이터 미리보기가 여기에 표시됩니다.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>취소</button>
          <button 
            style={{ 
              ...styles.saveBtn, 
              opacity: previewData.length === 0 ? 0.5 : 1, 
              cursor: previewData.length === 0 ? 'not-allowed' : 'pointer' 
            }}
            onClick={handleSave}
            disabled={previewData.length === 0}
          >
            <Save size={16} />
            데이터 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal;