import React from 'react';
import CarbonAnalysisTemplate from '../../components/analysis/CarbonAnalysisTemplate';
import type { AnalysisColumn, AnalysisData } from '../../types/analysis';

const COLUMNS: AnalysisColumn[] = [
  { id: 'name', header: '업체명', align: 'left' },
  { id: 'totalEmission', header: '탄소배출량 (tCO2eq)', format: 'number', sortable: true },
  { id: 'ratio', header: '비율 (%)', format: 'percent', sortable: true },
  { id: 'distance', header: '운행거리 (km)', format: 'number', sortable: true },
  { id: 'carCount', header: '차량등록수', format: 'number', sortable: true },
  { id: 'address', header: '주소', align: 'left' },
];

const CompanyEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="납품 업체별 탄소 배출량"
      hasScopeTabs={false}
      columns={COLUMNS}
      dataType='company'
    />
  );
};

export default CompanyEmissionPage;