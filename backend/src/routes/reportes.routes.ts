import { Router } from 'express';
import { deportistaController } from '../controllers/deportista.controller';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validation.middleware';
import { deportistasQuerySchema } from '../validators/deportista.validator';

const router = Router();

// GET /api/reportes/deportistas/pagos-pendientes - Alias front
router.get(
  '/deportistas/pagos-pendientes',
  authenticateToken,
  requireAdministrativo,
  deportistaController.getConPagosPendientes.bind(deportistaController)
);

// GET /api/reportes/deportistas - Alias front (listado deportistas con filtros)
router.get(
  '/deportistas',
  authenticateToken,
  requireAdministrativo,
  validateQuery(deportistasQuerySchema),
  deportistaController.getAll.bind(deportistaController)
);

export default router;
