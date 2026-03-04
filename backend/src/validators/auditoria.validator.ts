import { z } from 'zod';

const optionalPosInt = z.union([
  z.string().regex(/^\d+$/).transform(Number),
  z.number().int().positive(),
]).optional();

export const auditoriaQuerySchema = z.object({
  page: optionalPosInt,
  limit: optionalPosInt,
  cuentaId: optionalPosInt,
  entidad: z.string().max(100).optional(),
  accion: z.string().max(100).optional(),
  desde: z.string().max(50).optional(),
  hasta: z.string().max(50).optional(),
});
