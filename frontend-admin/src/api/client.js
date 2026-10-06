import axios from 'axios';

function resolveBaseURL() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return '/api';
  const trimmed = String(raw).replace(/\/$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return trimmed + '/api';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

export default api;
