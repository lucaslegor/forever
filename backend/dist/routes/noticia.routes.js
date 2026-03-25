"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noticia_service_1 = require("../services/noticia.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const noticia_validator_1 = require("../validators/noticia.validator");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/noticias
 * @desc    Obtener todas las noticias
 * @access  Public
 */
router.get('/', async (_req, res) => {
    try {
        const noticias = await noticia_service_1.noticiaService.getAll();
        res.json({
            success: true,
            data: noticias,
        });
    }
    catch (error) {
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
router.get('/admin/list', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, async (_req, res) => {
    try {
        const noticias = await noticia_service_1.noticiaService.getAllAdmin();
        res.json({ success: true, data: noticias });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener noticias',
            ...(process.env.NODE_ENV !== 'production' && { detail: error?.message }),
        });
    }
});
/**
 * @route   GET /api/noticias/admin/:id
 * @desc    Obtener una noticia por ID (admin, incluye no publicadas)
 * @access  Admin
 */
router.get('/admin/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(noticia_validator_1.noticiaIdParamSchema), async (req, res) => {
    try {
        const noticia = await noticia_service_1.noticiaService.getById(req.params.id, false);
        res.json({ success: true, data: noticia });
    }
    catch (error) {
        if (error.statusCode === 404) {
            res.status(404).json({ success: false, message: 'Noticia no encontrada' });
            return;
        }
        res.status(500).json({ success: false, message: 'Error al obtener noticia' });
    }
});
/**
 * @route   GET /api/noticias/:id
 * @desc    Obtener una noticia por ID (solo si está publicada y no eliminada)
 * @access  Public
 */
router.get('/:id', (0, validation_middleware_1.validateParams)(noticia_validator_1.noticiaIdParamSchema), async (req, res) => {
    try {
        const noticia = await noticia_service_1.noticiaService.getById(req.params.id, true);
        res.json({
            success: true,
            data: noticia,
        });
    }
    catch (error) {
        res.status(404).json({ success: false, message: 'Noticia no encontrada' });
    }
});
/**
 * @route   POST /api/noticias
 * @desc    Crear una noticia
 * @access  Admin
 */
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateBody)(noticia_validator_1.createNoticiaSchema), async (req, res) => {
    try {
        const noticia = await noticia_service_1.noticiaService.create(req.body);
        res.status(201).json({
            success: true,
            data: noticia,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear noticia' });
    }
});
/**
 * @route   PUT /api/noticias/:id
 * @desc    Actualizar una noticia
 * @access  Admin
 */
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(noticia_validator_1.noticiaIdParamSchema), (0, validation_middleware_1.validateBody)(noticia_validator_1.updateNoticiaSchema), async (req, res) => {
    try {
        const noticia = await noticia_service_1.noticiaService.update(req.params.id, req.body);
        res.json({
            success: true,
            data: noticia,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar noticia' });
    }
});
/**
 * @route   PATCH /api/noticias/:id/publicada
 * @desc    Publicar o despublicar una noticia
 * @access  Admin
 */
router.patch('/:id/publicada', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(noticia_validator_1.noticiaIdParamSchema), (0, validation_middleware_1.validateBody)(noticia_validator_1.setPublicadaSchema), async (req, res) => {
    try {
        const id = req.params.id;
        const publicada = req.body.publicada;
        const noticia = await noticia_service_1.noticiaService.setPublicada(id, publicada);
        res.json({ success: true, data: noticia });
    }
    catch (error) {
        if (error.statusCode === 404) {
            res.status(404).json({ success: false, message: 'Noticia no encontrada' });
            return;
        }
        res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
});
/**
 * @route   DELETE /api/noticias/:id
 * @desc    Eliminar una noticia (soft delete)
 * @access  Admin
 */
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo, (0, validation_middleware_1.validateParams)(noticia_validator_1.noticiaIdParamSchema), async (req, res) => {
    try {
        const result = await noticia_service_1.noticiaService.delete(req.params.id);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar noticia' });
    }
});
exports.default = router;
//# sourceMappingURL=noticia.routes.js.map