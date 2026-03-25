"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deportista_controller_1 = require("../controllers/deportista.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const deportista_validator_1 = require("../validators/deportista.validator");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
// GET /api/deportistas/pagos-pendientes - CU12 (solo Administrativo)
router.get('/pagos-pendientes', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, deportista_controller_1.deportistaController.getConPagosPendientes.bind(deportista_controller_1.deportistaController));
// GET /api/deportistas/mi-perfil - Obtener perfil del deportista logueado
router.get('/mi-perfil', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, deportista_controller_1.deportistaController.getMiPerfil.bind(deportista_controller_1.deportistaController));
// PUT /api/deportistas/mi-perfil - Actualizar adulto responsable del deportista logueado
router.put('/mi-perfil', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, (0, validation_middleware_1.validateBody)(deportista_validator_1.updateMiPerfilSchema), deportista_controller_1.deportistaController.updateMiPerfil.bind(deportista_controller_1.deportistaController));
// GET /api/deportistas/mi-historial - CU06 Historial del deportista logueado
router.get('/mi-historial', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, deportista_controller_1.deportistaController.getHistorial.bind(deportista_controller_1.deportistaController));
// POST /api/deportistas - Crear deportista (solo Administrativo)
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(deportista_validator_1.createDeportistaSchema), deportista_controller_1.deportistaController.create.bind(deportista_controller_1.deportistaController));
// GET /api/deportistas - Listar deportistas (solo Administrativo)
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateQuery)(deportista_validator_1.deportistasQuerySchema), deportista_controller_1.deportistaController.getAll.bind(deportista_controller_1.deportistaController));
// GET /api/deportistas/:id - Obtener deportista
router.get('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), deportista_controller_1.deportistaController.getById.bind(deportista_controller_1.deportistaController));
// PUT /api/deportistas/:id - Actualizar deportista (solo Administrativo)
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(deportista_validator_1.updateDeportistaSchema), deportista_controller_1.deportistaController.update.bind(deportista_controller_1.deportistaController));
// DELETE /api/deportistas/:id - Eliminar deportista (solo Administrativo)
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), deportista_controller_1.deportistaController.delete.bind(deportista_controller_1.deportistaController));
// PUT /api/deportistas/:id/alta - Dar de alta deportista (reactivar cuenta, solo Administrativo)
router.put('/:id/alta', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), deportista_controller_1.deportistaController.darDeAlta.bind(deportista_controller_1.deportistaController));
// PUT /api/deportistas/:id/reset-password - Restablecer contraseña (solo Administrativo)
router.put('/:id/reset-password', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), deportista_controller_1.deportistaController.resetPassword.bind(deportista_controller_1.deportistaController));
// POST /api/deportistas/reset-password-dni - Restablecer contraseña por DNI (solo Administrativo)
router.post('/reset-password-dni', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, deportista_controller_1.deportistaController.resetPasswordByDni.bind(deportista_controller_1.deportistaController));
// GET /api/deportistas/:id/historial - CU06 Historial de pagos
router.get('/:id/historial', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), deportista_controller_1.deportistaController.getHistorial.bind(deportista_controller_1.deportistaController));
exports.default = router;
//# sourceMappingURL=deportista.routes.js.map