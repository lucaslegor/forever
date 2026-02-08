import { Router } from 'express';
import { pagoController } from '../controllers/pago.controller';
import {
  authenticateToken,
  requireAdministrativo,
  requireDeportista,
} from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import { createPagoSchema, confirmarPagoSchema } from '../validators/pago.validator';
import { idParamSchema, deportistaIdParamSchema } from '../validators/user.validator';

const router = Router();

// POST /api/pagos/webhook - Webhook de Mercado Pago
router.post('/webhook', pagoController.webhook.bind(pagoController));

// POST /api/pagos - Alias front (crear pago con { cuotaId })
router.post(
  '/',
  authenticateToken,
  requireDeportista,
  validateBody(createPagoSchema),
  pagoController.crear.bind(pagoController)
);

// POST /api/pagos/crear - CU08 Pagar cuota (solo Deportista)
router.post(
  '/crear',
  authenticateToken,
  requireDeportista,
  validateBody(createPagoSchema),
  pagoController.crear.bind(pagoController)
);

// GET /api/pagos/mis-pagos - Pagos del deportista logueado
router.get(
  '/mis-pagos',
  authenticateToken,
  requireDeportista,
  pagoController.getMisPagos.bind(pagoController)
);

// GET /api/pagos/deportista/:deportistaId - Pagos de un deportista (Administrativo)
router.get(
  '/deportista/:deportistaId',
  authenticateToken,
  requireAdministrativo,
  validateParams(deportistaIdParamSchema),
  pagoController.getByDeportista.bind(pagoController)
);

// GET /api/pagos/:id - Obtener pago
router.get(
  '/:id',
  authenticateToken,
  validateParams(idParamSchema),
  pagoController.getById.bind(pagoController)
);

// POST /api/pagos/:id/confirmar - Confirmar pago manualmente (Admin)
router.post(
  '/:id/confirmar',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(confirmarPagoSchema),
  pagoController.confirmar.bind(pagoController)
);

export default router;
