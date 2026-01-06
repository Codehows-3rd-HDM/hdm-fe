import { BarChart2, Clock, Settings, User, Home } from "lucide-react";

export interface MenuItem {
  title: string;
  path?: string;
  icon?: React.ElementType;
  items?: MenuItem[];
  requiredRoles?: string[];
}

export const menuItems: MenuItem[] = [
  {
    title: "대시보드",
    path: "/dashboard",
    icon: Home,
    requiredRoles: ["SUPERADMIN", "ADMIN", "VIEWER"],
  },
  {
    title: "배출량 조회",
    icon: BarChart2,
    items: [
      { title: "기간별 탄소 총 배출량", path: "/view/period" }, // API: /emission/daily
      { title: "협력사별", path: "/view/company" }, // API: /company/emission
      { title: "운행 목적별", path: "/view/purpose" }, // API: /purpose/emission
      { title: "공급 유형별", path: "/view/supply-type" }, // API: /process/emission
      { title: "공급 고객별", path: "/view/supply-customer" }, // API: /product-class/emission
      { title: "연료별", path: "/view/fuel" }, // API: /fuel/emission
      { title: "목표 대비 탄소 배출량", path: "/view/target" }, // API: /target/compare
    ],
    requiredRoles: ["SUPERADMIN", "ADMIN", "VIEWER"],
  },
  {
    title: "저감활동 기록 조회",
    path: "/activities",
    icon: Clock,
    requiredRoles: ["SUPERADMIN", "ADMIN", "VIEWER"],
  },
  {
    title: "관리자 설정",
    icon: Settings,
    items: [
      {
        title: "출입 차량 데이터 관리",
        items: [
          {
            title: "출입차량의 기본정보 등록",
            path: "/admin/vehicle/register",
          },
          { title: "출입차량 정보 관리", path: "/admin/vehicle/manage" },
          {
            title: "협력사명과 주소지 정보 관리",
            path: "/admin/company/manage",
          },
          {
            title: "차종과 연비 정보 관리",
            path: "/admin/car-category/manage",
          },
          { title: "공급 유형 정보 관리", path: "/admin/supply-type/manage" },
          { title: "운행목적 정보 관리", path: "/admin/purpose/manage" },
          {
            title: "공급 고객 정보 관리",
            path: "/admin/supply-customer/manage",
          },
          { title: "기준 정보 액셀 관리", path: "/admin/excel/base-info" },
        ],
      },
      { title: "탄소 배출계수 관리", path: "/admin/emission-factor" }, // API: /emission-factor
      // { title: '탄소 배출량 계산', path: '/admin/calc-method' },       // API: /emission/calc-method
      { title: "탄소 배출 목표 조회", path: "/admin/target-view" }, // API: /target
      // { title: '대시보드 관리', path: '/admin/dashboard-setting' }, 기존엔 있었는데 미구현
      { title: "저감활동 기록 관리", path: "/admin/activity-manage" },
      { title: "출입 데이터 업로드", path: "/admin/excel/s1-nice" }, // API: /upload/nicepark, /upload/s1
    ],
    requiredRoles: ["SUPERADMIN", "ADMIN"],
  },
  {
    title: "계정 등록",
    path: "/register",
    icon: User,
    requiredRoles: ["SUPERADMIN"],
  },
];
