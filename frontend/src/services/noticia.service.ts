import api from '../config/api';
import type { ApiResponse } from './types';
import type { Noticia } from '../types/noticia';

export interface CreateNoticiaDTO {
  titulo: string;
  fecha: string;
  resumen: string;
  contenido: string;
  autorId?: number;
  imagenes: string[];
}

export interface UpdateNoticiaDTO {
  titulo?: string;
  fecha?: string;
  resumen?: string;
  contenido?: string;
  imagenes?: string[];
}

export const noticiaService = {
  getAll: async (): Promise<ApiResponse<Noticia[]>> => {
    const response = await api.get('/noticias');
    return response.data;
  },

  /** Listado para admin (incluye no publicadas) */
  getAllAdmin: async (): Promise<ApiResponse<Noticia[]>> => {
    const response = await api.get('/noticias/admin/list');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Noticia>> => {
    const response = await api.get(`/noticias/${id}`);
    return response.data;
  },

  /** Obtener noticia por ID (admin; incluye no publicadas) */
  getByIdAdmin: async (id: number): Promise<ApiResponse<Noticia>> => {
    const response = await api.get(`/noticias/admin/${id}`);
    return response.data;
  },

  setPublicada: async (id: number, publicada: boolean): Promise<ApiResponse<Noticia>> => {
    const response = await api.patch(`/noticias/${id}/publicada`, { publicada });
    return response.data;
  },

  create: async (data: CreateNoticiaDTO): Promise<ApiResponse<Noticia>> => {
    const response = await api.post('/noticias', data);
    return response.data;
  },

  update: async (id: number, data: UpdateNoticiaDTO): Promise<ApiResponse<Noticia>> => {
    const response = await api.put(`/noticias/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/noticias/${id}`);
    return response.data;
  },
};
