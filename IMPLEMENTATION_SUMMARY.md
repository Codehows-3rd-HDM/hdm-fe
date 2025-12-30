# 백엔드 조회 API 프론트엔드 연결 - 완료 보고서

## 📋 프로젝트 개요

백엔드에서 구현된 4가지 조회 페이지(운행 목적, 공급 유형, 공급 고객, 연료별)의 API를 프론트엔드와 연결하고, 관리 페이지용 API도 함께 구현했습니다.

---

## ✅ 완료된 작업

### 1️⃣ 조회 페이지 API 연결

#### 대상 API 엔드포인트
| 페이지 | 엔드포인트 | 파일 |
|--------|-----------|------|
| 운행 목적별 | `GET /view/operation-purpose` | `OperationPurposeEmissionPage.tsx` |
| 공급 유형별 | `GET /view/supply-type` | `SupplyTypeEmissionPage.tsx` |
| 공급 고객별 | `GET /view/supply-customer` | `SupplyCustomerEmissionPage.tsx` |
| 연료별 | `GET /view/fuel` | `FuelEmissionPage.tsx` |

#### 구현 내용
- ✅ `emissionsApi.ts` 에서 실제 백엔드 API 호출 구현
- ✅ BigDecimal → number 타입 변환
- ✅ 백엔드 응답 필드명을 프론트엔드 필드명으로 매핑
- ✅ API 실패 시 더미 데이터로 자동 폴백
- ✅ 연도(year), 월(month), Scope(defaultScope) 필터 지원

#### 응답 데이터 매핑
```typescript
// 백엔드 응답 → 프론트엔드 데이터
{
  purposeName → name
  totalEmission → totalEmission (BigDecimal → number)
  ratio → ratio
  totalDistance → distance
  tripCount → count
  avgEmission → avgEmission
  monthlyTrend → monthlyTrend (배열)
}
```

### 2️⃣ 페이지별 dataType 올바르게 설정

| 페이지 | 이전 | 변경 후 | API |
|--------|------|---------|-----|
| OperationPurposeEmissionPage | `operationpurpose` | `operationpurpose` | `/view/operation-purpose` |
| SupplyTypeEmissionPage | `process` | `supplytype` | `/view/supply-type` |
| SupplyCustomerEmissionPage | `product` | `supplycustomer` | `/view/supply-customer` |
| FuelEmissionPage | `fuel` | `fuel` | `/view/fuel` |

### 3️⃣ 관리 페이지용 API 파일 생성

#### 생성된 파일
1. **`operationPurposeApi.ts`** - 운행 목적 관리 API
2. **`supplyTypeApi.ts`** - 공급 유형 관리 API
3. **`supplyCustomerApi.ts`** - 공급 고객 관리 API

#### 제공 함수 (각 API마다 동일한 구조)
```typescript
// 조회 (페이지네이션)
fetch[Entity]s(filterParams?, page, size)

// 단일 조회
fetch[Entity](id)

// 등록
create[Entity](data)

// 수정
update[Entity](id, data)

// 다중 수정
update[Entity]sMultiple(dataList)

// 삭제
delete[Entity](id)

// 다중 삭제
delete[Entity]sMultiple(ids)
```

### 4️⃣ 문서화

#### 생성된 문서
1. **`API_IMPLEMENTATION_GUIDE.md`**
   - 조회 페이지 API 상세 명세
   - 구현 방법
   - 테스트 방법
   - 환경 설정

2. **`MANAGEMENT_API_GUIDE.md`**
   - 관리 페이지 API 상세 명세
   - 사용 예시
   - 에러 처리
   - 통합 가이드

---

## 🎯 백엔드 API 명세 (요약)

### 조회 API (View 엔드포인트)

#### 1. 운행 목적별 조회
```
GET /view/operation-purpose
Parameters: year, month, defaultScope
Response: List<{
  purposeName, totalEmission, ratio, totalDistance, 
  tripCount, avgEmission, monthlyTrend
}>
```

#### 2. 공급 유형별 조회
```
GET /view/supply-type
Parameters: year, month
Response: List<{
  supplyTypeName, totalEmission, ratio, totalDistance,
  tripCount, avgEmission, monthlyTrend
}>
```

#### 3. 공급 고객별 조회
```
GET /view/supply-customer
Parameters: year, month
Response: List<{
  customerName, totalEmission, ratio, totalDistance,
  tripCount, avgEmission, monthlyTrend
}>
```

#### 4. 연료별 조회
```
GET /view/fuel
Parameters: year, month, defaultScope
Response: List<{
  fuelType, totalEmission, ratio, monthlyTrend
}>
```

### 관리 API (Admin 엔드포인트)

#### 운행 목적
- `GET /admin/operation-purpose/search` - 목록 조회
- `POST /admin/operation-purpose` - 등록
- `PUT /admin/operation-purpose/{id}` - 수정
- `PATCH /admin/operation-purpose/bulk` - 다중 수정
- `DELETE /admin/operation-purpose/{id}` - 삭제
- `DELETE /admin/operation-purpose` - 다중 삭제

#### 공급 유형
- `GET /admin/supply-type/search` - 목록 조회
- `POST /admin/supply-type` - 등록
- `PUT /admin/supply-type/{id}` - 수정
- `PATCH /admin/supply-type/bulk` - 다중 수정
- `DELETE /admin/supply-type/{id}` - 삭제
- `DELETE /admin/supply-type` - 다중 삭제

#### 공급 고객
- `GET /admin/supply-customer/search` - 목록 조회
- `POST /admin/supply-customer` - 등록
- `PUT /admin/supply-customer/{id}` - 수정
- `PATCH /admin/supply-customer/bulk` - 다중 수정
- `DELETE /admin/supply-customer/{id}` - 삭제
- `DELETE /admin/supply-customer` - 다중 삭제

---

## 📁 수정/생성된 파일 목록

### 수정된 파일
```
src/apis/emissionsApi.ts
  - 백엔드 API 호출 로직 추가
  - 응답 데이터 변환 로직 추가
  - 에러 폴백 로직 추가

src/pages/Emissions inquiry/SupplyTypeEmissionPage.tsx
  - dataType: 'process' → 'supplytype'

src/pages/Emissions inquiry/SupplyCustomerEmissionPage.tsx
  - dataType: 'product' → 'supplycustomer'
```

### 생성된 파일
```
src/apis/operationPurposeApi.ts
  - 운행 목적 관리 API

src/apis/supplyTypeApi.ts
  - 공급 유형 관리 API

src/apis/supplyCustomerApi.ts
  - 공급 고객 관리 API

API_IMPLEMENTATION_GUIDE.md
  - 조회 페이지 구현 가이드

MANAGEMENT_API_GUIDE.md
  - 관리 페이지 API 가이드
```

---

## 🚀 사용 방법

### 1. 조회 페이지 사용
프론트엔드는 자동으로 백엔드 API를 호출합니다:

```typescript
// CarbonAnalysisTemplate에서 자동으로 호출
fetchAnalysisData(
  'operationpurpose',  // dataType
  '2025',              // year
  'all',               // month
  'total'              // scope
)
```

### 2. 관리 페이지에서 사용
```typescript
import { 
  fetchOperationPurposes, 
  createOperationPurpose,
  deleteOperationPurpose 
} from '@/apis/operationPurposeApi';

// 목록 조회
const data = await fetchOperationPurposes(undefined, undefined, undefined, 0, 15);

// 등록
const newItem = await createOperationPurpose({ purposeName: '출퇴근' });

// 삭제
await deleteOperationPurpose(id);
```

---

## ⚙️ 환경 설정

### .env 파일
```env
VITE_API_URL=http://localhost:8080
```

기본값: `/api`

---

## 🧪 테스트 방법

### 필수 사항
1. ✅ 백엔드 서버 실행 (http://localhost:8080)
2. ✅ 프론트엔드 개발 서버 실행 (npm run dev)

### 테스트 단계

#### 1단계: 조회 페이지 테스트
```bash
# 각 페이지에서 확인
/Emissions inquiry/operation-purpose
/Emissions inquiry/supply-type
/Emissions inquiry/supply-customer
/Emissions inquiry/fuel
```

테스트 항목:
- [ ] 데이터 로드 확인
- [ ] 연도 필터 작동 확인
- [ ] 월 필터 작동 확인
- [ ] Scope 탭 필터 작동 (운행 목적, 연료별)
- [ ] 테이블 데이터 표시 확인
- [ ] 파이 차트 표시 확인
- [ ] 라인 차트 표시 확인
- [ ] Excel 다운로드 확인

#### 2단계: 관리 페이지 테스트
```bash
# 각 관리 페이지에서 확인
/admin/operation-purpose
/admin/supply-type
/admin/supply-customer
```

테스트 항목:
- [ ] 목록 조회 확인
- [ ] 검색 기능 확인
- [ ] 등록 기능 확인
- [ ] 수정 기능 확인
- [ ] 삭제 기능 확인
- [ ] 페이지네이션 확인

#### 3단계: 에러 처리 테스트
- [ ] 백엔드 서버 종료 후 폴백 데이터 표시 확인
- [ ] 네트워크 오류 시 에러 메시지 확인 (콘솔)

---

## 🔍 주요 구현 특징

### 1. 자동 타입 변환
```typescript
// BigDecimal 타입을 JavaScript number로 자동 변환
parseFloat(String(item.totalEmission))
```

### 2. 에러 폴백
API 실패 시 더미 데이터를 사용하여 UI는 정상 작동:
```typescript
catch (error) {
  console.error('API 호출 실패:', error);
  return getOperationPurposeData(); // 더미 데이터
}
```

### 3. 유연한 필터
선택적 파라미터로 필터 조건을 유연하게 설정:
```typescript
{
  year: 2025,           // 필수
  month: undefined,     // 선택 (전월 조회)
  defaultScope: 1       // 선택 (Scope 1만 조회)
}
```

---

## 📊 응답 데이터 예시

### 운행 목적별 조회 응답
```json
[
  {
    "purposeName": "출퇴근",
    "totalEmission": 20000.5,
    "ratio": 50.25,
    "totalDistance": 15000.5,
    "tripCount": 125,
    "avgEmission": 160.0,
    "monthlyTrend": [1500, 1600, 1550, 1700, ...]
  }
]
```

### 연료별 조회 응답
```json
[
  {
    "fuelType": "GASOLINE",
    "totalEmission": 15000.0,
    "ratio": 40.5,
    "monthlyTrend": [1250, 1250, 1250, ...]
  }
]
```

---

## ⚠️ 주의사항

1. **CORS 설정**: 백엔드에서 프론트엔드 도메인에 대해 CORS를 허용해야 함
2. **토큰 관리**: axios 인스턴스에서 자동으로 토큰을 추가하므로 사전 로그인 필수
3. **페이지네이션**: 관리 API는 기본 15개씩 페이지네이션 (설정 가능)
4. **날짜 포맷**: 년도와 월은 숫자로 전달 (예: year=2025, month=1)

---

## 🎓 API 호출 흐름도

```
User Action
    ↓
CarbonAnalysisTemplate (연도/월/Scope 선택)
    ↓
fetchAnalysisData() 호출
    ↓
emissionsApi.ts (데이터 타입별 API 호출)
    ↓
axiosInstance.get() (HTTP 요청)
    ↓
Backend API (/view/...)
    ↓
Response (List<BackendDto>)
    ↓
데이터 변환 (필드명 매핑, 타입 변환)
    ↓
AnalysisData[] 반환
    ↓
컴포넌트 state 업데이트
    ↓
UI 렌더링 (테이블, 차트)
```

---

## 📞 지원 및 문제 해결

### 일반적인 문제

#### 1. "Cannot GET /view/operation-purpose"
**원인**: 백엔드 서버가 실행 중이지 않음
**해결**: 백엔드 서버 시작 (http://localhost:8080)

#### 2. API 응답이 없고 더미 데이터만 표시됨
**원인**: API 호출 실패 또는 네트워크 오류
**해결**: 
- 브라우저 개발 도구 콘솔 확인
- 네트워크 탭에서 HTTP 요청 상태 확인
- 백엔드 로그 확인

#### 3. "401 Unauthorized" 에러
**원인**: 토큰이 없거나 만료됨
**해결**: 로그인 페이지에서 새로 로그인

---

## 🔄 다음 단계

### 선택사항
1. **관리 페이지 UI 구현**
   - operationPurposeApi.ts를 사용하여 OperationPurposeManagementPage 업데이트
   - supplyTypeApi.ts를 사용하여 SupplyTypeManagementPage 업데이트
   - supplyCustomerApi.ts를 사용하여 SupplyCustomerManagementPage 업데이트

2. **성능 최적화**
   - API 응답 캐싱
   - 요청 디바운싱
   - 낙관적 업데이트

3. **UX 개선**
   - 로딩 스피너 추가
   - 에러 토스트 메시지
   - 성공 알림

---

## 📝 라이선스 및 개발자 정보

**개발 일시**: 2025년 12월 29일
**프로젝트**: 3M-BMS (HDM)
**담당**: 프론트엔드 개발팀

---

## ✨ 완료!

모든 조회 페이지와 관리 페이지 API가 백엔드와 연결되었습니다.
문서를 참고하여 필요한 기능을 구현하세요.

**필독 문서**:
- `API_IMPLEMENTATION_GUIDE.md` - 조회 페이지 가이드
- `MANAGEMENT_API_GUIDE.md` - 관리 페이지 가이드
