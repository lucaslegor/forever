import { z } from 'zod';
export declare const createDeportistaSchema: z.ZodObject<{
    nombre: z.ZodString;
    apellido: z.ZodString;
    dni: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    generoId: z.ZodCoercedNumber<unknown>;
    categoriaId: z.ZodCoercedNumber<unknown>;
    subcategoriaId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    disciplinaId: z.ZodCoercedNumber<unknown>;
    email: z.ZodString;
    password: z.ZodString;
    adultoResponsable: z.ZodOptional<z.ZodObject<{
        nombre: z.ZodString;
        apellido: z.ZodString;
        dni: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        email: z.ZodString;
        telefono: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updateDeportistaSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    apellido: z.ZodOptional<z.ZodString>;
    generoId: z.ZodOptional<z.ZodNumber>;
    categoriaId: z.ZodOptional<z.ZodNumber>;
    subcategoriaId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    disciplinaId: z.ZodOptional<z.ZodNumber>;
    adultoResponsable: z.ZodOptional<z.ZodObject<{
        nombre: z.ZodOptional<z.ZodString>;
        apellido: z.ZodOptional<z.ZodString>;
        dni: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        email: z.ZodOptional<z.ZodString>;
        telefono: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    adultosResponsables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        nombre: z.ZodOptional<z.ZodString>;
        apellido: z.ZodOptional<z.ZodString>;
        dni: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
        email: z.ZodOptional<z.ZodString>;
        telefono: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const deportistasQuerySchema: z.ZodObject<{
    page: z.ZodPipe<z.ZodTransform<string | number | undefined, unknown>, z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>>;
    limit: z.ZodPipe<z.ZodTransform<string | number | undefined, unknown>, z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>>;
    disciplinaId: z.ZodPipe<z.ZodTransform<string | number | undefined, unknown>, z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>>;
    generoId: z.ZodPipe<z.ZodTransform<string | number | undefined, unknown>, z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>>;
    categoriaId: z.ZodPipe<z.ZodTransform<string | number | undefined, unknown>, z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>>;
    subcategoriaId: z.ZodPipe<z.ZodTransform<string | number | undefined, unknown>, z.ZodOptional<z.ZodUnion<readonly [z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber]>>>;
    search: z.ZodPipe<z.ZodTransform<{} | null | undefined, unknown>, z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/** Lista de adultos responsables; el deportista sincroniza la suya (PUT mi-perfil) */
export declare const updateMiPerfilSchema: z.ZodObject<{
    adultosResponsables: z.ZodArray<z.ZodObject<{
        nombre: z.ZodString;
        apellido: z.ZodString;
        dni: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        email: z.ZodString;
        telefono: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateDeportistaInput = z.infer<typeof createDeportistaSchema>;
export type UpdateDeportistaInput = z.infer<typeof updateDeportistaSchema>;
export type UpdateMiPerfilInput = z.infer<typeof updateMiPerfilSchema>;
export type DeportistasQuery = z.infer<typeof deportistasQuerySchema>;
//# sourceMappingURL=deportista.validator.d.ts.map