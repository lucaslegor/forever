"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const beca_controller_1 = require("../controllers/beca.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const beca_validator_1 = require("../validators/beca.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo);
/** GET /api/becas - Listar deportistas becados */
router.get('/', beca_controller_1.becaController.getAll.bind(beca_controller_1.becaController));
/** GET /api/becas/:deportistaId - Ver estado beca de un deportista */
router.get('/:deportistaId', (0, validation_middleware_1.validateParams)(beca_validator_1.deportistaIdParamSchema), beca_controller_1.becaController.getByDeportistaId.bind(beca_controller_1.becaController));
/** POST /api/becas/:deportistaId/becar - Dar beca (body opcional: { cuotaBeca?: number }) */
router.post('/:deportistaId/becar', (0, validation_middleware_1.validateParams)(beca_validator_1.deportistaIdParamSchema), (0, validation_middleware_1.validateBody)(beca_validator_1.becarBodySchema), beca_controller_1.becaController.becar.bind(beca_controller_1.becaController));
/** DELETE /api/becas/:deportistaId - Quitar beca */
router.delete('/:deportistaId', (0, validation_middleware_1.validateParams)(beca_validator_1.deportistaIdParamSchema), beca_controller_1.becaController.quitarBeca.bind(beca_controller_1.becaController));
/** PATCH /api/becas/:deportistaId/cuota - Actualizar monto cuota beca (casos excepcionales). Body: { monto: number } */
router.patch('/:deportistaId/cuota', (0, validation_middleware_1.validateParams)(beca_validator_1.deportistaIdParamSchema), (0, validation_middleware_1.validateBody)(beca_validator_1.updateCuotaBecaBodySchema), beca_controller_1.becaController.updateCuotaBeca.bind(beca_controller_1.becaController));
exports.default = router;
//# sourceMappingURL=beca.routes.js.map