import React, { useState, useEffect } from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type VehicleData, VEHICLE_COLUMNS } from '../../types/data';
import { fetchRegistrationOptions, type OptionsData } from '../../apis/registerApi';

const VehicleManagementPage: React.FC = () => {
  const [options, setOptions] = useState<{
    operationPurposes: { id: number; name: string }[];
    companies: { id: number; name: string; oneWayDistance?: number }[];
    carCategories: { id: number; name: string }[];
    carCategoryMap: Record<string, { id: number; name: string }[]>;
    fuelTypes: { id: number; name: string }[];
  }>({
    operationPurposes: [],
    companies: [],
    carCategories: [],
    carCategoryMap: {},
    fuelTypes: []
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        console.log('[VehicleManagementPage] 옵션 데이터 로딩 시작');
        const fetchedOptions: OptionsData = await fetchRegistrationOptions();
        console.log('[VehicleManagementPage] 로드된 옵션 데이터:', fetchedOptions);
        // options는 추후 사용을 위해 보관
        console.log('[VehicleManagementPage] options 보관 완료');
        void options; // 사용되지 않는 변수 경고 회피
        console.log('[VehicleManagementPage] PURPOSE_OPTIONS:', fetchedOptions.PURPOSE_OPTIONS);
        console.log('[VehicleManagementPage] COMPANY_OPTIONS:', fetchedOptions.COMPANY_OPTIONS);
        console.log('[VehicleManagementPage] CAT_LARGE_OPTIONS:', fetchedOptions.CAT_LARGE_OPTIONS);
        console.log('[VehicleManagementPage] FUEL_OPTIONS:', fetchedOptions.FUEL_OPTIONS);
        
        setOptions({
          operationPurposes: fetchedOptions.PURPOSE_OPTIONS || [],
          companies: fetchedOptions.COMPANY_LIST || fetchedOptions.COMPANY_OPTIONS || [],
          carCategories: fetchedOptions.CAT_LARGE_OPTIONS || [],
          carCategoryMap: fetchedOptions.CAR_CATEGORY_MAP || {},
          fuelTypes: fetchedOptions.FUEL_OPTIONS || []
        });
        
        console.log('[VehicleManagementPage] 설정된 옵션 상태:', {
          operationPurposes: fetchedOptions.PURPOSE_OPTIONS || [],
          companies: fetchedOptions.COMPANY_LIST || fetchedOptions.COMPANY_OPTIONS || [],
          carCategories: fetchedOptions.CAT_LARGE_OPTIONS || [],
          carCategoryMap: fetchedOptions.CAR_CATEGORY_MAP || {},
          fuelTypes: fetchedOptions.FUEL_OPTIONS || []
        });
      } catch (error) {
        console.error('[VehicleManagementPage] 옵션 데이터 로딩 실패:', error);
      }
    };
    loadOptions();
  }, []);

  return (
    <StandardDataManagementTable<VehicleData>
      title="출입 차량 기준정보 관리"
      columns={VEHICLE_COLUMNS}
      apiEndpoint="/admin/vehicle"
      disableDelete={false}
      options={options}
    />
  );
};

export default VehicleManagementPage;