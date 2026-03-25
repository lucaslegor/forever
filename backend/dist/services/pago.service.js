"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagoService = exports.PagoService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const mercadopago_service_1 = require("./mercadopago.service");
const DOMINIO_EMAIL_FANTASMA = 'forever-club.com';
/**
 * Genera un email válido para el payer de Mercado Pago.
 * 1) Usa el email del deportista si existe y no es el del vendedor (evita auto-compra en Sandbox).
 * 2) Fallback: email fantasma usuario_[DNI_o_ID]@forever-club.com para DNI/ID sin caracteres problemáticos.
 */
function resolverPayerEmail(emailCuenta, dni, deportistaId, sellerEmail) {
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
class PagoService {
    async crear(deportistaId, data) {
        const cuota = await prisma_1.default.cuota.findUnique({
            where: { id: data.cuotaId },
            include: {
                deportista: { include: { cuenta: { select: { email: true } } } },
                disciplina: true,
            },
        });
        if (!cuota) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.CUOTA_NOT_FOUND);
        }
        if (cuota.deportistaId !== deportistaId) {
            throw new errors_1.BadRequestError('La cuota no pertenece al deportista');
        }
        if (cuota.estadoCuota === client_1.EstadoCuota.PAGADA) {
            throw new errors_1.BadRequestError(errors_1.ErrorMessages.CUOTA_ALREADY_PAID);
        }
        if (cuota.estadoCuota !== client_1.EstadoCuota.PENDIENTE && cuota.estadoCuota !== client_1.EstadoCuota.VENCIDA) {
            throw new errors_1.BadRequestError(errors_1.ErrorMessages.CUOTA_NOT_PENDING);
        }
        const anteriorImpaga = await prisma_1.default.cuota.findFirst({
            where: {
                deportistaId: cuota.deportistaId,
                estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                OR: [
                    { anio: { lt: cuota.anio } },
                    { anio: cuota.anio, nroCuota: { lt: cuota.nroCuota } },
                ],
            },
        });
        if (anteriorImpaga) {
            throw new errors_1.BadRequestError('Debe pagar las cuotas en orden. Tené cuotas anteriores pendientes.');
        }
        const pago = await prisma_1.default.pago.create({
            data: {
                fechaPago: new Date(),
                monto: cuota.monto,
                estadoPago: client_1.EstadoPago.PENDIENTE,
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
        const payerEmail = resolverPayerEmail(cuota.deportista.cuenta?.email, cuota.deportista.dni, cuota.deportista.id, env_1.env.MERCADOPAGO_SELLER_EMAIL);
        try {
            const preferencia = await (0, mercadopago_service_1.crearPreferenciaPago)({
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
        }
        catch (_err) {
            return { pago, initPoint: null, preferenceId: null };
        }
    }
    /**
     * Sincroniza un pago con el estado de Mercado Pago. Solo permite al deportista dueño del pago.
     */
    async syncPagoConMercadoPago(pagoId, mercadoPagoId, status, deportistaId) {
        const pago = await prisma_1.default.pago.findUnique({
            where: { id: pagoId },
            include: { cuota: true },
        });
        if (!pago) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.PAGO_NOT_FOUND);
        }
        if (pago.deportistaId !== deportistaId) {
            throw new errors_1.BadRequestError('No podés sincronizar un pago de otro deportista');
        }
        const statusNorm = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending';
        return this.confirmarPago(pagoId, mercadoPagoId, statusNorm);
    }
    async confirmarPago(pagoId, mercadoPagoId, status) {
        const pago = await prisma_1.default.pago.findUnique({
            where: { id: pagoId },
            include: { cuota: true },
        });
        if (!pago) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.PAGO_NOT_FOUND);
        }
        const estadoPago = status === 'approved' ? client_1.EstadoPago.APROBADO : status === 'rejected' ? client_1.EstadoPago.RECHAZADO : client_1.EstadoPago.PENDIENTE;
        await prisma_1.default.$transaction(async (tx) => {
            await tx.pago.update({
                where: { id: pagoId },
                data: {
                    estadoPago,
                    mercadoPagoId,
                    mercadoPagoStatus: status,
                },
            });
            if (estadoPago === client_1.EstadoPago.APROBADO) {
                await tx.cuota.update({
                    where: { id: pago.cuotaId },
                    data: { estadoCuota: client_1.EstadoCuota.PAGADA },
                });
                // Actualizar estado del deportista si ya no tiene deudas
                const cuotasPendientes = await tx.cuota.count({
                    where: {
                        deportistaId: pago.deportistaId,
                        estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                    },
                });
                if (cuotasPendientes === 0) {
                    await tx.deportista.update({
                        where: { id: pago.deportistaId },
                        data: { estado: client_1.EstadoDeportista.AL_DIA },
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
                            estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
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
                                estadoPago: client_1.EstadoPago.APROBADO,
                            },
                        });
                        await tx.cuota.update({
                            where: { id: c.id },
                            data: { estadoCuota: client_1.EstadoCuota.PAGADA },
                        });
                        const pendientesOtro = await tx.cuota.count({
                            where: {
                                deportistaId: c.deportistaId,
                                estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                            },
                        });
                        if (pendientesOtro === 0) {
                            await tx.deportista.update({
                                where: { id: c.deportistaId },
                                data: { estado: client_1.EstadoDeportista.AL_DIA },
                            });
                        }
                    }
                }
            }
        });
        return this.getById(pagoId);
    }
    async getById(id) {
        const pago = await prisma_1.default.pago.findUnique({
            where: { id },
            include: {
                cuota: {
                    include: { disciplina: true },
                },
                deportista: true,
            },
        });
        if (!pago) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.PAGO_NOT_FOUND);
        }
        return pago;
    }
    async getByMercadoPagoId(mercadoPagoId) {
        const pago = await prisma_1.default.pago.findUnique({
            where: { mercadoPagoId },
            include: {
                cuota: true,
                deportista: true,
            },
        });
        return pago;
    }
    async getByDeportista(deportistaId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [pagos, total] = await Promise.all([
            prisma_1.default.pago.findMany({
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
            prisma_1.default.pago.count({ where: { deportistaId } }),
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
exports.PagoService = PagoService;
exports.pagoService = new PagoService();
//# sourceMappingURL=pago.service.js.map