# 추가 관리 페이지 API 구현 가이드

## 개요
운행 목적, 공급 유형, 공급 고객의 관리 페이지(등록, 수정, 삭제)용 API를 구현했습니다.

## 생성된 API 파일

### 1. operationPurposeApi.ts
**경로**: `src/apis/operationPurposeApi.ts`

**제공 함수**:
```typescript
// 목록 조회 (페이지네이션)
fetchOperationPurposes(purposeName?, defaultScope?, keyword?, page, size)

// 단일 조회
fetchOperationPurpose(id)

// 등록
createOperationPurpose(data)

// 단일 수정
updateOperationPurpose(id, data)

// 다중 수정
updateOperationPurposesMultiple(dataList)

// 단일 삭제
deleteOperationPurpose(id)

// 다중 삭제
deleteOperationPurposesMultiple(ids)
```

### 2. supplyTypeApi.ts
**경로**: `src/apis/supplyTypeApi.ts`

**제공 함수**:
```typescript
// 목록 조회 (페이지네이션)
fetchSupplyTypes(supplyTypeName?, page, size)

// 단일 조회
fetchSupplyType(id)

// 등록
createSupplyType(data)

// 단일 수정
updateSupplyType(id, data)

// 다중 수정
updateSupplyTypesMultiple(dataList)

// 단일 삭제
deleteSupplyType(id)

// 다중 삭제
deleteSupplyTypesMultiple(ids)
```

### 3. supplyCustomerApi.ts
**경로**: `src/apis/supplyCustomerApi.ts`

**제공 함수**:
```typescript
// 목록 조회 (페이지네이션)
fetchSupplyCustomers(customerName?, page, size)

// 단일 조회
fetchSupplyCustomer(id)

// 등록
createSupplyCustomer(data)

// 단일 수정
updateSupplyCustomer(id, data)

// 다중 수정
updateSupplyCustomersMultiple(dataList)

// 단일 삭제
deleteSupplyCustomer(id)

// 다중 삭제
deleteSupplyCustomersMultiple(ids)
```

## 백엔드 API 명세

### 운행 목적 관리 API

#### 목록 조회 (페이지네이션)
```
GET /admin/operation-purpose/search
Parameters:
  - purposeName (String, 선택): 운행 목적명
  - defaultScope (Integer, 선택): 기본 범위
  - keyword (String, 선택): 검색 키워드
  - page (Integer, 기본값: 0): 페이지 번호
  - size (Integer, 기본값: 15): 페이지 크기

Response: Page<OperationPurposeResponseDto>
{
  "content": [
    {
      "id": 1,
      "purposeName": "string",
      "defaultScope": number,
      "createdAt": "2025-12-29T...",
      "updatedAt": "2025-12-29T..."
    }
  ],
  "totalElements": number,
  "totalPages": number,
  "size": number,
  "number": number
}
```

#### 등록
```
POST /admin/operation-purpose
Request Body:
{
  "purposeName": "string",
  "defaultScope": number (선택)
}

Response: OperationPurposeResponseDto
```

#### 수정
```
PUT /admin/operation-purpose/{id}
Request Body:
{
  "purposeName": "string",
  "defaultScope": number (선택)
}

Response: OperationPurposeResponseDto
```

#### 다중 수정
```
PATCH /admin/operation-purpose/bulk
Request Body:
[
  {
    "purposeName": "string",
    "defaultScope": number (선택)
  }
]

Response: List<OperationPurposeResponseDto>
```

#### 삭제
```
DELETE /admin/operation-purpose/{id}
Response: 204 No Content
```

#### 다중 삭제
```
DELETE /admin/operation-purpose
Request Body: [1, 2, 3]
Response: 204 No Content
```

### 공급 유형 관리 API

#### 목록 조회 (페이지네이션)
```
GET /admin/supply-type/search
Parameters:
  - supplyTypeName (String, 선택): 공급 유형명
  - page (Integer, 기본값: 0): 페이지 번호
  - size (Integer, 기본값: 15): 페이지 크기

Response: Page<SupplyTypeResponseDto>
```

#### 등록
```
POST /admin/supply-type
Request Body:
{
  "supplyTypeName": "string"
}

Response: SupplyTypeResponseDto
```

#### 수정
```
PUT /admin/supply-type/{id}
Request Body:
{
  "supplyTypeName": "string"
}

Response: SupplyTypeResponseDto
```

#### 다중 수정
```
PATCH /admin/supply-type/bulk
Request Body:
[
  {
    "supplyTypeName": "string"
  }
]

Response: List<SupplyTypeResponseDto>
```

#### 삭제
```
DELETE /admin/supply-type/{id}
Response: 204 No Content
```

#### 다중 삭제
```
DELETE /admin/supply-type
Request Body: [1, 2, 3]
Response: 204 No Content
```

### 공급 고객 관리 API

#### 목록 조회 (페이지네이션)
```
GET /admin/supply-customer/search
Parameters:
  - customerName (String, 선택): 공급 고객명
  - page (Integer, 기본값: 0): 페이지 번호
  - size (Integer, 기본값: 15): 페이지 크기

Response: Page<SupplyCustomerResponseDto>
```

#### 등록
```
POST /admin/supply-customer
Request Body:
{
  "customerName": "string"
}

Response: SupplyCustomerResponseDto
```

#### 수정
```
PUT /admin/supply-customer/{id}
Request Body:
{
  "customerName": "string"
}

Response: SupplyCustomerResponseDto
```

#### 다중 수정
```
PATCH /admin/supply-customer/bulk
Request Body:
[
  {
    "customerName": "string"
  }
]

Response: List<SupplyCustomerResponseDto>
```

#### 삭제
```
DELETE /admin/supply-customer/{id}
Response: 204 No Content
```

#### 다중 삭제
```
DELETE /admin/supply-customer
Request Body: [1, 2, 3]
Response: 204 No Content
```

## 사용 예시

### 운행 목적 데이터 조회
```typescript
import { fetchOperationPurposes } from '@/apis/operationPurposeApi';

const handleFetch = async () => {
  try {
    const data = await fetchOperationPurposes(
      undefined,  // purposeName
      undefined,  // defaultScope
      undefined,  // keyword
      0,          // page
      15          // size
    );
    console.log(data.content); // 목록
    console.log(data.totalElements); // 전체 개수
  } catch (error) {
    console.error('조회 실패:', error);
  }
};
```

### 운행 목적 등록
```typescript
import { createOperationPurpose } from '@/apis/operationPurposeApi';

const handleCreate = async () => {
  try {
    const response = await createOperationPurpose({
      purposeName: '출퇴근',
      defaultScope: 1
    });
    console.log('등록 성공:', response);
  } catch (error) {
    console.error('등록 실패:', error);
  }
};
```

### 운행 목적 수정
```typescript
import { updateOperationPurpose } from '@/apis/operationPurposeApi';

const handleUpdate = async (id: number) => {
  try {
    const response = await updateOperationPurpose(id, {
      purposeName: '출퇴근 (수정됨)',
      defaultScope: 3
    });
    console.log('수정 성공:', response);
  } catch (error) {
    console.error('수정 실패:', error);
  }
};
```

### 운행 목적 삭제
```typescript
import { deleteOperationPurpose } from '@/apis/operationPurposeApi';

const handleDelete = async (id: number) => {
  try {
    await deleteOperationPurpose(id);
    console.log('삭제 성공');
  } catch (error) {
    console.error('삭제 실패:', error);
  }
};
```

### 다중 삭제
```typescript
import { deleteOperationPurposesMultiple } from '@/apis/operationPurposeApi';

const handleMultiDelete = async (ids: number[]) => {
  try {
    await deleteOperationPurposesMultiple(ids);
    console.log('다중 삭제 성공');
  } catch (error) {
    console.error('다중 삭제 실패:', error);
  }
};
```

## 관리 페이지에서 사용

기존 관리 페이지들에서 이 API를 사용하려면:

### OperationPurposeManagementPage.tsx
```typescript
import { 
  fetchOperationPurposes, 
  createOperationPurpose,
  updateOperationPurpose,
  deleteOperationPurpose,
  deleteOperationPurposesMultiple
} from '@/apis/operationPurposeApi';

// 목록 조회 로직
// 등록 로직
// 수정 로직
// 삭제 로직
```

### SupplyTypeManagementPage.tsx
```typescript
import { 
  fetchSupplyTypes, 
  createSupplyType,
  updateSupplyType,
  deleteSupplyType,
  deleteSupplyTypesMultiple
} from '@/apis/supplyTypeApi';
```

### SupplyCustomerManagementPage.tsx
```typescript
import { 
  fetchSupplyCustomers, 
  createSupplyCustomer,
  updateSupplyCustomer,
  deleteSupplyCustomer,
  deleteSupplyCustomersMultiple
} from '@/apis/supplyCustomerApi';
```

## 에러 처리

모든 API 함수는 에러 발생 시 예외를 throw합니다.
관리 페이지에서는 다음과 같이 처리하세요:

```typescript
try {
  const data = await fetchOperationPurposes();
  // 성공 처리
} catch (error) {
  if (error.response?.status === 400) {
    console.error('잘못된 요청:', error.response.data);
  } else if (error.response?.status === 401) {
    console.error('인증 실패:', error);
  } else if (error.response?.status === 404) {
    console.error('리소스를 찾을 수 없음:', error);
  } else {
    console.error('요청 실패:', error);
  }
}
```

## 주의사항

1. **페이지네이션**: 모든 목록 조회는 페이지네이션을 지원합니다 (기본 15개)
2. **검색**: 검색 조건은 선택사항입니다 (undefined 전달 시 모든 데이터 반환)
3. **토큰**: axios 인스턴스에서 자동으로 Authorization 헤더 추가
4. **에러**: HTTP 에러는 자동으로 throw됩니다

## 향후 개선

1. 낙관적 업데이트 (Optimistic Update)
2. 요청 취소 (Request Cancellation)
3. 재시도 로직 (Retry Logic)
4. 요청 캐싱 (Request Caching)
