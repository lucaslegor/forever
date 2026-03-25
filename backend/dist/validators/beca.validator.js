"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCuotaBecaBodySchema = exports.becarBodySchema = exports.deportistaIdParamSchema = void 0;
const zod_1 = require("zod");
exports.deportistaIdParamSchema = zod_1.z.object({
    deportistaId: zod_1.z.string().regex(/^\d+$/, 'ID de deportista inválido').transform(Number),
});
exports.becarBodySchema = zod_1.z.object({
    cuotaBeca: zod_1.z.number().min(0).optional(),
}).optional().default({});
exports.updateCuotaBecaBodySchema = zod_1.z.object({
    monto: zod_1.z.coerce.number().min(0),
});
//# sourceMappingURL=beca.validator.js.map