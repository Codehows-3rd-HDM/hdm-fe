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

const ProductEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="생산품목 구분별 탄소 배출량"
      hasScopeTabs={false}
      columns={COLUMNS}
      dataType='product'
    />
  );
};

export default ProductEmissionPage;