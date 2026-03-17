import { z } from 'zod';

// CU01 - Login
export const loginSchema = z.object({
  email: z.string({ message: 'Email o DNI es requerido' }).min(1, 'Email o DNI es requerido'),
  password: z.string({ message: 'La contrasena es requerida' }).min(6, 'La contrasena debe tener al menos 6 caracteres'),
  captchaToken: z.string().min(1, 'CAPTCHA requerido'),
});

// CU02 - Registrar Usuario
export const registerSchema = z.object({
  nombre: z
    .string({ message: 'El nombre es requerido' })
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  apellido: z
    .string({ message: 'El apellido es requerido' })
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  dni: z
    .string({ message: 'El DNI es requerido' })
    .regex(/^\d{7,8}$/, 'El DNI debe tener 7 u 8 digitos'),
  email: z.string({ message: 'El email es requerido' }).email('Formato de email incorrecto'),
  password: z
    .string({ message: 'La contrasena es requerida' })
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contrasena debe tener al menos una mayuscula'),
  telefono: z.string().optional(),
  rol: z.enum(['ADMIN', 'ADMINISTRATIVO', 'DEPORTISTA'], { message: 'Rol invalido' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
