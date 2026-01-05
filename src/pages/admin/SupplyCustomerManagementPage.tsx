import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import Breadcrumb from '../../components/Breadcrumb';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type ProductData, PRODUCT_COLUMNS } from '../../types/data';

const SupplyCustomerManagementPage: React.FC = () => {
  return (
    <>
      <div style={{ padding: 'var(--padding-container)', marginBottom: 'var(--spacing-lg)' }}>
        <Breadcrumb items={getBreadcrumbItems('/admin/supply-customer/manage')} />
      </div>
      <StandardDataManagementTable<ProductData>
        title="공급 고객 기준정보 관리"
        columns={PRODUCT_COLUMNS}
        // initialData={MOCK_PRODUCT_DATA}
        apiEndpoint="/admin/supply-customer"
        disableDelete={false}
      />
    </>
  );
};

export default SupplyCustomerManagementPage;