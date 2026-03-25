"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncPagoSchema = exports.pagosQuerySchema = exports.createPagoSchema = void 0;
const zod_1 = require("zod");
// CU08 - Pagar Cuota
exports.createPagoSchema = zod_1.z.object({
    cuotaId: zod_1.z
        .number({ message: 'La cuota es requerida' })
        .int()
        .positive('ID de cuota invalido'),
    medioPago: zod_1.z.string().default('Mercado Pago'),
});
exports.pagosQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    estado: zod_1.z.enum(['APROBADO', 'RECHAZADO', 'PENDIENTE']).optional(),
    deportistaId: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    fechaDesde: zod_1.z.string().optional(),
    fechaHasta: zod_1.z.string().optional(),
});
// Sincronizar pago con Mercado Pago (cuando el webhook no llegó)
exports.syncPagoSchema = zod_1.z.object({
    paymentId: zod_1.z.string().min(1, 'paymentId es requerido'),
});
//# sourceMappingURL=pago.validator.js.map