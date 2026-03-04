import { z } from 'zod';

export const createNoticiaSchema = z.object({
  titulo: z.string().min(1, 'El título es requerido').max(300),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
  resumen: z.string().min(1, 'El resumen es requerido').max(500),
  contenido: z.string().min(1, 'El contenido es requerido'),
  autorId: z.number().int().positive().optional(),
  imagenes: z.array(z.string().url().or(z.string().max(2000))).optional().default([]),
});

export const updateNoticiaSchema = z.object({
  titulo: z.string().min(1).max(300).optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  resumen: z.string().min(1).max(500).optional(),
  contenido: z.string().min(1).optional(),
  imagenes: z.array(z.string().url().or(z.string().max(2000))).optional(),
});

export const setPublicadaSchema = z.object({
  publicada: z.boolean(),
});

export const noticiaIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});

export type CreateNoticiaInput = z.infer<typeof createNoticiaSchema>;
export type UpdateNoticiaInput = z.infer<typeof updateNoticiaSchema>;
export type SetPublicadaInput = z.infer<typeof setPublicadaSchema>;
