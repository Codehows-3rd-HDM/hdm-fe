import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type ProcessData, PROCESS_COLUMNS } from '../../types/data';

const ProcessManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProcessData>
      title="생산 공정 기준정보 관리"
      columns={PROCESS_COLUMNS}
      // initialData={MOCK_PROCESS_DATA}
      apiEndpoint="/api/admin/processes"
    />
  );
};

export default ProcessManagementPage;