// src/services/productService.ts
import axios from 'axios';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL as string;

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  quantity?: number | null;
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

export const create_product = async (payload: {
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  status?: string;
}): Promise<Product> => {
  const res = await api.post<ApiResponse<Product>>('/role/admin/products', payload);
  return parseResponse<Product>(res);
};

export const read_product = async (): Promise<Product[]> => {
  const res = await api.get<ApiResponse<Product[]>>('/role/admin/products');
  return parseResponse<Product[]>(res);
};

export const read_product_by_id = async (id: number): Promise<Product> => {
  const res = await api.get<ApiResponse<Product>>(`/role/admin/products/${id}`);
  return parseResponse<Product>(res);
};

export const update_product = async (
  id: number,
  payload: Partial<Pick<Product, 'name' | 'description' | 'price' | 'quantity' | 'status'>>
): Promise<Product> => {
  const res = await api.put<ApiResponse<Product>>(`/role/admin/products/${id}`, payload);
  return parseResponse<Product>(res);
};

export const delete_product = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<null>>(`/role/admin/products/${id}`);
  parseResponse<null>(res);
};
