"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reservaCancha_controller_1 = require("../controllers/reservaCancha.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const reservaCancha_validator_1 = require("../validators/reservaCancha.validator");
const router = (0, express_1.Router)();
/** GET /api/reservas-cancha/disponibilidad?fecha=YYYY-MM-DD - Público: horas ocupadas ese día */
router.get('/disponibilidad', (0, validation_middleware_1.validateQuery)(reservaCancha_validator_1.disponibilidadQuerySchema), reservaCancha_controller_1.reservaCanchaController.getDisponibilidad.bind(reservaCancha_controller_1.reservaCanchaController));
/** POST /api/reservas-cancha - Público: solicitar reserva (rate limit + validación) */
router.post('/', rateLimit_middleware_1.reservaPublicRateLimiter, (0, validation_middleware_1.validateBody)(reservaCancha_validator_1.createReservaSchema), reservaCancha_controller_1.reservaCanchaController.create.bind(reservaCancha_controller_1.reservaCanchaController));
/** GET /api/reservas-cancha - Admin: listar reservas (query: fechaDesde?, fechaHasta?) */
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateQuery)(reservaCancha_validator_1.listReservasQuerySchema), reservaCancha_controller_1.reservaCanchaController.list.bind(reservaCancha_controller_1.reservaCanchaController));
/** PATCH /api/reservas-cancha/:id/pagos - Admin: marcar seña/resto pagado */
router.patch('/:id/pagos', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(reservaCancha_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(reservaCancha_validator_1.updatePagosReservaSchema), reservaCancha_controller_1.reservaCanchaController.updatePagos.bind(reservaCancha_controller_1.reservaCanchaController));
/** PUT /api/reservas-cancha/:id - Admin: actualizar notas, monto total */
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(reservaCancha_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(reservaCancha_validator_1.updateReservaSchema), reservaCancha_controller_1.reservaCanchaController.update.bind(reservaCancha_controller_1.reservaCanchaController));
/** DELETE /api/reservas-cancha/:id - Admin: cancelar reserva */
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(reservaCancha_validator_1.idParamSchema), reservaCancha_controller_1.reservaCanchaController.delete.bind(reservaCancha_controller_1.reservaCanchaController));
exports.default = router;
//# sourceMappingURL=reservaCancha.routes.js.map