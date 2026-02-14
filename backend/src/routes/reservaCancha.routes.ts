import { Router } from 'express';
import { reservaCanchaController } from '../controllers/reservaCancha.controller';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.middleware';
import { reservaPublicRateLimiter } from '../middlewares/rateLimit.middleware';
import {
  disponibilidadQuerySchema,
  createReservaSchema,
  listReservasQuerySchema,
  updatePagosReservaSchema,
  updateReservaSchema,
  idParamSchema,
} from '../validators/reservaCancha.validator';

const router = Router();

/** GET /api/reservas-cancha/disponibilidad?fecha=YYYY-MM-DD - Público: horas ocupadas ese día */
router.get(
  '/disponibilidad',
  validateQuery(disponibilidadQuerySchema),
  reservaCanchaController.getDisponibilidad.bind(reservaCanchaController)
);

/** POST /api/reservas-cancha - Público: solicitar reserva (rate limit + validación) */
router.post(
  '/',
  reservaPublicRateLimiter,
  validateBody(createReservaSchema),
  reservaCanchaController.create.bind(reservaCanchaController)
);

/** GET /api/reservas-cancha - Admin: listar reservas (query: fechaDesde?, fechaHasta?) */
router.get(
  '/',
  authenticateToken,
  requireAdministrativo,
  validateQuery(listReservasQuerySchema),
  reservaCanchaController.list.bind(reservaCanchaController)
);

/** PATCH /api/reservas-cancha/:id/pagos - Admin: marcar seña/resto pagado */
router.patch(
  '/:id/pagos',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(updatePagosReservaSchema),
  reservaCanchaController.updatePagos.bind(reservaCanchaController)
);

/** PUT /api/reservas-cancha/:id - Admin: actualizar notas, monto total */
router.put(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  validateBody(updateReservaSchema),
  reservaCanchaController.update.bind(reservaCanchaController)
);

/** DELETE /api/reservas-cancha/:id - Admin: cancelar reserva */
router.delete(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(idParamSchema),
  reservaCanchaController.delete.bind(reservaCanchaController)
);

export default router;
