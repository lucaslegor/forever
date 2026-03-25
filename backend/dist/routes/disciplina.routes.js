"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const disciplina_controller_1 = require("../controllers/disciplina.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const disciplina_validator_1 = require("../validators/disciplina.validator");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
// POST /api/disciplinas - Crear disciplina (solo Administrativo)
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(disciplina_validator_1.createDisciplinaSchema), disciplina_controller_1.disciplinaController.create.bind(disciplina_controller_1.disciplinaController));
// GET /api/disciplinas - Listar disciplinas
router.get('/', auth_middleware_1.authenticateToken, disciplina_controller_1.disciplinaController.getAll.bind(disciplina_controller_1.disciplinaController));
// GET /api/disciplinas/:id - Obtener disciplina
router.get('/:id', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), disciplina_controller_1.disciplinaController.getById.bind(disciplina_controller_1.disciplinaController));
// PUT /api/disciplinas/:id - Actualizar disciplina (solo Administrativo)
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(disciplina_validator_1.updateDisciplinaSchema), disciplina_controller_1.disciplinaController.update.bind(disciplina_controller_1.disciplinaController));
// GET /api/disciplinas/:id/deportistas - Deportistas de una disciplina
router.get('/:id/deportistas', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), disciplina_controller_1.disciplinaController.getDeportistas.bind(disciplina_controller_1.disciplinaController));
exports.default = router;
//# sourceMappingURL=disciplina.routes.js.map