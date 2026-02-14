import { z } from 'zod';

export const createSubcategoriaSchema = z.object({
  nombre: z.string().min(1, 'nombre requerido').max(200),
  disciplinaNombre: z.string().min(1, 'disciplinaNombre requerido').max(200),
  categoriaNombre: z.string().min(1, 'categoriaNombre requerido').max(200),
  generoNombre: z.string().max(200).optional(),
});

export const subcategoriaIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});
