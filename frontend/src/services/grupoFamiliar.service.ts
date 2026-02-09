import api from '../config/api';
import type { ApiResponse } from './types';
import type { GrupoFamiliarAdmin } from '../types/admin';

export interface CreateGrupoFamiliarDTO {
  nombre: string;
  titularDni: string;
  cuotaHermano?: number;
  integrantes: Array<{
    deportistaId: number;
    esPrincipal?: boolean;
  }>;
}

export interface UpdateGrupoFamiliarDTO {
  nombre?: string;
  titularDni?: string;
  cuotaHermano?: number;
  integrantes?: Array<{
    deportistaId: number;
    esPrincipal?: boolean;
  }>;
}

export const grupoFamiliarService = {
  getAll: async (page?: number, limit?: number): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`/grupos-familiares?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<GrupoFamiliarAdmin>> => {
    const response = await api.get(`/grupos-familiares/${id}`);
    return response.data;
  },

  create: async (data: CreateGrupoFamiliarDTO): Promise<ApiResponse<GrupoFamiliarAdmin>> => {
    const response = await api.post('/grupos-familiares', data);
    return response.data;
  },

  update: async (id: number, data: UpdateGrupoFamiliarDTO): Promise<ApiResponse<GrupoFamiliarAdmin>> => {
    const response = await api.put(`/grupos-familiares/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/grupos-familiares/${id}`);
    return response.data;
  },

  getMios: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/grupos-familiares/mios');
    return response.data;
  },
};
