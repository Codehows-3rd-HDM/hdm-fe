import React from 'react';
import ActivityListTemplate from '../../components/activity/ActivityListTemplate';
import { getBreadcrumbItems } from '../../utils/breadcrumbHelper';

const ActivityManagementPage: React.FC = () => {
  return (
    // isAdmin = true: 등록/수정/삭제 가능 모드
    <ActivityListTemplate 
      isAdmin={true} 
      breadcrumbItems={getBreadcrumbItems('/admin/activity-manage')}
    />
  );
};

export default ActivityManagementPage;