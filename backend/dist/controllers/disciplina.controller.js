"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplinaController = exports.DisciplinaController = void 0;
const disciplina_service_1 = require("../services/disciplina.service");
const auditoria_service_1 = require("../services/auditoria.service");
const response_1 = require("../utils/response");
const request_1 = require("../utils/request");
class DisciplinaController {
    async create(req, res, next) {
        try {
            const data = req.body;
            const result = await disciplina_service_1.disciplinaService.create(data);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DISCIPLINA_ALTA,
                entidad: 'disciplina',
                entidadId: result.id,
                detalles: JSON.stringify({ nombre: result.nombre }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendCreated)(res, result, 'Disciplina creada exitosamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const result = await disciplina_service_1.disciplinaService.getAll(includeInactive);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await disciplina_service_1.disciplinaService.getById(id);
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
            const result = await disciplina_service_1.disciplinaService.update(id, data);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.DISCIPLINA_ACTUALIZACION,
                entidad: 'disciplina',
                entidadId: id,
                detalles: JSON.stringify({ cambios: Object.keys(data) }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, 'Disciplina actualizada correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getDeportistas(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const result = await disciplina_service_1.disciplinaService.getDeportistas(id, page, limit);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DisciplinaController = DisciplinaController;
exports.disciplinaController = new DisciplinaController();
//# sourceMappingURL=disciplina.controller.js.map