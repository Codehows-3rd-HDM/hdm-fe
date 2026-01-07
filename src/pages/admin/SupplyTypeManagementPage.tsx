import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type ProcessData, PROCESS_COLUMNS } from '../../types/data';

const SupplyTypeManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProcessData>
      title="공급 유형 기준정보 관리"
      columns={PROCESS_COLUMNS}
      // initialData={MOCK_PROCESS_DATA}
      apiEndpoint="/admin/supply-type"
      disableDelete={false}
      breadcrumbItems={getBreadcrumbItems('/admin/supply-type/manage')}
    />
  );
};

export default SupplyTypeManagementPage;