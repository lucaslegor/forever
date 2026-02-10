import api from '../config/api';
import type { ApiResponse } from './types';

export interface DisciplinaResponse {
  id: number;
  nombre: string;
  precioMensual: number;
  activa?: boolean;
}

export const disciplinaService = {
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
