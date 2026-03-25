"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noticiaIdParamSchema = exports.setPublicadaSchema = exports.updateNoticiaSchema = exports.createNoticiaSchema = void 0;
const zod_1 = require("zod");
exports.createNoticiaSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1, 'El título es requerido').max(300),
    fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
    resumen: zod_1.z.string().min(1, 'El resumen es requerido').max(500),
    contenido: zod_1.z.string().min(1, 'El contenido es requerido'),
    autorId: zod_1.z.number().int().positive().optional(),
    imagenes: zod_1.z.array(zod_1.z.string().url().or(zod_1.z.string().max(2000))).optional().default([]),
});
exports.updateNoticiaSchema = zod_1.z.object({
    titulo: zod_1.z.string().min(1).max(300).optional(),
    fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    resumen: zod_1.z.string().min(1).max(500).optional(),
    contenido: zod_1.z.string().min(1).optional(),
    imagenes: zod_1.z.array(zod_1.z.string().url().or(zod_1.z.string().max(2000))).optional(),
});
exports.setPublicadaSchema = zod_1.z.object({
    publicada: zod_1.z.boolean(),
});
exports.noticiaIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});
//# sourceMappingURL=noticia.validator.js.map