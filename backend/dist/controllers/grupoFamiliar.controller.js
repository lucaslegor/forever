"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.grupoFamiliarController = exports.GrupoFamiliarController = void 0;
const grupoFamiliar_service_1 = require("../services/grupoFamiliar.service");
const deportista_service_1 = require("../services/deportista.service");
const auditoria_service_1 = require("../services/auditoria.service");
const response_1 = require("../utils/response");
const request_1 = require("../utils/request");
class GrupoFamiliarController {
    async getMios(req, res, next) {
        try {
            const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
            const result = await grupoFamiliar_service_1.grupoFamiliarService.getByDeportistaId(deportista.id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const data = req.body;
            const result = await grupoFamiliar_service_1.grupoFamiliarService.create(data);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.GRUPO_FAMILIAR_CREAR,
                entidad: 'grupo_familiar',
                entidadId: result.id,
                detalles: JSON.stringify({ nombre: result.nombre }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendCreated)(res, result, 'Grupo familiar creado exitosamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const result = await grupoFamiliar_service_1.grupoFamiliarService.getAll(page, limit);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await grupoFamiliar_service_1.grupoFamiliarService.getById(id);
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
            const result = await grupoFamiliar_service_1.grupoFamiliarService.update(id, data);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.GRUPO_FAMILIAR_ACTUALIZACION,
                entidad: 'grupo_familiar',
                entidadId: id,
                detalles: JSON.stringify({ cambios: Object.keys(data) }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, 'Grupo familiar actualizado correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await grupoFamiliar_service_1.grupoFamiliarService.delete(id);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.GRUPO_FAMILIAR_BAJA,
                entidad: 'grupo_familiar',
                entidadId: id,
                detalles: JSON.stringify({ grupoFamiliarId: id }),
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
exports.GrupoFamiliarController = GrupoFamiliarController;
exports.grupoFamiliarController = new GrupoFamiliarController();
//# sourceMappingURL=grupoFamiliar.controller.js.map