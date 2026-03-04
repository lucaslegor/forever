import { z } from 'zod';

// CU08 - Pagar Cuota
export const createPagoSchema = z.object({
  cuotaId: z
    .number({ message: 'La cuota es requerida' })
    .int()
    .positive('ID de cuota invalido'),
  medioPago: z.string().default('Mercado Pago'),
});

export const pagosQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  estado: z.enum(['APROBADO', 'RECHAZADO', 'PENDIENTE']).optional(),
  deportistaId: z.string().regex(/^\d+$/).transform(Number).optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
});

// Sincronizar pago con Mercado Pago (cuando el webhook no llegó)
export const syncPagoSchema = z.object({
  paymentId: z.string().min(1, 'paymentId es requerido'),
});

export type CreatePagoInput = z.infer<typeof createPagoSchema>;
export type PagosQuery = z.infer<typeof pagosQuerySchema>;
export type SyncPagoInput = z.infer<typeof syncPagoSchema>;