import api from '../config/api';
import type { ApiResponse } from './types';

export const HORAS_TURNO = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];
export const MONTO_SENA = 5000;

export function horaToLabel(h: number): string {
  if (h === 0) return '00:00';
  if (h === 1) return '01:00';
  return `${h.toString().padStart(2, '0')}:00`;
}

export interface ReservaCancha {
  id: number;
  fecha: string;
  hora: number;
  nombreCliente: string;
  telefono: string;
  email?: string | null;
  montoSena: number;
  senaPagada: boolean;
  restoPagado: boolean;
  montoTotal?: number | null;
  notas?: string | null;
  createdAt?: string;
}

export const reservaCanchaService = {
  getDisponibilidad: async (fecha: string): Promise<ApiResponse<{ horasOcupadas: number[] }>> => {
    const res = await api.get(`/reservas-cancha/disponibilidad`, { params: { fecha } });
    return res.data;
  },

  create: async (data: {
    fecha: string;
    hora: number;
    nombreCliente: string;
    telefono: string;
    email?: string;
    notas?: string;
    metodoPago?: 'mercadopago' | 'transferencia';
  }): Promise<
    ApiResponse<
      | { reserva: ReservaCancha; metodoPago: 'mercadopago'; initPoint?: string; preferenceId?: string }
      | {
          reserva: ReservaCancha;
          metodoPago: 'transferencia';
          whatsappLink: string;
          expiraAt: string | null;
          minutosParaPagar: number;
        }
    >
  > => {
    const res = await api.post('/reservas-cancha', data);
    return res.data;
  },

  list: async (fechaDesde?: string, fechaHasta?: string): Promise<ApiResponse<ReservaCancha[]>> => {
    const params: Record<string, string> = {};
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    const res = await api.get('/reservas-cancha', { params });
    return res.data;
  },

  updatePagos: async (
    id: number,
    data: { senaPagada?: boolean; restoPagado?: boolean; montoTotal?: number }
  ): Promise<ApiResponse<Partial<ReservaCancha>>> => {
    const res = await api.patch(`/reservas-cancha/${id}/pagos`, data);
    return res.data;
  },

  update: async (
    id: number,
    data: { notas?: string; montoTotal?: number }
  ): Promise<ApiResponse<ReservaCancha>> => {
    const res = await api.put(`/reservas-cancha/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<ApiResponse<{ ok: boolean }>> => {
    const res = await api.delete(`/reservas-cancha/${id}`);
    return res.data;
  },
};
