import React, { useState, useEffect } from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type CompanyData, COMPANY_COLUMNS } from '../../types/data';
import { fetchRegistrationOptions, type OptionsData } from '../../apis/registerApi';

type CompanyOptions = {
  supplyTypes: { id: number; name: string }[];
  supplyCustomers: { id: number; name: string }[];
};

// StrictMode의 이중 마운트로 인한 중복 호출 방지용 모듈 캐시
let companyOptionsCache: CompanyOptions | null = null;
let companyOptionsPromise: Promise<CompanyOptions> | null = null;

const loadCompanyOptions = async (): Promise<CompanyOptions> => {
  if (companyOptionsCache) return companyOptionsCache;
  if (!companyOptionsPromise) {
    companyOptionsPromise = fetchRegistrationOptions()
      .then((fetchedOptions: OptionsData) => {
        const prepared: CompanyOptions = {
          supplyTypes: fetchedOptions.SUPPLY_TYPE_OPTIONS || [],
          supplyCustomers: fetchedOptions.SUPPLY_CUSTOMER_OPTIONS || []
        };
        companyOptionsCache = prepared;
        return prepared;
      })
      .finally(() => {
        companyOptionsPromise = null;
      });
  }

  return companyOptionsPromise;
};

const CompanyManagementPage: React.FC = () => {
  const [options, setOptions] = useState<CompanyOptions>({
    supplyTypes: [],
    supplyCustomers: []
  });

  useEffect(() => {
    let mounted = true;
    loadCompanyOptions()
      .then(data => {
        if (mounted) setOptions(data);
      })
      .catch(error => {
        console.error('[CompanyManagementPage] 옵션 데이터 로딩 실패:', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StandardDataManagementTable<CompanyData>
      title="협력사 및 주소지 기준정보 관리"
      columns={COMPANY_COLUMNS}
      apiEndpoint="/admin/company"
      options={options}
      breadcrumbItems={getBreadcrumbItems('/admin/company/manage')}
    />
  );
};

export default CompanyManagementPage;