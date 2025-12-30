import axiosInstance from './axiosInstance';

/**
 * 공급 고객 관리 페이지용 API
 */

export interface SupplyCustomerData {
  id?: number;
  customerName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplyCustomerResponse {
  id: number;
  customerName: string;
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
export const fetchSupplyCustomers = async (
  customerName?: string,
  page: number = 0,
  size: number = 15
): Promise<PageResponse<SupplyCustomerResponse>> => {
  const params: any = {
    page,
    size,
  };

  if (customerName) params.customerName = customerName;

  const response = await axiosInstance.get('/admin/supply-customer/search', { params });
  return response.data;
};

// 단일 조회
export const fetchSupplyCustomer = async (id: number): Promise<SupplyCustomerResponse> => {
  const response = await axiosInstance.get(`/admin/supply-customer/${id}`);
  return response.data;
};

// 등록
export const createSupplyCustomer = async (data: SupplyCustomerData): Promise<SupplyCustomerResponse> => {
  const response = await axiosInstance.post('/admin/supply-customer', data);
  return response.data;
};

// 단일 수정
export const updateSupplyCustomer = async (id: number, data: SupplyCustomerData): Promise<SupplyCustomerResponse> => {
  const response = await axiosInstance.put(`/admin/supply-customer/${id}`, data);
  return response.data;
};

// 다중 수정
export const updateSupplyCustomersMultiple = async (dataList: SupplyCustomerData[]): Promise<SupplyCustomerResponse[]> => {
  const response = await axiosInstance.patch('/admin/supply-customer/bulk', dataList);
  return response.data;
};

// 단일 삭제
export const deleteSupplyCustomer = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/supply-customer/${id}`);
};

// 다중 삭제
export const deleteSupplyCustomersMultiple = async (ids: number[]): Promise<void> => {
  await axiosInstance.delete('/admin/supply-customer', {
    data: ids,
  });
};
