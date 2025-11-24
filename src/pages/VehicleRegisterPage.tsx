import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import ExcelUploadModal from '../components/common/ExcelUploadModal';

const VehicleRegisterPage: React.FC = () => {
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 이 페이지에서 사용할 엑셀 컬럼 정의
  const vehicleColumns: ColumnDef[] = [
    { header: '차량번호', key: 'carNumber' },
    { header: '차종', key: 'carModel' },
    { header: '연료타입', key: 'fuelType' },
    { header: '등록일자', key: 'regDate' },
    { header: '소속업체', key: 'companyName' },
  ];

  // 모달에서 '등록하기' 눌렀을 때 실행될 함수
  const handleUploadComplete = (data: any[]) => {
    console.log('📌 [부모 페이지] 엑셀 데이터 수신:', data);
    // 여기서 백엔드 API (POST /vehicle/batch) 호출 로직 수행
    alert(`${data.length}건의 차량 정보가 등록되었습니다.`);
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>출입차량 기본정보 등록</h2>
      
      <p style={{ marginBottom: '20px', color: '#666' }}>
        차량 정보를 개별 등록하거나, 엑셀 파일을 통해 일괄 등록할 수 있습니다.
      </p>

      {/* 엑셀 업로드 버튼 (모달 트리거) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: '#28a745', // 엑셀 색상 느낌
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '15px'
        }}
      >
        <Upload size={18} />
        엑셀 일괄 업로드
      </button>

      {/* 공통 모달 컴포넌트 사용 */}
      <ExcelUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="차량 정보 엑셀 업로드"
        columns={vehicleColumns} // 위에서 정의한 컬럼 전달
        onUpload={handleUploadComplete}
      />
      
      {/* ... 나머지 페이지 컨텐츠 (리스트 등) ... */}
    </div>
  );
};

export default VehicleRegisterPage;