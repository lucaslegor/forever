import prisma from '../config/prisma';
import { CreatePagoDTO } from '../types/requests';
import {
  NotFoundError,
  BadRequestError,
  ErrorMessages,
} from '../utils/errors';
import { EstadoPago, EstadoCuota, EstadoDeportista } from '@prisma/client';
import { env } from '../config/env';
import { crearPreferenciaPago } from './mercadopago.service';

const DOMINIO_EMAIL_FANTASMA = 'forever-club.com';

/**
 * Genera un email válido para el payer de Mercado Pago.
 * 1) Usa el email del deportista si existe y no es el del vendedor (evita auto-compra en Sandbox).
 * 2) Fallback: email fantasma usuario_[DNI_o_ID]@forever-club.com para DNI/ID sin caracteres problemáticos.
 */
function resolverPayerEmail(
  emailCuenta: string | null | undefined,
  dni: string,
  deportistaId: number,
  sellerEmail?: string
): string {
  const email = (emailCuenta ?? '').trim();
  if (email.length > 0) {
    const emailNorm = email.toLowerCase();
    if (!sellerEmail || emailNorm !== sellerEmail) {
      return email;
    }
  }
  const local = (dni ?? '').replace(/\D/g, '') || String(deportistaId);
  return `usuario_${local}@${DOMINIO_EMAIL_FANTASMA}`;
}

export class PagoService {
  async crear(deportistaId: number, data: CreatePagoDTO) {
    const cuota = await prisma.cuota.findUnique({
      where: { id: data.cuotaId },
      include: {
        deportista: { include: { cuenta: { select: { email: true } } } },
        disciplina: true,
      },
    });

    if (!cuota) {
      throw new NotFoundError(ErrorMessages.CUOTA_NOT_FOUND);
    }

    if (cuota.deportistaId !== deportistaId) {
      throw new BadRequestError('La cuota no pertenece al deportista');
    }

    if (cuota.estadoCuota === EstadoCuota.PAGADA) {
      throw new BadRequestError(ErrorMessages.CUOTA_ALREADY_PAID);
    }

    if (cuota.estadoCuota !== EstadoCuota.PENDIENTE && cuota.estadoCuota !== EstadoCuota.VENCIDA) {
      throw new BadRequestError(ErrorMessages.CUOTA_NOT_PENDING);
    }

    const anteriorImpaga = await prisma.cuota.findFirst({
      where: {
        deportistaId: cuota.deportistaId,
        estadoCuota: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] },
        OR: [
          { anio: { lt: cuota.anio } },
          { anio: cuota.anio, nroCuota: { lt: cuota.nroCuota } },
        ],
      },
    });
    if (anteriorImpaga) {
      throw new BadRequestError('Debe pagar las cuotas en orden. Tené cuotas anteriores pendientes.');
    }

    const pago = await prisma.pago.create({
      data: {
        fechaPago: new Date(),
        monto: cuota.monto,
        estadoPago: EstadoPago.PENDIENTE,
        medioPago: data.medioPago || 'Mercado Pago',
        cuotaId: cuota.id,
        deportistaId,
      },
      include: {
        cuota: {
          include: { disciplina: true },
        },
      },
    });

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return { pago, initPoint: null, preferenceId: null };
    }

    const disciplinaNombre = cuota.disciplina?.nombre ?? 'Cuota';
    const tituloPreferencia = `Cuota For Ever - ${disciplinaNombre} ${cuota.nroCuota}/${cuota.anio}`;
    const payerEmail = resolverPayerEmail(
      cuota.deportista.cuenta?.email,
      cuota.deportista.dni,
      cuota.deportista.id,
      env.MERCADOPAGO_SELLER_EMAIL
    );

    try {
      const preferencia = await crearPreferenciaPago({
        pagoId: pago.id,
        title: tituloPreferencia,
        unitPrice: Number(cuota.monto),
        payerEmail,
      });
      return {
        pago,
        initPoint: preferencia.initPoint,
        preferenceId: preferencia.preferenceId,
      };
    } catch (_err) {
      return { pago, initPoint: null, preferenceId: null };
    }
  }

  /**
   * Sincroniza un pago con el estado de Mercado Pago. Solo permite al deportista dueño del pago.
   */
  async syncPagoConMercadoPago(pagoId: number, mercadoPagoId: string, status: string, deportistaId: number) {
    const pago = await prisma.pago.findUnique({
      where: { id: pagoId },
      include: { cuota: true },
    });
    if (!pago) {
      throw new NotFoundError(ErrorMessages.PAGO_NOT_FOUND);
    }
    if (pago.deportistaId !== deportistaId) {
      throw new BadRequestError('No podés sincronizar un pago de otro deportista');
    }
    const statusNorm = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';
    return this.confirmarPago(pagoId, mercadoPagoId, statusNorm);
  }

  async confirmarPago(pagoId: number, mercadoPagoId: string, status: string) {
    const pago = await prisma.pago.findUnique({
      where: { id: pagoId },
      include: { cuota: true },
    });

    if (!pago) {
      throw new NotFoundError(ErrorMessages.PAGO_NOT_FOUND);
    }

    const estadoPago =
      status === 'approved' ? EstadoPago.APROBADO : status === 'rejected' ? EstadoPago.RECHAZADO : EstadoPago.PENDIENTE;

    await prisma.$transaction(async (tx) => {
      await tx.pago.update({
        where: { id: pagoId },
        data: {
          estadoPago,
          mercadoPagoId,
          mercadoPagoStatus: status,
        },
      });

      if (estadoPago === EstadoPago.APROBADO) {
        await tx.cuota.update({
          where: { id: pago.cuotaId },
          data: { estadoCuota: EstadoCuota.PAGADA },
        });

        // Actualizar estado del deportista si ya no tiene deudas
        const cuotasPendientes = await tx.cuota.count({
          where: {
            deportistaId: pago.deportistaId,
            estadoCuota: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] },
          },
        });

        if (cuotasPendientes === 0) {
          await tx.deportista.update({
            where: { id: pago.deportistaId },
            data: { estado: EstadoDeportista.AL_DIA },
          });
        }

        // Manejo de Grupo Familiar (si aplica)
        const integrante = await tx.grupoFamiliarIntegrante.findFirst({
          where: { deportistaId: pago.deportistaId },
          select: { grupoId: true },
        });

        if (integrante) {
          const otrosIntegrantes = await tx.grupoFamiliarIntegrante.findMany({
            where: {
              grupoId: integrante.grupoId,
              deportistaId: { not: pago.deportistaId },
            },
            select: { deportistaId: true },
          });
          const otrosIds = otrosIntegrantes.map((o) => o.deportistaId);
          const cuotasGrupo = await tx.cuota.findMany({
            where: {
              deportistaId: { in: otrosIds },
              anio: pago.cuota.anio,
              nroCuota: pago.cuota.nroCuota,
              disciplinaId: pago.cuota.disciplinaId,
              estadoCuota: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] },
            },
          });
          const fechaPago = new Date();
          for (const c of cuotasGrupo) {
            await tx.pago.create({
              data: {
                cuotaId: c.id,
                deportistaId: c.deportistaId,
                monto: c.monto,
                fechaPago,
                medioPago: 'sistema',
                estadoPago: EstadoPago.APROBADO,
              },
            });
            await tx.cuota.update({
              where: { id: c.id },
              data: { estadoCuota: EstadoCuota.PAGADA },
            });
            const pendientesOtro = await tx.cuota.count({
              where: {
                deportistaId: c.deportistaId,
                estadoCuota: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] },
              },
            });
            if (pendientesOtro === 0) {
              await tx.deportista.update({
                where: { id: c.deportistaId },
                data: { estado: EstadoDeportista.AL_DIA },
              });
            }
          }
        }
      }
    });

    return this.getById(pagoId);
  }

  async getById(id: number) {
    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        cuota: {
          include: { disciplina: true },
        },
        deportista: true,
      },
    });

    if (!pago) {
      throw new NotFoundError(ErrorMessages.PAGO_NOT_FOUND);
    }

    return pago;
  }

  async getByMercadoPagoId(mercadoPagoId: string) {
    const pago = await prisma.pago.findUnique({
      where: { mercadoPagoId },
      include: {
        cuota: true,
        deportista: true,
      },
    });

    return pago;
  }

  async getByDeportista(deportistaId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where: { deportistaId },
        skip,
        take: limit,
        include: {
          cuota: {
            include: { disciplina: true },
          },
        },
        orderBy: { fechaPago: 'desc' },
      }),
      prisma.pago.count({ where: { deportistaId } }),
    ]);

    return {
      data: pagos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const pagoService = new PagoService();