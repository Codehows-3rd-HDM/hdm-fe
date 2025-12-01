import React from 'react';
import ActivityListTemplate from '../../components/activity/ActivityListTemplate';

const ActivityManagementPage: React.FC = () => {
  return (
    // isAdmin = true: 등록/수정/삭제 가능 모드
    <ActivityListTemplate isAdmin={true} />
  );
};

export default ActivityManagementPage;