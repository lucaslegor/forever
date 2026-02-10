import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enviar cookies HttpOnly en cada request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores de respuesta (cookie se envía automáticamente)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('forever_auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
