import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import Breadcrumb from '../../components/Breadcrumb';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type ProcessData, PROCESS_COLUMNS } from '../../types/data';

const SupplyTypeManagementPage: React.FC = () => {
  return (
    <>
      <div style={{ padding: 'var(--padding-container)', marginBottom: 'var(--spacing-lg)' }}>
        <Breadcrumb items={getBreadcrumbItems('/admin/supply-type/manage')} />
      </div>
      <StandardDataManagementTable<ProcessData>
        title="공급 유형 기준정보 관리"
        columns={PROCESS_COLUMNS}
        // initialData={MOCK_PROCESS_DATA}
        apiEndpoint="/admin/supply-type"
        disableDelete={false}
      />
    </>
  );
};

export default SupplyTypeManagementPage;