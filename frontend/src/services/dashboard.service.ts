import api from '../config/api';

export interface RecaudacionPorClasificacionRow {
  disciplinaId: number;
  disciplinaNombre: string;
  generoId: number;
  generoNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  subcategoriaId: number | null;
  subcategoriaNombre: string | null;
  totalRecaudado: number;
  cantidadPagos: number;
}

export interface DeportistasPorDisciplinaRow {
  disciplinaId: number;
  disciplinaNombre: string;
  cantidad: number;
}

export interface CuotasPendientesVencidas {
  pendientes: number;
  vencidas: number;
  total: number;
}

export interface PagosPorMedioRow {
  medio: string;
  cantidad: number;
  montoTotal: number;
}

export interface DashboardStats {
  recaudacionPorClasificacion: RecaudacionPorClasificacionRow[];
  deportistasPorDisciplina: DeportistasPorDisciplinaRow[];
  cuotasPendientesVencidas: CuotasPendientesVencidas;
  pagosPorMedio: PagosPorMedioRow[];
  totalRecaudado: number;
}

export interface DeudorRow {
  deportistaId: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  disciplinaNombre: string;
  categoriaNombre: string;
  subcategoriaNombre: string | null;
  generoNombre: string;
  /** Nombre del grupo familiar si es integrante (evita confusión de doble conteo). */
  grupoFamiliarNombre: string | null;
  cuotasImpagas: { nroCuota: number; anio: number; monto: number; estado: string; fechaVencimiento: string }[];
  montoTotalAdeudado: number;
}

export const dashboardService = {
  getStats: async (anio?: number, mes?: number): Promise<DashboardStats> => {
    const params: Record<string, number> = {};
    if (anio != null) params.anio = anio;
    if (mes != null) params.mes = mes;
    const res = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats', { params });
    return res.data.data;
  },

  getDeudores: async (filters?: {
    disciplinaId?: number;
    generoId?: number;
    categoriaId?: number;
    subcategoriaId?: number;
    anio?: number;
    mes?: number;
  }): Promise<DeudorRow[]> => {
    const params: Record<string, number> = {};
    if (filters?.disciplinaId != null) params.disciplinaId = filters.disciplinaId;
    if (filters?.generoId != null) params.generoId = filters.generoId;
    if (filters?.categoriaId != null) params.categoriaId = filters.categoriaId;
    if (filters?.subcategoriaId != null) params.subcategoriaId = filters.subcategoriaId;
    if (filters?.anio != null) params.anio = filters.anio;
    if (filters?.mes != null) params.mes = filters.mes;
    const res = await api.get<{ success: boolean; data: DeudorRow[] }>('/dashboard/deudores', { params });
    return res.data.data;
  },
};
