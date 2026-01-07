import axiosInstance from "./axiosInstance";

// 1. 이미 업로드된 데이터가 있는지 확인 (중복 체크)
export const checkExcelExistence = async (
  year: string,
  month: string,
  source: "NICE" | "S1"
) => {
  const response = await axiosInstance.get("/admin/excel/check", {
    params: { year, month, source },
  });
  return response.data; // { exists: true/false }
};

// 2. 나이스파크 데이터 유효성 검증 (차량번호 DB 확인)
export const validateNiceParkData = async (data: any[]) => {
  const response = await axiosInstance.post(
    "/admin/excel/is-valid/nicepark",
    data
  );
  return response.data; // Invalid List 반환
};

// 3. 에스원 데이터 유효성 검증 (사원번호 DB 확인)
export const validateS1Data = async (data: any[]) => {
  const response = await axiosInstance.post("/admin/excel/is-valid/s1", data);
  return response.data; // Invalid List 반환
};

// 4. 나이스파크 최종 업로드
export const uploadNiceParkData = async (
  data: any[],
  year: string,
  month: string
) => {
  const response = await axiosInstance.post(
    "/admin/excel/upload/nicepark",
    data,
    {
      params: { year, month },
    }
  );
  return response.data;
};

// 5. 에스원 최종 업로드
export const uploadS1Data = async (
  data: any[],
  year: string,
  month: string
) => {
  const response = await axiosInstance.post("/admin/excel/upload/s1", data, {
    params: { year, month },
  });
  return response.data;
};
