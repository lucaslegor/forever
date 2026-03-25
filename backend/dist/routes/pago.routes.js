"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pago_controller_1 = require("../controllers/pago.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const pago_validator_1 = require("../validators/pago.validator");
const user_validator_1 = require("../validators/user.validator");
const beca_validator_1 = require("../validators/beca.validator");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
// GET /api/pagos/webhook/test - Prueba de accesibilidad del webhook
router.get('/webhook/test', pago_controller_1.pagoController.webhookTest.bind(pago_controller_1.pagoController));
// POST /api/pagos/webhook - Webhook de Mercado Pago (rate limit anti abuso)
router.post('/webhook', rateLimit_middleware_1.webhookRateLimiter, pago_controller_1.pagoController.webhook.bind(pago_controller_1.pagoController));
// POST /api/pagos/sync - Sincronizar pago con MP (cuando el webhook no llegó; solo Deportista)
router.post('/sync', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, (0, validation_middleware_1.validateBody)(pago_validator_1.syncPagoSchema), pago_controller_1.pagoController.sync.bind(pago_controller_1.pagoController));
// POST /api/pagos/crear - CU08 Pagar cuota (solo Deportista)
router.post('/crear', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, (0, validation_middleware_1.validateBody)(pago_validator_1.createPagoSchema), pago_controller_1.pagoController.crear.bind(pago_controller_1.pagoController));
// GET /api/pagos/mis-pagos - Pagos del deportista logueado
router.get('/mis-pagos', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, pago_controller_1.pagoController.getMisPagos.bind(pago_controller_1.pagoController));
// GET /api/pagos/deportista/:deportistaId - Pagos de un deportista (Administrativo)
router.get('/deportista/:deportistaId', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(beca_validator_1.deportistaIdParamSchema), pago_controller_1.pagoController.getByDeportista.bind(pago_controller_1.pagoController));
// GET /api/pagos/:id - Obtener pago
router.get('/:id', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), pago_controller_1.pagoController.getById.bind(pago_controller_1.pagoController));
// POST /api/pagos/:id/confirmar - Confirmar pago manualmente (Admin)
router.post('/:id/confirmar', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), pago_controller_1.pagoController.confirmar.bind(pago_controller_1.pagoController));
exports.default = router;
//# sourceMappingURL=pago.routes.js.map