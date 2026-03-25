"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDisciplinaSchema = exports.createDisciplinaSchema = void 0;
const zod_1 = require("zod");
exports.createDisciplinaSchema = zod_1.z.object({
    nombre: zod_1.z
        .string({ message: 'El nombre es requerido' })
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    precioMensual: zod_1.z
        .number({ message: 'El precio mensual es requerido' })
        .positive('El precio mensual debe ser mayor a 0'),
});
exports.updateDisciplinaSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(2).max(100).optional(),
    precioMensual: zod_1.z.number().positive().optional(),
    activa: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=disciplina.validator.js.map