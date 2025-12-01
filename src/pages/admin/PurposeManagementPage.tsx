import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type PurposeData, PURPOSE_COLUMNS } from '../../types/data';

const MOCK_PURPOSE_DATA: PurposeData[] = [
  { id: 1, purpose: '납품', scope: 'Scope3' },
  { id: 2, purpose: '출퇴근', scope: 'Scope1' }, // 사내 차량인 경우 Scope1일 수도 있음 (예시)
  { id: 3, purpose: '고객', scope: 'Scope3' },
  { id: 4, purpose: '기타', scope: '기타' },
  { id: 5, purpose: '자재운송', scope: 'Scope3' },
];

const PurposeManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<PurposeData>
      title="운행 목적 기준정보 관리"
      columns={PURPOSE_COLUMNS}
      initialData={MOCK_PURPOSE_DATA}
      apiEndpoint="/api/management/purposes"
    />
  );
};

export default PurposeManagementPage;