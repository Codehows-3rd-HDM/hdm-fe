import axiosInstance from './axiosInstance';

/**
 * 공급 유형 관리 페이지용 API
 */

export interface SupplyTypeData {
  id?: number;
  supplyTypeName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplyTypeResponse {
  id: number;
  supplyTypeName: string;
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
export const fetchSupplyTypes = async (
  supplyTypeName?: string,
  page: number = 0,
  size: number = 15
): Promise<PageResponse<SupplyTypeResponse>> => {
  const params: any = {
    page,
    size,
  };

  if (supplyTypeName) params.supplyTypeName = supplyTypeName;

  const response = await axiosInstance.get('/admin/supply-type/search', { params });
  return response.data;
};

// 단일 조회
export const fetchSupplyType = async (id: number): Promise<SupplyTypeResponse> => {
  const response = await axiosInstance.get(`/admin/supply-type/${id}`);
  return response.data;
};

// 등록
export const createSupplyType = async (data: SupplyTypeData): Promise<SupplyTypeResponse> => {
  const response = await axiosInstance.post('/admin/supply-type', data);
  return response.data;
};

// 단일 수정
export const updateSupplyType = async (id: number, data: SupplyTypeData): Promise<SupplyTypeResponse> => {
  const response = await axiosInstance.put(`/admin/supply-type/${id}`, data);
  return response.data;
};

// 다중 수정
export const updateSupplyTypesMultiple = async (dataList: SupplyTypeData[]): Promise<SupplyTypeResponse[]> => {
  const response = await axiosInstance.patch('/admin/supply-type/bulk', dataList);
  return response.data;
};

// 단일 삭제
export const deleteSupplyType = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/supply-type/${id}`);
};

// 다중 삭제
export const deleteSupplyTypesMultiple = async (ids: number[]): Promise<void> => {
  await axiosInstance.delete('/admin/supply-type', {
    data: ids,
  });
};
