# HDM 프론트엔드 - Copilot 가이드

## 프로젝트 개요

HDM(탄소 배출 모니터링 및 차량 관리 시스템)은 탄소 배출량을 다양한 차원(연료 유형, 협력사, 운행 목적 등)에서 추적하고 차량 등록 및 감축 활동을 관리하는 React + TypeScript + Vite 프론트엔드입니다.

**기술 스택**: React 18, TypeScript, React Router v7, Tailwind CSS 4, Recharts, Axios, Vite

**주요 포트**: 개발 서버 `localhost:5173`, API 프록시 `http://localhost:8080/api`

## 아키텍처

### 핵심 데이터 흐름

1. **페이지** (`src/pages/`) → **API 레이어** (`src/apis/`) → **백엔드** (포트 8080 Spring Boot)
2. **분석 페이지**는 재사용 가능한 `CarbonAnalysisTemplate` 컴포넌트에 데이터 타입 + 열 설정을 전달하여 렌더링
3. **상태 관리**: React 훅 + sessionStorage (인증을 위해 토큰, 권한 저장)
4. **인증 흐름**: `/login` → sessionStorage 토큰 저장 → `ProtectedRoute`에서 토큰 + 권한 확인 → 페이지 렌더링

### 디렉토리 구조

- `src/pages/` - 페이지 컴포넌트 (라우트)
  - `admin/` - 관리자 관리 페이지 (등록, 데이터 업로드, 기준정보)
  - `Emissions inquiry/` - 다중 뷰 분석 페이지 (연료, 목적, 협력사 등)
  - `dashboard/` - 드래그 가능한 위젯이 있는 그리드 레이아웃 대시보드
  - `activities/` - 활동 조회/관리
- `src/components/` - 재사용 가능한 컴포넌트
  - `analysis/` - `CarbonAnalysisTemplate.tsx` - 분석 페이지 핵심 템플릿
  - `activity/` - 활동 모달 + 리스트 템플릿
  - `common/` - `ExcelUploadModal.tsx` 파일 업로드
- `src/apis/` - Axios 기반 API 클라이언트 함수 (더미 데이터 생성기 포함)
- `src/types/` - TypeScript 인터페이스
- `src/hooks/` - 커스텀 훅 (`useAuth` 권한 기반 접근)
- `src/data/` - `MenuData.ts` 권한 기반 사이드바 네비게이션 정의

### 핵심 컴포넌트

#### CarbonAnalysisTemplate (`src/components/analysis/CarbonAnalysisTemplate.tsx`)

모든 배출량 조회 페이지용 재사용 가능 컴포넌트. Props:

- `title`: 페이지 제목
- `dataType`: `'fuel' | 'purpose' | 'company' | 'supply-type' | 'supply-customer' | 'period'`
- `columns`: 테이블 구조를 정의하는 `AnalysisColumn` 배열
- `hasScopeTabs`: Scope 1/3/총배출량 탭 표시 여부

**사용 예제** (FuelEmissionPage):

```tsx
<CarbonAnalysisTemplate
  title="연료별 탄소 배출량"
  hasScopeTabs={true}
  columns={COLUMNS}
  dataType="fuel"
/>
```

기능: 파이/라인 차트, 정렬/검색이 있는 테이블, 연도/월/스코프 필터, 인쇄/다운로드, 차트 선택 체크박스

#### ProtectedRoute & useAuth

- `useAuth()` - sessionStorage에서 `{ isAuthenticated, role, hasRole() }` 반환
- `<ProtectedRoute requiredRoles={['ADMIN']}>` - 특정 권한이 필요한 라우트 감싸기
- 권한: `SUPERADMIN`, `ADMIN`, `VIEWER`, `GUEST` (권한 없을 시 기본값)

#### 사이드바 네비게이션

- `MenuData.ts`의 `menuItems`는 네비게이션 트리 정의 (중첩 구조)
- 각 메뉴 항목에는 권한 기반 가시성을 위한 `requiredRoles` 배열 있음
- 깊이 1/2 섹션 접기 가능
- 버튼으로 토글; 닫혔을 때 `w-[80px]`로 축소되어 아이콘만 표시

### API 통합 패턴

**더미 데이터 방식**: `src/apis/emissionsApi.ts`는 모든 데이터 타입에 대한 생성기 함수 포함:

```typescript
export const fetchAnalysisData = async (
  dataType: AnalysisDataType,
  year: string,
  month: string,
  scope: ScopeType
): Promise<AnalysisData[]>
```

더미 데이터 생성기: `getPurposeData()`, `getFuelData()`, `getVendorData()`, `getProcessData()`

**실제 API 통합**: 더미 생성기를 axios 호출로 대체. 기본 URL: `/api` (vite.config.ts에서 `http://localhost:8080`로 프록시)

**API 호출 패턴 예제** (registerApi.ts에서):

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const fetchOptions = async (): Promise<OptionsData> => {
  const { data } = await axios.get(`${BASE_URL}/options`);
  return data;
};
```

### 타입 시스템

- `AnalysisData` - `id, name, totalEmission, ratio, [key: string]: any`를 포함하는 핵심 데이터 객체
- `AnalysisColumn` - 테이블 열 정의 (id, header, sortable, format, align)
- `ReductionActivity` - 활동 기록 (날짜, 제목, 내용, 비용, 효과, 이미지URL)
- `ScopeType` - `'total' | 'scope1' | 'scope3' | 'other'`

## 규칙 및 패턴

### 스타일링

- **Tailwind CSS 4** 주요 접근 방식
- `src/styles/commonStyles.ts`의 공통 유틸리티 스타일 (className으로 import하여 사용)
- Tailwind 유틸리티를 사용한 그리드/플렉스 레이아웃
- 대시보드는 `react-grid-layout`을 반응형 브레이크포인트(lg, md, sm, xs, xxs)와 함께 사용

### 상태 관리

- React 훅만 사용 (useState, useEffect, useRef, useMemo)
- 페이지 간 공유되지 않는 경우 로컬 컴포넌트 상태
- 인증 토큰 및 권한 지속성을 위해 sessionStorage 사용
- Redux/Context API 미사용 (의도적인 단순성)

### 폼 패턴

- 모달 기반 폼 (ActivityFormModal은 생성/수정/조회 모드 표시)
- 제출 전 유효성 검사 (날짜 범위, 필수 필드)
- 파일 업로드는 미리보기/저장을 위해 base64 데이터 URL로 변환

### 차트 렌더링

- 시각화를 위한 **Recharts** 라이브러리
- 카테고리 분포용 `PieChart` (연료, 목적 등)
- 월별 추세용 `LineChart`
- `COLORS` 배열의 7색 팔레트
- 상호작용을 위한 Tooltip, Legend, ResponsiveContainer

### 명명 규칙

- 컴포넌트 파일: PascalCase (예: `CarbonAnalysisTemplate.tsx`)
- 훅 파일: `use` 접두사 (예: `useAuth.ts`)
- API 모듈: camelCase + `Api` 접미사 (예: `emissionsApi.ts`)
- 타입 파일: 기능 기반 (예: `analysis.ts`, `activity.ts`)
- 라우트: kebab-case 경로 (예: `/view/period`, `/admin/vehicle/register`)

## 핵심 개발 워크플로우

### 앱 실행

```cmd
npm install                    # 의존성 설치
npm run dev                    # 개발 서버 시작 (http://localhost:5173)
npm run build                  # 프로덕션 빌드
npm run lint                   # ESLint 오류 확인
npm run preview               # 프로덕션 빌드 미리보기
```

### TypeScript & Linting

- tsconfig.json에서 Strict 모드 활성화
- React Hooks 플러그인이 구성된 ESLint
- 커밋 전에 `npm run lint` 실행하여 오류 확인

### 새 분석 페이지 추가

1. `src/pages/Emissions inquiry/NewEmissionPage.tsx`에 페이지 파일 생성
2. 테이블 구조를 정의하는 `AnalysisColumn[]` 배열 정의
3. 적절한 dataType으로 `CarbonAnalysisTemplate` 렌더링
4. `MenuData.ts`에 requiredRoles와 함께 메뉴 항목 추가
5. `App.tsx`에 라우트 추가
6. 실제 데이터의 경우: `emissionsApi.ts` fetch 함수를 백엔드 엔드포인트 호출로 업데이트

### 새 관리자 관리 페이지 추가

1. `src/components/management/`에 컴포넌트 생성 (선택사항: 재사용 가능 테이블 템플릿)
2. `src/pages/admin/`에 페이지 생성
3. 해당하는 경우 CRUD 작업용 `StandardDataManagementTable` 사용
4. 라우트 + 메뉴 항목 + 권한 요구사항 추가
5. `src/apis/`의 API 엔드포인트에 연결 (예: vehicle_manageApi.ts)

### 프록시 설정

개발 서버는 `/api/*` 요청을 `http://localhost:8080`로 프록시합니다 (rewrite는 `/api` 접두사 제거). 예제: `/api/emissions/fuel` → 백엔드의 `/emissions/fuel`

## 주의할 점

1. **인증 토큰 누락**: 브라우저 DevTools의 Application 탭에서 sessionStorage 확인. 토큰은 로그인 중에 설정되어야 합니다.
2. **권한 기반 접근 문제**: ProtectedRoute의 `requiredRoles`이 MenuData.ts의 메뉴 항목 권한과 일치하는지 확인
3. **차트 데이터 형식**: `AnalysisData[]`에 `name` 필드(차트 키로 사용)와 라인 차트용 선택사항 `monthlyTrend` 있는지 확인
4. **정렬 방향**: `sortConfig` 상태에서 'asc'/'desc' 사이 토글 (열 다시 클릭 시 방향 변경 잊지 말기)
5. **스코프 탭 필터링**: selectedScope를 API로 전달; 더미 데이터 생성기는 이미 필터링 로직 처리
6. **회계연도**: 현재 연도 대신 `dateUtils.ts`의 `getBusinessYear()` 사용 (회계연도 로직)

## 테스트 및 디버깅

- 브라우저 DevTools → Application 탭에서 sessionStorage 검사 (토큰, 권한)
- Network 탭에서 API 호출 및 더미 데이터 생성기 작동 확인
- ProtectedRoute에 인증 디버깅을 위한 콘솔 로그 이미 존재
- 차트 렌더링 문제의 경우 Recharts DevTools (이용 가능한 경우)
