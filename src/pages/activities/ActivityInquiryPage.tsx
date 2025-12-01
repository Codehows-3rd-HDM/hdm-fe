import React from 'react';
import ActivityListTemplate from '../../components/activity/ActivityListTemplate';

const ActivityInquiryPage: React.FC = () => {
  return (
    // isAdmin = false: 조회 전용 모드
    <ActivityListTemplate isAdmin={false} />
  );
};

export default ActivityInquiryPage;