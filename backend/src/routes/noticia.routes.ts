import { Router, Request, Response } from 'express';
import { noticiaService } from '../services/noticia.service';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import {
  createNoticiaSchema,
  updateNoticiaSchema,
  setPublicadaSchema,
  noticiaIdParamSchema,
} from '../validators/noticia.validator';

const router = Router();

/**
 * @route   GET /api/noticias
 * @desc    Obtener todas las noticias
 * @access  Public
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const noticias = await noticiaService.getAll();
    res.json({
      success: true,
      data: noticias,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener noticias',
      ...(process.env.NODE_ENV !== 'production' && { detail: error?.message }),
    });
  }
});

/**
 * @route   GET /api/noticias/admin/list
 * @desc    Listado de noticias para admin (incluye no publicadas, excluye eliminadas)
 * @access  Admin
 */
router.get(
  '/admin/list',
  authenticateToken,
  requireAdministrativo,
  async (_req: Request, res: Response) => {
    try {
      const noticias = await noticiaService.getAllAdmin();
      res.json({ success: true, data: noticias });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener noticias',
        ...(process.env.NODE_ENV !== 'production' && { detail: error?.message }),
      });
    }
  }
);

/**
 * @route   GET /api/noticias/admin/:id
 * @desc    Obtener una noticia por ID (admin, incluye no publicadas)
 * @access  Admin
 */
router.get(
  '/admin/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(noticiaIdParamSchema),
  async (req: Request, res: Response) => {
    try {
      const noticia = await noticiaService.getById(req.params.id as unknown as number, false);
      res.json({ success: true, data: noticia });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ success: false, message: 'Noticia no encontrada' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al obtener noticia' });
    }
  }
);

/**
 * @route   GET /api/noticias/:id
 * @desc    Obtener una noticia por ID (solo si está publicada y no eliminada)
 * @access  Public
 */
router.get('/:id', validateParams(noticiaIdParamSchema), async (req: Request, res: Response) => {
  try {
    const noticia = await noticiaService.getById(req.params.id as unknown as number, true);
    res.json({
      success: true,
      data: noticia,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Noticia no encontrada' });
  }
});

/**
 * @route   POST /api/noticias
 * @desc    Crear una noticia
 * @access  Admin
 */
router.post(
  '/',
  authenticateToken,
  requireAdministrativo,
  validateBody(createNoticiaSchema),
  async (req: Request, res: Response) => {
    try {
      const noticia = await noticiaService.create(req.body);
      res.status(201).json({
        success: true,
        data: noticia,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear noticia' });
    }
  }
);

/**
 * @route   PUT /api/noticias/:id
 * @desc    Actualizar una noticia
 * @access  Admin
 */
router.put(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(noticiaIdParamSchema),
  validateBody(updateNoticiaSchema),
  async (req: Request, res: Response) => {
    try {
      const noticia = await noticiaService.update(
        req.params.id as unknown as number,
        req.body
      );
      res.json({
        success: true,
        data: noticia,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar noticia' });
    }
  }
);

/**
 * @route   PATCH /api/noticias/:id/publicada
 * @desc    Publicar o despublicar una noticia
 * @access  Admin
 */
router.patch(
  '/:id/publicada',
  authenticateToken,
  requireAdministrativo,
  validateParams(noticiaIdParamSchema),
  validateBody(setPublicadaSchema),
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as unknown as number;
      const publicada = (req.body as { publicada: boolean }).publicada;
      const noticia = await noticiaService.setPublicada(id, publicada);
      res.json({ success: true, data: noticia });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ success: false, message: 'Noticia no encontrada' });
        return;
      }
      res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
  }
);

/**
 * @route   DELETE /api/noticias/:id
 * @desc    Eliminar una noticia (soft delete)
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(noticiaIdParamSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await noticiaService.delete(req.params.id as unknown as number);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar noticia' });
    }
  }
);

export default router;
