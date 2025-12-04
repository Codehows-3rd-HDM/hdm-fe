import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type ProductData, PRODUCT_COLUMNS } from '../../types/data';

const ProductManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProductData>
      title="생산 품목 구분 기준정보 관리"
      columns={PRODUCT_COLUMNS}
      // initialData={MOCK_PRODUCT_DATA}
      apiEndpoint="/api/admin/product-class"
    />
  );
};

export default ProductManagementPage;