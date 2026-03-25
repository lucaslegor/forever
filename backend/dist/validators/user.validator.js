"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAdminPasswordSchema = exports.setAdminActivoSchema = exports.idParamSchema = exports.updateProfileSchema = exports.assignRoleSchema = void 0;
const zod_1 = require("zod");
// CU03 - Asignar Rol
exports.assignRoleSchema = zod_1.z.object({
    rol: zod_1.z.enum(['ADMIN', 'ADMINISTRATIVO', 'DEPORTISTA'], { message: 'Rol invalido' }),
});
// Al cambiar contraseña (deportista u otro usuario): debe tener al menos una mayúscula y un número
const passwordCambioRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
// CU17 - Modificar Perfil
exports.updateProfileSchema = zod_1.z.object({
    email: zod_1.z.string().email('Formato de email incorrecto').optional(),
    telefono: zod_1.z.string().optional(),
    currentPassword: zod_1.z.string().optional(),
    password: zod_1.z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .optional(),
}).refine((data) => {
    if (data.password && !data.currentPassword)
        return false;
    return true;
}, { message: 'La contraseña actual es requerida para cambiar la contraseña', path: ['currentPassword'] }).refine((data) => {
    if (!data.password)
        return true;
    return passwordCambioRegex.test(data.password);
}, { message: 'La nueva contraseña debe tener al menos una mayúscula y un número', path: ['password'] });
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID invalido').transform(Number),
});
exports.setAdminActivoSchema = zod_1.z.object({
    activo: zod_1.z.boolean(),
});
// Restablecer contraseña de admin (admin principal)
const passwordResetRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
exports.resetAdminPasswordSchema = zod_1.z.object({
    newPassword: zod_1.z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .regex(passwordResetRegex, 'Debe tener al menos una mayúscula y un número'),
});
//# sourceMappingURL=user.validator.js.map