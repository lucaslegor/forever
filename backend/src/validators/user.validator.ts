import { z } from 'zod';

// CU03 - Asignar Rol
export const assignRoleSchema = z.object({
  rol: z.enum(['ADMIN', 'ADMINISTRATIVO', 'DEPORTISTA'], { message: 'Rol invalido' }),
});

// Al cambiar contraseña (deportista u otro usuario): debe tener al menos una mayúscula y un número
const passwordCambioRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;

// CU17 - Modificar Perfil
export const updateProfileSchema = z.object({
  email: z.string().email('Formato de email incorrecto').optional(),
  telefono: z.string().optional(),
  currentPassword: z.string().optional(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional(),
}).refine((data) => {
  if (data.password && !data.currentPassword) return false;
  return true;
}, { message: 'La contraseña actual es requerida para cambiar la contraseña', path: ['currentPassword'] }).refine((data) => {
  if (!data.password) return true;
  return passwordCambioRegex.test(data.password);
}, { message: 'La nueva contraseña debe tener al menos una mayúscula y un número', path: ['password'] });

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID invalido').transform(Number),
});

export const setAdminActivoSchema = z.object({
  activo: z.boolean(),
});

// Restablecer contraseña de admin (admin principal)
const passwordResetRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
export const resetAdminPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(passwordResetRegex, 'Debe tener al menos una mayúscula y un número'),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type SetAdminActivoInput = z.infer<typeof setAdminActivoSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
