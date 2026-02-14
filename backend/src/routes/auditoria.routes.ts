import { Router } from 'express';
import { auditoriaController } from '../controllers/auditoria.controller';
import { authenticateToken, requireAdministrativo, requirePrincipalAdmin } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validation.middleware';
import { auditoriaQuerySchema } from '../validators/auditoria.validator';

const router = Router();

/** Solo el admin supremo (admin@foreverclub.com) puede ver el log de auditoría */
router.use(authenticateToken, requireAdministrativo, requirePrincipalAdmin);

/**
 * GET /api/auditoria
 * Query: page, limit, cuentaId, entidad, accion, desde (ISO date), hasta (ISO date)
 */
router.get('/', validateQuery(auditoriaQuerySchema), auditoriaController.listar.bind(auditoriaController));

export default router;
