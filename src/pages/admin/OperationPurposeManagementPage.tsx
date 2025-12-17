import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type PurposeData, PURPOSE_COLUMNS } from '../../types/data';

const PurposeManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<PurposeData>
      title="운행 목적 기준정보 관리"
      columns={PURPOSE_COLUMNS}
      // initialData={MOCK_PURPOSE_DATA}
      apiEndpoint="/api/admin/purposes"
      disableDelete={true}
    />
  );
};

export default PurposeManagementPage;