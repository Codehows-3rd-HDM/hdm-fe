import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Hexagon } from 'lucide-react'; // 아이콘 추가
import { menuItems } from '../data/MenuData';

// --- 스타일 정의 ---
const styles = {
  container: {
    width: '260px', 
    height: '100vh',
    backgroundColor: '#ffffff', 
    borderRight: '1px solid #e0e0e0',
    fontFamily: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
    overflowY: 'auto' as const,
  },
  logoArea: {
    padding: '25px 20px 15px 20px',
    borderBottom: '1px solid #f0f0f0',
    marginBottom: '10px',
  },
  logo: {
    height: '200px',
    width: 'auto',
    display: 'block',
  },
  // 1 Depth (대분류)
  depth1Item: (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    cursor: 'pointer',
    color: isActive ? '#007bff' : '#333333',
    fontWeight: isActive ? 700 : 600,
    backgroundColor: isActive ? '#eef6ff' : 'transparent', // 활성 시 연한 파랑 배경
    transition: 'all 0.2s',
    fontSize: '15px',
  }),
  // 2 Depth (중분류)
  depth2Wrapper: (isClosed: boolean) => ({
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    maxHeight: isClosed ? '0' : '800px', 
    backgroundColor: '#ffffff',
  }),
  depth2Item: (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px 10px 32px',
    cursor: 'pointer',
    // 활성화되면 파란색(#007bff), 아니면 회색(#555)
    color: isActive ? '#007bff' : '#555555', 
    // 활성화되면 글자 두께도 살짝 두껍게
    fontWeight: isActive ? 600 : 400, 
    backgroundColor: isActive ? '#eef6ff' : 'transparent', // 활성 시 연한 파랑 배경
    fontSize: '14px',
    transition: 'color 0.2s',
  }),
  // 3 Depth (소분류)
  depth3Wrapper: (isClosed: boolean) => ({
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    maxHeight: isClosed ? '0' : '500px',
    backgroundColor: '#f9f9f9', // 3단계는 살짝 어두운 배경
  }),
  depth3Item: (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 24px 10px 52px', // 깊은 들여쓰기
    cursor: 'pointer',
    color: isActive ? '#007bff' : '#666666',
    backgroundColor: isActive ? '#eef6ff' : 'transparent', // 활성 시 연한 파랑 배경
    fontWeight: isActive ? 600 : 400,
    fontSize: '13px',
  }),
  icon: {
    marginRight: '10px',
  },
  arrow: {
    marginLeft: 'auto', // 화살표 우측 정렬
    color: '#999',
  },
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 경로 확인용
  
  const [closedDepth1, setClosedDepth1] = useState<Set<string>>(() => {
    // 여기 Set에 넣으면 그 항목을 닫은 채로 시작
    return new Set(['관리자 설정']); 
  });

  const [closedDepth2, setClosedDepth2] = useState<Set<string>>(new Set(['출입 차량의 기본 데이터 관리']));

  // 1 Depth 토글
  const handleToggleDepth1 = (title: string, hasSubItems: boolean, path?: string) => {
    if (!hasSubItems && path) {
      navigate(path);
      return;
    }
    setClosedDepth1(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) newSet.delete(title); // 닫혀있으면 -> 연다
      else newSet.add(title); // 열려있으면 -> 닫는다
      return newSet;
    });
  };

  // 2 Depth 토글
  const handleToggleDepth2 = (key: string, hasSubItems: boolean, path?: string) => {
    if (!hasSubItems && path) {
      navigate(path);
      return;
    }
    setClosedDepth2(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  return (
    <div style={styles.container}>
      {/* 로고 영역 */}
      <div style={styles.logoArea}>
         <img src="/rogo.png" alt="HDM Logo" style={{ maxWidth: '220px' }} />
      </div>

      {menuItems.map((depth1) => {
        const isClosed1 = closedDepth1.has(depth1.title);
        const hasSub1 = !!(depth1.items && depth1.items.length > 0);
        const isActive1 = depth1.path === location.pathname; // 현재 페이지 활성화 체크
        const Icon = depth1.icon;

        return (
          <div key={depth1.title}>
            {/* --- Level 1 --- */}
            <div
              style={styles.depth1Item(isActive1)}
              onClick={() => handleToggleDepth1(depth1.title, hasSub1, depth1.path)}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f9ff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isActive1 ? '#eef6ff' : 'transparent'; }}
            >
              {Icon && <Icon size={20} strokeWidth={1.5} style={styles.icon} />}
              <span>{depth1.title}</span>
              {hasSub1 && (
                isClosed1 ? <ChevronDown size={16} style={styles.arrow} /> : <ChevronDown size={16} style={{...styles.arrow, transform: 'rotate(180deg)'}} />
              )}
            </div>

            {/* --- Level 1 Content --- */}
            {hasSub1 && (
              <div style={styles.depth2Wrapper(isClosed1)}>
                {depth1.items!.map((depth2) => {
                  const depth2Key = `${depth1.title}-${depth2.title}`;
  const isClosed2 = closedDepth2.has(depth2Key);
  const hasSub2 = !!(depth2.items && depth2.items.length > 0);
  
  // 1. 현재 Depth 2 자체가 선택되었는지
  const isActive2 = depth2.path === location.pathname;

  // 2. 하위 메뉴(Depth 3) 중 하나라도 선택되었는지 확인 (부모도 같이 하이라이트)
  const isChildActive = depth2.items?.some(child => child.path === location.pathname);

  // 최종 하이라이트 여부
  const isHighlight2 = isActive2 || isChildActive;

  return (
    <div key={depth2Key}>
      {/* --- Level 2 --- */}
      <div
        //위에서 만든 스타일 함수에 isHighlight2 전달
        style={styles.depth2Item(isHighlight2)} 
        onClick={() => handleToggleDepth2(depth2Key, hasSub2, depth2.path)}
      >
        <span style={{ 
            marginRight: '8px', 
            color: isHighlight2 ? '#007bff' : '#b0b0b0', // 여기도 조건부 색상 적용
            fontSize: '18px', 
            lineHeight: 0 
        }}>~</span>
        
        <span>{depth2.title}</span>
        
        {hasSub2 && (
            isClosed2 
            ? <ChevronDown size={14} style={{ marginLeft: 'auto', color: '#bbb' }} /> 
            : <ChevronDown size={14} style={{ marginLeft: 'auto', color: '#bbb', transform: 'rotate(180deg)' }} />
        )}
      </div>

                      {/* --- Level 2 Content (Level 3) --- */}
                      {hasSub2 && (
                        <div style={styles.depth3Wrapper(isClosed2)}>
                          {depth2.items!.map((depth3) => {
                             const isActive3 = depth3.path === location.pathname;
                             return (
                                <div
                                  key={depth3.title}
                                  style={styles.depth3Item(isActive3)}
                                  onClick={() => navigate(depth3.path!)}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#007bff'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = isActive3 ? '#007bff' : '#666'}
                                >
                                  {/* 이미지의 톱니바퀴(육각형) 아이콘 흉내 */}
                                  <Hexagon size={12} style={{ marginRight: '8px', fill: isActive3 ? '#007bff' : '#ddd', stroke: 'none' }} />
                                  {depth3.title}
                                </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;