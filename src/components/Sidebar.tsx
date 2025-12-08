import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Hexagon } from 'lucide-react';
import { menuItems } from '../data/MenuData';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 초기 닫힘 상태 설정 ('관리자 설정' 메뉴는 닫힌 상태로 시작)
  const [closedDepth1, setClosedDepth1] = useState<Set<string>>(() => new Set(['관리자 설정']));
  const [closedDepth2, setClosedDepth2] = useState<Set<string>>(new Set(['출입 차량의 기본 데이터 관리']));

  // 권한 훅
  const { hasRole } = useAuth();

  const handleToggleDepth1 = (title: string, hasSubItems: boolean, path?: string) => {
    if (!hasSubItems && path) {
      navigate(path);
      return;
    }
    setClosedDepth1(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) newSet.delete(title); // 닫혀있으면 -> 연다 (삭제)
      else newSet.add(title); // 열려있으면 -> 닫는다 (추가)
      return newSet;
    });
  };

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
    // [수정] fixed w-[260px]로 변경 (App.tsx의 ml-[260px]과 일치시킴)
    <div className="fixed left-0 top-0 w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto pb-10 font-sans z-50">
      
      {/* 로고 영역 */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100 mb-2">
        <img src="/rogo.png" alt="HDM Logo" className="max-w-[180px] block h-auto mx-auto" />
      </div>

      {menuItems.map((depth1) => {
        // [1단계 권한 체크]
        if (depth1.requiredRoles && !hasRole(depth1.requiredRoles)) {
          return null; 
        }

        const isClosed1 = closedDepth1.has(depth1.title);
        const hasSub1 = !!(depth1.items && depth1.items.length > 0);
        const isActive1 = depth1.path === location.pathname;
        const Icon = depth1.icon;

        return (
          <div key={depth1.title}>
            {/* --- Level 1 --- */}
            <div
              className={`
                flex items-center justify-between px-6 py-3 mb-1 cursor-pointer text-[15px] transition-all duration-200
                ${isActive1 
                  ? 'text-blue-600 font-bold bg-blue-50' 
                  : 'text-gray-700 font-semibold hover:bg-gray-50'
                }
              `}
              onClick={() => handleToggleDepth1(depth1.title, hasSub1, depth1.path)}
            >
              <div className="flex items-center gap-x-3">
                {Icon && <Icon size={20} strokeWidth={1.5} />}
                <span>{depth1.title}</span>
              </div>
              
              {/* 화살표 아이콘 (조건부 렌더링) */}
              {hasSub1 && (
                <ChevronDown 
                  // 색상을 text-gray-400으로 명시하여 가시성 확보
                  className={`text-gray-400 transition-transform duration-200 ${isClosed1 ? 'rotate-180' : 'rotate-0'}`} 
                />
              )}
            </div>

            {/* --- Level 1 Content --- */}
            {hasSub1 && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out bg-white ${isClosed1 ? 'max-h-0 opacity-0' : 'max-h-[1000px] opacity-100'}`}
              >
                {depth1.items!.map((depth2) => {
                  // [2단계 권한 체크]
                  if (depth2.requiredRoles && !hasRole(depth2.requiredRoles)) {
                    return null;
                  }

                  const depth2Key = `${depth1.title}-${depth2.title}`;
                  const isClosed2 = closedDepth2.has(depth2Key);
                  const hasSub2 = !!(depth2.items && depth2.items.length > 0);

                  const isActive2 = depth2.path === location.pathname;
                  const isChildActive = depth2.items?.some(child => child.path === location.pathname);
                  const isHighlight2 = isActive2 || isChildActive;

                  return (
                    <div key={depth2Key}>
                      {/* --- Level 2 --- */}
                      <div
                        className={`
                          flex items-center justify-between pr-6 mb-1 cursor-pointer text-sm transition-colors duration-200 pl-10 py-2.5
                          ${isHighlight2 
                            ? 'text-blue-600 font-semibold bg-blue-50' 
                            : 'text-gray-600 font-normal hover:bg-gray-50 hover:text-blue-600'
                          }
                        `}
                        onClick={() => handleToggleDepth2(depth2Key, hasSub2, depth2.path)}
                      >
                        <div className="flex items-center gap-x-2">
                          <span className={`text-lg leading-none ${isHighlight2 ? 'text-blue-600' : 'text-gray-300'}`}>~</span>
                          <span>{depth2.title}</span>
                        </div>
                        {hasSub2 && (
                          <ChevronDown 
                            size={14} 
                            className={`ml-auto text-gray-300 transition-transform duration-200 ${isClosed2 ? 'rotate-180' : 'rotate-0'}`}
                          />
                        )}
                      </div>

                      {/* --- Level 2 Content (Level 3) --- */}
                      {hasSub2 && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50 ${isClosed2 ? 'max-h-0' : 'max-h-[500px]'}`}
                        >
                          {depth2.items!.map((depth3) => {
                            // [3단계 권한 체크]
                            if (depth3.requiredRoles && !hasRole(depth3.requiredRoles)) {
                              return null;
                            }

                            const isActive3 = depth3.path === location.pathname;
                            return (
                              <div
                                key={depth3.title}
                                className={`
                                  flex items-center pr-6 mb-1 cursor-pointer text-[13px] transition-colors duration-200 pl-[68px] py-2
                                  ${isActive3 
                                    ? 'text-blue-600 font-semibold bg-blue-50' 
                                    : 'text-gray-500 font-normal hover:bg-white hover:text-blue-600'
                                  }
                                `}
                                onClick={() => navigate(depth3.path!)}
                              >
                                <Hexagon 
                                  size={12} 
                                  className={`mr-2 ${isActive3 ? 'fill-blue-600 text-blue-600' : 'fill-gray-300 text-transparent'} stroke-none`} 
                                />
                                <span>{depth3.title}</span>
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