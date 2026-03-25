"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditoriaController = exports.AuditoriaController = void 0;
const auditoria_service_1 = require("../services/auditoria.service");
const response_1 = require("../utils/response");
class AuditoriaController {
    async listar(req, res, next) {
        try {
            const page = req.query.page != null ? parseInt(String(req.query.page), 10) : undefined;
            const limit = req.query.limit != null ? parseInt(String(req.query.limit), 10) : undefined;
            const cuentaId = req.query.cuentaId != null ? parseInt(String(req.query.cuentaId), 10) : undefined;
            const entidad = typeof req.query.entidad === 'string' ? req.query.entidad : undefined;
            const accion = typeof req.query.accion === 'string' ? req.query.accion : undefined;
            const desde = typeof req.query.desde === 'string' ? new Date(req.query.desde) : undefined;
            const hasta = typeof req.query.hasta === 'string' ? new Date(req.query.hasta) : undefined;
            const result = await auditoria_service_1.auditoriaService.listar({
                page,
                limit,
                cuentaId: Number.isNaN(cuentaId) ? undefined : cuentaId,
                entidad,
                accion,
                desde: desde && !Number.isNaN(desde.getTime()) ? desde : undefined,
                hasta: hasta && !Number.isNaN(hasta.getTime()) ? hasta : undefined,
            });
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuditoriaController = AuditoriaController;
exports.auditoriaController = new AuditoriaController();
//# sourceMappingURL=auditoria.controller.js.map