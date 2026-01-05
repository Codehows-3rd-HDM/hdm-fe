import { menuItems, type MenuItem } from "../data/MenuData";
import type { BreadcrumbItem } from "../components/Breadcrumb";

/**
 * 현재 경로에 맞는 breadcrumb 아이템을 찾아 반환
 * @param pathname 현재 경로 (예: /view/company)
 * @returns BreadcrumbItem[] (예: [{label: '배출량 조회'}, {label: '협력사별', path: '/view/company'}])
 */
export const getBreadcrumbItems = (pathname: string): BreadcrumbItem[] => {
  const result: BreadcrumbItem[] = [];

  const findPath = (items: MenuItem[], parents: MenuItem[] = []): boolean => {
    for (const item of items) {
      if (item.path === pathname) {
        // 경로를 찾았을 때 부모들을 먼저 추가
        parents.forEach((parent) => {
          result.push({ label: parent.title });
        });
        // 마지막으로 현재 아이템 추가
        result.push({ label: item.title, path: item.path });
        return true;
      }

      // 하위 메뉴가 있으면 재귀적으로 탐색
      if (item.items) {
        if (findPath(item.items, [...parents, item])) {
          return true;
        }
      }
    }
    return false;
  };

  findPath(menuItems);
  return result;
};
