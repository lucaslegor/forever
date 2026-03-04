import { z } from 'zod';

const optionalPosInt = z.union([
  z.string().regex(/^\d+$/).transform(Number),
  z.number().int().positive(),
]).optional();

export const dashboardStatsQuerySchema = z.object({
  anio: optionalPosInt,
  mes: z.union([
    z.string().regex(/^(0?[1-9]|1[0-2])$/).transform(Number),
    z.number().int().min(1).max(12),
  ]).optional(),
});

export const dashboardDeudoresQuerySchema = z.object({
  disciplinaId: optionalPosInt,
  generoId: optionalPosInt,
  categoriaId: optionalPosInt,
  subcategoriaId: optionalPosInt,
  anio: optionalPosInt,
  mes: z.union([
    z.string().regex(/^(0?[1-9]|1[0-2])$/).transform(Number),
    z.number().int().min(1).max(12),
  ]).optional(),
});
