"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuotaController = exports.CuotaController = void 0;
const cuota_service_1 = require("../services/cuota.service");
const deportista_service_1 = require("../services/deportista.service");
const auditoria_service_1 = require("../services/auditoria.service");
const response_1 = require("../utils/response");
const request_1 = require("../utils/request");
const client_1 = require("@prisma/client");
class CuotaController {
    async asignar(req, res, next) {
        try {
            const data = req.body;
            const result = await cuota_service_1.cuotaService.asignar(data);
            (0, response_1.sendCreated)(res, result, 'Cuota asignada exitosamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await cuota_service_1.cuotaService.getById(id);
            const rol = req.user.rol;
            if (rol === client_1.Rol.ADMIN || rol === client_1.Rol.ADMINISTRATIVO) {
                (0, response_1.sendSuccess)(res, result);
                return;
            }
            const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
            if (result.deportistaId !== deportista.id) {
                (0, response_1.sendForbidden)(res, 'No tiene permisos para acceder a este recurso');
                return;
            }
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
            const result = await cuota_service_1.cuotaService.update(id, data);
            (0, response_1.sendSuccess)(res, result, 'Cuota actualizada correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getPredefinidas(req, res, next) {
        try {
            const disciplinaId = req.query.disciplinaId
                ? parseInt(req.query.disciplinaId, 10)
                : undefined;
            const result = await cuota_service_1.cuotaService.getPredefinidas(disciplinaId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getEstadoCuenta(req, res, next) {
        try {
            let deportistaId;
            if (req.user.rol === client_1.Rol.DEPORTISTA) {
                const deportista = await deportista_service_1.deportistaService.getByUserId(req.user.id);
                deportistaId = deportista.id;
            }
            else {
                deportistaId = parseInt(req.params.deportistaId, 10);
            }
            const result = await cuota_service_1.cuotaService.getEstadoCuenta(deportistaId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getByDeportista(req, res, next) {
        try {
            const deportistaId = parseInt(req.params.deportistaId, 10);
            const query = req.query;
            const result = await cuota_service_1.cuotaService.getByDeportista(deportistaId, query);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async getMiEstadoCuenta(req, res, next) {
        try {
            const deportistaId = await deportista_service_1.deportistaService.getDeportistaIdByUserId(req.user.id);
            if (deportistaId == null) {
                res.status(404).json({ success: false, error: 'Deportista no encontrado' });
                return;
            }
            const result = await cuota_service_1.cuotaService.getEstadoCuenta(deportistaId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async generarMensuales(req, res, next) {
        try {
            const data = req.body;
            const result = await cuota_service_1.cuotaService.generarCuotasMensuales(data.mes, data.anio);
            (0, response_1.sendCreated)(res, result, 'Cuotas generadas exitosamente');
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const query = req.query;
            const result = await cuota_service_1.cuotaService.getAll(query);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await cuota_service_1.cuotaService.delete(id);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePorGeneracion(req, res, next) {
        try {
            const query = req.query;
            const result = await cuota_service_1.cuotaService.deletePorGeneracion(query.anio, query.mes, query.disciplinaId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async deletePorMes(req, res, next) {
        try {
            const query = req.query;
            const result = await cuota_service_1.cuotaService.deletePorMes(query.anio, query.mes);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async marcarPagadaEfectivo(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const result = await cuota_service_1.cuotaService.marcarPagadaEfectivo(id);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.CUOTA_MARCAR_PAGADA,
                entidad: 'cuota',
                entidadId: id,
                detalles: JSON.stringify({ cuotaId: id }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, 'Cuota marcada como pagada en efectivo');
        }
        catch (error) {
            next(error);
        }
    }
    async cancelarDeuda(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = req.body;
            const result = await cuota_service_1.cuotaService.cancelarDeuda(id, data.motivo, req.user.id);
            await auditoria_service_1.auditoriaService.registrar({
                cuentaId: req.user?.id ?? null,
                accion: auditoria_service_1.ACCIONES.CUOTA_CANCELAR_DEUDA,
                entidad: 'cuota',
                entidadId: id,
                detalles: JSON.stringify({ cuotaId: id, motivo: data.motivo }),
                ip: (0, request_1.getClientIp)(req),
                userAgent: (0, request_1.getUserAgent)(req),
            });
            (0, response_1.sendSuccess)(res, result, 'Deuda cancelada');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CuotaController = CuotaController;
exports.cuotaController = new CuotaController();
//# sourceMappingURL=cuota.controller.js.map