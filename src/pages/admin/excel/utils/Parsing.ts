import * as XLSX from "xlsx";

export const normalize = (value: string) =>
  value?.toString().replace(/\s+/g, "").trim();

export const normalizeRow = (row: Record<string, any>) => {
  const normalized: Record<string, any> = {};

  Object.keys(row).forEach((key) => {
    normalized[normalize(key)] = row[key];
  });

  return normalized;
};

export const parseExcelFile = (
  file: File
): Promise<{ rawData: any[]; normalizedData: any[] }> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      reject(new Error("엑셀 파일만 업로드 가능합니다."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);

        // 날짜 파싱은 여기서 결정
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 서버 전송용 (Date 객체 유지됨)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        }) as any[];

        // 화면 표시용
        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        }) as any[];

        const normalizedData = jsonData.map(normalizeRow);

        resolve({ rawData, normalizedData });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsArrayBuffer(file);
  });
};
