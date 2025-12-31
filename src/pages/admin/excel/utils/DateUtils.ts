// 1. [S1용] 날짜만 필요할 때 (시간 버림, 날짜 밀림 방지)
export const formatDate = (val: any) => {
  if (!val) return "";

  // 엑셀에서 날짜 객체(Date)로 넘어왔을 때
  if (val instanceof Date) {
    // 시차 보정 (UTC시간을 한국 시간으로 밀어줌)
    // 엑셀(UTC 0시) -> 한국(09시)로 인식되게 만들어서 날짜가 전날로 가는 걸 막음
    const offset = val.getTimezoneOffset() * 60000;
    const dateOffset = new Date(val.getTime() - offset);

    const year = dateOffset.getFullYear();
    const month = String(dateOffset.getMonth() + 1).padStart(2, "0");
    const day = String(dateOffset.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
  // 2. 혹시 문자로 들어오면 (예: "2025/10/29")
  // 최대한 "-"로 맞춰줌
  return String(val).replace(/\//g, "-").trim();
};

// 2. [나이스파크용] 날짜+시간 전부 필요할 때 시간 포맷팅 (HH:mm:ss) (시간 왜곡 절대 방지!)
export const formatTimeOnly = (val: any) => {
  if (!val) return "00:00:00"; // 없으면 0시

  if (val instanceof Date) {
    // 엑셀에서 시간만 있는 셀도 Date 객체(1899년...)로 옴
    // 시차 보정 후 시간 부분만 뚝 떼어냄
    const offset = val.getTimezoneOffset() * 60000;
    const dateOffset = new Date(val.getTime() - offset);

    // "2025-10-29T17:26:20.000Z" -> "17:26:20"
    return dateOffset.toISOString().split("T")[1].split(".")[0];
  }

  // 문자로 오면 그대로 리턴 (혹시 모를 공백 제거)
  return String(val).trim();
};
