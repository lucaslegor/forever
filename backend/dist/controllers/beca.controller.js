"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.becaController = exports.BecaController = void 0;
const beca_service_1 = require("../services/beca.service");
const response_1 = require("../utils/response");
class BecaController {
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 500;
            const result = await beca_service_1.becaService.getAll(page, limit);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async becar(req, res, next) {
        try {
            const deportistaId = parseInt(req.params.deportistaId, 10);
            const body = (req.body || {});
            const cuotaBeca = body.cuotaBeca != null ? Number(body.cuotaBeca) : undefined;
            const result = await beca_service_1.becaService.becar(deportistaId, cuotaBeca);
            (0, response_1.sendCreated)(res, result, 'Beca asignada correctamente');
        }
        catch (error) {
            next(error);
        }
    }
    async quitarBeca(req, res, next) {
        try {
            const deportistaId = parseInt(req.params.deportistaId, 10);
            const result = await beca_service_1.becaService.quitarBeca(deportistaId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateCuotaBeca(req, res, next) {
        try {
            const deportistaId = parseInt(req.params.deportistaId, 10);
            const body = req.body;
            const monto = Number(body.monto);
            if (Number.isNaN(monto) || monto < 0) {
                res.status(400).json({ error: 'Monto inválido' });
                return;
            }
            const result = await beca_service_1.becaService.updateCuotaBeca(deportistaId, monto);
            (0, response_1.sendSuccess)(res, result, 'Cuota beca actualizada');
        }
        catch (error) {
            next(error);
        }
    }
    async getByDeportistaId(req, res, next) {
        try {
            const deportistaId = parseInt(req.params.deportistaId, 10);
            const result = await beca_service_1.becaService.getByDeportistaId(deportistaId);
            (0, response_1.sendSuccess)(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BecaController = BecaController;
exports.becaController = new BecaController();
//# sourceMappingURL=beca.controller.js.map