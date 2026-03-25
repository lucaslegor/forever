"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grupoFamiliar_controller_1 = require("../controllers/grupoFamiliar.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const grupoFamiliar_validator_1 = require("../validators/grupoFamiliar.validator");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
// GET /api/grupos-familiares/mios - Ver mis grupos familiares (solo Deportista)
router.get('/mios', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, grupoFamiliar_controller_1.grupoFamiliarController.getMios.bind(grupoFamiliar_controller_1.grupoFamiliarController));
// POST /api/grupos-familiares - CU13 Crear grupo familiar (solo Administrativo)
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(grupoFamiliar_validator_1.createGrupoFamiliarSchema), grupoFamiliar_controller_1.grupoFamiliarController.create.bind(grupoFamiliar_controller_1.grupoFamiliarController));
// GET /api/grupos-familiares - Listar grupos familiares
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, grupoFamiliar_controller_1.grupoFamiliarController.getAll.bind(grupoFamiliar_controller_1.grupoFamiliarController));
// GET /api/grupos-familiares/:id - Obtener grupo familiar
router.get('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), grupoFamiliar_controller_1.grupoFamiliarController.getById.bind(grupoFamiliar_controller_1.grupoFamiliarController));
// PUT /api/grupos-familiares/:id - Actualizar grupo familiar
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(grupoFamiliar_validator_1.updateGrupoFamiliarSchema), grupoFamiliar_controller_1.grupoFamiliarController.update.bind(grupoFamiliar_controller_1.grupoFamiliarController));
// DELETE /api/grupos-familiares/:id - Eliminar grupo familiar
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), grupoFamiliar_controller_1.grupoFamiliarController.delete.bind(grupoFamiliar_controller_1.grupoFamiliarController));
exports.default = router;
//# sourceMappingURL=grupoFamiliar.routes.js.map