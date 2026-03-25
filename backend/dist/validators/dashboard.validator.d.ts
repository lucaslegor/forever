import { z } from 'zod';
export declare const dashboardStatsQuerySchema: z.ZodObject<{
    anio: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    mes: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const dashboardDeudoresQuerySchema: z.ZodObject<{
    disciplinaId: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    generoId: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    categoriaId: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    subcategoriaId: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    anio: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    mes: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
}, z.core.$strip>;
//# sourceMappingURL=dashboard.validator.d.ts.map