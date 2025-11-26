import React from 'react';
import CarbonAnalysisTemplate from '../../components/analysis/CarbonAnalysisTemplate';
import type { AnalysisColumn, AnalysisData } from '../../types/analysis';

const COLUMNS: AnalysisColumn[] = [
  { id: 'name', header: '생산 품목 구분', align: 'left' },
  { id: 'totalEmission', header: '탄소배출량 (tCO2eq)', format: 'number', sortable: true },
  { id: 'ratio', header: '비율 (%)', format: 'percent', sortable: true },
  { id: 'distance', header: '운행거리 (km)', format: 'number', sortable: true },
  { id: 'count', header: '운행 횟수', format: 'number', sortable: true },
  { id: 'avgEmission', header: '평균 탄소배출량', format: 'number', sortable: true },
];

const MOCK_DATA: AnalysisData[] = [
    { id: 1, name: '1000', totalEmission: 4000, ratio: 20, distance: 1000, count: 40, avgEmission: 100, monthlyTrend: Array(12).fill(333) },
    { id: 2, name: '2000', totalEmission: 6000, ratio: 30, distance: 1500, count: 60, avgEmission: 100, monthlyTrend: Array(12).fill(500) },
    { id: 3, name: '3000', totalEmission: 8000, ratio: 40, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
    { id: 4, name: 'clark', totalEmission: 2000, ratio: 10, distance: 500, count: 20, avgEmission: 100, monthlyTrend: Array(12).fill(166) },
];

const ProductEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="생산 품목 구분별 탄소 배출량"
      hasScopeTabs={false}
      columns={COLUMNS}
      initialData={MOCK_DATA}
    />
  );
};

export default ProductEmissionPage;