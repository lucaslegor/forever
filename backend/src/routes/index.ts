import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import deportistaRoutes from './deportista.routes';
import cuotaRoutes from './cuota.routes';
import pagoRoutes from './pago.routes';
import disciplinaRoutes from './disciplina.routes';
import grupoFamiliarRoutes from './grupoFamiliar.routes';
import reportesRoutes from './reportes.routes';
import { authenticateToken, requireDeportista } from '../middlewares/auth.middleware';
import { deportistaController } from '../controllers/deportista.controller';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/deportistas', deportistaRoutes);
router.use('/cuotas', cuotaRoutes);
router.use('/pagos', pagoRoutes);
router.use('/disciplinas', disciplinaRoutes);
router.use('/grupos-familiares', grupoFamiliarRoutes);
router.use('/reportes', reportesRoutes);

// GET /api/historial - Alias front (historial del deportista logueado)
router.get(
  '/historial',
  authenticateToken,
  requireDeportista,
  deportistaController.getHistorial.bind(deportistaController)
);

export default router;
