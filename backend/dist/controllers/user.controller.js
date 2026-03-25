"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const auditoria_service_1 = require("../services/auditoria.service");
const response_1 = require("../utils/response");
const request_1 = require("../utils/request");
class UserController {
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await user_service_1.userService.getProfile(userId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const data = req.body;
            const result = await user_service_1.userService.updateProfile(userId, data);
            if (data.password != null && data.password.trim() !== '') {
                await auditoria_service_1.auditoriaService.registrar({
                    cuentaId: userId,
                    accion: auditoria_service_1.ACCIONES.CUENTA_CAMBIO_CONTRASEÑA,
                    entidad: 'cuenta',
                    entidadId: userId,
                    detalles: JSON.stringify({ cambioContraseña: true }),
                    ip: (0, request_1.getClientIp)(req),
                    userAgent: (0, request_1.getUserAgent)(req),
                });
            }
            (0, response_1.sendSuccess)(res, result, 'Perfil actualizado correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async assignRole(req, res, next) {
        try {
            const userId = req.user.id;
            const targetUserId = parseInt(req.params.id, 10);
            const data = req.body;
            const result = await user_service_1.userService.assignRole(userId, targetUserId, data);
            (0, response_1.sendSuccess)(res, result, 'Rol asignado correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const result = await user_service_1.userService.getAllUsers(page, limit);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async resetAdminPassword(req, res, next) {
        try {
            const adminId = parseInt(req.params.id, 10);
            const { newPassword } = req.body;
            const result = await user_service_1.userService.resetAdminPassword(adminId, newPassword);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.ADMIN_RESET_PASSWORD,
                entidad: 'administrativo',
                entidadId: adminId,
                detalles: JSON.stringify({ administrativoId: adminId }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async setAdminActivo(req, res, next) {
        try {
            const userId = req.user.id;
            const adminId = parseInt(req.params.id, 10);
            const { activo } = req.body;
            const result = await user_service_1.userService.setAdminActivo(userId, adminId, activo);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: userId,
                accion: activo ? auditoria_service_1.ACCIONES.ADMIN_ACTIVAR : auditoria_service_1.ACCIONES.ADMIN_DESACTIVAR,
                entidad: 'administrativo',
                entidadId: adminId,
                detalles: JSON.stringify({ administrativoId: adminId, activo }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, activo ? 'Cuenta activada' : 'Cuenta desactivada');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=user.controller.js.map