import React from 'react';
import CarbonAnalysisTemplate from '../../components/analysis/CarbonAnalysisTemplate';
import type { AnalysisColumn, AnalysisData } from '../../types/analysis';

const COLUMNS: AnalysisColumn[] = [
  { id: 'name', header: '생산 공정', align: 'left' },
  { id: 'totalEmission', header: '탄소배출량 (tCO2eq)', format: 'number', sortable: true },
  { id: 'ratio', header: '비율 (%)', format: 'percent', sortable: true },
  { id: 'distance', header: '운행거리 (km)', format: 'number', sortable: true },
  { id: 'count', header: '운행 횟수', format: 'number', sortable: true },
  { id: 'avgEmission', header: '평균 탄소배출량', format: 'number', sortable: true },
];

const MOCK_DATA: AnalysisData[] = [
    { id: 1, name: '프레스', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(416) },
    { id: 2, name: '도장', totalEmission: 8000, ratio: 32, distance: 2000, count: 80, avgEmission: 100, monthlyTrend: Array(12).fill(666) },
    { id: 3, name: '조립', totalEmission: 7000, ratio: 28, distance: 1500, count: 70, avgEmission: 100, monthlyTrend: Array(12).fill(583) },
    { id: 4, name: '검수', totalEmission: 5000, ratio: 20, distance: 1000, count: 50, avgEmission: 100, monthlyTrend: Array(12).fill(416) },
];

const ProcessEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="생산 공정별 탄소 배출량"
      hasScopeTabs={false}
      columns={COLUMNS}
      initialData={MOCK_DATA}
    />
  );
};

export default ProcessEmissionPage;