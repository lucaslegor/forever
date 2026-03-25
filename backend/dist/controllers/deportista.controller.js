"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deportistaController = exports.DeportistaController = void 0;
const deportista_service_1 = require("../services/deportista.service");
const auditoria_service_1 = require("../services/auditoria.service");
const response_1 = require("../utils/response");
const request_1 = require("../utils/request");
const client_1 = require("@prisma/client");
class DeportistaController {
    async create(req, res, next) {
        try {
            const data = req.body;
            const result = await deportista_service_1.deportistaService.create(data);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DEPORTISTA_ALTA,
                entidad: 'deportista',
                entidadId: result.id,
                detalles: JSON.stringify({ nombre: result.nombre, apellido: result.apellido, dni: result.dni }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendCreated)(res, result, 'Deportista creado exitosamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const query = req.query;
            const result = await deportista_service_1.deportistaService.getAll(query);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await deportista_service_1.deportistaService.getById(id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = req.body;
            const result = await deportista_service_1.deportistaService.update(id, data);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DEPORTISTA_ACTUALIZACION,
                entidad: 'deportista',
                entidadId: id,
                detalles: JSON.stringify({ cambios: Object.keys(data) }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, 'Deportista actualizado correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await deportista_service_1.deportistaService.delete(id);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DEPORTISTA_BAJA,
                entidad: 'deportista',
                entidadId: id,
                detalles: JSON.stringify({ deportistaId: id }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async darDeAlta(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await deportista_service_1.deportistaService.darDeAlta(id);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DEPORTISTA_REACTIVAR,
                entidad: 'deportista',
                entidadId: id,
                detalles: JSON.stringify({ deportistaId: id }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, 'Deportista dado de alta. Ya puede iniciar sesión.');
        }
        catch (error) {
            next(error);
        }
    }
    async getConPagosPendientes(_req, res, next) {
        try {
            const result = await deportista_service_1.deportistaService.getConPagosPendientes();
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getHistorial(req, res, next) {
        try {
            let deportistaId;
            if (req.user.rol === client_1.Rol.DEPORTISTA) {
                const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
                deportistaId = deportista.id;
            }
            else {
                deportistaId = parseInt(req.params.id, 10);
            }
            const result = await deportista_service_1.deportistaService.getHistorial(deportistaId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMiPerfil(req, res, next) {
        try {
            const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
            (0, response_1.sendSuccess)(res, deportista);
        }
        catch (error) {
            next(error);
        }
    }
    async updateMiPerfil(req, res, next) {
        try {
            const data = req.body;
            const result = await deportista_service_1.deportistaService.updateMiPerfilAdultos(req.user.id, data);
            (0, response_1.sendSuccess)(res, result, 'Adultos responsables guardados correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const { newPassword } = req.body;
            const result = await deportista_service_1.deportistaService.resetPassword(id, newPassword);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DEPORTISTA_RESET_PASSWORD,
                entidad: 'deportista',
                entidadId: result.deportistaId ?? id,
                detalles: JSON.stringify({ deportistaId: result.deportistaId ?? id }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async resetPasswordByDni(req, res, next) {
        try {
            const { dni, newPassword } = req.body;
            const result = await deportista_service_1.deportistaService.resetPasswordByDni(dni, newPassword);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DEPORTISTA_RESET_PASSWORD,
                entidad: 'deportista',
                entidadId: result.deportistaId ?? null,
                detalles: JSON.stringify({ dni }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DeportistaController = DeportistaController;
exports.deportistaController = new DeportistaController();
//# sourceMappingURL=deportista.controller.js.map