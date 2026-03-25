"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
class UserService {
    async getProfile(userId) {
        const cuenta = await prisma_1.default.cuentaUsuario.findUnique({
            where: { id: userId },
            include: {
                deportista: {
                    include: {
                        disciplina: true,
                    },
                },
                administrativo: true,
            },
        });
        if (!cuenta) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.USER_NOT_FOUND);
        }
        const { password, ...cuentaSinPassword } = cuenta;
        return cuentaSinPassword;
    }
    async updateProfile(userId, data) {
        const cuenta = await prisma_1.default.cuentaUsuario.findUnique({
            where: { id: userId },
        });
        if (!cuenta) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.USER_NOT_FOUND);
        }
        // Verificar email único si se está actualizando
        if (data.email && data.email !== cuenta.email) {
            const existingEmail = await prisma_1.default.cuentaUsuario.findUnique({
                where: { email: data.email },
            });
            if (existingEmail) {
                throw new errors_1.ConflictError(errors_1.ErrorMessages.EMAIL_EXISTS);
            }
        }
        const updateData = {};
        if (data.email) {
            updateData.email = data.email;
        }
        if (data.password) {
            if (!data.currentPassword) {
                throw new errors_1.BadRequestError('La contraseña actual es requerida para cambiar la contraseña');
            }
            const passwordValid = await bcryptjs_1.default.compare(data.currentPassword, cuenta.password);
            if (!passwordValid) {
                throw new errors_1.BadRequestError('La contraseña actual es incorrecta');
            }
            updateData.password = await bcryptjs_1.default.hash(data.password, 10);
        }
        const updatedCuenta = await prisma_1.default.cuentaUsuario.update({
            where: { id: userId },
            data: updateData,
            include: {
                deportista: true,
                administrativo: true,
            },
        });
        const { password, ...cuentaSinPassword } = updatedCuenta;
        return cuentaSinPassword;
    }
    async assignRole(_userId, targetUserId, data) {
        const targetCuenta = await prisma_1.default.cuentaUsuario.findUnique({
            where: { id: targetUserId },
        });
        if (!targetCuenta) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.USER_NOT_FOUND);
        }
        // Validar regla de al menos 1 Admin
        if (targetCuenta.rol === client_1.Rol.ADMIN && data.rol !== 'ADMIN') {
            const adminCount = await prisma_1.default.cuentaUsuario.count({
                where: { rol: client_1.Rol.ADMIN, activo: true },
            });
            if (adminCount <= 1) {
                throw new errors_1.BadRequestError(errors_1.ErrorMessages.LAST_ADMIN);
            }
        }
        const updatedCuenta = await prisma_1.default.cuentaUsuario.update({
            where: { id: targetUserId },
            data: { rol: data.rol },
        });
        const { password, ...cuentaSinPassword } = updatedCuenta;
        return cuentaSinPassword;
    }
    async getAllUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            prisma_1.default.cuentaUsuario.findMany({
                skip,
                take: limit,
                include: {
                    deportista: true,
                    administrativo: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_1.default.cuentaUsuario.count(),
        ]);
        return {
            data: users.map(({ password, ...user }) => user),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async resetAdminPassword(adminId, newPassword) {
        const admin = await prisma_1.default.administrativo.findUnique({
            where: { id: adminId },
            include: { cuenta: true },
        });
        if (!admin) {
            throw new errors_1.NotFoundError('Administrativo no encontrado');
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.cuentaUsuario.update({
            where: { id: admin.cuentaId },
            data: { password: hashedPassword },
        });
        return { message: 'Contraseña restablecida correctamente' };
    }
    async setAdminActivo(principalUserId, adminId, activo) {
        const admin = await prisma_1.default.administrativo.findUnique({
            where: { id: adminId },
            include: { cuenta: true },
        });
        if (!admin) {
            throw new errors_1.NotFoundError('Administrativo no encontrado');
        }
        if (admin.cuentaId === principalUserId) {
            throw new errors_1.BadRequestError('No podés desactivar tu propia cuenta');
        }
        await prisma_1.default.cuentaUsuario.update({
            where: { id: admin.cuentaId },
            data: { activo },
        });
        return { activo };
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
//# sourceMappingURL=user.service.js.map