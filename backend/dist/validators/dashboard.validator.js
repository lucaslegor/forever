"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardDeudoresQuerySchema = exports.dashboardStatsQuerySchema = void 0;
const zod_1 = require("zod");
const optionalPosInt = zod_1.z.union([
    zod_1.z.string().regex(/^\d+$/).transform(Number),
    zod_1.z.number().int().positive(),
]).optional();
exports.dashboardStatsQuerySchema = zod_1.z.object({
    anio: optionalPosInt,
    mes: zod_1.z.union([
        zod_1.z.string().regex(/^(0?[1-9]|1[0-2])$/).transform(Number),
        zod_1.z.number().int().min(1).max(12),
    ]).optional(),
});
exports.dashboardDeudoresQuerySchema = zod_1.z.object({
    disciplinaId: optionalPosInt,
    generoId: optionalPosInt,
    categoriaId: optionalPosInt,
    subcategoriaId: optionalPosInt,
    anio: optionalPosInt,
    mes: zod_1.z.union([
        zod_1.z.string().regex(/^(0?[1-9]|1[0-2])$/).transform(Number),
        zod_1.z.number().int().min(1).max(12),
    ]).optional(),
});
//# sourceMappingURL=dashboard.validator.js.map