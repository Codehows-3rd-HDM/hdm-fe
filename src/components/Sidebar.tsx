import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Hexagon, Menu, LogOut } from "lucide-react"; // LogOut 아이콘 추가
import { menuItems } from "../data/MenuData";
import { useAuth } from "../hooks/useAuth";

// Props 타입 정의 (부모 컴포넌트에서 상태를 제어하기 위함)
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 초기 닫힘 상태 설정
  const [closedDepth1, setClosedDepth1] = useState<Set<string>>(
    () => new Set(["관리자 설정"])
  );
  const [closedDepth2, setClosedDepth2] = useState<Set<string>>(
    new Set(["출입 차량의 기본 데이터 관리"])
  );

  // 권한 훅
  const { hasRole } = useAuth();

  // 로그아웃 핸들러
  const handleLogout = () => {
    // 로컬 스토리지에서 토큰 제거
    sessionStorage.removeItem("token");
    // 로그인 페이지로 이동
    navigate("/login");
  };

  const handleToggleDepth1 = (
    title: string,
    hasSubItems: boolean,
    path?: string
  ) => {
    // 사이드바가 접혀있을 때 (isOpen: false) 하위 메뉴가 있는 항목을 클릭하면
    if (!isOpen && hasSubItems) {
      // 1. 사이드바를 펼치고
      toggleSidebar();
      // 2. 해당 뎁스 메뉴를 펼침 (closedDepth1에서 title을 제거)
      setClosedDepth1((prev) => {
        const newSet = new Set(prev);
        newSet.delete(title);
        return newSet;
      });
      return; // 일반 뎁스 토글 로직이 실행되는 것을 방지
    }

    if (!hasSubItems && path) {
      navigate(path);
      return;
    }
    setClosedDepth1((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) newSet.delete(title);
      else newSet.add(title);
      return newSet;
    });
  };

  const handleToggleDepth2 = (
    key: string,
    hasSubItems: boolean,
    path?: string
  ) => {
    if (!hasSubItems && path) {
      navigate(path);
      return;
    }
    setClosedDepth2((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  return (
    // 너비를 isOpen 상태에 따라 동적으로 변경 (w-[260px] <-> w-[80px])
    <div
      className={`
    fixed left-0 top-0 h-screen border-r border-gray-200 flex flex-col font-sans z-50 transition-all duration-300 ease-in-out
    ${isOpen ? "w-65" : "w-20"}
  `}
    >
      {/* 헤더 영역: 로고 및 토글 버튼 */}
      <div
        className={`flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        } border-b border-gray-100 transition-all`}
        style={{
          padding: `var(--spacing-lg) ${
            isOpen ? "1.25rem" : "0.75rem"
          } var(--spacing-md)`,
          marginBottom: "var(--spacing-sm)",
        }}
      >
        {isOpen && (
          <img
            src="/rogo1.png"
            alt="HDM Logo"
            className="max-w-36 block h-auto cursor-pointer bg-transparent select-none"
            onClick={() => navigate("/main")}
            draggable={false}
          />
        )}

        {/* 햄버거 버튼: 항상 표시 */}
        <button
          onClick={toggleSidebar}
          className="rounded hover:bg-gray-100 text-gray-500 transition-colors"
          title={isOpen ? "메뉴 접기" : "메뉴 펼치기"}
          style={{ padding: "var(--spacing-sm)" }}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* 메뉴 리스트 영역 */}
      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar overflow-x-hidden">
        {menuItems.map((depth1) => {
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
                  flex items-center cursor-pointer transition-all duration-200
                  ${
                    isOpen
                      ? "justify-between rounded-lg"
                      : "justify-center rounded-md"
                  }
                  ${
                    isActive1
                      ? "text-blue-600 font-bold bg-blue-50"
                      : "text-gray-700 font-semibold hover:bg-gray-50"
                  }
                `}
                style={{
                  padding: "var(--spacing-md) 1rem",
                  margin: isOpen
                    ? "0 0.5rem 0.25rem 0.5rem"
                    : "0 0.25rem 0.25rem 0.25rem",
                }}
                onClick={() =>
                  handleToggleDepth1(depth1.title, hasSub1, depth1.path)
                }
                title={!isOpen ? depth1.title : undefined} // 접혔을 때 툴팁 효과
              >
                <div
                  className={`flex items-center`}
                  style={{ gap: isOpen ? "0.75rem" : "0" }}
                >
                  {Icon && (
                    <Icon size={22} strokeWidth={1.5} className="shrink-0" />
                  )}

                  {/* 텍스트: 펼쳐졌을 때만 표시 */}
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isOpen ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                    }`}
                  >
                    {depth1.title}
                  </span>
                </div>

                {/* 화살표: 펼쳐졌을 때만 표시 */}
                {isOpen && hasSub1 && (
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      isClosed1 ? "rotate-180" : "rotate-0"
                    }`}
                  />
                )}
              </div>

              {/* --- Level 1 Content (Submenus) --- */}
              {/* 사이드바가 접혀있을 때는 하위 메뉴를 숨김 (복잡도 방지) */}
              {isOpen && hasSub1 && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out bg-white ${
                    isClosed1 ? "max-h-0 opacity-0" : "max-h-250 opacity-100"
                  }`}
                >
                  {depth1.items!.map((depth2) => {
                    if (depth2.requiredRoles && !hasRole(depth2.requiredRoles))
                      return null;

                    const depth2Key = `${depth1.title}-${depth2.title}`;
                    const isClosed2 = closedDepth2.has(depth2Key);
                    const hasSub2 = !!(depth2.items && depth2.items.length > 0);

                    const isActive2 = depth2.path === location.pathname;
                    const isChildActive = depth2.items?.some(
                      (child) => child.path === location.pathname
                    );
                    const isHighlight2 = isActive2 || isChildActive;

                    return (
                      <div key={depth2Key}>
                        {/* --- Level 2 --- */}
                        <div
                          className={`
                            flex items-center justify-between cursor-pointer text-sm transition-colors duration-200
                            ${
                              isHighlight2
                                ? "text-blue-600 font-semibold bg-blue-50"
                                : "text-gray-600 font-normal hover:bg-gray-50 hover:text-blue-600"
                            }
                          `}
                          style={{
                            padding: "0.625rem 1.5rem 0.625rem 3rem",
                            margin: "0.25rem 0",
                          }}
                          onClick={() =>
                            handleToggleDepth2(depth2Key, hasSub2, depth2.path)
                          }
                        >
                          <div
                            className="flex items-center"
                            style={{ gap: "0.5rem" }}
                          >
                            <span
                              className={`text-lg leading-none ${
                                isHighlight2 ? "text-blue-600" : "text-gray-300"
                              }`}
                            >
                              ~
                            </span>
                            <span>{depth2.title}</span>
                          </div>
                          {hasSub2 && (
                            <ChevronDown
                              size={14}
                              className={`ml-auto text-gray-300 transition-transform duration-200 ${
                                isClosed2 ? "rotate-180" : "rotate-0"
                              }`}
                            />
                          )}
                        </div>

                        {/* --- Level 2 Content (Level 3) --- */}
                        {hasSub2 && (
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50 ${
                              isClosed2 ? "max-h-0" : "max-h-125"
                            }`}
                          >
                            {depth2.items!.map((depth3) => {
                              if (
                                depth3.requiredRoles &&
                                !hasRole(depth3.requiredRoles)
                              )
                                return null;

                              const isActive3 =
                                depth3.path === location.pathname;
                              return (
                                <div
                                  key={depth3.title}
                                  className={`
                                    flex items-center cursor-pointer text-[13px] transition-colors duration-200
                                    ${
                                      isActive3
                                        ? "text-blue-600 font-semibold bg-blue-50"
                                        : "text-gray-500 font-normal hover:bg-white hover:text-blue-600"
                                    }
                                  `}
                                  style={{
                                    padding: "0.5rem 1.5rem 0.5rem 4.625rem",
                                    margin: "0.25rem 0",
                                  }}
                                  onClick={() => navigate(depth3.path!)}
                                >
                                  <Hexagon
                                    size={10}
                                    className={`${
                                      isActive3
                                        ? "fill-blue-600 text-blue-600"
                                        : "fill-gray-300 text-transparent"
                                    } stroke-none`}
                                    style={{ marginRight: "0.5rem" }}
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

      {/* 로그아웃 버튼 */}
      <div
        className="border-t border-gray-100"
        style={{ padding: "var(--spacing-md)" }}
      >
        <button
          onClick={handleLogout}
          className={`
            flex items-center w-full
            rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm
            ${isOpen ? "justify-start" : "justify-center"}
          `}
          title="로그아웃"
          style={{ gap: "0.75rem", padding: `var(--spacing-md) 0.75rem` }}
        >
          <LogOut size={18} />
          {isOpen && <span>로그아웃</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
