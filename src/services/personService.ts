// src/services/personService.ts
import axios from 'axios';

const URL_BACKEND = import.meta.env.VITE_BACKEND_URL as string;

export interface Person {
  id: number;
  company_id?: number | null;
  card_id?: string | null;
  prefix?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  affiliation?: string | null;
  type?: string | null;              // backend field
  code?: string | null;              // backend field
  // transitional aliases some UIs might still use:
  person_type?: string | null;
  person_code?: string | null;

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

// map front-end aliases -> backend keys & whitelist columns
const toBackendPayload = (payload: Record<string, unknown>) => {
  const mapped = { ...payload };

  if (mapped.person_type && !mapped.type) mapped.type = mapped.person_type;
  if (mapped.person_code && !mapped.code) mapped.code = mapped.person_code;

  const allowedKeys = new Set([
    'company_id',
    'card_id',
    'prefix',
    'name',
    'phone',
    'email',
    'address',
    'affiliation',
    'type',
    'code',
    'participated_status',
    'status',
  ]);

  return Object.fromEntries(
    Object.entries(mapped).filter(([k, v]) => allowedKeys.has(k) && v !== undefined)
  );
};

// CREATE
export const create_person = async (payload: Partial<Person> & Pick<Person, 'name'>): Promise<Person> => {
  const body = toBackendPayload(payload as Record<string, unknown>);
  const res = await api.post<ApiResponse<Person>>('/role/admin/persons', body);
  return parseResponse<Person>(res);
};

// READ (all)
export const read_person = async (): Promise<Person[]> => {
  const res = await api.get<ApiResponse<Person[]>>('/role/admin/persons');
  return parseResponse<Person[]>(res);
};

// READ by ID
export const read_person_by_id = async (id: number): Promise<Person> => {
  const res = await api.get<ApiResponse<Person>>(`/role/admin/persons/${id}`);
  return parseResponse<Person>(res);
};

// UPDATE (partial)
export const update_person = async (
  id: number,
  payload: Partial<
    Pick<
      Person,
      | 'company_id'
      | 'card_id'
      | 'prefix'
      | 'name'
      | 'phone'
      | 'email'
      | 'address'
      | 'affiliation'
      | 'type'
      | 'code'
      | 'person_type'
      | 'person_code'
      | 'participated_status'
      | 'status'
    >
  >
): Promise<Person> => {
  const body = toBackendPayload(payload as Record<string, unknown>);
  const res = await api.put<ApiResponse<Person>>(`/role/admin/persons/${id}`, body);
  return parseResponse<Person>(res);
};

// DELETE
export const delete_person = async (id: number): Promise<void> => {
  const res = await api.delete<ApiResponse<null>>(`/role/admin/persons/${id}`);
  parseResponse<null>(res);
};
