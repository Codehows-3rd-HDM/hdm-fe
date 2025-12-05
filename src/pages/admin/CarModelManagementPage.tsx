import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type CarModelData, CAR_MODEL_COLUMNS } from '../../types/data';

const CarModelManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<CarModelData>
      title="차종 및 연비 기준정보 관리"
      columns={CAR_MODEL_COLUMNS}
      // initialData={MOCK_CAR_MODEL_DATA}
      apiEndpoint="/api/admin/car-models"
    />
  );
};

export default CarModelManagementPage;