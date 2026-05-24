import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'https://nusantara-backend-498485862524.asia-southeast2.run.app/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject token ke setiap request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — refresh token atau logout
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const newToken = res.data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// ─── Locations ────────────────────────────────────────────────
export const locationApi = {
  getAll: (page = 1, limit = 10, category?: string) =>
    api.get('/locations', { params: { page, limit, category } }),
  getById: (id: number) => api.get(`/locations/${id}`),
  create: (data: FormData) =>
    api.post('/locations', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) =>
    api.put(`/locations/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: number) => api.delete(`/locations/${id}`),
};

// ─── QR Code ──────────────────────────────────────────────────
export const qrApi = {
  generate: (locationId: number) =>
    api.post(`/qrcodes/generate/${locationId}`),
  delete: (id: number) => api.delete(`/qrcodes/${id}`),
};

// ─── Audio Guide ──────────────────────────────────────────────
export const audioApi = {
  getByLocation: (locationId: number) =>
    api.get(`/audio/${locationId}`),
  upload: (data: FormData) =>
    api.post('/audio', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: object) => api.put(`/audio/${id}`, data),
  delete: (id: string) => api.delete(`/audio/${id}`),
};

// ─── Historical Content ───────────────────────────────────────
export const contentApi = {
  getByLocation: (locationId: number, language?: string) =>
    api.get(`/content/${locationId}`, { params: { language } }),
  create: (data: object) => api.post('/content', data),
  update: (id: string, data: object) => api.put(`/content/${id}`, data),
  delete: (id: string) => api.delete(`/content/${id}`),
};

// ─── Reviews ──────────────────────────────────────────────────
export const reviewApi = {
  getByLocation: (locationId: number) =>
    api.get(`/reviews/${locationId}`),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

// ─── Visit Stats ──────────────────────────────────────────────
export const visitApi = {
  getStats: () => api.get('/visits/stats'),
  getStatsByLocation: (locationId: number) =>
    api.get(`/visits/stats/${locationId}`),
};

// ─── Users ────────────────────────────────────────────────────
export const userApi = {
  getAll: () => api.get('/users'),
  updateRole: (id: number, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
  toggleActive: (id: number, isActive: boolean) =>
    api.patch(`/users/${id}/active`, { isActive }),
};

export default api;
