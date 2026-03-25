"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clasificacion_service_1 = require("../services/clasificacion.service");
const paseCategoria_service_1 = require("../services/paseCategoria.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const clasificacion_validator_1 = require("../validators/clasificacion.validator");
const router = (0, express_1.Router)();
function paramToInt(param) {
    const raw = Array.isArray(param) ? param[0] : param;
    return parseInt(String(raw), 10);
}
/**
 * @route   GET /api/clasificacion/generos
 * @desc    Obtener todos los géneros
 * @access  Public
 */
router.get('/generos', async (_req, res) => {
    try {
        const generos = await clasificacion_service_1.clasificacionService.getGeneros();
        res.json({
            success: true,
            data: generos,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener géneros' });
    }
});
/**
 * @route   GET /api/clasificacion/categorias
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get('/categorias', async (_req, res) => {
    try {
        const categorias = await clasificacion_service_1.clasificacionService.getCategorias();
        res.json({
            success: true,
            data: categorias,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener categorías' });
    }
});
/**
 * @route   POST /api/clasificacion/categorias
 * @desc    Crear una nueva categoría
 * @access  Admin
 */
router.post('/categorias', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(clasificacion_validator_1.createCategoriaSchema), async (req, res) => {
    try {
        const { nombre } = req.body;
        const categoria = await clasificacion_service_1.clasificacionService.createCategoria(nombre);
        res.status(201).json({
            success: true,
            data: categoria,
            message: 'Categoría creada exitosamente',
        });
    }
    catch (error) {
        const status = error.statusCode ?? 500;
        const message = error.message || 'Error al crear categoría';
        res.status(status).json({ success: false, error: message, message });
    }
});
/**
 * @route   DELETE /api/clasificacion/categorias/:id
 * @desc    Eliminar una categoría (solo si no tiene deportistas asociados)
 * @access  Admin
 */
router.delete('/categorias/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(clasificacion_validator_1.categoriaIdParamSchema), async (req, res) => {
    try {
        const id = paramToInt(req.params.id);
        await clasificacion_service_1.clasificacionService.deleteCategoria(id);
        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente',
        });
    }
    catch (error) {
        const status = error.statusCode ?? 500;
        const message = error.message || 'Error al eliminar categoría';
        res.status(status).json({ success: false, error: message, message });
    }
});
/**
 * @route   GET /api/clasificacion/subcategorias
 * @desc    Obtener subcategorías (filtradas por disciplina, categoría, género)
 * @access  Public
 */
router.get('/subcategorias', async (req, res) => {
    try {
        const disciplinaId = req.query.disciplinaId
            ? parseInt(req.query.disciplinaId)
            : undefined;
        const categoriaId = req.query.categoriaId
            ? parseInt(req.query.categoriaId)
            : undefined;
        const generoId = req.query.generoId
            ? parseInt(req.query.generoId)
            : undefined;
        const subcategorias = await clasificacion_service_1.clasificacionService.getSubcategorias(disciplinaId, categoriaId, generoId);
        res.json({
            success: true,
            data: subcategorias,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener subcategorías' });
    }
});
/**
 * @route   GET /api/clasificacion/opciones
 * @desc    Obtener todas las opciones de clasificación (para frontend)
 * @access  Public
 */
router.get('/opciones', async (_req, res) => {
    try {
        const opciones = await clasificacion_service_1.clasificacionService.getOpcionesCompletas();
        res.json({
            success: true,
            data: opciones,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener opciones' });
    }
});
/**
 * @route   POST /api/clasificacion/subcategorias
 * @desc    Crear una nueva subcategoría
 * @access  Admin
 */
router.post('/subcategorias', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(clasificacion_validator_1.createSubcategoriaSchema), async (req, res) => {
    try {
        const { nombre, disciplinaNombre, categoriaNombre, generoNombre } = req.body;
        const subcategoria = await clasificacion_service_1.clasificacionService.createSubcategoria({
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear subcategoría',
        });
    }
});
/**
 * @route   DELETE /api/clasificacion/subcategorias/:id
 * @desc    Eliminar una subcategoría
 * @access  Admin
 */
router.delete('/subcategorias/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(clasificacion_validator_1.subcategoriaIdParamSchema), async (req, res) => {
    try {
        const id = paramToInt(req.params.id);
        await clasificacion_service_1.clasificacionService.deleteSubcategoria(id);
        res.json({
            success: true,
            message: 'Subcategoría eliminada exitosamente',
        });
    }
    catch (error) {
        const status = error.statusCode ?? 500;
        const message = error.message || 'Error al eliminar subcategoría';
        res.status(status).json({
            success: false,
            error: message,
            message,
        });
    }
});
/**
 * @route   POST /api/clasificacion/pase-categoria
 * @desc    Ejecutar pase de categoría anual (solo Fútbol masculino: Infantiles y Juveniles)
 * @access  Admin
 */
router.post('/pase-categoria', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, async (_req, res) => {
    try {
        const result = await (0, paseCategoria_service_1.ejecutarPaseCategoriaFutbolMasculino)();
        res.json({
            success: true,
            data: result,
            message: `Pase de categoría ejecutado: ${result.actualizados} deportistas actualizados.`,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al ejecutar pase de categoría',
        });
    }
});
exports.default = router;
//# sourceMappingURL=clasificacion.routes.js.map