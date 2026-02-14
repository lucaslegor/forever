import { z } from 'zod';

export const disponibilidadQuerySchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha requerida (YYYY-MM-DD)'),
});

export const createReservaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha inválida (YYYY-MM-DD)'),
  hora: z.number().int().min(0).max(23),
  nombreCliente: z.string().min(1, 'nombre requerido').max(200),
  telefono: z.string().min(1, 'teléfono requerido').max(50),
  email: z.string().email().optional().or(z.literal('')),
  notas: z.string().max(1000).optional(),
  metodoPago: z.enum(['mercadopago', 'transferencia']).optional(),
});

export const listReservasQuerySchema = z.object({
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updatePagosReservaSchema = z.object({
  senaPagada: z.boolean().optional(),
  restoPagado: z.boolean().optional(),
  montoTotal: z.number().nonnegative().optional(),
});

export const updateReservaSchema = z.object({
  notas: z.string().max(1000).optional(),
  montoTotal: z.number().nonnegative().optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});

export type CreateReservaInput = z.infer<typeof createReservaSchema>;
export type UpdatePagosReservaInput = z.infer<typeof updatePagosReservaSchema>;
export type UpdateReservaInput = z.infer<typeof updateReservaSchema>;
