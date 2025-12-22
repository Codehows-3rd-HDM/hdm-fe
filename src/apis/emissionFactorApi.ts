import axiosInstance from './axiosInstance';

export interface EmissionFactor {
  id: number;
  fuelType: string;   // ENUM
  unitType: string;   // VARCHAR(10)
  emissionFactor: number; // NUMERIC(5,3)
  remark: string;
}

// ------------------------------------------------------
// ✅ 1) 전체 조회 API
// GET /api/admin/emission-factors
// ------------------------------------------------------
export const getEmissionFactors = async (): Promise<EmissionFactor[]> => {
  const res = await axiosInstance.get(`/admin/emission-factor`);
  console.log('Fetched Emission Factors:', res.data);
  return res.data;
};

// ------------------------------------------------------
// ✅ 2) 특정 항목 수정 API
// PUT /api/admin/emission-factors/{id}
// ------------------------------------------------------
export const updateEmissionFactor = async (
  id: number,
  payload: {
    emissionFactor: number;
    remark: string;
    unitType: string;
  }
) => {
  const res = await axiosInstance.put(`/admin/emission-factor/${id}`, payload);
  return res.data;
};
