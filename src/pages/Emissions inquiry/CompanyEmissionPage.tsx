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

const MOCK_DATA: AnalysisData[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `협력업체 ${String.fromCharCode(65 + i)}`,
    totalEmission: Math.floor(Math.random() * 10000) + 1000,
    ratio: 10,
    distance: Math.floor(Math.random() * 5000) + 500,
    carCount: Math.floor(Math.random() * 20) + 1,
    address: `경기도 성남시 분당구 판교로 ${i + 1}번길`,
    monthlyTrend: Array.from({ length: 12 }, () => Math.floor(Math.random() * 1000))
}));

const CompanyEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="납품 업체별 탄소 배출량"
      hasScopeTabs={false}
      columns={COLUMNS}
      initialData={MOCK_DATA}
    />
  );
};

export default CompanyEmissionPage;