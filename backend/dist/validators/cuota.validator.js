"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePorMesQuerySchema = exports.deletePorGeneracionQuerySchema = exports.generarCuotasSchema = exports.listCuotasQuerySchema = exports.cuotasQuerySchema = exports.cancelarCuotaSchema = exports.updateCuotaSchema = exports.asignarCuotaSchema = void 0;
const zod_1 = require("zod");
// CU04 - Asignar Cuota
exports.asignarCuotaSchema = zod_1.z.object({
    deportistaId: zod_1.z
        .number({ message: 'El deportista es requerido' })
        .int()
        .positive('ID de deportista invalido'),
    nroCuota: zod_1.z
        .number({ message: 'El numero de cuota es requerido' })
        .int()
        .positive('Numero de cuota invalido'),
    monto: zod_1.z
        .number({ message: 'El monto es requerido' })
        .positive('El monto debe ser mayor a 0'),
    fechaEmision: zod_1.z.string({ message: 'La fecha de emision es requerida' }),
    fechaVencimiento: zod_1.z.string({ message: 'La fecha de vencimiento es requerida' }),
    disciplinaId: zod_1.z
        .number({ message: 'La disciplina es requerida' })
        .int()
        .positive('ID de disciplina invalido'),
});
// CU05 - Actualizar Cuotas
exports.updateCuotaSchema = zod_1.z.object({
    monto: zod_1.z.number().positive('El monto debe ser mayor a 0').optional(),
    fechaVencimiento: zod_1.z.string().optional(),
    periodicidad: zod_1.z.enum(['MENSUAL', 'ANUAL']).optional(),
});
// Cancelar deuda de cuota (admin)
exports.cancelarCuotaSchema = zod_1.z.object({
    motivo: zod_1.z
        .string({ message: 'El motivo es requerido' })
        .trim()
        .min(5, 'El motivo debe tener al menos 5 caracteres')
        .max(500, 'El motivo no puede superar 500 caracteres'),
});
exports.cuotasQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    estado: zod_1.z.enum(['PAGADA', 'PENDIENTE', 'VENCIDA', 'CANCELADA']).optional(),
    deportistaId: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    disciplinaId: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
});
// Listado admin: filtro por año y opcionalmente mes
exports.listCuotasQuerySchema = zod_1.z.object({
    anio: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    mes: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    estado: zod_1.z.enum(['PAGADA', 'PENDIENTE', 'VENCIDA', 'CANCELADA']).optional(),
    disciplinaId: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
});
// Generar cuotas mensuales
exports.generarCuotasSchema = zod_1.z.object({
    mes: zod_1.z.number({ message: 'El mes es requerido' }).int().min(1, 'Mes invalido').max(12, 'Mes invalido'),
    anio: zod_1.z.number({ message: 'El año es requerido' }).int().min(2024, 'Año invalido').max(2030, 'Año invalido'),
});
// Borrar todas las cuotas de una generación (anio + mes + disciplina)
exports.deletePorGeneracionQuerySchema = zod_1.z.object({
    anio: zod_1.z.string().regex(/^\d+$/).transform(Number),
    mes: zod_1.z.string().regex(/^\d+$/).transform(Number),
    disciplinaId: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
// Borrar todas las cuotas de un mes (anio + mes)
exports.deletePorMesQuerySchema = zod_1.z.object({
    anio: zod_1.z.string().regex(/^\d+$/).transform(Number),
    mes: zod_1.z.string().regex(/^\d+$/).transform(Number),
});
//# sourceMappingURL=cuota.validator.js.map