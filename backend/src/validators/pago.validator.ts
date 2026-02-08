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

export const confirmarPagoSchema = z.object({
  mercadoPagoId: z.string().min(1, 'mercadoPagoId requerido').optional(),
  status: z.string().min(1, 'status requerido').optional(),
});

export type CreatePagoInput = z.infer<typeof createPagoSchema>;
export type PagosQuery = z.infer<typeof pagosQuerySchema>;
export type ConfirmarPagoInput = z.infer<typeof confirmarPagoSchema>;
