//1~12월로 데이터를 바꾸는게 아닌 2~내년1월로 데이터를 바꾸게끔하는 로직

export const getBusinessYear = (): number => {
  const today = new Date();
  const month = today.getMonth(); // 0(1월) ~ 11(12월)
  const year = today.getFullYear();

  // 1월(0)인 경우, 아직 작년 데이터로 취급 (예: 2026년 1월 -> 2025년 데이터)
  if (month === 0) {
    return year - 1;
  }
  return year;
};