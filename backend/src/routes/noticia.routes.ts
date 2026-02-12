import { Router, Request, Response } from 'express';
import { noticiaService } from '../services/noticia.service';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   GET /api/noticias
 * @desc    Obtener todas las noticias
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const noticias = await noticiaService.getAll();
    res.json({
      success: true,
      data: noticias,
    });
  } catch (error) {
    console.error('GET /api/noticias error:', error);
    res.status(500).json({ success: false, message: 'Error al obtener noticias' });
  }
});

/**
 * @route   GET /api/noticias/:id
 * @desc    Obtener una noticia por ID
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const noticia = await noticiaService.getById(parseInt(req.params.id));
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
  async (req: Request, res: Response) => {
    try {
      const noticia = await noticiaService.update(
        parseInt(req.params.id),
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
 * @route   DELETE /api/noticias/:id
 * @desc    Eliminar una noticia
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticateToken,
  requireAdministrativo,
  async (req: Request, res: Response) => {
    try {
      const result = await noticiaService.delete(parseInt(req.params.id));
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
