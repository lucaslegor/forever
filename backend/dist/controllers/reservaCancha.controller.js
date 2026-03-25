"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaCanchaController = exports.ReservaCanchaController = void 0;
const reservaCancha_service_1 = require("../services/reservaCancha.service");
const captcha_service_1 = require("../services/captcha.service");
const response_1 = require("../utils/response");
class ReservaCanchaController {
    getParamId(param) {
        const raw = Array.isArray(param) ? param[0] : param;
        const id = parseInt(String(raw), 10);
        return id;
    }
    async getDisponibilidad(req, res, next) {
        try {
            const fecha = req.query.fecha;
            if (!fecha) {
                res.status(400).json({ success: false, error: 'Parámetro fecha es requerido (YYYY-MM-DD)' });
                return;
            }
            const ocupados = await reservaCancha_service_1.reservaCanchaService.getOcupadosPorFecha(fecha);
            (0, response_1.sendSuccess)(res, { horasOcupadas: ocupados });
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const body = req.body;
            const valid = await captcha_service_1.captchaService.verifyTurnstile(body.captchaToken);
            if (!valid) {
                res.status(400).json({
                    success: false,
                    error: 'La verificación de seguridad falló. Intentá de nuevo.',
                });
                return;
            }
            const { captchaToken: _t, ...data } = body;
            const result = await reservaCancha_service_1.reservaCanchaService.create(data);
            const message = result.metodoPago === 'transferencia'
                ? 'Reserva registrada. Tenés 20 minutos para abonar la seña por transferencia vía WhatsApp.'
                : result.initPoint
                    ? 'Reserva registrada. Redirigiendo a Mercado Pago para abonar la seña.'
                    : 'Reserva registrada. Debe abonar la seña de $5000 para confirmar.';
            (0, response_1.sendCreated)(res, result, message);
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const fechaDesde = req.query.fechaDesde;
            const fechaHasta = req.query.fechaHasta;
            const data = await reservaCancha_service_1.reservaCanchaService.list(fechaDesde, fechaHasta);
            (0, response_1.sendSuccess)(res, data);
        }
        catch (error) {
            next(error);
        }
    }
    async updatePagos(req, res, next) {
        try {
            const id = this.getParamId(req.params.id);
            const body = req.body;
            const data = await reservaCancha_service_1.reservaCanchaService.updatePagos(id, body);
            (0, response_1.sendSuccess)(res, data, 'Pagos actualizados');
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const id = this.getParamId(req.params.id);
            const body = req.body;
            const data = await reservaCancha_service_1.reservaCanchaService.update(id, body);
            (0, response_1.sendSuccess)(res, data, 'Reserva actualizada');
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const id = this.getParamId(req.params.id);
            await reservaCancha_service_1.reservaCanchaService.delete(id);
            (0, response_1.sendSuccess)(res, { ok: true }, 'Reserva cancelada');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReservaCanchaController = ReservaCanchaController;
exports.reservaCanchaController = new ReservaCanchaController();
//# sourceMappingURL=reservaCancha.controller.js.map