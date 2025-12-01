import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type CarModelData, CAR_MODEL_COLUMNS } from '../../types/data';

const MOCK_CAR_MODEL_DATA: CarModelData[] = [
  { id: 1, categoryLarge: '승용차', categorySmall: '중형', fuelType: '가솔린', fuelEfficiency: '12.3' },
  { id: 2, categoryLarge: '승용차', categorySmall: '소형', fuelType: '디젤', fuelEfficiency: '16.5' },
  { id: 3, categoryLarge: '상용트럭', categorySmall: '대형', fuelType: '디젤', fuelEfficiency: '4.5' },
  { id: 4, categoryLarge: '승용차', categorySmall: '경차', fuelType: 'LPG', fuelEfficiency: '10.2' },
  // 더미 데이터
  ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 5,
      categoryLarge: '승용차',
      categorySmall: '대형',
      fuelType: '전기',
      fuelEfficiency: '5.2' // km/kWh 등 단위 통일 필요할 수 있음
  }))
];

const CarModelManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<CarModelData>
      title="차종 및 연비 기준정보 관리"
      columns={CAR_MODEL_COLUMNS}
      initialData={MOCK_CAR_MODEL_DATA}
      apiEndpoint="/api/management/car-models"
    />
  );
};

export default CarModelManagementPage;