import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type VehicleData, VEHICLE_COLUMNS } from '../../types/data';

const VehicleManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<VehicleData>
      title="출입 차량 기준정보 관리"
      columns={VEHICLE_COLUMNS}
      // initialData={MOCK_VEHICLE_DATA}
      apiEndpoint="/api/admin/vehicles"
    />
  );
};

export default VehicleManagementPage;