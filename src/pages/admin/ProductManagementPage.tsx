import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type ProductData, PRODUCT_COLUMNS } from '../../types/data';

const MOCK_PRODUCT_DATA: ProductData[] = [
  { id: 1, productClass: '1000', note: '기본 부품류' },
  { id: 2, productClass: '2000', note: '전자 장비' },
  { id: 3, productClass: '3000', note: '내장재' },
  { id: 4, productClass: 'clark', note: '지게차 부품' },
  { id: 5, productClass: '기타', note: '소모품 등' },
];

const ProductManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProductData>
      title="생산 품목 구분 기준정보 관리"
      columns={PRODUCT_COLUMNS}
      initialData={MOCK_PRODUCT_DATA}
      apiEndpoint="/api/management/products"
    />
  );
};

export default ProductManagementPage;