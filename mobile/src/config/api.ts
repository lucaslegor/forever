import axios from 'axios';
import { getSecureItem } from '../utils/secureStorage';
import { TOKEN_KEY } from './storageKeys';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getSecureItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
