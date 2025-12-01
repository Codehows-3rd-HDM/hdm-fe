import React from 'react';
import CarbonAnalysisTemplate from '../../components/analysis/CarbonAnalysisTemplate';
import type { AnalysisColumn, AnalysisData } from '../../types/analysis';

const COLUMNS: AnalysisColumn[] = [
  { id: 'name', header: '연료', align: 'left' },
  { id: 'totalEmission', header: '탄소배출량 (tCO2eq)', format: 'number', sortable: true },
  { id: 'ratio', header: '비율 (%)', format: 'percent', sortable: true },
];

const MOCK_DATA: AnalysisData[] = [
  { id: 1, name: '휘발유', totalEmission: 15000, ratio: 40, monthlyTrend: Array(12).fill(1250) },
  { id: 2, name: '경유', totalEmission: 18000, ratio: 50, monthlyTrend: Array(12).fill(1500) },
  { id: 3, name: 'LPG', totalEmission: 3000, ratio: 8, monthlyTrend: Array(12).fill(250) },
  { id: 4, name: '전기', totalEmission: 750, ratio: 2, monthlyTrend: Array(12).fill(62.5) },
];

const FuelEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="연료별 탄소 배출량"
      hasScopeTabs={true}
      columns={COLUMNS}
      initialData={MOCK_DATA}
    />
  );
};

export default FuelEmissionPage;