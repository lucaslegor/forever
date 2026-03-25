import { z } from 'zod';
export declare const createNoticiaSchema: z.ZodObject<{
    titulo: z.ZodString;
    fecha: z.ZodString;
    resumen: z.ZodString;
    contenido: z.ZodString;
    autorId: z.ZodOptional<z.ZodNumber>;
    imagenes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodString]>>>>;
}, z.core.$strip>;
export declare const updateNoticiaSchema: z.ZodObject<{
    titulo: z.ZodOptional<z.ZodString>;
    fecha: z.ZodOptional<z.ZodString>;
    resumen: z.ZodOptional<z.ZodString>;
    contenido: z.ZodOptional<z.ZodString>;
    imagenes: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodString]>>>;
}, z.core.$strip>;
export declare const setPublicadaSchema: z.ZodObject<{
    publicada: z.ZodBoolean;
}, z.core.$strip>;
export declare const noticiaIdParamSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export type CreateNoticiaInput = z.infer<typeof createNoticiaSchema>;
export type UpdateNoticiaInput = z.infer<typeof updateNoticiaSchema>;
export type SetPublicadaInput = z.infer<typeof setPublicadaSchema>;
//# sourceMappingURL=noticia.validator.d.ts.map