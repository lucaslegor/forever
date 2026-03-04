import api from '../config/api';
import type { ApiResponse } from './types';

export interface BecadoItem {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  disciplina: string;
  precioMensual: number;
  cuotaBeca: number | null;
  montoEfectivo: number;
}

export const becaService = {
  getAll: async (page?: number, limit?: number): Promise<ApiResponse<{ data: BecadoItem[]; total: number; totalPages: number }>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    const response = await api.get(`/becas?${params}`);
    return response.data;
  },

  becar: async (deportistaId: number, cuotaBeca?: number): Promise<ApiResponse<BecadoItem>> => {
    const response = await api.post(`/becas/${deportistaId}/becar`, cuotaBeca != null ? { cuotaBeca } : {});
    return response.data;
  },

  quitarBeca: async (deportistaId: number): Promise<ApiResponse<{ ok: boolean }>> => {
    const response = await api.delete(`/becas/${deportistaId}`);
    return response.data;
  },

  updateCuotaBeca: async (deportistaId: number, monto: number): Promise<ApiResponse<BecadoItem>> => {
    const response = await api.patch(`/becas/${deportistaId}/cuota`, { monto });
    return response.data;
  },

  getByDeportistaId: async (deportistaId: number): Promise<ApiResponse<BecadoItem>> => {
    const response = await api.get(`/becas/${deportistaId}`);
    return response.data;
  },
};
