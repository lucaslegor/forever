import prisma from '../config/prisma';
import { env } from '../config/env';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { crearPreferenciaReservaSena } from './mercadopago.service';

const MINUTOS_TRANSFERENCIA = 20;

/** Horas válidas para turnos: 14 a 23 y 0, 1 (00:00 y 01:00) */
export const HORAS_TURNO = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1];
export const MONTO_SENA = 10;

function normalizarFecha(fecha: string): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

export class ReservaCanchaService {
  /** Cancela reservas con seña por transferencia que ya vencieron (20 min) y no fueron pagadas */
  async cancelarReservasTransferenciaVencidas() {
    const now = new Date();
    const deleted = await prisma.reservaCancha.deleteMany({
      where: {
        senaMetodoPago: 'transferencia',
        senaPagada: false,
        senaExpiraAt: { lt: now },
      },
    });
    return deleted.count;
  }

  /** Disponibilidad: slots ocupados = seña pagada O transferencia aún no vencida */
  async getOcupadosPorFecha(fecha: string) {
    const date = normalizarFecha(fecha);
    await this.cancelarReservasTransferenciaVencidas();
    const now = new Date();
    const reservas = await prisma.reservaCancha.findMany({
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
  async list(fechaDesde?: string, fechaHasta?: string) {
    const where: { fecha?: { gte?: Date; lte?: Date } } = {};
    if (fechaDesde) {
      where.fecha = { ...where.fecha, gte: normalizarFecha(fechaDesde) };
    }
    if (fechaHasta) {
      where.fecha = { ...where.fecha, lte: normalizarFecha(fechaHasta) };
    }
    if (!fechaDesde && !fechaHasta) {
      where.fecha = { gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    }
    const list = await prisma.reservaCancha.findMany({
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
  async create(data: {
    fecha: string;
    hora: number;
    nombreCliente: string;
    telefono: string;
    email?: string;
    notas?: string;
    metodoPago?: 'mercadopago' | 'transferencia';
  }) {
    const fecha = normalizarFecha(data.fecha);
    if (!HORAS_TURNO.includes(data.hora)) {
      throw new ConflictError('Hora de turno no válida');
    }
    const now = new Date();
    const hoyStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const horaYaEmpezada = now.getMinutes() > 0 || now.getSeconds() > 0;
    // Solo bloquear horas 14–23 ya pasadas o en curso; 0 y 1 son 00:00 y 01:00 del día siguiente
    if (data.fecha === hoyStr && data.hora >= 14 && (data.hora < now.getHours() || (data.hora === now.getHours() && horaYaEmpezada))) {
      throw new BadRequestError('No se puede reservar un horario que ya pasó.');
    }
    await this.cancelarReservasTransferenciaVencidas();
    const existente = await prisma.reservaCancha.findUnique({
      where: { fecha_hora: { fecha, hora: data.hora } },
    });
    if (existente) {
      if (!existente.canceladaAt && existente.senaPagada) {
        throw new ConflictError('Ese turno ya está reservado');
      }
      await prisma.reservaCancha.delete({ where: { id: existente.id } });
    }

    const metodoPago = data.metodoPago ?? 'mercadopago';
    const esTransferencia = metodoPago === 'transferencia';
    if (!esTransferencia && !(data.email?.trim())) {
      throw new BadRequestError('El email es obligatorio para pagar la seña con Mercado Pago.');
    }
    const expiraAt = esTransferencia
      ? new Date(Date.now() + MINUTOS_TRANSFERENCIA * 60 * 1000)
      : null;

    const reserva = await prisma.reservaCancha.create({
      data: {
        fecha,
        hora: data.hora,
        nombreCliente: data.nombreCliente.trim(),
        telefono: data.telefono.trim(),
        email: data.email?.trim() || null,
        notas: data.notas?.trim() || null,
        montoSena: MONTO_SENA,
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
      const msg = `Hola, acabo de reservar el turno para el ${reservaPayload.fecha} a las ${String(reserva.hora).padStart(2, '0')}:00. Quiero pagar la seña de $${MONTO_SENA.toLocaleString('es-AR')} por transferencia.`;
      const whatsappLink = `https://wa.me/${env.CLUB_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      return {
        reserva: reservaPayload,
        metodoPago: 'transferencia' as const,
        whatsappLink,
        expiraAt: reserva.senaExpiraAt?.toISOString() ?? null,
        minutosParaPagar: MINUTOS_TRANSFERENCIA,
      };
    }

    try {
      const pref = await crearPreferenciaReservaSena({
        reservaId: reserva.id,
        title: `Seña alquiler cancha - ${reservaPayload.fecha} ${String(reserva.hora).padStart(2, '0')}:00`,
        unitPrice: MONTO_SENA,
        payerEmail: reserva.email ?? undefined,
      });
      return {
        reserva: reservaPayload,
        metodoPago: 'mercadopago' as const,
        initPoint: pref.initPoint,
        preferenceId: pref.preferenceId,
      };
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[ReservaCancha] Error creando preferencia MP para seña:', err);
      }
      return { reserva: reservaPayload, metodoPago: 'mercadopago' as const };
    }
  }

  /** Marcar seña pagada / resto pagado (admin) */
  async updatePagos(
    id: number,
    data: { senaPagada?: boolean; restoPagado?: boolean; montoTotal?: number }
  ) {
    const reserva = await prisma.reservaCancha.findUnique({ where: { id } });
    if (!reserva) throw new NotFoundError('Reserva no encontrada');
    const updated = await prisma.reservaCancha.update({
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
  async update(
    id: number,
    data: { notas?: string; montoTotal?: number }
  ) {
    const reserva = await prisma.reservaCancha.findUnique({ where: { id } });
    if (!reserva) throw new NotFoundError('Reserva no encontrada');
    const updated = await prisma.reservaCancha.update({
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
  /** Cancela la reserva (soft-delete: set canceladaAt). El turno queda libre para nuevas reservas. */
  async delete(id: number) {
    const reserva = await prisma.reservaCancha.findUnique({ where: { id } });
    if (!reserva) throw new NotFoundError('Reserva no encontrada');
    if (reserva.canceladaAt) return { ok: true };
    await prisma.reservaCancha.update({
      where: { id },
      data: { canceladaAt: new Date() },
    });
    return { ok: true };
  }
}

export const reservaCanchaService = new ReservaCanchaService();
