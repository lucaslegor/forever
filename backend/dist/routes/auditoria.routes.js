"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditoria_controller_1 = require("../controllers/auditoria.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auditoria_validator_1 = require("../validators/auditoria.validator");
const router = (0, express_1.Router)();
/** Solo el admin supremo (admin@foreverclub.com) puede ver el log de auditoría */
router.use(auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, auth_middleware_1.requirePrincipalAdmin);
/**
 * GET /api/auditoria
 * Query: page, limit, cuentaId, entidad, accion, desde (ISO date), hasta (ISO date)
 */
router.get('/', (0, validation_middleware_1.validateQuery)(auditoria_validator_1.auditoriaQuerySchema), auditoria_controller_1.auditoriaController.listar.bind(auditoria_controller_1.auditoriaController));
exports.default = router;
//# sourceMappingURL=auditoria.routes.js.map