import React from 'react';
import CarbonAnalysisTemplate from '../../components/analysis/CarbonAnalysisTemplate';
import type { AnalysisColumn, AnalysisData } from '../../types/analysis';

const COLUMNS: AnalysisColumn[] = [
  { id: 'name', header: '운행 목적', align: 'left' },
  { id: 'totalEmission', header: '탄소배출량 (tCO2eq)', format: 'number', sortable: true },
  { id: 'ratio', header: '비율 (%)', format: 'percent', sortable: true },
  { id: 'distance', header: '운행거리 (km)', format: 'number', sortable: true },
  { id: 'count', header: '운행 횟수', format: 'number', sortable: true },
  { id: 'avgEmission', header: '평균 탄소배출량 (tCO2eq)', format: 'number', sortable: true },
];

const MOCK_DATA: AnalysisData[] = [
  { id: 1, name: '출퇴근', totalEmission: 20000, ratio: 50, distance: 15000, count: 125, avgEmission: 160, monthlyTrend: [1500, 1600, 1550, 1700, 1800, 1750, 1600, 1500, 1650, 1700, 1800, 1850] },
  { id: 2, name: '납품', totalEmission: 10000, ratio: 25, distance: 20000, count: 150, avgEmission: 66, monthlyTrend: [800, 850, 900, 800, 750, 800, 850, 900, 950, 900, 850, 800] },
  { id: 3, name: '기타', totalEmission: 10000, ratio: 25, distance: 5000, count: 50, avgEmission: 200, monthlyTrend: [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500] },
  { id: 4, name: '자재운송', totalEmission: 5000, ratio: 12.5, distance: 3000, count: 30, avgEmission: 166, monthlyTrend: [400, 420, 410, 430, 400, 420, 410, 430, 400, 420, 410, 430] },
];

const OperationPurposeEmissionPage: React.FC = () => {
  return (
    <CarbonAnalysisTemplate
      title="운행 목적별 탄소 배출량"
      hasScopeTabs={true}
      columns={COLUMNS}
      initialData={MOCK_DATA}
    />
  );
};

export default OperationPurposeEmissionPage;