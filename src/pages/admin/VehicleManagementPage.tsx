import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type VehicleData, VEHICLE_COLUMNS } from '../../types/data';

const VehicleManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<VehicleData>
      title="출입 차량 기준정보 관리"
      columns={VEHICLE_COLUMNS}
      apiEndpoint="/api/admin/vehicles"
      disableDelete={true}
    />
  );
};

export default VehicleManagementPage;