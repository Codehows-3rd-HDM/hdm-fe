import axiosInstance from './axiosInstance';

/**
 * 운행 목적 관리 페이지용 API
 */

export interface OperationPurposeData {
  id?: number;
  purposeName: string;
  defaultScope?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OperationPurposeResponse {
  id: number;
  purposeName: string;
  defaultScope?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 목록 조회
export const fetchOperationPurposes = async (
  purposeName?: string,
  defaultScope?: number,
  keyword?: string,
  page: number = 0,
  size: number = 15
): Promise<PageResponse<OperationPurposeResponse>> => {
  const params: any = {
    page,
    size,
  };

  if (purposeName) params.purposeName = purposeName;
  if (defaultScope) params.defaultScope = defaultScope;
  if (keyword) params.keyword = keyword;

  const response = await axiosInstance.get('/admin/operation-purpose/search', { params });
  return response.data;
};

// 단일 조회
export const fetchOperationPurpose = async (id: number): Promise<OperationPurposeResponse> => {
  const response = await axiosInstance.get(`/admin/operation-purpose/${id}`);
  return response.data;
};

// 등록
export const createOperationPurpose = async (data: OperationPurposeData): Promise<OperationPurposeResponse> => {
  const response = await axiosInstance.post('/admin/operation-purpose', data);
  return response.data;
};

// 단일 수정
export const updateOperationPurpose = async (id: number, data: OperationPurposeData): Promise<OperationPurposeResponse> => {
  const response = await axiosInstance.put(`/admin/operation-purpose/${id}`, data);
  return response.data;
};

// 다중 수정
export const updateOperationPurposesMultiple = async (dataList: OperationPurposeData[]): Promise<OperationPurposeResponse[]> => {
  const response = await axiosInstance.patch('/admin/operation-purpose/bulk', dataList);
  return response.data;
};

// 단일 삭제
export const deleteOperationPurpose = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/operation-purpose/${id}`);
};

// 다중 삭제
export const deleteOperationPurposesMultiple = async (ids: number[]): Promise<void> => {
  await axiosInstance.delete('/admin/operation-purpose', {
    data: ids,
  });
};
