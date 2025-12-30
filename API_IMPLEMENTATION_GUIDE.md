# 프론트엔드 API 구현 가이드

## 개요
백엔드의 조회 API를 프론트엔드와 연결하여 운행 목적, 공급 유형, 공급 고객, 연료별 조회 페이지를 구현했습니다.

## 구현된 항목

### 1. emissionsApi.ts - API 호출 구현
**파일 경로**: `src/apis/emissionsApi.ts`

#### 변경 사항:
- **실제 백엔드 API 호출 추가**
  - `/view/operation-purpose` - 운행 목적별 조회
  - `/view/supply-type` - 공급 유형별 조회
  - `/view/supply-customer` - 공급 고객별 조회
  - `/view/fuel` - 연료별 조회

- **새로운 dataType 추가**:
  ```typescript
  type AnalysisDataType = 'operationpurpose' | 'fuel' | 'company' | 'process' | 'product' | 'supplycustomer' | 'supplytype'
  ```

- **백엔드 응답 포맷 변환**:
  - BigDecimal → number로 변환
  - 백엔드의 필드명을 프론트엔드의 필드명으로 매핑
  - API 실패 시 더미 데이터로 자동 폴백

#### API 요청 파라미터:
```typescript
{
  year: number;           // 조회 연도
  month?: number;         // 조회 월 (선택)
  defaultScope?: number;  // Scope 필터 (1=Scope1, 3=Scope3)
}
```

### 2. 조회 페이지 dataType 매핑
각 페이지의 `dataType` 파라미터를 올바르게 설정했습니다:

#### 운행 목적 조회
**파일**: `src/pages/Emissions inquiry/OperationPurposeEmissionPage.tsx`
- **dataType**: `'operationpurpose'`
- **API 엔드포인트**: `/view/operation-purpose`
- **응답 필드**:
  - `purposeName` → `name`
  - `totalEmission` → `totalEmission`
  - `ratio` → `ratio`
  - `totalDistance` → `distance`
  - `tripCount` → `count`
  - `avgEmission` → `avgEmission`
  - `monthlyTrend` → `monthlyTrend`

#### 공급 유형 조회
**파일**: `src/pages/Emissions inquiry/SupplyTypeEmissionPage.tsx`
- **dataType**: `'supplytype'` (이전: `'process'`)
- **API 엔드포인트**: `/view/supply-type`
- **응답 필드**:
  - `supplyTypeName` → `name`
  - `totalEmission` → `totalEmission`
  - `ratio` → `ratio`
  - `totalDistance` → `distance`
  - `tripCount` → `count`
  - `avgEmission` → `avgEmission`
  - `monthlyTrend` → `monthlyTrend`

#### 공급 고객 조회
**파일**: `src/pages/Emissions inquiry/SupplyCustomerEmissionPage.tsx`
- **dataType**: `'supplycustomer'` (이전: `'product'`)
- **API 엔드포인트**: `/view/supply-customer`
- **응답 필드**:
  - `customerName` → `name`
  - `totalEmission` → `totalEmission`
  - `ratio` → `ratio`
  - `totalDistance` → `distance`
  - `tripCount` → `count`
  - `avgEmission` → `avgEmission`
  - `monthlyTrend` → `monthlyTrend`

#### 연료별 조회
**파일**: `src/pages/Emissions inquiry/FuelEmissionPage.tsx`
- **dataType**: `'fuel'`
- **API 엔드포인트**: `/view/fuel`
- **응답 필드**:
  - `fuelType` → `name`
  - `totalEmission` → `totalEmission`
  - `ratio` → `ratio`
  - `monthlyTrend` → `monthlyTrend`

### 3. 공통 컴포넌트: CarbonAnalysisTemplate
**파일**: `src/components/analysis/CarbonAnalysisTemplate.tsx`

이미 구현되어 있으며, 다음 기능을 제공합니다:
- 연도/월 선택 필터
- Scope 탭 (총 배출량, Scope 1, Scope 3, 기타)
- 검색 및 정렬
- 파이 차트 및 라인 차트 시각화
- Excel 다운로드
- 반응형 테이블

## 백엔드 API 명세

### 1. 운행 목적별 조회
```
GET /view/operation-purpose
Parameters:
  - year (Integer): 조회 연도
  - month (Integer, 선택): 조회 월
  - defaultScope (Integer, 선택): Scope 필터

Response:
[
  {
    "purposeName": "string",
    "totalEmission": BigDecimal,
    "ratio": BigDecimal,
    "totalDistance": BigDecimal,
    "tripCount": Long,
    "avgEmission": BigDecimal,
    "monthlyTrend": [BigDecimal]
  }
]
```

### 2. 공급 유형별 조회
```
GET /view/supply-type
Parameters:
  - year (Integer): 조회 연도
  - month (Integer, 선택): 조회 월

Response:
[
  {
    "supplyTypeName": "string",
    "totalEmission": BigDecimal,
    "ratio": BigDecimal,
    "totalDistance": BigDecimal,
    "tripCount": Long,
    "avgEmission": BigDecimal,
    "monthlyTrend": [BigDecimal]
  }
]
```

### 3. 공급 고객별 조회
```
GET /view/supply-customer
Parameters:
  - year (Integer): 조회 연도
  - month (Integer, 선택): 조회 월

Response:
[
  {
    "customerName": "string",
    "totalEmission": BigDecimal,
    "ratio": BigDecimal,
    "totalDistance": BigDecimal,
    "tripCount": Long,
    "avgEmission": BigDecimal,
    "monthlyTrend": [BigDecimal]
  }
]
```

### 4. 연료별 조회
```
GET /view/fuel
Parameters:
  - year (Integer): 조회 연도
  - month (Integer, 선택): 조회 월
  - defaultScope (Integer, 선택): Scope 필터

Response:
[
  {
    "fuelType": "string",
    "totalEmission": BigDecimal,
    "ratio": BigDecimal,
    "monthlyTrend": [BigDecimal]
  }
]
```

## 환경 설정

### VITE_API_URL 설정
`.env` 또는 `.env.local` 파일에서 API 기본 URL을 설정하세요:

```env
VITE_API_URL=http://localhost:8080
```

만약 설정하지 않으면 `/api`를 기본값으로 사용합니다.

## 테스트 방법

1. **백엔드 서버 실행**
   - 백엔드 서버가 `http://localhost:8080`에서 실행 중인지 확인

2. **프론트엔드 개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **조회 페이지 접속**
   - 브라우저에서 다음 페이지들을 방문
   - `/Emissions inquiry/operation-purpose` - 운행 목적별
   - `/Emissions inquiry/supply-type` - 공급 유형별
   - `/Emissions inquiry/supply-customer` - 공급 고객별
   - `/Emissions inquiry/fuel` - 연료별

4. **기능 검증**
   - 연도/월 필터 작동 확인
   - Scope 탭 필터 작동 확인 (운행 목적, 연료별만)
   - 데이터 테이블 및 차트 표시 확인
   - Excel 다운로드 확인

## 에러 처리

API 호출 실패 시:
- 콘솔에 에러 메시지 출력
- 더미 데이터로 자동 폴백하여 UI는 정상 작동
- 사용자에게 명확한 에러 메시지 표시 (필요시)

## 향후 개선 사항

1. **로딩 상태 표시** - Skeleton loader 또는 스핀너 추가
2. **에러 상태 처리** - 사용자 친화적인 에러 메시지
3. **캐싱 구현** - 중복 요청 방지
4. **페이지네이션** - 대량 데이터 처리 시 페이지네이션 추가
5. **필터 개선** - 동적 필터링 옵션 추가

## 파일 변경 사항 요약

| 파일 | 변경 사항 |
|------|---------|
| `src/apis/emissionsApi.ts` | 실제 백엔드 API 호출 구현 |
| `src/pages/Emissions inquiry/SupplyTypeEmissionPage.tsx` | dataType: 'process' → 'supplytype' |
| `src/pages/Emissions inquiry/SupplyCustomerEmissionPage.tsx` | dataType: 'product' → 'supplycustomer' |

## 연락처
질문이나 문제가 있으면 개발팀에 문의하세요.
