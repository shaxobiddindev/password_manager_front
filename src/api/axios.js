import axios from 'axios';

const api = axios.create({
  baseURL: 'http://170.168.6.63:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isUnlock = err.config?.url?.includes('/auth/unlock');
    const isLogin = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isUnlock && !isLogin) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
