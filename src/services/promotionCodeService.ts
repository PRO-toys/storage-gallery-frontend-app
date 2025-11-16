// src/services/promotionCodeService.ts
import axios from 'axios';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL as string;

export interface PromotionCode {
  id: number;
  company_id?: number | null;
  person_id?: number | null;
  code?: string | null;
  description?: string | null;
  discount_value?: number | string | null;
  discount_type?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_redeemed?: '0' | '1' | string | null;
  redeemed_at?: string | null;
  status: 'active' | 'inactive' | string;
  created_at?: string;
  updated_at?: string;
}

type ApiSuccess<T> = { status: 'success'; message: string; data: T };
type ApiError = { status: 'error'; message: string; details?: string };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

const api = axios.create({ baseURL: `${URL_BACKEND}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const parseResponse = <T>(res: { data: ApiResponse<T> }): T => {
  const data = res.data;
  if ((data as ApiError).status === 'error') {
    throw new Error((data as ApiError).message || 'Request failed');
  }
  return (data as ApiSuccess<T>).data;
};

// CREATE
export const create_promotion_code = async (payload: Partial<PromotionCode>): Promise<PromotionCode> => {
  const res = await api.post<ApiResponse<PromotionCode>>('/role/admin/promotion-codes', payload);
  return parseResponse<PromotionCode>(res);
};

// READ (all)
export const read_promotion_code = async (): Promise<PromotionCode[]> => {
  const res = await api.get<ApiResponse<PromotionCode[]>>('/role/admin/promotion-codes');
  return parseResponse<PromotionCode[]>(res);
};

// READ by ID
export const read_promotion_code_by_id = async (id: number): Promise<PromotionCode> => {
  const res = await api.get<ApiResponse<PromotionCode>>(`/role/admin/promotion-codes/${id}`);
  return parseResponse<PromotionCode>(res);
};

// UPDATE (partial)
export const update_promotion_code = async (
  id: number,
  payload: Partial<PromotionCode>
): Promise<PromotionCode> => {
  const res = await api.put<ApiResponse<PromotionCode>>(`/role/admin/promotion-codes/${id}`, payload);
  return parseResponse<PromotionCode>(res);
};

// DELETE
export const delete_promotion_code = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<null>>(`/role/admin/promotion-codes/${id}`);
  parseResponse<null>(res);
};
