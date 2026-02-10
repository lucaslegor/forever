import api from '../config/api';
import type { ApiResponse } from './types';

export interface CrearPagoResponse {
  pago: {
    id: number;
    monto: number;
    estadoPago: string;
    cuotaId: number;
    cuota?: { disciplina?: { nombre: string }; nroCuota: number; anio: number };
  };
  initPoint: string | null;
  preferenceId: string | null;
}

export const pagoService = {
  /** Crear preferencia de pago (Checkout Pro) para una cuota. Devuelve initPoint para redirigir al usuario. */
  crear: async (cuotaId: number): Promise<ApiResponse<CrearPagoResponse>> => {
    const response = await api.post<ApiResponse<CrearPagoResponse>>('/pagos/crear', { cuotaId });
    return response.data;
  },

  /** Sincronizar pago con Mercado Pago (cuando el webhook no llegó). Usar el payment_id de la URL de éxito. */
  sync: async (paymentId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>('/pagos/sync', { paymentId });
    return response.data;
  },
};
