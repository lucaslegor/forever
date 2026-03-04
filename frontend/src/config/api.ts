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
      const url = error.config?.url ?? '';
      const isLoginRequest = url.includes('/auth/login');
      const isProfileCheck = url.includes('/users/profile');
      // No redirigir en getProfile: 401 es normal cuando no hay sesión (ej. en la página de login).
      if (!isLoginRequest && !isProfileCheck) {
        localStorage.removeItem('forever_auth');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
