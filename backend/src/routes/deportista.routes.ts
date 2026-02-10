import { Router } from 'express';
import { deportistaController } from '../controllers/deportista.controller';
import {
  authenticateToken,
  requireAdministrativo,
  requireDeportista,
} from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import {
  createDeportistaSchema,
  updateDeportistaSchema,
  updateMiPerfilSchema,
  deportistasQuerySchema,
} from '../validators/deportista.validator';
import { idParamSchema } from '../validators/user.validator';

const router = Router();

// GET /api/deportistas/pagos-pendientes - CU12 (solo Administrativo)
router.get(
  '/pagos-pendientes',
  authenticateToken,
  requireAdministrativo,
  deportistaController.getConPagosPendientes.bind(deportistaController)
);

// GET /api/deportistas/mi-perfil - Obtener perfil del deportista logueado
router.get(
  '/mi-perfil',
  authenticateToken,
  requireDeportista,
  deportistaController.getMiPerfil.bind(deportistaController)
);

// PUT /api/deportistas/mi-perfil - Actualizar adulto responsable del deportista logueado
router.put(
  '/mi-perfil',
  authenticateToken,
  requireDeportista,
  validateBody(updateMiPerfilSchema),
  deportistaController.updateMiPerfil.bind(deportistaController)
);

// GET /api/deportistas/mi-historial - CU06 Historial del deportista logueado
router.get(
  '/mi-historial',
  authenticateToken,
  requireDeportista,
  deportistaController.getHistorial.bind(deportistaController)
);

// POST /api/deportistas - Crear deportista (solo Administrativo)
router.post(
  '/',
  authenticateToken,
  requireAdministrativo,
  validateBody(createDeportistaSchema),
  deportistaController.create.bind(deportistaController)
);

// GET /api/deportistas - Listar deportistas (solo Administrativo)
router.get(
  '/',
  authenticateToken,
  requireAdministrativo,
  validateQuery(deportistasQuerySchema),
  deportistaController.getAll.bind(deportistaController)
);

// GET /api/deportistas/:id - Obtener deportista
router.get(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  deportistaController.getById.bind(deportistaController)
);

// PUT /api/deportistas/:id - Actualizar deportista (solo Administrativo)
router.put(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(updateDeportistaSchema),
  deportistaController.update.bind(deportistaController)
);

// DELETE /api/deportistas/:id - Eliminar deportista (solo Administrativo)
router.delete(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  deportistaController.delete.bind(deportistaController)
);

// PUT /api/deportistas/:id/reset-password - Restablecer contraseña (solo Administrativo)
router.put(
  '/:id/reset-password',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  deportistaController.resetPassword.bind(deportistaController)
);

// POST /api/deportistas/reset-password-dni - Restablecer contraseña por DNI (solo Administrativo)
router.post(
  '/reset-password-dni',
  authenticateToken,
  requireAdministrativo,
  deportistaController.resetPasswordByDni.bind(deportistaController)
);

// GET /api/deportistas/:id/historial - CU06 Historial de pagos
router.get(
  '/:id/historial',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  deportistaController.getHistorial.bind(deportistaController)
);

export default router;
