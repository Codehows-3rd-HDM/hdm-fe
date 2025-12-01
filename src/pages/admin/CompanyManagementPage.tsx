import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type CompanyData, COMPANY_COLUMNS } from '../../types/data';

const MOCK_COMPANY_DATA: CompanyData[] = [
  { 
    id: 1, 
    vendorName: '현대정밀', 
    processName: '조립', 
    distance: '12.5', 
    productClass: '1000', 
    address: '경상남도 창원시', 
    note: '' 
  },
  { 
    id: 2, 
    vendorName: 'Volvo KOREA', 
    processName: '도장', 
    distance: '45.0', 
    productClass: 'clark', 
    address: '경상남도 창원시 성산구', 
    note: '메인 협력사' 
  },
  // 더미 데이터
  ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 3,
    vendorName: `협력업체_${i + 1}`,
    processName: i % 2 === 0 ? '프레스' : '차체',
    distance: String(Math.floor(Math.random() * 100)),
    productClass: i % 3 === 0 ? '2000' : '3000',
    address: `경기도 평택시 포승읍 ${i + 1}번길`,
    note: '-'
  }))
];

const CompanyManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<CompanyData>
      title="업체명 및 주소지 기준정보 관리"
      columns={COMPANY_COLUMNS}
      initialData={MOCK_COMPANY_DATA}
      apiEndpoint="/api/management/companies"
    />
  );
};

export default CompanyManagementPage;