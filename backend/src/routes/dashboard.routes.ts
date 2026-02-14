import { Router, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validation.middleware';
import { dashboardStatsQuerySchema, dashboardDeudoresQuerySchema } from '../validators/dashboard.validator';

const router = Router();

router.use(authenticateToken, requireAdministrativo);

/**
 * GET /api/dashboard/stats
 * Query: anio, mes (opcionales, para filtrar recaudación por período)
 */
router.get('/stats', validateQuery(dashboardStatsQuerySchema), async (req: Request, res: Response) => {
  try {
    const anio = req.query.anio != null ? Number(req.query.anio) : undefined;
    const mes = req.query.mes != null ? Number(req.query.mes) : undefined;
    const stats = await dashboardService.getStats(anio, mes);
    res.json({ success: true, data: stats });
  } catch (_error: unknown) {
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
  }
});

/**
 * GET /api/dashboard/deudores
 * Query opcionales: disciplinaId, generoId, categoriaId, subcategoriaId, anio, mes
 */
router.get('/deudores', validateQuery(dashboardDeudoresQuerySchema), async (req: Request, res: Response) => {
  try {
    const filters = {
      disciplinaId: req.query.disciplinaId != null ? Number(req.query.disciplinaId) : undefined,
      generoId: req.query.generoId != null ? Number(req.query.generoId) : undefined,
      categoriaId: req.query.categoriaId != null ? Number(req.query.categoriaId) : undefined,
      subcategoriaId: req.query.subcategoriaId != null ? Number(req.query.subcategoriaId) : undefined,
      anio: req.query.anio != null ? Number(req.query.anio) : undefined,
      mes: req.query.mes != null ? Number(req.query.mes) : undefined,
    };
    const hasFilter = Object.values(filters).some((v) => v != null);
    const deudores = await dashboardService.getDeudores(hasFilter ? filters : undefined);
    res.json({ success: true, data: deudores });
  } catch (_error: unknown) {
    res.status(500).json({ success: false, message: 'Error al obtener listado de deudores' });
  }
});

export default router;
