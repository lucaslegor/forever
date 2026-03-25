"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.updateReservaSchema = exports.updatePagosReservaSchema = exports.listReservasQuerySchema = exports.createReservaSchema = exports.disponibilidadQuerySchema = void 0;
const zod_1 = require("zod");
exports.disponibilidadQuerySchema = zod_1.z.object({
    fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha requerida (YYYY-MM-DD)'),
});
exports.createReservaSchema = zod_1.z.object({
    fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha inválida (YYYY-MM-DD)'),
    hora: zod_1.z.number().int().min(0).max(23),
    nombreCliente: zod_1.z.string().min(1, 'nombre requerido').max(200),
    telefono: zod_1.z.string().min(1, 'teléfono requerido').max(50),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    notas: zod_1.z.string().max(1000).optional(),
    metodoPago: zod_1.z.enum(['mercadopago', 'transferencia']).optional(),
    captchaToken: zod_1.z.string().min(1, 'CAPTCHA requerido'),
});
exports.listReservasQuerySchema = zod_1.z.object({
    fechaDesde: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    fechaHasta: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
exports.updatePagosReservaSchema = zod_1.z.object({
    senaPagada: zod_1.z.boolean().optional(),
    restoPagado: zod_1.z.boolean().optional(),
    montoTotal: zod_1.z.number().nonnegative().optional(),
});
exports.updateReservaSchema = zod_1.z.object({
    notas: zod_1.z.string().max(1000).optional(),
    montoTotal: zod_1.z.number().nonnegative().optional(),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});
//# sourceMappingURL=reservaCancha.validator.js.map