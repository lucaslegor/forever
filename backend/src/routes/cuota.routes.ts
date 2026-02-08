import { Router } from 'express';
import { cuotaController } from '../controllers/cuota.controller';
import {
  authenticateToken,
  requireAdministrativo,
  requireDeportista,
} from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { uploadComprobante } from '../middlewares/upload.middleware';
import {
  asignarCuotaSchema,
  updateCuotaSchema,
  cuotasQuerySchema,
  generarCuotasSchema,
  adminGenerarSchema,
  updateEstadoCuotaSchema,
  cuotaIdParamSchema,
} from '../validators/cuota.validator';
import { idParamSchema, deportistaIdParamSchema } from '../validators/user.validator';

const router = Router();

// GET /api/cuotas/predefinidas - CU10 Consultar cuotas predefinidas
router.get(
  '/predefinidas',
  authenticateToken,
  requireAdministrativo,
  cuotaController.getPredefinidas.bind(cuotaController)
);

// GET /api/cuotas/socio - Cuotas del socio logueado (formato front)
router.get(
  '/socio',
  authenticateToken,
  requireDeportista,
  cuotaController.getCuotasSocio.bind(cuotaController)
);

// GET /api/cuotas/administrativo - Listado de cuotas para admin
router.get(
  '/administrativo',
  authenticateToken,
  requireAdministrativo,
  cuotaController.getCuotasAdministrativo.bind(cuotaController)
);

// POST /api/cuotas/admin/generar - Alias front: actividadId, mes string, preview
router.post(
  '/admin/generar',
  authenticateToken,
  requireAdministrativo,
  validateBody(adminGenerarSchema),
  cuotaController.adminGenerar.bind(cuotaController)
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

// PATCH /api/cuotas/administrativo/:id/estado - Cambiar estado (Aprobada/Rechazada)
router.patch(
  '/administrativo/:id/estado',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(updateEstadoCuotaSchema),
  cuotaController.updateEstadoCuota.bind(cuotaController)
);

// POST /api/cuotas/socio/:cuotaId/comprobante - Subir comprobante (socio)
router.post(
  '/socio/:cuotaId/comprobante',
  authenticateToken,
  requireDeportista,
  validateParams(cuotaIdParamSchema),
  (req, res, next) => {
    uploadComprobante(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, error: err.message || 'Error al subir archivo' });
        return;
      }
      next();
    });
  },
  cuotaController.subirComprobante.bind(cuotaController)
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
  validateParams(deportistaIdParamSchema),
  validateQuery(cuotasQuerySchema),
  cuotaController.getByDeportista.bind(cuotaController)
);

// GET /api/cuotas/estado-cuenta/:deportistaId - CU07 Estado de cuenta
router.get(
  '/estado-cuenta/:deportistaId',
  authenticateToken,
  requireAdministrativo,
  validateParams(deportistaIdParamSchema),
  cuotaController.getEstadoCuenta.bind(cuotaController)
);

// PATCH /api/cuotas/:id/estado - Cambiar estado (ComprobantePage: Aprobada/Rechazada)
router.patch(
  '/:id/estado',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(updateEstadoCuotaSchema),
  cuotaController.updateEstadoCuota.bind(cuotaController)
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

export default router;
