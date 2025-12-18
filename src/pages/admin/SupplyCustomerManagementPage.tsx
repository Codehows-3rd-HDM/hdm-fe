import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type ProductData, PRODUCT_COLUMNS } from '../../types/data';

const SupplyCustomerManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProductData>
      title="공급 고객 기준정보 관리"
      columns={PRODUCT_COLUMNS}
      // initialData={MOCK_PRODUCT_DATA}
      apiEndpoint="/admin/supply-customer"
      disableDelete={false}
    />
  );
};

export default SupplyCustomerManagementPage;