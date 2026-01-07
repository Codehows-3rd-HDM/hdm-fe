import axiosInstance from "./axiosInstance";

// 1. 데이터 검증 (미리보기 전)
export const checkBaseInfoData = async (data: any[]) => {
  const response = await axiosInstance.post(
    "/admin/excel/upload/base-info/check",
    data
  );
  return response.data;
};

// 2. 데이터 최종 업로드 (등록)
export const uploadBaseInfoData = async (data: any[]) => {
  const response = await axiosInstance.post(
    "/admin/excel/upload/base-info",
    data
  );
  return response.data;
};

// 3. 엑셀 다운로드 (Blob 처리)
export const downloadBaseInfoExcel = async () => {
  const response = await axiosInstance.get("/admin/excel/download/base-info", {
    responseType: "blob", // 파일 다운로드 필수 옵션
  });
  return response.data; // Blob 데이터 반환
};
