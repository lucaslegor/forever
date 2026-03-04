import api from '../config/api';
import type { ApiResponse } from './types';

export interface DisciplinaResponse {
  id: number;
  nombre: string;
  precioMensual: number;
  activa?: boolean;
}

export const disciplinaService = {
  /** Listar disciplinas (activas por defecto). Cualquier usuario autenticado. */
  getAll: async (includeInactive = false): Promise<ApiResponse<DisciplinaResponse[]>> => {
    const params = includeInactive ? '?includeInactive=true' : '';
    const response = await api.get<ApiResponse<DisciplinaResponse[]>>(`/disciplinas${params}`);
    return response.data;
  },

  create: async (data: { nombre: string; precioMensual: number }): Promise<ApiResponse<DisciplinaResponse>> => {
    const response = await api.post<ApiResponse<DisciplinaResponse>>('/disciplinas', data);
    return response.data;
  },

  update: async (
    id: number,
    data: { nombre?: string; precioMensual?: number; activa?: boolean }
  ): Promise<ApiResponse<DisciplinaResponse>> => {
    const response = await api.put<ApiResponse<DisciplinaResponse>>(`/disciplinas/${id}`, data);
    return response.data;
  },
};
