// src/services/companyService.ts
import axios from 'axios';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL as string;

export interface Company {
  id: number;
  juristic_id?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  type?: string | null;
  code?: string | null;
  participated_status?: '0' | '1' | string;
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

export const create_company = async (payload: {
  juristic_id?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: string;
  code?: string;
  participated_status?: '0' | '1' | string;
  status?: 'active' | 'inactive' | string;
}): Promise<Company> => {
  const res = await api.post<ApiResponse<Company>>('/role/admin/companies', payload);
  return parseResponse<Company>(res);
};

export const read_company = async (): Promise<Company[]> => {
  const res = await api.get<ApiResponse<Company[]>>('/role/admin/companies');
  return parseResponse<Company[]>(res);
};

export const read_company_by_id = async (id: number): Promise<Company> => {
  const res = await api.get<ApiResponse<Company>>(`/role/admin/companies/${id}`);
  return parseResponse<Company>(res);
};

export const update_company = async (
  id: number,
  payload: Partial<Pick<Company,
    'juristic_id' |
    'name' |
    'phone' |
    'email' |
    'address' |
    'type' |
    'code' |
    'participated_status' |
    'status'
  >>
): Promise<Company> => {
  const res = await api.put<ApiResponse<Company>>(`/role/admin/companies/${id}`, payload);
  return parseResponse<Company>(res);
};

export const delete_company = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<null>>(`/role/admin/companies/${id}`);
  parseResponse<null>(res);
};
