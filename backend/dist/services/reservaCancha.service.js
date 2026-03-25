"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaCanchaService = exports.ReservaCanchaService = exports.MONTO_SENA = exports.HORAS_TURNO = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const mercadopago_service_1 = require("./mercadopago.service");
const MINUTOS_TRANSFERENCIA = 20;
/** Horas válidas para turnos: 14 a 23 y 0, 1 (00:00 y 01:00) */
exports.HORAS_TURNO = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];
exports.MONTO_SENA = 10;
function normalizarFecha(fecha) {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
}
class ReservaCanchaService {
    /** Cancela reservas con seña por transferencia que ya vencieron (20 min) y no fueron pagadas */
    async cancelarReservasTransferenciaVencidas() {
        const now = new Date();
        const deleted = await prisma_1.default.reservaCancha.deleteMany({
            where: {
                senaMetodoPago: 'transferencia',
                senaPagada: false,
                senaExpiraAt: { lt: now },
            },
        });
        return deleted.count;
    }
    /** Disponibilidad: slots ocupados = seña pagada O transferencia aún no vencida */
    async getOcupadosPorFecha(fecha) {
        const date = normalizarFecha(fecha);
        await this.cancelarReservasTransferenciaVencidas();
        const now = new Date();
        const reservas = await prisma_1.default.reservaCancha.findMany({
            where: {
                fecha: date,
                canceladaAt: null,
                OR: [
                    { senaPagada: true },
                    {
                        senaMetodoPago: 'transferencia',
                        senaPagada: false,
                        senaExpiraAt: { gte: now },
                    },
                ],
            },
            select: { hora: true },
        });
        return reservas.map((r) => r.hora);
    }
    /** Listar reservas (admin): por defecto desde hoy, opcional filtro fecha */
    async list(fechaDesde, fechaHasta) {
        const where = {};
        if (fechaDesde) {
            where.fecha = { ...where.fecha, gte: normalizarFecha(fechaDesde) };
        }
        if (fechaHasta) {
            where.fecha = { ...where.fecha, lte: normalizarFecha(fechaHasta) };
        }
        if (!fechaDesde && !fechaHasta) {
            where.fecha = { gte: new Date(new Date().setHours(0, 0, 0, 0)) };
        }
        const list = await prisma_1.default.reservaCancha.findMany({
            where,
            orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
        });
        return list.map((r) => ({
            id: r.id,
            fecha: r.fecha.toISOString().split('T')[0],
            hora: r.hora,
            nombreCliente: r.nombreCliente,
            telefono: r.telefono,
            email: r.email,
            montoSena: Number(r.montoSena),
            senaPagada: r.senaPagada,
            senaMetodoPago: r.senaMetodoPago,
            senaExpiraAt: r.senaExpiraAt?.toISOString() ?? null,
            restoPagado: r.restoPagado,
            montoTotal: r.montoTotal != null ? Number(r.montoTotal) : null,
            notas: r.notas,
            canceladaAt: r.canceladaAt?.toISOString() ?? null,
            createdAt: r.createdAt.toISOString(),
        }));
    }
    /** Crear reserva (público o admin). metodoPago: 'mercadopago' (default) o 'transferencia' */
    async create(data) {
        const fecha = normalizarFecha(data.fecha);
        if (!exports.HORAS_TURNO.includes(data.hora)) {
            throw new errors_1.ConflictError('Hora de turno no válida');
        }
        const now = new Date();
        const hoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const horaYaEmpezada = now.getMinutes() > 0 || now.getSeconds() > 0;
        // Solo bloquear horas 14–23 ya pasadas o en curso; 0 y 1 son 00:00 y 01:00 del día siguiente
        if (data.fecha === hoyStr && data.hora >= 14 && (data.hora < now.getHours() || (data.hora === now.getHours() && horaYaEmpezada))) {
            throw new errors_1.BadRequestError('No se puede reservar un horario que ya pasó.');
        }
        await this.cancelarReservasTransferenciaVencidas();
        const existente = await prisma_1.default.reservaCancha.findUnique({
            where: { fecha_hora: { fecha, hora: data.hora } },
        });
        if (existente) {
            if (!existente.canceladaAt && existente.senaPagada) {
                throw new errors_1.ConflictError('Ese turno ya está reservado');
            }
            await prisma_1.default.reservaCancha.delete({ where: { id: existente.id } });
        }
        const metodoPago = data.metodoPago ?? 'mercadopago';
        const esTransferencia = metodoPago === 'transferencia';
        if (!esTransferencia && !(data.email?.trim())) {
            throw new errors_1.BadRequestError('El email es obligatorio para pagar la seña con Mercado Pago.');
        }
        const expiraAt = esTransferencia
            ? new Date(Date.now() + MINUTOS_TRANSFERENCIA * 60 * 1000)
            : null;
        const reserva = await prisma_1.default.reservaCancha.create({
            data: {
                fecha,
                hora: data.hora,
                nombreCliente: data.nombreCliente.trim(),
                telefono: data.telefono.trim(),
                email: data.email?.trim() || null,
                notas: data.notas?.trim() || null,
                montoSena: exports.MONTO_SENA,
                senaMetodoPago: metodoPago,
                senaExpiraAt: expiraAt,
            },
        });
        const reservaPayload = {
            id: reserva.id,
            fecha: reserva.fecha.toISOString().split('T')[0],
            hora: reserva.hora,
            nombreCliente: reserva.nombreCliente,
            telefono: reserva.telefono,
            email: reserva.email,
            montoSena: Number(reserva.montoSena),
            senaPagada: reserva.senaPagada,
            senaMetodoPago: reserva.senaMetodoPago,
            senaExpiraAt: reserva.senaExpiraAt?.toISOString() ?? null,
            restoPagado: reserva.restoPagado,
            createdAt: reserva.createdAt.toISOString(),
        };
        if (esTransferencia) {
            const msg = `Hola, acabo de reservar el turno para el ${reservaPayload.fecha} a las ${String(reserva.hora).padStart(2, '0')}:00. Quiero pagar la seña de $${exports.MONTO_SENA.toLocaleString('es-AR')} por transferencia.`;
            const whatsappLink = `https://wa.me/${env_1.env.CLUB_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
            return {
                reserva: reservaPayload,
                metodoPago: 'transferencia',
                whatsappLink,
                expiraAt: reserva.senaExpiraAt?.toISOString() ?? null,
                minutosParaPagar: MINUTOS_TRANSFERENCIA,
            };
        }
        try {
            const pref = await (0, mercadopago_service_1.crearPreferenciaReservaSena)({
                reservaId: reserva.id,
                title: `Seña alquiler cancha - ${reservaPayload.fecha} ${String(reserva.hora).padStart(2, '0')}:00`,
                unitPrice: exports.MONTO_SENA,
                payerEmail: reserva.email ?? undefined,
            });
            return {
                reserva: reservaPayload,
                metodoPago: 'mercadopago',
                initPoint: pref.initPoint,
                preferenceId: pref.preferenceId,
            };
        }
        catch (_err) {
            return { reserva: reservaPayload, metodoPago: 'mercadopago' };
        }
    }
    /** Marcar seña pagada / resto pagado (admin) */
    async updatePagos(id, data) {
        const reserva = await prisma_1.default.reservaCancha.findUnique({ where: { id } });
        if (!reserva)
            throw new errors_1.NotFoundError('Reserva no encontrada');
        const updated = await prisma_1.default.reservaCancha.update({
            where: { id },
            data: {
                ...(data.senaPagada !== undefined && { senaPagada: data.senaPagada }),
                ...(data.restoPagado !== undefined && { restoPagado: data.restoPagado }),
                ...(data.montoTotal !== undefined && { montoTotal: data.montoTotal }),
            },
        });
        return {
            id: updated.id,
            fecha: updated.fecha.toISOString().split('T')[0],
            hora: updated.hora,
            senaPagada: updated.senaPagada,
            restoPagado: updated.restoPagado,
            montoTotal: updated.montoTotal != null ? Number(updated.montoTotal) : null,
        };
    }
    /** Actualizar reserva (admin): notas, monto total */
    async update(id, data) {
        const reserva = await prisma_1.default.reservaCancha.findUnique({ where: { id } });
        if (!reserva)
            throw new errors_1.NotFoundError('Reserva no encontrada');
        const updated = await prisma_1.default.reservaCancha.update({
            where: { id },
            data: {
                ...(data.notas !== undefined && { notas: data.notas?.trim() || null }),
                ...(data.montoTotal !== undefined && { montoTotal: data.montoTotal }),
            },
        });
        return {
            id: updated.id,
            fecha: updated.fecha.toISOString().split('T')[0],
            hora: updated.hora,
            nombreCliente: updated.nombreCliente,
            telefono: updated.telefono,
            email: updated.email,
            montoSena: Number(updated.montoSena),
            senaPagada: updated.senaPagada,
            restoPagado: updated.restoPagado,
            montoTotal: updated.montoTotal != null ? Number(updated.montoTotal) : null,
            notas: updated.notas,
        };
    }
    /** Eliminar/cancelar reserva (admin) */
    /** Cancela la reserva (soft-delete: set canceladaAt). El turno queda libre para nuevas reservas. No se puede cancelar si el resto ya está pagado. */
    async delete(id) {
        const reserva = await prisma_1.default.reservaCancha.findUnique({ where: { id } });
        if (!reserva)
            throw new errors_1.NotFoundError('Reserva no encontrada');
        if (reserva.restoPagado)
            throw new errors_1.BadRequestError('No se puede cancelar una reserva cuyo resto ya está pagado.');
        if (reserva.canceladaAt)
            return { ok: true };
        await prisma_1.default.reservaCancha.update({
            where: { id },
            data: { canceladaAt: new Date() },
        });
        return { ok: true };
    }
}
exports.ReservaCanchaService = ReservaCanchaService;
exports.reservaCanchaService = new ReservaCanchaService();
//# sourceMappingURL=reservaCancha.service.js.map