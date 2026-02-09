import api from '../config/api';
import type { ApiResponse } from './types';
import type { Deportista } from '../types/admin';

export interface CreateDeportistaDTO {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNac: string;
  generoId: number;
  categoriaId: number;
  subcategoriaId?: number;
  disciplinaId: number;
  email: string;
  password: string;
  adultoResponsable?: {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono: string;
  };
}

export interface UpdateDeportistaDTO {
  nombre?: string;
  apellido?: string;
  fechaNac?: string;
  generoId?: number;
  categoriaId?: number;
  subcategoriaId?: number | null;
  disciplinaId?: number;
  adultoResponsable?: Partial<CreateDeportistaDTO['adultoResponsable']>;
}

export interface DeportistasQuery {
  page?: number;
  limit?: number;
  estado?: string;
  disciplinaId?: number;
  search?: string;
}

export const deportistaService = {
  getAll: async (query?: DeportistasQuery): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.estado) params.append('estado', query.estado);
    if (query?.disciplinaId) params.append('disciplinaId', query.disciplinaId.toString());
    if (query?.search) params.append('search', query.search);
    
    const response = await api.get(`/deportistas?${params}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Deportista>> => {
    const response = await api.get(`/deportistas/${id}`);
    return response.data;
  },

  create: async (data: CreateDeportistaDTO): Promise<ApiResponse<Deportista>> => {
    const response = await api.post('/deportistas', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDeportistaDTO): Promise<ApiResponse<Deportista>> => {
    const response = await api.put(`/deportistas/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/deportistas/${id}`);
    return response.data;
  },

  resetPassword: async (id: number, newPassword: string): Promise<ApiResponse<any>> => {
    const response = await api.put(`/deportistas/${id}/reset-password`, { newPassword });
    return response.data;
  },

  resetPasswordByDni: async (dni: string, newPassword: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/deportistas/reset-password-dni', { dni, newPassword });
    return response.data;
  },

  getMiPerfil: async (): Promise<ApiResponse<Deportista>> => {
    const response = await api.get('/deportistas/mi-perfil');
    return response.data;
  },

  getConPagosPendientes: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/deportistas/pagos-pendientes');
    return response.data;
  },

  getMiHistorial: async (): Promise<ApiResponse<{ pagos: Array<{ id: number; fecha: string; monto: number; medioPago?: string; estado: string; cuota: { nroCuota: number; anio?: number; disciplina: string } }> }>> => {
    const response = await api.get('/deportistas/mi-historial');
    return response.data;
  },
};
