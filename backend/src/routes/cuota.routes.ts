import { Router } from 'express';
import { cuotaController } from '../controllers/cuota.controller';
import {
  authenticateToken,
  requireAdministrativo,
  requireDeportista,
} from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { asignarCuotaSchema, updateCuotaSchema, cancelarCuotaSchema, cuotasQuerySchema, listCuotasQuerySchema, generarCuotasSchema, deletePorGeneracionQuerySchema, deletePorMesQuerySchema } from '../validators/cuota.validator';
import { idParamSchema } from '../validators/user.validator';

const router = Router();

// GET /api/cuotas/predefinidas - CU10 Consultar cuotas predefinidas
router.get(
  '/predefinidas',
  authenticateToken,
  requireAdministrativo,
  cuotaController.getPredefinidas.bind(cuotaController)
);

// POST /api/cuotas/generar-mensual - Generar cuotas del mes para todos los deportistas
router.post(
  '/generar-mensual',
  authenticateToken,
  requireAdministrativo,
  validateBody(generarCuotasSchema),
  cuotaController.generarMensuales.bind(cuotaController)
);

// GET /api/cuotas/mi-estado - CU07 Estado de cuenta del deportista logueado
router.get(
  '/mi-estado',
  authenticateToken,
  requireDeportista,
  cuotaController.getMiEstadoCuenta.bind(cuotaController)
);

// POST /api/cuotas/asignar - CU04 Asignar cuota (solo Administrativo)
router.post(
  '/asignar',
  authenticateToken,
  requireAdministrativo,
  validateBody(asignarCuotaSchema),
  cuotaController.asignar.bind(cuotaController)
);

// GET /api/cuotas/deportista/:deportistaId - Cuotas de un deportista
router.get(
  '/deportista/:deportistaId',
  authenticateToken,
  requireAdministrativo,
  validateQuery(cuotasQuerySchema),
  cuotaController.getByDeportista.bind(cuotaController)
);

// GET /api/cuotas/estado-cuenta/:deportistaId - CU07 Estado de cuenta
router.get(
  '/estado-cuenta/:deportistaId',
  authenticateToken,
  requireAdministrativo,
  cuotaController.getEstadoCuenta.bind(cuotaController)
);

// GET /api/cuotas - Listado admin (anio, mes, estado, page, limit)
router.get(
  '/',
  authenticateToken,
  requireAdministrativo,
  validateQuery(listCuotasQuerySchema),
  cuotaController.getAll.bind(cuotaController)
);

// DELETE /api/cuotas/por-generacion - Borrar toda una generación (mes + año + disciplina)
router.delete(
  '/por-generacion',
  authenticateToken,
  requireAdministrativo,
  validateQuery(deletePorGeneracionQuerySchema),
  cuotaController.deletePorGeneracion.bind(cuotaController)
);

// DELETE /api/cuotas/por-mes - Borrar toda la generación del mes (anio + mes)
router.delete(
  '/por-mes',
  authenticateToken,
  requireAdministrativo,
  validateQuery(deletePorMesQuerySchema),
  cuotaController.deletePorMes.bind(cuotaController)
);

// GET /api/cuotas/:id - Obtener cuota
router.get(
  '/:id',
  authenticateToken,
  validateParams(idParamSchema),
  cuotaController.getById.bind(cuotaController)
);

// PUT /api/cuotas/:id - CU05 Actualizar cuota (solo Administrativo)
router.put(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(updateCuotaSchema),
  cuotaController.update.bind(cuotaController)
);

// DELETE /api/cuotas/:id - Borrar cuota (solo si no tiene pago aprobado)
router.delete(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  cuotaController.delete.bind(cuotaController)
);

// POST /api/cuotas/:id/marcar-efectivo - Marcar como pagada en efectivo
router.post(
  '/:id/marcar-efectivo',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  cuotaController.marcarPagadaEfectivo.bind(cuotaController)
);

// PATCH /api/cuotas/:id/cancelar - Cancelar deuda (solo si está pendiente/vencida)
router.patch(
  '/:id/cancelar',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(cancelarCuotaSchema),
  cuotaController.cancelarDeuda.bind(cuotaController)
);

export default router;
