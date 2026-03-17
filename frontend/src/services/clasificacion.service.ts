import api from '../config/api';
import type { ApiResponse } from './types';

export interface Genero {
  id_genero: number;
  nombre: string;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Subcategoria {
  id_subcategoria: number;
  nombre: string;
  disciplinaId: number;
  categoriaId: number;
  generoId: number | null;
}

export interface OpcionesClasificacion {
  generos: Array<{ id: number; nombre: string }>;
  categorias: Array<{ id: number; nombre: string }>;
  disciplinas: Array<{ id: number; nombre: string; precioMensual: number }>;
  subcategoriasPorKey: Record<string, string[]>;
  categoriasExcepcion: Record<string, string[]>;
}

export const clasificacionService = {
  getGeneros: async (): Promise<ApiResponse<Genero[]>> => {
    const response = await api.get('/clasificacion/generos');
    return response.data;
  },

  getCategorias: async (): Promise<ApiResponse<Categoria[]>> => {
    const response = await api.get('/clasificacion/categorias');
    return response.data;
  },

  createCategoria: async (nombre: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/clasificacion/categorias', { nombre: nombre.trim() });
    return response.data;
  },

  deleteCategoria: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/clasificacion/categorias/${id}`);
    return response.data;
  },

  getSubcategorias: async (
    disciplinaId?: number,
    categoriaId?: number,
    generoId?: number
  ): Promise<ApiResponse<Subcategoria[]>> => {
    const params = new URLSearchParams();
    if (disciplinaId) params.append('disciplinaId', disciplinaId.toString());
    if (categoriaId) params.append('categoriaId', categoriaId.toString());
    if (generoId !== undefined) params.append('generoId', generoId.toString());
    
    const response = await api.get(`/clasificacion/subcategorias?${params}`);
    return response.data;
  },

  getOpcionesCompletas: async (): Promise<ApiResponse<OpcionesClasificacion>> => {
    const response = await api.get('/clasificacion/opciones');
    return response.data;
  },

  createSubcategoria: async (data: {
    nombre: string;
    disciplinaNombre: string;
    categoriaNombre: string;
    generoNombre?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/clasificacion/subcategorias', data);
    return response.data;
  },

  deleteSubcategoria: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/clasificacion/subcategorias/${id}`);
    return response.data;
  },
};
