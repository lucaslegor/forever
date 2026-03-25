"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriaIdParamSchema = exports.createCategoriaSchema = exports.subcategoriaIdParamSchema = exports.createSubcategoriaSchema = void 0;
const zod_1 = require("zod");
exports.createSubcategoriaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'nombre requerido').max(200),
    disciplinaNombre: zod_1.z.string().min(1, 'disciplinaNombre requerido').max(200),
    categoriaNombre: zod_1.z.string().min(1, 'categoriaNombre requerido').max(200),
    generoNombre: zod_1.z.string().max(200).optional(),
});
exports.subcategoriaIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});
exports.createCategoriaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, 'nombre requerido').max(200),
});
exports.categoriaIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});
//# sourceMappingURL=clasificacion.validator.js.map