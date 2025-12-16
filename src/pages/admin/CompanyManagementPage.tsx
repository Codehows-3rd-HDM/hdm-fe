import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type CompanyData, COMPANY_COLUMNS } from '../../types/data';

const CompanyManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<CompanyData>
      title="협력사 및 주소지 기준정보 관리"
      columns={COMPANY_COLUMNS}
      apiEndpoint="/admin/companies"
    />
  );
};

export default CompanyManagementPage;