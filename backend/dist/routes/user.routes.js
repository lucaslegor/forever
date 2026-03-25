"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
// GET /api/users - Listar usuarios (solo admin principal)
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, auth_middleware_1.requirePrincipalAdmin, user_controller_1.userController.getAllUsers.bind(user_controller_1.userController));
// GET /api/users/profile - CU16 Consultar perfil propio
router.get('/profile', auth_middleware_1.authenticateToken, user_controller_1.userController.getProfile.bind(user_controller_1.userController));
// PUT /api/users/profile - CU17 Modificar perfil propio
router.put('/profile', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateBody)(user_validator_1.updateProfileSchema), user_controller_1.userController.updateProfile.bind(user_controller_1.userController));
// PUT /api/users/:id/role - CU03 Asignar rol (solo admin principal)
router.put('/:id/role', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, auth_middleware_1.requirePrincipalAdmin, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(user_validator_1.assignRoleSchema), user_controller_1.userController.assignRole.bind(user_controller_1.userController));
// PUT /api/users/admin/:id/reset-password - Restablecer contraseña de admin (solo admin principal)
router.put('/admin/:id/reset-password', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, auth_middleware_1.requirePrincipalAdmin, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(user_validator_1.resetAdminPasswordSchema), user_controller_1.userController.resetAdminPassword.bind(user_controller_1.userController));
// PATCH /api/users/admin/:id/activo - Activar/desactivar cuenta de admin (solo admin principal, no la propia)
router.patch('/admin/:id/activo', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, auth_middleware_1.requirePrincipalAdmin, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(user_validator_1.setAdminActivoSchema), user_controller_1.userController.setAdminActivo.bind(user_controller_1.userController));
exports.default = router;
//# sourceMappingURL=user.routes.js.map