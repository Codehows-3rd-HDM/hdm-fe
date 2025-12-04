import React from 'react';
import CarbonAnalysisTemplate from '../../components/analysis/CarbonAnalysisTemplate';
import type { AnalysisColumn, AnalysisData } from '../../types/analysis';

const COLUMNS: AnalysisColumn[] = [
  { id: 'name', header: '연료', align: 'left' },
  { id: 'totalEmission', header: '탄소배출량 (tCO2eq)', format: 'number', sortable: true },
  { id: 'ratio', header: '비율 (%)', format: 'percent', sortable: true },
];

const FuelEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="연료별 탄소 배출량"
      hasScopeTabs={true}
      columns={COLUMNS}
      dataType='fuel'
    />
  );
};

export default FuelEmissionPage;