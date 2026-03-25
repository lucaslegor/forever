import { z } from 'zod';
export declare const deportistaIdParamSchema: z.ZodObject<{
    deportistaId: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export declare const becarBodySchema: z.ZodDefault<z.ZodOptional<z.ZodObject<{
    cuotaBeca: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>>>;
export declare const updateCuotaBecaBodySchema: z.ZodObject<{
    monto: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
//# sourceMappingURL=beca.validator.d.ts.map