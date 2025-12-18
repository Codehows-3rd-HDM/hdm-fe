import React, { useState, useEffect } from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type CompanyData, COMPANY_COLUMNS } from '../../types/data';
import { fetchRegistrationOptions, type OptionsData } from '../../apis/registerApi';

const CompanyManagementPage: React.FC = () => {
  const [options, setOptions] = useState<{
    supplyTypes: { id: number; name: string }[];
    supplyCustomers: { id: number; name: string }[];
  }>({
    supplyTypes: [],
    supplyCustomers: []
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        console.log('[CompanyManagementPage] 옵션 데이터 로딩 시작');
        const fetchedOptions: OptionsData = await fetchRegistrationOptions();
        console.log('[CompanyManagementPage] 로드된 옵션 데이터:', fetchedOptions);
        console.log('[CompanyManagementPage] SUPPLY_TYPE_OPTIONS:', fetchedOptions.SUPPLY_TYPE_OPTIONS);
        console.log('[CompanyManagementPage] SUPPLY_CUSTOMER_OPTIONS:', fetchedOptions.SUPPLY_CUSTOMER_OPTIONS);
        
        setOptions({
          supplyTypes: fetchedOptions.SUPPLY_TYPE_OPTIONS || [],
          supplyCustomers: fetchedOptions.SUPPLY_CUSTOMER_OPTIONS || []
        });
        
        console.log('[CompanyManagementPage] 설정된 옵션 상태:', {
          supplyTypes: fetchedOptions.SUPPLY_TYPE_OPTIONS || [],
          supplyCustomers: fetchedOptions.SUPPLY_CUSTOMER_OPTIONS || []
        });
      } catch (error) {
        console.error('[CompanyManagementPage] 옵션 데이터 로딩 실패:', error);
      }
    };
    loadOptions();
  }, []);

  return (
    <StandardDataManagementTable<CompanyData>
      title="협력사 및 주소지 기준정보 관리"
      columns={COMPANY_COLUMNS}
      apiEndpoint="/admin/companies"
      options={options}
    />
  );
};

export default CompanyManagementPage;