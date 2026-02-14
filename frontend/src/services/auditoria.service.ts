import api from '../config/api';

export interface AuditoriaLogRow {
  id: number;
  cuentaId: number | null;
  email: string | null;
  rol: string | null;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detalles: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditoriaListResponse {
  data: AuditoriaLogRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditoriaFilters {
  page?: number;
  limit?: number;
  cuentaId?: number;
  entidad?: string;
  accion?: string;
  desde?: string;
  hasta?: string;
}

export const auditoriaService = {
  getLogs: async (filters?: AuditoriaFilters): Promise<AuditoriaListResponse> => {
    const params: Record<string, string | number> = {};
    if (filters?.page != null) params.page = filters.page;
    if (filters?.limit != null) params.limit = filters.limit;
    if (filters?.cuentaId != null) params.cuentaId = filters.cuentaId;
    if (filters?.entidad) params.entidad = filters.entidad;
    if (filters?.accion) params.accion = filters.accion;
    if (filters?.desde) params.desde = filters.desde;
    if (filters?.hasta) params.hasta = filters.hasta;
    const res = await api.get<{ success: boolean; data: AuditoriaListResponse }>('/auditoria', { params });
    return res.data.data;
  },
};
