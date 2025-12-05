# HDM 프론트 설명

## src 폴더 구조 설명

---

파일 뒤에 o 테일윈드 전환 api - api 분리 완료

src

ㄴapis

    ㄴemissions.ts (조회 페이지 api)

    ㄴvehicle_manage.ts (차량 기본 정보 관리 페이지 api)

ㄴcomponents (공통 구성 요소)

      ㄴactivity

        ㄴActivityFormModal.tsx(저감 활동 기록 등록/상세 조회/삭제 모달) o

        ㄴActivityListTemplate.tsx(저감 활동 기록 조회 템플릿) o

      ㄴanalysis

        ㄴCarbonAnalysisTemplate.tsx (탄소 배출량 조회 템플릿) o api

      ㄴcommon

        ㄴExcelUploadModal.tsx (액셀 업로드 모달) o

      ㄴmanagement

        ㄴStandardDataManagementTable.tsx (기준정보 관리 페이지 템플릿) o api

      ㄴSidebar.tsx (사이드바) o

ㄴdata

    ㄴMenuData.ts(사이드바에 들어갈 메뉴들 data)

ㄴpages

    ㄴactivities (저감활동)

      ㄴActivityInquiryPage.tsx(저감 활동 조회)

    ㄴadmin (관리자)

      ㄴActivityManagementPage.tsx(저감 활동 관리)

      ㄴCarModelManagementPage.tsx (차종 및 연비 기준정보 관리)

      ㄴCompanyManagementPage.tsx (업체명 및 주소지 기준정보 관리)

      ㄴDataUploadPage.tsx (나이스파크, 에스원 데이터 업로드) o

      ㄴProcessManagementPage.tsx (생산 공정 기준정보 관리)

      ㄴProductManagementPage.tsx (생산 품목 구분 기준정보 관리)

      ㄴPurposeManagementPage.tsx (운행 목적 기준정보 관리)

      ㄴRegisterPage.tsx (계정 생성) o

      ㄴVehicleManagementPage.tsx (출입 차량 기준정보 관리)

      ㄴVehicleRegisterPage.tsx (등록 페이지 6) o

    ㄴdashboard (대시보드) o

      ㄴDashboardPage.tsx (위젯을 부르는 대시보드)

      ㄴDashboardWidgets.tsx (대시보드 각 영역 위젯 구)

    ㄴEmissions inquiry (배출량 조회)

      ㄴCompanyEmissionPage.tsx (납품 업체별 탄소 배출)

      ㄴFuelEmissionPage.tsx (연료별 탄소 배출)

      ㄴOperationPurposeEmissionPage.tsx (운행 목적별 탄소 배출)

      ㄴPeriodEmissionPage.tsx(기간별 탄소 배출) o

      ㄴProcessEmissionPage.tsx (생산 공정별 탄소 배출)

      ㄴProductEmissionPage.tsx (생산품목 구분별 탄소 배출)

      ㄴTargetComparisonPage.tsx (목표 대비 탄소 배출) o

    ㄴLoginPage.tsx (로그인) o

ㄴstyles (스타일)

    ㄴcommonStyles.ts(공통 스타일)

ㄴtypes (인터페이스 타입정의)

    ㄴactivity.ts (저감 활동)

    ㄴanalysis.ts (탄소 배출량 조회)

    ㄴdata.ts (기준정보 등록)

ㄴutils

    ㄴdateUtils.ts (1~12월로 데이터를 바꾸는게 아닌 2~내년1월로 데이터를 바꾸게 끔하는 로직)

ㄴApp.css o

ㄴApp.tsx o

ㄴindex.css o

ㄴmain.tsx o
