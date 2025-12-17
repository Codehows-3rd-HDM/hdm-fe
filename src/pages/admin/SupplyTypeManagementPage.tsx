import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type ProcessData, PROCESS_COLUMNS } from '../../types/data';

const SupplyTypeManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProcessData>
      title="공급 유형 기준정보 관리"
      columns={PROCESS_COLUMNS}
      // initialData={MOCK_PROCESS_DATA}
      apiEndpoint="/api/admin/supply-type"
      disableDelete={true}
    />
  );
};

export default SupplyTypeManagementPage;