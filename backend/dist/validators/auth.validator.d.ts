import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    captchaToken: z.ZodString;
}, z.core.$strip>;
export declare const registerSchema: z.ZodObject<{
    nombre: z.ZodString;
    apellido: z.ZodString;
    dni: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    telefono: z.ZodOptional<z.ZodString>;
    rol: z.ZodEnum<{
        ADMIN: "ADMIN";
        ADMINISTRATIVO: "ADMINISTRATIVO";
        DEPORTISTA: "DEPORTISTA";
    }>;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
//# sourceMappingURL=auth.validator.d.ts.map