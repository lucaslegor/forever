import { z } from 'zod';
export declare const createSubcategoriaSchema: z.ZodObject<{
    nombre: z.ZodString;
    disciplinaNombre: z.ZodString;
    categoriaNombre: z.ZodString;
    generoNombre: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const subcategoriaIdParamSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export declare const createCategoriaSchema: z.ZodObject<{
    nombre: z.ZodString;
}, z.core.$strip>;
export declare const categoriaIdParamSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
//# sourceMappingURL=clasificacion.validator.d.ts.map