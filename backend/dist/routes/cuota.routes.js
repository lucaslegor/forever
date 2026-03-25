"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cuota_controller_1 = require("../controllers/cuota.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const cuota_validator_1 = require("../validators/cuota.validator");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
// GET /api/cuotas/predefinidas - CU10 Consultar cuotas predefinidas
router.get('/predefinidas', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, cuota_controller_1.cuotaController.getPredefinidas.bind(cuota_controller_1.cuotaController));
// POST /api/cuotas/generar-mensual - Generar cuotas del mes para todos los deportistas
router.post('/generar-mensual', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(cuota_validator_1.generarCuotasSchema), cuota_controller_1.cuotaController.generarMensuales.bind(cuota_controller_1.cuotaController));
// GET /api/cuotas/mi-estado - CU07 Estado de cuenta del deportista logueado
router.get('/mi-estado', auth_middleware_1.authenticateToken, auth_middleware_1.requireDeportista, cuota_controller_1.cuotaController.getMiEstadoCuenta.bind(cuota_controller_1.cuotaController));
// POST /api/cuotas/asignar - CU04 Asignar cuota (solo Administrativo)
router.post('/asignar', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(cuota_validator_1.asignarCuotaSchema), cuota_controller_1.cuotaController.asignar.bind(cuota_controller_1.cuotaController));
// GET /api/cuotas/deportista/:deportistaId - Cuotas de un deportista
router.get('/deportista/:deportistaId', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateQuery)(cuota_validator_1.cuotasQuerySchema), cuota_controller_1.cuotaController.getByDeportista.bind(cuota_controller_1.cuotaController));
// GET /api/cuotas/estado-cuenta/:deportistaId - CU07 Estado de cuenta
router.get('/estado-cuenta/:deportistaId', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, cuota_controller_1.cuotaController.getEstadoCuenta.bind(cuota_controller_1.cuotaController));
// GET /api/cuotas - Listado admin (anio, mes, estado, page, limit)
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateQuery)(cuota_validator_1.listCuotasQuerySchema), cuota_controller_1.cuotaController.getAll.bind(cuota_controller_1.cuotaController));
// DELETE /api/cuotas/por-generacion - Borrar toda una generación (mes + año + disciplina)
router.delete('/por-generacion', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateQuery)(cuota_validator_1.deletePorGeneracionQuerySchema), cuota_controller_1.cuotaController.deletePorGeneracion.bind(cuota_controller_1.cuotaController));
// DELETE /api/cuotas/por-mes - Borrar toda la generación del mes (anio + mes)
router.delete('/por-mes', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateQuery)(cuota_validator_1.deletePorMesQuerySchema), cuota_controller_1.cuotaController.deletePorMes.bind(cuota_controller_1.cuotaController));
// GET /api/cuotas/:id - Obtener cuota
router.get('/:id', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), cuota_controller_1.cuotaController.getById.bind(cuota_controller_1.cuotaController));
// PUT /api/cuotas/:id - CU05 Actualizar cuota (solo Administrativo)
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(cuota_validator_1.updateCuotaSchema), cuota_controller_1.cuotaController.update.bind(cuota_controller_1.cuotaController));
// DELETE /api/cuotas/:id - Borrar cuota (solo si no tiene pago aprobado)
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), cuota_controller_1.cuotaController.delete.bind(cuota_controller_1.cuotaController));
// POST /api/cuotas/:id/marcar-efectivo - Marcar como pagada en efectivo
router.post('/:id/marcar-efectivo', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), cuota_controller_1.cuotaController.marcarPagadaEfectivo.bind(cuota_controller_1.cuotaController));
// PATCH /api/cuotas/:id/cancelar - Cancelar deuda (solo si está pendiente/vencida)
router.patch('/:id/cancelar', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(user_validator_1.idParamSchema), (0, validation_middleware_1.validateBody)(cuota_validator_1.cancelarCuotaSchema), cuota_controller_1.cuotaController.cancelarDeuda.bind(cuota_controller_1.cuotaController));
exports.default = router;
//# sourceMappingURL=cuota.routes.js.map