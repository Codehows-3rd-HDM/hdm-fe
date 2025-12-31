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

const toAbsoluteUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const envBase = import.meta.env.VITE_API_URL;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // 사진 리소스는 백엔드(origin) 기준으로 처리
  if (url.startsWith("/photos/")) {
    if (envBase && envBase.startsWith("http")) {
      try {
        const api = new URL(envBase);
        return `${api.origin}${url}`;
      } catch {
        return url;
      }
    }
    // Vite 개발환경에서 /photos 프록시 사용 → 상대경로 그대로 둠
    return url;
  }

  // 그 외 API 응답 상대경로 처리
  const base = envBase
    ? envBase.startsWith("http")
      ? envBase
      : `${origin}${envBase}`
    : origin;

  try {
    return base ? new URL(url, base).toString() : url;
  } catch {
    return url;
  }
};

type RawActivity = Partial<ReductionActivity> & {
  id?: number | string;
  imageUrl?: string;
  imageUrls?: Array<string | undefined | null>;
  costAmount?: number | string | null;
};

const normalizeActivity = (data: RawActivity): ReductionActivity => {
  const rawList = Array.isArray(data?.imageUrls)
    ? data.imageUrls
    : data?.imageUrl
    ? [data.imageUrl]
    : [];

  const absoluteList = rawList
    .map((u) => toAbsoluteUrl(u ?? undefined))
    .filter((u): u is string => Boolean(u));

  return {
    id: Number(data?.id ?? 0),
    periodStart: data?.periodStart ?? "",
    periodEnd: data?.periodEnd ?? "",
    activityName: data?.activityName ?? "",
    activityDetails: data?.activityDetails ?? "",
    costAmount: Number(
      typeof data?.costAmount === "number"
        ? data.costAmount
        : data?.costAmount
        ? parseFloat(data.costAmount)
        : 0
    ),
    expectedEffect: data?.expectedEffect ?? "",
    imageUrls: absoluteList,
    imageUrl: absoluteList[0] ?? toAbsoluteUrl(data?.imageUrl),
  };
};

const buildFormData = (
  payload: ReductionActivity,
  files: File[] = []
): FormData => {
  const form = new FormData();

  files.forEach((file) => form.append("files", file));

  // ID는 서버에서 생성/경로로 전달되므로 본문에서 제외
  const { id: _id, imageUrls: _imageUrls, ...rest } = payload;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  });

  return form;
};

export const fetchActivities = async (params?: {
  periodStart?: string;
  periodEnd?: string;
}): Promise<ReductionActivity[]> => {
  try {
    const response = await axiosInstance.get("/activity/list", {
      params: {
        periodStart: params?.periodStart,
        periodEnd: params?.periodEnd,
      },
    });

    const payload = Array.isArray(response.data)
      ? response.data
      : response.data?.content ?? [];

    return payload.map(normalizeActivity);
  } catch (error) {
    console.error("Fetch Activities API Error:", error);
    throw error;
  }
};

export const fetchActivity = async (
  id: number
): Promise<ReductionActivity> => {
  try {
    const response = await axiosInstance.get(`/activity/${id}`);
    return normalizeActivity(response.data);
  } catch (error) {
    console.error("Fetch Activity API Error:", error);
    throw error;
  }
};

export const createActivity = async (
  data: ReductionActivity,
  files: File[] = []
): Promise<ReductionActivity> => {
  try {
    const response = await axiosInstance.post(
      "/activity/create",
      buildFormData(data, files)
    );

    const body = response.data;

    if (typeof body === "number") {
      return normalizeActivity({ ...data, id: body });
    }

    if (body?.id !== undefined) {
      return normalizeActivity(body);
    }

    return normalizeActivity(data);
  } catch (error) {
    console.error("Create Activity API Error:", error);
    throw error;
  }
};

export const updateActivity = async (
  id: number,
  data: ReductionActivity,
  files: File[] = []
): Promise<ReductionActivity> => {
  try {
    const response = await axiosInstance.put(
      `/activity/${id}`,
      buildFormData({ ...data, id }, files)
    );

    return normalizeActivity(response.data ?? { ...data, id });
  } catch (error) {
    console.error("Update Activity API Error:", error);
    throw error;
  }
};

export const deleteActivity = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/activity/${id}`);
  } catch (error) {
    console.error("Delete Activity API Error:", error);
    throw error;
  }
};
