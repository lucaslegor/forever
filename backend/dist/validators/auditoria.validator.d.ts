import { z } from 'zod';
export declare const auditoriaQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    cuentaId: z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>;
    entidad: z.ZodOptional<z.ZodString>;
    accion: z.ZodOptional<z.ZodString>;
    desde: z.ZodOptional<z.ZodString>;
    hasta: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=auditoria.validator.d.ts.map