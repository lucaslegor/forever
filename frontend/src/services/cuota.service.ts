import api from '../config/api';
import type { ApiResponse } from './types';

export const cuotaService = {
  getMiEstado: async (): Promise<ApiResponse<{ cuotasPendientes: Array<{ id: number; nroCuota: number; monto: number; fechaVencimiento: string; estadoCuota: string }>; totalAdeudado: number }>> => {
    const response = await api.get('/cuotas/mi-estado');
    return response.data;
  },

  getByDeportista: async (deportistaId: number, query?: { page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    const response = await api.get(`/cuotas/deportista/${deportistaId}?${params}`);
    return response.data;
  },

  /** Generar cuotas mensuales para todos los deportistas (solo admin). */
  generarMensual: async (mes: number, anio: number): Promise<ApiResponse<{ cuotasGeneradas: number; cuotasOmitidas: number; mensaje: string }>> => {
    const response = await api.post('/cuotas/generar-mensual', { mes, anio });
    return response.data;
  },

  /** Listado de cuotas para admin (filtros: anio, mes, estado, disciplinaId, page, limit). */
  getAll: async (params?: { anio?: number; mes?: number; estado?: string; disciplinaId?: number; page?: number; limit?: number }): Promise<ApiResponse<{ data: any[]; total: number; page: number; limit: number; totalPages: number }>> => {
    const search = new URLSearchParams();
    if (params?.anio != null) search.set('anio', String(params.anio));
    if (params?.mes != null) search.set('mes', String(params.mes));
    if (params?.estado) search.set('estado', params.estado);
    if (params?.disciplinaId != null) search.set('disciplinaId', String(params.disciplinaId));
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    const response = await api.get(`/cuotas?${search}`);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/cuotas/${id}`);
    return response.data;
  },

  /** Borrar toda una generación (todas las cuotas de un mes + año + disciplina). */
  deletePorGeneracion: async (anio: number, mes: number, disciplinaId: number): Promise<ApiResponse<{ message: string; eliminadas: number }>> => {
    const params = new URLSearchParams({ anio: String(anio), mes: String(mes), disciplinaId: String(disciplinaId) });
    const response = await api.delete(`/cuotas/por-generacion?${params}`);
    return response.data;
  },

  /** Borrar toda la generación del mes (todas las cuotas del mes/año). */
  deletePorMes: async (anio: number, mes: number): Promise<ApiResponse<{ message: string; eliminadas: number }>> => {
    const params = new URLSearchParams({ anio: String(anio), mes: String(mes) });
    const response = await api.delete(`/cuotas/por-mes?${params}`);
    return response.data;
  },

  marcarPagadaEfectivo: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/cuotas/${id}/marcar-efectivo`);
    return response.data;
  },
};
