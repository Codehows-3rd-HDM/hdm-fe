import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
  const res = await axios.get(`${BASE_URL}/admin/emission-factor`);
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
  const res = await axios.put(`${BASE_URL}/admin/emission-factor/${id}`, payload);
  return res.data;
};
