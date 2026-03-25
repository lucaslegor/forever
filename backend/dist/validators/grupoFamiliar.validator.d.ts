import { z } from 'zod';
export declare const createGrupoFamiliarSchema: z.ZodObject<{
    nombre: z.ZodString;
    titularDni: z.ZodString;
    cuotaHermano: z.ZodOptional<z.ZodNumber>;
    integrantes: z.ZodArray<z.ZodObject<{
        deportistaId: z.ZodNumber;
        esPrincipal: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateGrupoFamiliarSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    titularDni: z.ZodOptional<z.ZodString>;
    cuotaHermano: z.ZodOptional<z.ZodNumber>;
    integrantes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        deportistaId: z.ZodNumber;
        esPrincipal: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type CreateGrupoFamiliarInput = z.infer<typeof createGrupoFamiliarSchema>;
export type UpdateGrupoFamiliarInput = z.infer<typeof updateGrupoFamiliarSchema>;
//# sourceMappingURL=grupoFamiliar.validator.d.ts.map