import { Router } from 'express';
import { becaController } from '../controllers/beca.controller';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import { deportistaIdParamSchema, becarBodySchema, updateCuotaBecaBodySchema } from '../validators/beca.validator';

const router = Router();

router.use(authenticateToken, requireAdministrativo);

/** GET /api/becas - Listar deportistas becados */
router.get('/', becaController.getAll.bind(becaController));

/** GET /api/becas/:deportistaId - Ver estado beca de un deportista */
router.get(
  '/:deportistaId',
  validateParams(deportistaIdParamSchema),
  becaController.getByDeportistaId.bind(becaController)
);

/** POST /api/becas/:deportistaId/becar - Dar beca (body opcional: { cuotaBeca?: number }) */
router.post(
  '/:deportistaId/becar',
  validateParams(deportistaIdParamSchema),
  validateBody(becarBodySchema),
  becaController.becar.bind(becaController)
);

/** DELETE /api/becas/:deportistaId - Quitar beca */
router.delete(
  '/:deportistaId',
  validateParams(deportistaIdParamSchema),
  becaController.quitarBeca.bind(becaController)
);

/** PATCH /api/becas/:deportistaId/cuota - Actualizar monto cuota beca (casos excepcionales). Body: { monto: number } */
router.patch(
  '/:deportistaId/cuota',
  validateParams(deportistaIdParamSchema),
  validateBody(updateCuotaBecaBodySchema),
  becaController.updateCuotaBeca.bind(becaController)
);

export default router;
