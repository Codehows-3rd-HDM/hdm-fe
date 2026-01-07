import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type CarModelData, CAR_MODEL_COLUMNS } from '../../types/data';

const CarModelManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<CarModelData>
      title="차종 및 연비 기준정보 관리"
      columns={CAR_MODEL_COLUMNS}
      apiEndpoint="/admin/car-model"
      disableDelete={true}
      breadcrumbItems={getBreadcrumbItems('/admin/car-category/manage')}
    />
  );
};

export default CarModelManagementPage;