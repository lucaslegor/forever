import { Router, Request, Response } from 'express';
import { clasificacionService } from '../services/clasificacion.service';
import { ejecutarPaseCategoriaFutbolMasculino } from '../services/paseCategoria.service';
import { authenticateToken, requireAdministrativo } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validation.middleware';
import { createSubcategoriaSchema, subcategoriaIdParamSchema, createCategoriaSchema, categoriaIdParamSchema } from '../validators/clasificacion.validator';

const router = Router();

/**
 * @route   GET /api/clasificacion/generos
 * @desc    Obtener todos los géneros
 * @access  Public
 */
router.get('/generos', async (req: Request, res: Response) => {
  try {
    const generos = await clasificacionService.getGeneros();
    res.json({
      success: true,
      data: generos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener géneros' });
  }
});

/**
 * @route   GET /api/clasificacion/categorias
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get('/categorias', async (req: Request, res: Response) => {
  try {
    const categorias = await clasificacionService.getCategorias();
    res.json({
      success: true,
      data: categorias,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
});

/**
 * @route   POST /api/clasificacion/categorias
 * @desc    Crear una nueva categoría
 * @access  Admin
 */
router.post(
  '/categorias',
  authenticateToken,
  requireAdministrativo,
  validateBody(createCategoriaSchema),
  async (req: Request, res: Response) => {
    try {
      const { nombre } = req.body;
      const categoria = await clasificacionService.createCategoria(nombre);
      res.status(201).json({
        success: true,
        data: categoria,
        message: 'Categoría creada exitosamente',
      });
    } catch (error: any) {
      const status = error.statusCode ?? 500;
      const message = error.message || 'Error al crear categoría';
      res.status(status).json({ success: false, error: message, message });
    }
  }
);

/**
 * @route   DELETE /api/clasificacion/categorias/:id
 * @desc    Eliminar una categoría (solo si no tiene deportistas asociados)
 * @access  Admin
 */
router.delete(
  '/categorias/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(categoriaIdParamSchema),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      await clasificacionService.deleteCategoria(id);
      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente',
      });
    } catch (error: any) {
      const status = error.statusCode ?? 500;
      const message = error.message || 'Error al eliminar categoría';
      res.status(status).json({ success: false, error: message, message });
    }
  }
);

/**
 * @route   GET /api/clasificacion/subcategorias
 * @desc    Obtener subcategorías (filtradas por disciplina, categoría, género)
 * @access  Public
 */
router.get('/subcategorias', async (req: Request, res: Response) => {
  try {
    const disciplinaId = req.query.disciplinaId
      ? parseInt(req.query.disciplinaId as string)
      : undefined;
    const categoriaId = req.query.categoriaId
      ? parseInt(req.query.categoriaId as string)
      : undefined;
    const generoId = req.query.generoId
      ? parseInt(req.query.generoId as string)
      : undefined;

    const subcategorias = await clasificacionService.getSubcategorias(
      disciplinaId,
      categoriaId,
      generoId
    );
    res.json({
      success: true,
      data: subcategorias,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener subcategorías' });
  }
});

/**
 * @route   GET /api/clasificacion/opciones
 * @desc    Obtener todas las opciones de clasificación (para frontend)
 * @access  Public
 */
router.get('/opciones', async (req: Request, res: Response) => {
  try {
    const opciones = await clasificacionService.getOpcionesCompletas();
    res.json({
      success: true,
      data: opciones,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener opciones' });
  }
});

/**
 * @route   POST /api/clasificacion/subcategorias
 * @desc    Crear una nueva subcategoría
 * @access  Admin
 */
router.post(
  '/subcategorias',
  authenticateToken,
  requireAdministrativo,
  validateBody(createSubcategoriaSchema),
  async (req: Request, res: Response) => {
  try {
    const { nombre, disciplinaNombre, categoriaNombre, generoNombre } = req.body;

    const subcategoria = await clasificacionService.createSubcategoria({
      nombre,
      disciplinaNombre,
      categoriaNombre,
      generoNombre,
    });

    res.status(201).json({
      success: true,
      data: subcategoria,
      message: 'Subcategoría creada exitosamente',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear subcategoría',
    });
  }
  }
);

/**
 * @route   DELETE /api/clasificacion/subcategorias/:id
 * @desc    Eliminar una subcategoría
 * @access  Admin
 */
router.delete(
  '/subcategorias/:id',
  authenticateToken,
  requireAdministrativo,
  validateParams(subcategoriaIdParamSchema),
  async (req: Request, res: Response) => {
  try {
    const id = req.params.id as unknown as number;

    await clasificacionService.deleteSubcategoria(id);

    res.json({
      success: true,
      message: 'Subcategoría eliminada exitosamente',
    });
  } catch (error: any) {
    const status = error.statusCode ?? 500;
    const message = error.message || 'Error al eliminar subcategoría';
    res.status(status).json({
      success: false,
      error: message,
      message,
    });
  }
  }
);

/**
 * @route   POST /api/clasificacion/pase-categoria
 * @desc    Ejecutar pase de categoría anual (solo Fútbol masculino: Infantiles y Juveniles)
 * @access  Admin
 */
router.post(
  '/pase-categoria',
  authenticateToken,
  requireAdministrativo,
  async (req: Request, res: Response) => {
    try {
      const result = await ejecutarPaseCategoriaFutbolMasculino();
      res.json({
        success: true,
        data: result,
        message: `Pase de categoría ejecutado: ${result.actualizados} deportistas actualizados.`,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al ejecutar pase de categoría',
      });
    }
  }
);

export default router;
