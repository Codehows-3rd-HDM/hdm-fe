import { formatDate, formatTimeOnly } from "../../excel/utils/DateUtils";

// 나이스파크 변환 규칙
export const mapToNiceParkData = (data: any[]) => {
  let idx = 1;
  return data
    .map((row) => ({
      idx: idx++,
      carNumber: row["차량번호"],
      accessDate: formatDate(row["입차일자"]), // dateUtils 사용
      accessTime: formatTimeOnly(row["입차시간"]), // dateUtils 사용
      isInvalid: false,
    }))
    .filter((item) => item.carNumber && item.accessDate);
};

// 에스원 변환 규칙
export const mapToS1Data = (data: any[]) => {
  let idx = 1;
  return data
    .map((row) => ({
      idx: idx++,
      memberId: row["사원번호"],
      employeeName: row["이름"],
      accessDate: formatDate(row["근무일자"]),
      isInvalid: false,
    }))
    .filter((item) => item.memberId && item.accessDate);
};

// [추가] 강력한 문자열 청소 함수
// 1. null, undefined -> 빈 문자열("")로 변환
// 2. String()으로 강제 형변환
// 3. \u00A0 (Non-breaking space, 특수공백) -> 일반 공백으로 치환
// 4. \n, \t (줄바꿈, 탭) -> 공백으로 치환
// 5. trim()으로 앞뒤 공백 제거
const cleanString = (val: any): string => {
  if (val === undefined || val === null) return "";
  return String(val)
    .replace(/\u00A0/g, " ") // 특수 공백 제거 (제일 중요!)
    .replace(/\u200B/g, "")
    .replace(/[\r\n\t]/g, " ") // 엔터, 탭 제거
    .replace(/\s+/g, " ") // 연속된 공백을 하나로 (선택 사항)
    .trim();
};

export const mapToBaseInfoData = (data: any[]) => {
  return data.map((row) => ({
    // ✅ 모든 문자열 필드에 cleanString 적용
    purposeName: cleanString(row["운행목적"]),
    scope: cleanString(row["Scope"] || "4"), // scope는 기본값 주의
    fuelName: cleanString(row["연료종류"]),

    emissionFactor: row["탄소배출계수"] ?? 0, // 숫자는 그대로

    companyName: cleanString(row["업체"]),
    address: cleanString(row["주소"]), // 주소에 엔터나 특수공백 많음
    supplyTypeName: cleanString(row["공급유형"]),
    supplyCustomerName: cleanString(row["공급고객"]),

    distanceInput: row["편도거리(km)"] ?? 0,

    bigCategory: cleanString(row["차종구분(대분류)"]),
    smallCategory: cleanString(row["차종구분(소분류)"]),

    // 연비는 숫자지만 엑셀 서식 때문에 문자로 올 때가 있어서 처리
    efficiency: row["연비(ℓ/km)"] ?? 0,

    carNumber: cleanString(row["차량번호"]), // 차량번호 공백 절대 금지
    carModelName: cleanString(row["차종"]),
    driverMemberId: cleanString(row["사원번호"]),
    calcBaseDate: row.calcBaseDate || "",
  }));
};
