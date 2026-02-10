import { Router } from 'express';
import { reservaCanchaController } from '../controllers/reservaCancha.controller';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';

const router = Router();

/** GET /api/reservas-cancha/disponibilidad?fecha=YYYY-MM-DD - Público: horas ocupadas ese día */
router.get('/disponibilidad', reservaCanchaController.getDisponibilidad.bind(reservaCanchaController));

/** POST /api/reservas-cancha - Público: solicitar reserva (luego se abona seña $5000) */
router.post('/', reservaCanchaController.create.bind(reservaCanchaController));

/** GET /api/reservas-cancha - Admin: listar reservas (query: fechaDesde?, fechaHasta?) */
router.get(
  '/',
  authenticateToken,
  requireAdministrativo,
  reservaCanchaController.list.bind(reservaCanchaController)
);

/** PATCH /api/reservas-cancha/:id/pagos - Admin: marcar seña/resto pagado */
router.patch(
  '/:id/pagos',
  authenticateToken,
  requireAdministrativo,
  reservaCanchaController.updatePagos.bind(reservaCanchaController)
);

/** PUT /api/reservas-cancha/:id - Admin: actualizar notas, monto total */
router.put(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  reservaCanchaController.update.bind(reservaCanchaController)
);

/** DELETE /api/reservas-cancha/:id - Admin: cancelar reserva */
router.delete(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  reservaCanchaController.delete.bind(reservaCanchaController)
);

export default router;
