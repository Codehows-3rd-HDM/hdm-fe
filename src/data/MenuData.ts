import { BarChart2, Clock, Settings, User, Home } from 'lucide-react';

export interface MenuItem {
  title: string;
  path?: string;
  icon?: React.ElementType;
  items?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    title: '대시보드',
    path: '/dashboard', 
    icon: Home,
  },
  {
    title: '배출량 조회',
    icon: BarChart2,
    items: [
      { title: '기간별 탄소 총 배출량', path: '/emissions/period' }, // API: /emission/daily
      { title: '납품 업체별', path: '/emissions/company' },           // API: /company/emission
      { title: '운행 목적별', path: '/emissions/purpose' },           // API: /purpose/emission
      { title: '생산 공정별', path: '/emissions/process' },           // API: /process/emission
      { title: '생산품목 구분별', path: '/emissions/product-class' }, // API: /product-class/emission
      { title: '연료별', path: '/emissions/fuel' },                   // API: /fuel/emission
      { title: '목표 대비 탄소 배출량', path: '/emissions/target' },   // API: /target/compare
    ],
  },
  {
    title: '저감활동 기록 조회',
    path: '/activities', 
    icon: Clock,
  },
  {
    title: '관리자 설정',
    icon: Settings,
    items: [
      {
        title: '출입 차량 데이터 관리',
        items: [
          { title: '출입차량의 기본정보 등록', path: '/admin/vehicle/register' },
          { title: '출입차량 정보 관리', path: '/admin/vehicle/manage' },
          { title: '업체명과 주소지 정보 관리', path: '/admin/company/manage' },
          { title: '차종과 연비 정보 관리', path: '/admin/car-category/manage' },
          { title: '생산공정 정보 관리', path: '/admin/process/manage' },
          { title: '운행목적 정보 관리', path: '/admin/purpose/manage' },
          { title: '생산품목 구분 정보 관리', path: '/admin/product-class/manage' },
        ],
      },
      { title: '탄소 배출계수 관리', path: '/admin/emission-factor' }, // API: /emission-factor
      { title: '탄소 배출량 계산', path: '/admin/calc-method' },       // API: /emission/calc-method
      { title: '탄소 배출 목표 조회', path: '/admin/target-view' },    // API: /target
      // { title: '대시보드 관리', path: '/admin/dashboard-setting' }, 기존엔 있었는데 미구현
      { title: '저감활동 기록 관리', path: '/admin/activity-manage' },
      { title: '출입 데이터 업로드', path: '/admin/data-upload' },     // API: /upload/nicepark, /upload/s1
    ],
  },
  {
    title: '계정 등록',
    path: '/register', // API: /users
    icon: User,
  },
];