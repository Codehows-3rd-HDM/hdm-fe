import React, { useState, useEffect } from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';
import { type VehicleData, VEHICLE_COLUMNS } from '../../types/data';
import { fetchRegistrationOptions } from '../../apis/registerApi';
import { fetchOperationPurposes, type OperationPurposeResponse } from '../../apis/operationPurposeApi';

type VehicleOptions = {
  operationPurposes: { id: number; name: string }[];
  operationPurposesMap: Record<number, { purposeName: string; defaultScope?: number }>;
  companies: { id: number; name: string; oneWayDistance?: number }[];
  carCategories: { id: number; name: string }[];
  carCategoryMap: Record<string, { id: number; name: string }[]>;
  fuelTypes: { id: number; name: string }[];
};

// StrictMode에서의 이중 마운트로 인한 중복 호출을 방지하기 위해 모듈 단위 캐시 사용
let vehicleOptionsCache: VehicleOptions | null = null;
let vehicleOptionsPromise: Promise<VehicleOptions> | null = null;

const loadVehicleOptions = async (): Promise<VehicleOptions> => {
  if (vehicleOptionsCache) return vehicleOptionsCache;
  if (!vehicleOptionsPromise) {
    vehicleOptionsPromise = Promise.all([
      fetchRegistrationOptions(),
      fetchOperationPurposes(undefined, undefined, undefined, 0, 1000)
    ]).then(([fetchedOptions, purposeResponse]) => {
      const operationPurposesMap: Record<number, { purposeName: string; defaultScope?: number }> = {};
      purposeResponse.content.forEach((purpose: OperationPurposeResponse) => {
        operationPurposesMap[purpose.id] = {
          purposeName: purpose.purposeName,
          defaultScope: purpose.defaultScope
        };
      });

      const prepared: VehicleOptions = {
        operationPurposes: fetchedOptions.PURPOSE_OPTIONS || [],
        operationPurposesMap,
        companies: fetchedOptions.COMPANY_LIST || fetchedOptions.COMPANY_OPTIONS || [],
        carCategories: fetchedOptions.CAT_LARGE_OPTIONS || [],
        carCategoryMap: fetchedOptions.CAR_CATEGORY_MAP || {},
        fuelTypes: fetchedOptions.FUEL_OPTIONS || []
      };

      vehicleOptionsCache = prepared;
      return prepared;
    }).finally(() => {
      vehicleOptionsPromise = null;
    });
  }

  return vehicleOptionsPromise;
};

const VehicleManagementPage: React.FC = () => {
  const [options, setOptions] = useState<VehicleOptions>({
    operationPurposes: [],
    operationPurposesMap: {},
    companies: [],
    carCategories: [],
    carCategoryMap: {},
    fuelTypes: []
  });

  useEffect(() => {
    let mounted = true;
    loadVehicleOptions()
      .then(data => {
        if (mounted) setOptions(data);
      })
      .catch(error => {
        console.error('[VehicleManagementPage] 옵션 데이터 로딩 실패:', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StandardDataManagementTable<VehicleData>
      title="출입 차량 기준정보 관리"
      columns={VEHICLE_COLUMNS}
      apiEndpoint="/admin/vehicle"
      disableDelete={false}
      options={options}
      breadcrumbItems={getBreadcrumbItems('/admin/vehicle/manage')}
    />
  );
};

export default VehicleManagementPage;