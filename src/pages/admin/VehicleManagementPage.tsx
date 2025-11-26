import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type VehicleData, VEHICLE_COLUMNS } from '../../types/data';

// 등록 페이지의 IntegratedFormData 필드와 100% 일치하는 Mock Data
const MOCK_VEHICLE_DATA: VehicleData[] = [
  { 
    id: 1, 
    carNumber: '123가4567', 
    purpose: '출퇴근', 
    scope: 'Scope1',
    vendorName: '현대정밀', 
    employeeId: '30', 
    distance: '4.7', 
    categoryLarge: '승용차',
    categorySmall: '중형',
    carModel: '쏘나타',
    fuelType: '가솔린',
    note: '기본 등록 데이터' 
  },
  { 
    id: 2, 
    carNumber: '58너1234', 
    purpose: '납품', 
    scope: 'Scope3',
    vendorName: 'Volvo KOREA', 
    employeeId: '102', 
    distance: '15.2', 
    categoryLarge: '상용트럭',
    categorySmall: '대형',
    carModel: '볼보트럭',
    fuelType: '디젤',
    note: '장거리 운행' 
  },
  // ... 추가 더미 데이터 생성
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 3,
    carNumber: `${100 + i}허${9000 + i}`,
    purpose: i % 2 === 0 ? '업무' : '방문',
    scope: 'Scope3',
    vendorName: i % 3 === 0 ? '삼성전자' : 'LG화학',
    employeeId: String(200 + i),
    distance: String(Math.floor(Math.random() * 50) + 5),
    categoryLarge: '승용차',
    categorySmall: '소형',
    carModel: '아반떼',
    fuelType: '가솔린',
    note: '-'
  }))
];

const VehicleManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<VehicleData>
      title="출입 차량 기준정보 관리"
      columns={VEHICLE_COLUMNS}
      initialData={MOCK_VEHICLE_DATA}
      apiEndpoint="/api/management/vehicles"
    />
  );
};

export default VehicleManagementPage;