"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const rateLimit_middleware_1 = require("../middlewares/rateLimit.middleware");
const router = (0, express_1.Router)();
// POST /api/auth/login - CU01 (rate limit anti fuerza bruta)
router.post('/login', rateLimit_middleware_1.loginRateLimiter, (0, validation_middleware_1.validateBody)(auth_validator_1.loginSchema), auth_controller_1.authController.login.bind(auth_controller_1.authController));
// POST /api/auth/register - CU02 (solo admin principal: admin@foreverclub.com)
router.post('/register', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, auth_middleware_1.requirePrincipalAdmin, (0, validation_middleware_1.validateBody)(auth_validator_1.registerSchema), auth_controller_1.authController.register.bind(auth_controller_1.authController));
// GET /api/auth/me - Obtener usuario autenticado
router.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.authController.me.bind(auth_controller_1.authController));
// POST /api/auth/logout - Cerrar sesion (borra cookie HttpOnly)
router.post('/logout', auth_controller_1.authController.logout.bind(auth_controller_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map