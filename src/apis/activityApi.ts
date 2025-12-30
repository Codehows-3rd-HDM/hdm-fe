import axios from "axios";
import type { ReductionActivity } from "../types/activity";

// axios 인스턴스 (인증용)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// 요청 인터셉터: 토큰이 있으면 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const createActivity = async (
  data: ReductionActivity,
  files: File[] = []
): Promise<ReductionActivity> => {
  try {
    const form = new FormData();

    files.forEach((file) => form.append("files", file));

    // form.append("startDate", data.startDate);
    // form.append("endDate", data.endDate);
    // form.append("title", data.title);
    // form.append("content", data.content);
    // form.append("cost", String(data.cost));
    // form.append("effect", data.effect);

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });

    // form.append(
    //   "data",
    //   new Blob([JSON.stringify(data)], { type: "application/json" })
    // );

    const response = await axiosInstance.post("/activity/create", form);
    return response.data;
  } catch (error) {
    console.error("Create Activity API Error:", error);
    throw error;
  }
};
