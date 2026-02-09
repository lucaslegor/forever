import api from '../config/api';
import type { ApiResponse, LoginCredentials, LoginResponse } from './types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { email?: string; telefono?: string; currentPassword?: string; password?: string }): Promise<ApiResponse<any>> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  getUsers: async (page?: number, limit?: number): Promise<ApiResponse<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  resetAdminPassword: async (adminId: number, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.put(`/users/admin/${adminId}/reset-password`, { newPassword });
    return response.data;
  },
};
