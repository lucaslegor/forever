import { z } from 'zod';
export declare const assignRoleSchema: z.ZodObject<{
    rol: z.ZodEnum<{
        ADMIN: "ADMIN";
        ADMINISTRATIVO: "ADMINISTRATIVO";
        DEPORTISTA: "DEPORTISTA";
    }>;
}, z.core.$strip>;
export declare const updateProfileSchema: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    telefono: z.ZodOptional<z.ZodString>;
    currentPassword: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
}, z.core.$strip>;
export declare const setAdminActivoSchema: z.ZodObject<{
    activo: z.ZodBoolean;
}, z.core.$strip>;
export declare const resetAdminPasswordSchema: z.ZodObject<{
    newPassword: z.ZodString;
}, z.core.$strip>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type SetAdminActivoInput = z.infer<typeof setAdminActivoSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
//# sourceMappingURL=user.validator.d.ts.map