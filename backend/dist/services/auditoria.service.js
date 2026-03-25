"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditoriaService = exports.AuditoriaService = exports.ACCIONES = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
exports.ACCIONES = {
    DEPORTISTA_ALTA: 'DEPORTISTA_ALTA',
    DEPORTISTA_BAJA: 'DEPORTISTA_BAJA',
    DEPORTISTA_REACTIVAR: 'DEPORTISTA_REACTIVAR',
    DEPORTISTA_ACTUALIZACION: 'DEPORTISTA_ACTUALIZACION',
    PAGO_CONFIRMAR: 'PAGO_CONFIRMAR',
    CUOTA_MARCAR_PAGADA: 'CUOTA_MARCAR_PAGADA',
    CUOTA_CANCELAR_DEUDA: 'CUOTA_CANCELAR_DEUDA',
    DISCIPLINA_ALTA: 'DISCIPLINA_ALTA',
    DISCIPLINA_ACTUALIZACION: 'DISCIPLINA_ACTUALIZACION',
    ADMIN_DESACTIVAR: 'ADMIN_DESACTIVAR',
    ADMIN_ACTIVAR: 'ADMIN_ACTIVAR',
    ADMIN_RESET_PASSWORD: 'ADMIN_RESET_PASSWORD',
    DEPORTISTA_RESET_PASSWORD: 'DEPORTISTA_RESET_PASSWORD',
    CUENTA_CAMBIO_CONTRASEÑA: 'CUENTA_CAMBIO_CONTRASEÑA',
    GRUPO_FAMILIAR_CREAR: 'GRUPO_FAMILIAR_CREAR',
    GRUPO_FAMILIAR_ACTUALIZACION: 'GRUPO_FAMILIAR_ACTUALIZACION',
    GRUPO_FAMILIAR_BAJA: 'GRUPO_FAMILIAR_BAJA',
};
class AuditoriaService {
    async registrar(data) {
        try {
            await prisma_1.default.auditoriaLog.create({
                data: {
                    cuentaId: data.cuentaId ?? undefined,
                    accion: data.accion,
                    entidad: data.entidad,
                    entidadId: data.entidadId ?? undefined,
                    detalles: data.detalles ?? undefined,
                    ip: data.ip ?? undefined,
                    userAgent: data.userAgent ?? undefined,
                },
            });
        }
        catch (_err) {
            // Fallo silencioso para no interrumpir el flujo; la auditoría es no crítica
        }
    }
    async listar(filters) {
        const page = Math.max(1, filters.page ?? 1);
        const limit = Math.min(100, Math.max(1, filters.limit ?? 50));
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.cuentaId != null)
            where.cuentaId = filters.cuentaId;
        if (filters.entidad)
            where.entidad = filters.entidad;
        if (filters.accion)
            where.accion = filters.accion;
        if (filters.desde || filters.hasta) {
            where.createdAt = {};
            if (filters.desde)
                where.createdAt.gte = filters.desde;
            if (filters.hasta)
                where.createdAt.lte = filters.hasta;
        }
        const [logs, total] = await Promise.all([
            prisma_1.default.auditoriaLog.findMany({
                where,
                include: {
                    cuenta: {
                        select: { id: true, email: true, rol: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_1.default.auditoriaLog.count({ where }),
        ]);
        return {
            data: logs.map((l) => ({
                id: l.id,
                cuentaId: l.cuentaId,
                email: l.cuenta?.email ?? null,
                rol: l.cuenta?.rol ?? null,
                accion: l.accion,
                entidad: l.entidad,
                entidadId: l.entidadId,
                detalles: l.detalles,
                ip: l.ip,
                userAgent: l.userAgent,
                createdAt: l.createdAt.toISOString(),
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.AuditoriaService = AuditoriaService;
exports.auditoriaService = new AuditoriaService();
//# sourceMappingURL=auditoria.service.js.map