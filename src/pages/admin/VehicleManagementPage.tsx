import React, { useState, useEffect, useRef } from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type VehicleData, VEHICLE_COLUMNS } from '../../types/data';
import { fetchRegistrationOptions } from '../../apis/registerApi';
import { fetchOperationPurposes, type OperationPurposeResponse } from '../../apis/operationPurposeApi';

const VehicleManagementPage: React.FC = () => {
  const [options, setOptions] = useState<{
    operationPurposes: { id: number; name: string }[];
    operationPurposesMap: Record<number, { purposeName: string; defaultScope?: number }>;
    companies: { id: number; name: string; oneWayDistance?: number }[];
    carCategories: { id: number; name: string }[];
    carCategoryMap: Record<string, { id: number; name: string }[]>;
    fuelTypes: { id: number; name: string }[];
  }>({
    operationPurposes: [],
    operationPurposesMap: {},
    companies: [],
    carCategories: [],
    carCategoryMap: {},
    fuelTypes: []
  });
  const optionsLoadedRef = useRef(false);

  useEffect(() => {
    if (optionsLoadedRef.current) return;
    optionsLoadedRef.current = true;

    const loadOptions = async () => {
      try {
        console.log('[VehicleManagementPage] 옵션 데이터 로딩 시작');
        const [fetchedOptions, purposeResponse] = await Promise.all([
          fetchRegistrationOptions(),
          fetchOperationPurposes(undefined, undefined, undefined, 0, 1000)
        ]);
        
        console.log('[VehicleManagementPage] 로드된 옵션 데이터:', fetchedOptions);
        console.log('[VehicleManagementPage] 운행 목적 데이터:', purposeResponse);
        
        // 운행 목적 맵 생성
        const operationPurposesMap: Record<number, { purposeName: string; defaultScope?: number }> = {};
        purposeResponse.content.forEach((purpose: OperationPurposeResponse) => {
          operationPurposesMap[purpose.id] = {
            purposeName: purpose.purposeName,
            defaultScope: purpose.defaultScope
          };
        });
        
        setOptions({
          operationPurposes: fetchedOptions.PURPOSE_OPTIONS || [],
          operationPurposesMap,
          companies: fetchedOptions.COMPANY_LIST || fetchedOptions.COMPANY_OPTIONS || [],
          carCategories: fetchedOptions.CAT_LARGE_OPTIONS || [],
          carCategoryMap: fetchedOptions.CAR_CATEGORY_MAP || {},
          fuelTypes: fetchedOptions.FUEL_OPTIONS || []
        });
        
        console.log('[VehicleManagementPage] 설정된 옵션 상태:', {
          operationPurposes: fetchedOptions.PURPOSE_OPTIONS || [],
          operationPurposesMap,
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