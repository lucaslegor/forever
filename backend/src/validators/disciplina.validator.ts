import { z } from 'zod';

export const createDisciplinaSchema = z.object({
  nombre: z
    .string({ message: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  precioMensual: z
    .number({ message: 'El precio mensual es requerido' })
    .positive('El precio mensual debe ser mayor a 0'),
});

export const updateDisciplinaSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  precioMensual: z.number().positive().optional(),
  activa: z.boolean().optional(),
});

export type CreateDisciplinaInput = z.infer<typeof createDisciplinaSchema>;
export type UpdateDisciplinaInput = z.infer<typeof updateDisciplinaSchema>;
