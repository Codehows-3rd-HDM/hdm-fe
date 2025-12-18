import React from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';

const MANAGEMENT_ITEMS = [
  { title: '출입 차량 기준정보', endpoint: '/vehicles' },
  // { title: '협력사 기준정보', endpoint: '/companies' },
  // { title: '차종/연비 기준정보', endpoint: '/carmodels' },
  // { title: '공급 유형 기준정보', endpoint: '/processes' },
  // { title: '운행 목적 기준정보', endpoint: '/purposes' },
  // { title: '공급 고객 기준정보', endpoint: '/products' },
];

const ExcelManagementPage: React.FC = () => {
  
  const handleUpload = (title: string) => {
    alert(`[${title}] 엑셀 업로드 모달을 엽니다.`);
    // TODO: ExcelUploadModal 연결
  };

  const handleDownload = (title: string) => {
    alert(`[${title}] 전체 데이터를 엑셀로 다운로드합니다.`);
    // TODO: API 호출 및 다운로드 로직
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">기준정보 엑셀 관리</h2>
        <p className="text-gray-500">각 기준정보 데이터를 엑셀 파일로 일괄 등록하거나 다운로드할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MANAGEMENT_ITEMS.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => handleUpload(item.title)}
                className="flex-1 flex items-center justify-center py-2.5 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                <Upload size={16} className="mr-2" /> 업로드
              </button>
              <button 
                onClick={() => handleDownload(item.title)}
                className="flex-1 flex items-center justify-center py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                <Download size={16} className="mr-2" /> 다운로드
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExcelManagementPage;