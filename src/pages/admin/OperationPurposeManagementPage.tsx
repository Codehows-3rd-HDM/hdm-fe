import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import Breadcrumb from '../../components/Breadcrumb';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type PurposeData, PURPOSE_COLUMNS } from '../../types/data';

const PurposeManagementPage: React.FC = () => {
  return (
    <>
      <div style={{ padding: 'var(--padding-container)', marginBottom: 'var(--spacing-lg)' }}>
        <Breadcrumb items={getBreadcrumbItems('/admin/purpose/manage')} />
      </div>
      <StandardDataManagementTable<PurposeData>
        title="운행 목적 기준정보 관리"
        columns={PURPOSE_COLUMNS}
        // initialData={MOCK_PURPOSE_DATA}
        apiEndpoint="/admin/operation-purpose"
        disableDelete={false}
      />
    </>
  );
};

export default PurposeManagementPage;