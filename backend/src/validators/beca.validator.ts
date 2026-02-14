import { z } from 'zod';

export const deportistaIdParamSchema = z.object({
  deportistaId: z.string().regex(/^\d+$/, 'ID de deportista inválido').transform(Number),
});

export const becarBodySchema = z.object({
  cuotaBeca: z.number().min(0).optional(),
}).optional().default({});

export const updateCuotaBecaBodySchema = z.object({
  monto: z.coerce.number().min(0),
});
