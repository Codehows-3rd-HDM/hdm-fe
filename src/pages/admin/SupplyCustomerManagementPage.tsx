import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type ProductData, PRODUCT_COLUMNS } from '../../types/data';

const SupplyCustomerManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProductData>
      title="공급 고객 기준정보 관리"
      columns={PRODUCT_COLUMNS}
      // initialData={MOCK_PRODUCT_DATA}
      apiEndpoint="/admin/supply-customer"
      disableDelete={false}
      breadcrumbItems={getBreadcrumbItems('/admin/supply-customer/manage')}
    />
  );
};

export default SupplyCustomerManagementPage;