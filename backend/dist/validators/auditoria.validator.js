"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditoriaQuerySchema = void 0;
const zod_1 = require("zod");
const optionalPosInt = zod_1.z.union([
    zod_1.z.string().regex(/^\d+$/).transform(Number),
    zod_1.z.number().int().positive(),
]).optional();
exports.auditoriaQuerySchema = zod_1.z.object({
    page: optionalPosInt,
    limit: optionalPosInt,
    cuentaId: optionalPosInt,
    entidad: zod_1.z.string().max(100).optional(),
    accion: zod_1.z.string().max(100).optional(),
    desde: zod_1.z.string().max(50).optional(),
    hasta: zod_1.z.string().max(50).optional(),
});
//# sourceMappingURL=auditoria.validator.js.map