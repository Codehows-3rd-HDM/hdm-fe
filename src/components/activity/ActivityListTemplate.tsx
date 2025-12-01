import React, { useState, useMemo } from 'react';
import { Download, Calendar, Edit2, Trash2, Plus } from 'lucide-react';
import { commonStyles } from '../../styles/commonStyles';
import ActivityFormModal from './ActivityFormModal';
import { type ReductionActivity } from '../../types/activity';

// --- Mock Data ---
const MOCK_ACTIVITIES: ReductionActivity[] = [
  {
    id: 1,
    startDate: '2025-11-01', endDate: '2025-11-07',
    title: '차량 공회전 제한 캠페인',
    content: '사내 주차장 내 공회전 금지 안내 표지 설치 및 직원 교육 실시. 차량별 공회전 감시 및 위반 시 알림제도 운영.',
    cost: 1200000,
    effect: '연료 절감 및 탄소 배출 감소',
    imageUrl: 'https://via.placeholder.com/300x150?text=Campaign'
  },
  {
    id: 2,
    startDate: '2025-11-08', endDate: '2025-11-15',
    title: '친환경 차량도입(하이브리드)',
    content: '기존 휘발유 차량 2대를 하이브리드 차량으로 교체. 연간 약 2.5톤 CO2 절감 예상.',
    cost: 45000000,
    effect: 'CO2 배출량 30% 감소 효과',
    imageUrl: 'https://via.placeholder.com/300x150?text=Hybrid+Car'
  },
  {
    id: 3,
    startDate: '2025-11-16', endDate: '2025-11-22',
    title: '차량 운행 효율화 시스템 도입',
    content: '차량별 운행거리 및 관리 시스템 구축. 운행 효율성 분석 및 운행 경로 최적화.',
    cost: 3500000,
    effect: '운행 거리 단축 및 관리 효율 증대',
    imageUrl: 'https://via.placeholder.com/300x150?text=System'
  },
  {
    id: 4,
    startDate: '2025-11-23', endDate: '2025-11-30',
    title: '차량 정기 점검 강화',
    content: '타이어 공기압, 엔진오일, 필터류 등 정기 점검주기 단축. 차량 상태 유지로 불필요한 연료 소비 방지.',
    cost: 2400000,
    effect: '연비 5% 향상 기대',
    imageUrl: 'https://via.placeholder.com/300x150?text=Maintenance'
  },
];

interface ActivityListTemplateProps {
  isAdmin: boolean;
}

const ActivityListTemplate: React.FC<ActivityListTemplateProps> = ({ isAdmin }) => {
  // --- 상태 관리 ---
  const [activities, setActivities] = useState<ReductionActivity[]>(MOCK_ACTIVITIES);
  
  // 기간 선택 상태 (시작일, 종료일)
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedActivity, setSelectedActivity] = useState<ReductionActivity | null>(null);

  // --- 데이터 필터링 로직 ---
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // 기간 필터가 없으면 전체 표시
      if (!filterStartDate && !filterEndDate) return true;

      const actStart = new Date(activity.startDate);
      const actEnd = new Date(activity.endDate);
      const filterStart = filterStartDate ? new Date(filterStartDate) : null;
      const filterEnd = filterEndDate ? new Date(filterEndDate) : null;

      // 필터링 로직: 활동 기간이 선택된 기간과 겹치는지 확인
      // (간단하게: 활동 시작일이 필터 종료일 이전이고, 활동 종료일이 필터 시작일 이후여야 함)
      if (filterStart && actEnd < filterStart) return false;
      if (filterEnd && actStart > filterEnd) return false;

      return true;
    });
  }, [activities, filterStartDate, filterEndDate]);

  // --- 핸들러 ---

  const handleRegisterClick = () => {
    setModalMode('create');
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const handleCardClick = (activity: ReductionActivity) => {
    setModalMode('view');
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, activity: ReductionActivity) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까?')) {
      setActivities(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSave = (data: ReductionActivity) => {
    if (modalMode === 'create') {
      setActivities(prev => [{ ...data, id: Date.now() }, ...prev]);
      alert('등록되었습니다.');
    } else {
      setActivities(prev => prev.map(item => item.id === data.id ? data : item));
      alert('수정되었습니다.');
    }
  };

  // 엑셀 다운로드 구현 (CSV)
  const handleExcelDownload = () => {
    if (filteredActivities.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    // CSV 헤더 및 데이터 생성
    const headers = "ID,활동명,시작일,종료일,소요금액,기대효과,활동내역\n";
    const rows = filteredActivities.map(item => 
      `${item.id},"${item.title}",${item.startDate},${item.endDate},${item.cost},"${item.effect}","${item.content.replace(/"/g, '""')}"`
    ).join("\n");
    const csvContent = `\ufeff${headers}${rows}`; // BOM 추가 (한글 깨짐 방지)

    // 파일 다운로드 트리거
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reduction_activities_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  return (
    <div style={commonStyles.pageContainer}>
      
      {/* 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>
            {isAdmin ? '저감활동 기록 관리' : '저감활동 기록 조회'}
          </h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            총 {filteredActivities.length}건의 활동이 조회되었습니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* 엑셀 버튼 스타일 변경 (다른 페이지와 통일: 흰배경+초록테두리) */}
          {isAdmin && (
            <button 
                onClick={handleRegisterClick} 
                style={{ 
                    padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', 
                    borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' 
                }}
            >
              <Plus size={18} /> 등록
            </button>
          )}
          
          {/* 조회 페이지와 관리 페이지 모두 엑셀 다운로드 가능하도록 */}
          <button 
            onClick={handleExcelDownload} 
            style={{ 
                padding: '10px 20px', backgroundColor: '#fff', color: '#28a745', border: '1px solid #28a745', 
                borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' 
            }}
          >
            <Download size={18} /> Excel
          </button>
        </div>
      </div>

      {/* 기간 선택 필터 (시작일 ~ 종료일, 겹침 방지 레이아웃) */}
      <div style={{ 
          ...commonStyles.card, marginBottom: '20px', padding: '20px', 
          display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' // 좁은 화면 대비 wrap
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#666" />
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>활동 기간 :</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="date" 
              value={filterStartDate} 
              onChange={(e) => setFilterStartDate(e.target.value)}
              style={dateInputStyle} 
            />
            <span style={{ color: '#666' }}>~</span>
            <input 
              type="date" 
              value={filterEndDate} 
              onChange={(e) => setFilterEndDate(e.target.value)}
              style={dateInputStyle} 
            />
        </div>
        
        {/* 필터 초기화 버튼 (선택사항) */}
        {(filterStartDate || filterEndDate) && (
            <button 
                onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}
                style={{ fontSize: '12px', color: '#666', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
            >
                필터 초기화
            </button>
        )}
      </div>

      {/* 카드 리스트 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredActivities.map(activity => (
          <div 
            key={activity.id} 
            onClick={() => handleCardClick(activity)}
            style={{ 
              backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee', 
              overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'relative'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
            }}
          >
            {isAdmin && (
              <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px', zIndex: 10 }}>
                <button onClick={(e) => handleEditClick(e, activity)} style={iconButtonStyle}>
                  <Edit2 size={16} color="#007bff" />
                </button>
                <button onClick={(e) => handleDeleteClick(e, activity.id)} style={iconButtonStyle}>
                  <Trash2 size={16} color="#dc3545" />
                </button>
              </div>
            )}

            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '8px', paddingRight: '70px', lineHeight: '1.4' }}>
                {activity.title}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                <Calendar size={12} style={{ marginRight: '5px' }} />
                {activity.startDate} ~ {activity.endDate}
              </div>

              <div style={{ width: '100%', height: '180px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activity.imageUrl ? (
                    <img src={activity.imageUrl} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ color: '#ccc', fontSize: '14px' }}>No Image</span>
                )}
              </div>

              <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', marginBottom: '15px', height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {activity.content}
              </p>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>소요금액</span>
                <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#28a745' }}>
                  {activity.cost.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 (데이터가 많을 때만 표시 예시) */}
      {filteredActivities.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
                <span style={paginationButtonStyle}>← Prev</span>
                <span style={{ ...paginationButtonStyle, fontWeight: 'bold', borderBottom: '2px solid #333', color: '#000' }}>1</span>
                <span style={paginationButtonStyle}>2</span>
                <span style={paginationButtonStyle}>3</span>
                <span style={paginationButtonStyle}>Next →</span>
            </div>
          </div>
      )}

      {/* 공통 모달 */}
      <ActivityFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedActivity}
        onSave={handleSave}
      />

    </div>
  );
};

// --- 스타일 객체 ---
const dateInputStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
    color: '#333',
    backgroundColor: '#fff',
    cursor: 'pointer'
};

const iconButtonStyle = {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid #eee',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const paginationButtonStyle = {
    padding: '8px 12px',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px'
};

export default ActivityListTemplate;