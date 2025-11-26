import React from 'react';
import StandardDataManagementTable from '../../components/management/StandardDataManagementTable';
import { type ProcessData, PROCESS_COLUMNS } from '../../types/data';

const MOCK_PROCESS_DATA: ProcessData[] = [
  { id: 1, processName: '프레스' },
  { id: 2, processName: '차체' },
  { id: 3, processName: '도장' },
  { id: 4, processName: '조립' },
  { id: 5, processName: '엔진' },
  { id: 6, processName: '변속기' },
  { id: 7, processName: '시트' },
  { id: 8, processName: '기타' },
];

const ProcessManagementPage: React.FC = () => {
  return (
    <StandardDataManagementTable<ProcessData>
      title="생산 공정 기준정보 관리"
      columns={PROCESS_COLUMNS}
      initialData={MOCK_PROCESS_DATA}
      apiEndpoint="/api/management/processes"
    />
  );
};

export default ProcessManagementPage;