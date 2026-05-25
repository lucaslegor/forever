import api from '../config/api';
import type { ApiResponse, LoginRequest, LoginResponse, LoginResponseUser } from '../types/auth';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<LoginResponseUser>> => {
    const response = await api.get<ApiResponse<LoginResponseUser>>('/auth/me');
    return response.data;
  },
};
