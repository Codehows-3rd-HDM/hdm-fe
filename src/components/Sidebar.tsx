import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Hexagon } from 'lucide-react';
import { menuItems } from '../data/MenuData';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [closedDepth1, setClosedDepth1] = useState<Set<string>>(() => new Set(['관리자 설정']));
  const [closedDepth2, setClosedDepth2] = useState<Set<string>>(new Set(['출입 차량의 기본 데이터 관리']));

  const handleToggleDepth1 = (title: string, hasSubItems: boolean, path?: string) => {
    if (!hasSubItems && path) {
      navigate(path);
      return;
    }
    setClosedDepth1(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) newSet.delete(title);
      else newSet.add(title);
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
    <div className="fixed left-0 top-0 w-[260px] h-screen bg-white border-r border-[#e0e0e0] 
                    font-[Malgun_Gothic,'Apple_SD_Gothic_Neo',sans-serif] flex flex-col overflow-y-auto pb-10">
      {/* 로고 영역 */}
      <div className="px-5 pt-[25px] pb-[15px] border-b border-[#f0f0f0] mb-[10px]">
        <img src="/rogo.png" alt="HDM Logo" className="max-w-[220px] block h-auto" />
      </div>

      {menuItems.map((depth1) => {
        const isClosed1 = closedDepth1.has(depth1.title);
        const hasSub1 = !!(depth1.items && depth1.items.length > 0);
        const isActive1 = depth1.path === location.pathname;
        const Icon = depth1.icon;

        return (
          <div key={depth1.title}>
            {/* --- Level 1 --- */}
            <div
              className={`flex items-center justify-between pl-6 pr-6 mb-3 cursor-pointer text-base transition-all
                ${isActive1 ? 'text-[#007bff] font-bold bg-[#eef6ff]' : 'text-[#333] font-semibold'}
                hover:bg-[#f5f9ff] active:bg-[#eef6ff]
              `}
              style={{ height: '50px' }}
              onClick={() => handleToggleDepth1(depth1.title, hasSub1, depth1.path)}
            >
              <div className="flex items-center gap-x-4">
                {Icon && <Icon size={20} strokeWidth={1.5} />}
                <span className="block leading-[2.2rem]">{depth1.title}</span>
              </div>
              {hasSub1 && (
                isClosed1
                  ? <ChevronDown size={16} className="text-[#999] rotate-180" />
                  : <ChevronDown size={16} className="text-[#999]" />
              )}
            </div>

            {/* --- Level 1 Content --- */}
            {hasSub1 && (
              <div
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out bg-white"
                style={{ maxHeight: isClosed1 ? '0' : '800px' }}
              >
                {depth1.items!.map((depth2) => {
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
                        className={`flex items-center justify-between pr-6 mb-2 cursor-pointer text-sm transition-colors
                          ${isHighlight2 ? 'text-[#007bff] font-semibold bg-[#eef6ff]' : 'text-[#555] font-normal'}
                          hover:bg-[#f5f9ff] active:bg-[#eef6ff]
                        `}
                        style={{ paddingLeft: '40px', height: '45px' }}
                        onClick={() => handleToggleDepth2(depth2Key, hasSub2, depth2.path)}
                      >
                        <div className="flex items-center gap-x-3">
                          <span className={`text-[18px] ${isHighlight2 ? 'text-[#007bff]' : 'text-[#b0b0b0]'}`}>~</span>
                          <span className="block leading-[2rem]">{depth2.title}</span>
                        </div>
                        {hasSub2 && (
                          isClosed2
                            ? <ChevronDown size={14} className="text-[#bbb] rotate-180" />
                            : <ChevronDown size={14} className="text-[#bbb]" />
                        )}
                      </div>

                      {/* --- Level 2 Content (Level 3) --- */}
                      {hasSub2 && (
                        <div
                          className="overflow-hidden transition-[max-height] duration-300 ease-in-out bg-[#f9f9f9]"
                          style={{ maxHeight: isClosed2 ? '0' : '500px' }}
                        >
                          {depth2.items!.map((depth3) => {
                            const isActive3 = depth3.path === location.pathname;
                            return (
                              <div
                                key={depth3.title}
                                className={`flex items-center justify-between pr-6 mb-2 cursor-pointer text-[13px]
                                  ${isActive3 ? 'text-[#007bff] font-semibold bg-[#eef6ff]' : 'text-[#666] font-normal'}
                                  hover:bg-[#f5f9ff] active:bg-[#eef6ff]
                                `}
                                style={{ paddingLeft: '68px', height: '40px' }}
                                onClick={() => navigate(depth3.path!)}
                              >
                                <div className="flex items-center gap-x-3">
                                  <Hexagon size={12} className={`${isActive3 ? 'fill-[#007bff]' : 'fill-[#ddd]'} stroke-none`} />
                                  <span className="block leading-[1.8rem]">{depth3.title}</span>
                                </div>
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