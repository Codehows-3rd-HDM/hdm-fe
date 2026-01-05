import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import Breadcrumb from '../../components/Breadcrumb';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type CarModelData, CAR_MODEL_COLUMNS } from '../../types/data';

const CarModelManagementPage: React.FC = () => {
  return (
    <>
      <div style={{ padding: 'var(--padding-container)', marginBottom: 'var(--spacing-lg)' }}>
        <Breadcrumb items={getBreadcrumbItems('/admin/car-category/manage')} />
      </div>
      <StandardDataManagementTable<CarModelData>
        title="차종 및 연비 기준정보 관리"
        columns={CAR_MODEL_COLUMNS}
        apiEndpoint="/admin/car-model"
        disableDelete={true}
      />
    </>
  );
};

export default CarModelManagementPage;