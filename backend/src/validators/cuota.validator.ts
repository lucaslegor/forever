import { z } from 'zod';

// CU04 - Asignar Cuota
export const asignarCuotaSchema = z.object({
  deportistaId: z
    .number({ message: 'El deportista es requerido' })
    .int()
    .positive('ID de deportista invalido'),
  nroCuota: z
    .number({ message: 'El numero de cuota es requerido' })
    .int()
    .positive('Numero de cuota invalido'),
  monto: z
    .number({ message: 'El monto es requerido' })
    .positive('El monto debe ser mayor a 0'),
  fechaEmision: z.string({ message: 'La fecha de emision es requerida' }),
  fechaVencimiento: z.string({ message: 'La fecha de vencimiento es requerida' }),
  disciplinaId: z
    .number({ message: 'La disciplina es requerida' })
    .int()
    .positive('ID de disciplina invalido'),
});

// CU05 - Actualizar Cuotas
export const updateCuotaSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0').optional(),
  fechaVencimiento: z.string().optional(),
  periodicidad: z.enum(['MENSUAL', 'ANUAL']).optional(),
});

export const cuotasQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  estado: z.enum(['PAGADA', 'PENDIENTE', 'VENCIDA']).optional(),
  deportistaId: z.string().regex(/^\d+$/).transform(Number).optional(),
  disciplinaId: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Generar cuotas mensuales
export const generarCuotasSchema = z.object({
  mes: z.number({ message: 'El mes es requerido' }).int().min(1, 'Mes invalido').max(12, 'Mes invalido'),
  anio: z.number({ message: 'El año es requerido' }).int().min(2024, 'Año invalido').max(2030, 'Año invalido'),
});

// Alias front: GET/PATCH administrativo, socio, admin/generar
export const adminGenerarSchema = z.object({
  actividadId: z.number().int().positive().optional(),
  mes: z.string().min(1, 'Mes requerido'),
  montoBase: z.number().min(0).optional(),
  preview: z.boolean(),
});

export const updateEstadoCuotaSchema = z.object({
  estado: z.enum(['Aprobada', 'Rechazada', 'PAGADA', 'PENDIENTE'], { message: 'Estado invalido' }),
  motivo: z.string().optional(),
});

export const cuotaIdParamSchema = z.object({
  cuotaId: z.string().regex(/^\d+$/, 'ID de cuota invalido').transform(Number),
});

export type AsignarCuotaInput = z.infer<typeof asignarCuotaSchema>;
export type UpdateCuotaInput = z.infer<typeof updateCuotaSchema>;
export type CuotasQuery = z.infer<typeof cuotasQuerySchema>;
export type GenerarCuotasInput = z.infer<typeof generarCuotasSchema>;
export type AdminGenerarInput = z.infer<typeof adminGenerarSchema>;
export type UpdateEstadoCuotaInput = z.infer<typeof updateEstadoCuotaSchema>;
