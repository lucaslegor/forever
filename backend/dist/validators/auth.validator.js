"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// CU01 - Login
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string({ message: 'Email o DNI es requerido' }).min(1, 'Email o DNI es requerido'),
    password: zod_1.z.string({ message: 'La contrasena es requerida' }).min(6, 'La contrasena debe tener al menos 6 caracteres'),
    captchaToken: zod_1.z.string().min(1, 'CAPTCHA requerido'),
});
// CU02 - Registrar Usuario
exports.registerSchema = zod_1.z.object({
    nombre: zod_1.z
        .string({ message: 'El nombre es requerido' })
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    apellido: zod_1.z
        .string({ message: 'El apellido es requerido' })
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido no puede exceder 50 caracteres'),
    dni: zod_1.z
        .string({ message: 'El DNI es requerido' })
        .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 digitos'),
    email: zod_1.z.string({ message: 'El email es requerido' }).email('Formato de email incorrecto'),
    password: zod_1.z
        .string({ message: 'La contrasena es requerida' })
        .min(8, 'La contrasena debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contrasena debe tener al menos una mayuscula'),
    telefono: zod_1.z.string().optional(),
    rol: zod_1.z.enum(['ADMIN', 'ADMINISTRATIVO', 'DEPORTISTA'], { message: 'Rol invalido' }),
});
//# sourceMappingURL=auth.validator.js.map