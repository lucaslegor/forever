import { z } from 'zod';

// CU03 - Asignar Rol
export const assignRoleSchema = z.object({
  rol: z.enum(['ADMIN', 'ADMINISTRATIVO', 'DEPORTISTA'], { message: 'Rol invalido' }),
});

// CU17 - Modificar Perfil
export const updateProfileSchema = z.object({
  email: z.string().email('Formato de email incorrecto').optional(),
  telefono: z.string().optional(),
  password: z
    .string()
    .min(8, 'La contrasena debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contrasena debe tener al menos una mayuscula')
    .optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID invalido').transform(Number),
});

export const deportistaIdParamSchema = z.object({
  deportistaId: z.string().regex(/^\d+$/, 'ID de deportista invalido').transform(Number),
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type DeportistaIdParam = z.infer<typeof deportistaIdParamSchema>;
