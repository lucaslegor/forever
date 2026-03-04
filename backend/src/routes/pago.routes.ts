import { Router } from 'express';
import { pagoController } from '../controllers/pago.controller';
import {
  authenticateToken,
  requireAdministrativo,
  requireDeportista,
} from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import { createPagoSchema, syncPagoSchema } from '../validators/pago.validator';
import { idParamSchema } from '../validators/user.validator';
import { deportistaIdParamSchema } from '../validators/beca.validator';
import { webhookRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// GET /api/pagos/webhook/test - Prueba de accesibilidad del webhook
router.get('/webhook/test', pagoController.webhookTest.bind(pagoController));

// POST /api/pagos/webhook - Webhook de Mercado Pago (rate limit anti abuso)
router.post('/webhook', webhookRateLimiter, pagoController.webhook.bind(pagoController));

// POST /api/pagos/sync - Sincronizar pago con MP (cuando el webhook no llegó; solo Deportista)
router.post(
  '/sync',
  authenticateToken,
  requireDeportista,
  validateBody(syncPagoSchema),
  pagoController.sync.bind(pagoController)
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
  pagoController.confirmar.bind(pagoController)
);

export default router;
