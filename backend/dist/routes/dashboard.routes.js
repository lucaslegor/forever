"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_service_1 = require("../services/dashboard.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const dashboard_validator_1 = require("../validators/dashboard.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken, auth_middleware_1.requireAdministrativo);
/**
 * GET /api/dashboard/stats
 * Query: anio, mes (opcionales, para filtrar recaudación por período)
 */
router.get('/stats', (0, validation_middleware_1.validateQuery)(dashboard_validator_1.dashboardStatsQuerySchema), async (req, res) => {
    try {
        const anio = req.query.anio != null ? Number(req.query.anio) : undefined;
        const mes = req.query.mes != null ? Number(req.query.mes) : undefined;
        const stats = await dashboard_service_1.dashboardService.getStats(anio, mes);
        res.json({ success: true, data: stats });
    }
    catch (_error) {
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
});
/**
 * GET /api/dashboard/deudores
 * Query opcionales: disciplinaId, generoId, categoriaId, subcategoriaId, anio, mes
 */
router.get('/deudores', (0, validation_middleware_1.validateQuery)(dashboard_validator_1.dashboardDeudoresQuerySchema), async (req, res) => {
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
        const deudores = await dashboard_service_1.dashboardService.getDeudores(hasFilter ? filters : undefined);
        res.json({ success: true, data: deudores });
    }
    catch (_error) {
        res.status(500).json({ success: false, message: 'Error al obtener listado de deudores' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map