"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cuotaService = exports.CuotaService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
const FACTOR_BECA = 0.7;
function montoBeca(precioMensual, cuotaBeca) {
    if (cuotaBeca != null && !Number.isNaN(cuotaBeca))
        return Math.round(cuotaBeca * 100) / 100;
    return Math.round(precioMensual * FACTOR_BECA * 100) / 100;
}
class CuotaService {
    async asignar(data) {
        // Verificar que el deportista existe
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id: data.deportistaId },
        });
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        // Verificar que no exista cuota para el mismo período
        const existingCuota = await prisma_1.default.cuota.findFirst({
            where: {
                deportistaId: data.deportistaId,
                nroCuota: data.nroCuota,
                disciplinaId: data.disciplinaId,
            },
        });
        if (existingCuota) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.CUOTA_ALREADY_ASSIGNED);
        }
        const fechaEmision = new Date(data.fechaEmision);
        const cuota = await prisma_1.default.cuota.create({
            data: {
                nroCuota: data.nroCuota,
                anio: fechaEmision.getFullYear(),
                monto: data.monto,
                fechaEmision: fechaEmision,
                fechaVencimiento: new Date(data.fechaVencimiento),
                disciplinaId: data.disciplinaId,
                deportistaId: data.deportistaId,
            },
            include: {
                disciplina: true,
                deportista: true,
            },
        });
        return cuota;
    }
    async getById(id) {
        const cuota = await prisma_1.default.cuota.findUnique({
            where: { id },
            include: {
                disciplina: true,
                deportista: true,
                pagos: true,
                canceladaPorCuenta: { select: { id: true, email: true } },
            },
        });
        if (!cuota) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.CUOTA_NOT_FOUND);
        }
        return cuota;
    }
    async update(id, data) {
        const cuota = await prisma_1.default.cuota.findUnique({
            where: { id },
        });
        if (!cuota) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.CUOTA_NOT_FOUND);
        }
        const updatedCuota = await prisma_1.default.cuota.update({
            where: { id },
            data: {
                monto: data.monto,
                fechaVencimiento: data.fechaVencimiento
                    ? new Date(data.fechaVencimiento)
                    : undefined,
                periodicidad: data.periodicidad,
            },
            include: {
                disciplina: true,
                deportista: true,
            },
        });
        return updatedCuota;
    }
    async getPredefinidas(disciplinaId) {
        const where = {};
        if (disciplinaId) {
            where.disciplinaId = disciplinaId;
        }
        const disciplinas = await prisma_1.default.disciplina.findMany({
            where: { activa: true },
            select: {
                id: true,
                nombre: true,
                precioMensual: true,
            },
        });
        return disciplinas.map((d) => ({
            disciplinaId: d.id,
            disciplinaNombre: d.nombre,
            montoMensual: d.precioMensual,
        }));
    }
    async getEstadoCuenta(deportistaId) {
        await this.actualizarVencidas();
        const [deportista, cuotas, integranteGrupo] = await Promise.all([
            prisma_1.default.deportista.findUnique({
                where: { id: deportistaId },
                select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    dni: true,
                    becado: true,
                    cuotaBeca: true,
                    disciplina: { select: { precioMensual: true } },
                },
            }),
            prisma_1.default.cuota.findMany({
                where: { deportistaId },
                include: {
                    disciplina: { select: { nombre: true } },
                    pagos: {
                        where: { estadoPago: 'APROBADO' },
                    },
                },
                orderBy: { nroCuota: 'asc' },
            }),
            prisma_1.default.grupoFamiliarIntegrante.findFirst({
                where: { deportistaId, esPrincipal: false },
                include: { grupo: { select: { cuotaHermano: true, titularDni: true } } },
            }),
        ]);
        if (!deportista) {
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.DEPORTISTA_NOT_FOUND);
        }
        const montoGrupoFamiliar = integranteGrupo?.grupo?.cuotaHermano != null
            ? Number(integranteGrupo.grupo.cuotaHermano)
            : null;
        const precioDisciplina = deportista.disciplina ? Number(deportista.disciplina.precioMensual) : 0;
        const montoBecaDeportista = deportista.becado && precioDisciplina > 0
            ? montoBeca(precioDisciplina, deportista.cuotaBeca != null ? Number(deportista.cuotaBeca) : null)
            : null;
        const montoObjetivoPendientes = montoGrupoFamiliar ?? montoBecaDeportista;
        const cuotasPagadas = cuotas
            .filter((c) => c.estadoCuota === client_1.EstadoCuota.PAGADA)
            .map((c) => ({
            id: c.id,
            nroCuota: c.nroCuota,
            monto: c.monto,
            fechaPago: c.pagos[0]?.fechaPago,
            medioPago: c.pagos[0]?.medioPago,
            disciplina: c.disciplina?.nombre ?? null,
        }));
        // Deuda = solo cuotas PENDIENTE o VENCIDA (excluir CANCELADA)
        const pendientesRaw = cuotas.filter((c) => c.estadoCuota === client_1.EstadoCuota.PENDIENTE || c.estadoCuota === client_1.EstadoCuota.VENCIDA);
        const cuotasAActualizar = pendientesRaw.filter((c) => montoObjetivoPendientes != null && Number(c.monto) !== montoObjetivoPendientes);
        if (cuotasAActualizar.length > 0) {
            await prisma_1.default.$transaction(cuotasAActualizar.map((c) => prisma_1.default.cuota.update({
                where: { id: c.id },
                data: { monto: new client_1.Prisma.Decimal(montoObjetivoPendientes) },
            })));
        }
        const cuotasPendientes = pendientesRaw.map((c) => {
            const monto = montoObjetivoPendientes != null && Number(c.monto) !== montoObjetivoPendientes
                ? montoObjetivoPendientes
                : c.monto;
            return {
                id: c.id,
                nroCuota: c.nroCuota,
                anio: c.anio,
                monto,
                fechaVencimiento: c.fechaVencimiento,
                estadoCuota: c.estadoCuota,
                disciplina: c.disciplina?.nombre ?? null,
            };
        });
        const totalAdeudado = cuotasPendientes.reduce((sum, c) => sum + Number(c.monto), 0);
        const titularDni = integranteGrupo?.grupo?.titularDni ?? null;
        const esTitularGrupoFamiliar = titularDni == null || titularDni === deportista.dni;
        return {
            deportista: {
                id: deportista.id,
                nombre: deportista.nombre,
                apellido: deportista.apellido,
            },
            cuotasPagadas,
            cuotasPendientes,
            totalAdeudado,
            esTitularGrupoFamiliar,
        };
    }
    async getByDeportista(deportistaId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const where = { deportistaId };
        if (query.estado) {
            where.estadoCuota = query.estado;
        }
        const [cuotas, total] = await Promise.all([
            prisma_1.default.cuota.findMany({
                where,
                skip,
                take: limit,
                include: {
                    disciplina: true,
                    pagos: true,
                },
                orderBy: { nroCuota: 'desc' },
            }),
            prisma_1.default.cuota.count({ where }),
        ]);
        return {
            data: cuotas,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    /** Listado para admin: todas las cuotas con filtros anio, mes, estado, disciplina */
    async getAll(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 50, 200);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.anio != null)
            where.anio = typeof query.anio === 'number' ? query.anio : parseInt(String(query.anio), 10);
        if (query.mes != null)
            where.nroCuota = typeof query.mes === 'number' ? query.mes : parseInt(String(query.mes), 10);
        if (query.estado)
            where.estadoCuota = query.estado;
        if (query.disciplinaId != null)
            where.disciplinaId = typeof query.disciplinaId === 'number' ? query.disciplinaId : parseInt(String(query.disciplinaId), 10);
        const [cuotas, total] = await Promise.all([
            prisma_1.default.cuota.findMany({
                where,
                skip,
                take: limit,
                include: {
                    disciplina: { select: { nombre: true } },
                    canceladaPorCuenta: { select: { id: true, email: true } },
                    deportista: {
                        include: {
                            genero: { select: { nombre: true } },
                            categoria: { select: { nombre: true } },
                            subcategoria: { select: { nombre: true } },
                            grupoFamiliar: { include: { grupo: true } },
                        },
                    },
                    pagos: {
                        where: { estadoPago: client_1.EstadoPago.APROBADO },
                        take: 1,
                        orderBy: { fechaPago: 'desc' },
                    },
                },
                orderBy: [{ anio: 'desc' }, { nroCuota: 'desc' }],
            }),
            prisma_1.default.cuota.count({ where }),
        ]);
        const data = cuotas.map((c) => {
            const pago = c.pagos[0];
            const formaPago = !pago ? '' : (pago.medioPago?.toLowerCase().includes('efectivo') ? 'efectivo' : 'sistema');
            return {
                id: c.id,
                deportistaId: c.deportistaId,
                disciplinaId: c.disciplinaId,
                deportistaNombre: `${c.deportista.nombre} ${c.deportista.apellido}`,
                disciplina: c.disciplina.nombre,
                genero: c.deportista.genero?.nombre ?? '',
                categoria: c.deportista.categoria?.nombre ?? '',
                subcategoria: c.deportista.subcategoria?.nombre ?? '',
                mes: c.nroCuota,
                anio: c.anio,
                monto: Number(c.monto),
                formaPago,
                estadoCuota: c.estadoCuota,
                fechaPago: pago?.fechaPago,
                canceladaAt: c.canceladaAt ?? null,
                cancelacionMotivo: c.cancelacionMotivo ?? null,
                canceladaPor: c.canceladaPorCuenta?.email ?? null,
            };
        });
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async delete(id) {
        const cuota = await prisma_1.default.cuota.findUnique({
            where: { id },
            include: { pagos: true },
        });
        if (!cuota)
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.CUOTA_NOT_FOUND);
        if (cuota.pagos.some((p) => p.estadoPago === client_1.EstadoPago.APROBADO)) {
            throw new errors_1.ConflictError('No se puede borrar una cuota que ya tiene un pago aprobado');
        }
        await prisma_1.default.pago.deleteMany({ where: { cuotaId: id } });
        await prisma_1.default.cuota.delete({ where: { id } });
        return { message: 'Cuota eliminada' };
    }
    /** Borrar todas las cuotas de una generación (mes + año + disciplina). Elimina pagos asociados y luego las cuotas. */
    async deletePorGeneracion(anio, mes, disciplinaId) {
        const cuotas = await prisma_1.default.cuota.findMany({
            where: { anio, nroCuota: mes, disciplinaId },
            select: { id: true },
        });
        const ids = cuotas.map((c) => c.id);
        if (ids.length === 0) {
            return { message: 'No hay cuotas para esta generación', eliminadas: 0 };
        }
        await prisma_1.default.pago.deleteMany({ where: { cuotaId: { in: ids } } });
        const result = await prisma_1.default.cuota.deleteMany({ where: { id: { in: ids } } });
        return { message: `Generación eliminada: ${result.count} cuota(s)`, eliminadas: result.count };
    }
    /** Borrar todas las cuotas de un mes/año (toda la generación del mes). */
    async deletePorMes(anio, mes) {
        const anioNum = typeof anio === 'number' ? anio : parseInt(String(anio), 10);
        const mesNum = typeof mes === 'number' ? mes : parseInt(String(mes), 10);
        const cuotas = await prisma_1.default.cuota.findMany({
            where: { anio: anioNum, nroCuota: mesNum },
            select: { id: true },
        });
        const ids = cuotas.map((c) => c.id);
        if (ids.length === 0) {
            return { message: 'No hay cuotas para este mes', eliminadas: 0 };
        }
        await prisma_1.default.pago.deleteMany({ where: { cuotaId: { in: ids } } });
        const result = await prisma_1.default.cuota.deleteMany({ where: { id: { in: ids } } });
        return { message: `Generación del mes eliminada: ${result.count} cuota(s)`, eliminadas: result.count };
    }
    /** Marcar cuota como pagada en efectivo (admin). Si es el titular del grupo familiar, marca como pagadas las cuotas del mismo período de todos los miembros. */
    async marcarPagadaEfectivo(id) {
        const cuota = await prisma_1.default.cuota.findUnique({
            where: { id },
            include: { pagos: { where: { estadoPago: client_1.EstadoPago.APROBADO } } },
        });
        if (!cuota)
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.CUOTA_NOT_FOUND);
        if (cuota.estadoCuota === client_1.EstadoCuota.PAGADA) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.CUOTA_ALREADY_PAID);
        }
        const fechaPago = new Date();
        const steps = [
            prisma_1.default.pago.create({
                data: {
                    cuotaId: id,
                    deportistaId: cuota.deportistaId,
                    monto: cuota.monto,
                    fechaPago,
                    medioPago: 'efectivo',
                    estadoPago: client_1.EstadoPago.APROBADO,
                },
            }),
            prisma_1.default.cuota.update({
                where: { id },
                data: { estadoCuota: client_1.EstadoCuota.PAGADA },
            }),
        ];
        // Si pertenece a un grupo familiar, marcar como pagadas las cuotas del mismo período de todos los demás miembros (titular o no)
        const integrante = await prisma_1.default.grupoFamiliarIntegrante.findFirst({
            where: { deportistaId: cuota.deportistaId },
            select: { grupoId: true },
        });
        if (integrante) {
            const otrosIntegrantes = await prisma_1.default.grupoFamiliarIntegrante.findMany({
                where: {
                    grupoId: integrante.grupoId,
                    deportistaId: { not: cuota.deportistaId },
                },
                select: { deportistaId: true },
            });
            const otrosIds = otrosIntegrantes.map((o) => o.deportistaId);
            const cuotasGrupo = await prisma_1.default.cuota.findMany({
                where: {
                    deportistaId: { in: otrosIds },
                    anio: cuota.anio,
                    nroCuota: cuota.nroCuota,
                    disciplinaId: cuota.disciplinaId,
                    estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                },
            });
            for (const c of cuotasGrupo) {
                steps.push(prisma_1.default.pago.create({
                    data: {
                        cuotaId: c.id,
                        deportistaId: c.deportistaId,
                        monto: c.monto,
                        fechaPago,
                        medioPago: 'efectivo',
                        estadoPago: client_1.EstadoPago.APROBADO,
                    },
                }));
                steps.push(prisma_1.default.cuota.update({
                    where: { id: c.id },
                    data: { estadoCuota: client_1.EstadoCuota.PAGADA },
                }));
            }
        }
        await prisma_1.default.$transaction(steps);
        return this.getById(id);
    }
    /** Cancelar deuda de una cuota (admin). Solo si está PENDIENTE o VENCIDA. */
    async cancelarDeuda(id, motivo, canceladaPorCuentaId) {
        const cuota = await prisma_1.default.cuota.findUnique({
            where: { id },
            select: { id: true, estadoCuota: true, deportistaId: true },
        });
        if (!cuota)
            throw new errors_1.NotFoundError(errors_1.ErrorMessages.CUOTA_NOT_FOUND);
        if (cuota.estadoCuota === client_1.EstadoCuota.PAGADA) {
            throw new errors_1.ConflictError('No se puede cancelar una cuota que ya está pagada');
        }
        if (cuota.estadoCuota !== client_1.EstadoCuota.PENDIENTE && cuota.estadoCuota !== client_1.EstadoCuota.VENCIDA) {
            throw new errors_1.ConflictError('Solo se pueden cancelar cuotas pendientes o vencidas');
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.cuota.update({
                where: { id },
                data: {
                    estadoCuota: client_1.EstadoCuota.CANCELADA,
                    canceladaAt: new Date(),
                    cancelacionMotivo: motivo,
                    canceladaPorCuentaId,
                },
            });
            // Si ya no tiene cuotas pendientes/vencidas, marcar deportista AL_DIA
            const pendientes = await tx.cuota.count({
                where: {
                    deportistaId: cuota.deportistaId,
                    estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
                },
            });
            if (pendientes === 0) {
                await tx.deportista.update({
                    where: { id: cuota.deportistaId },
                    data: { estado: 'AL_DIA' },
                });
            }
        });
        return this.getById(id);
    }
    async actualizarVencidas() {
        const now = new Date();
        const result = await prisma_1.default.cuota.updateMany({
            where: {
                estadoCuota: client_1.EstadoCuota.PENDIENTE,
                fechaVencimiento: { lt: now },
            },
            data: {
                estadoCuota: client_1.EstadoCuota.VENCIDA,
            },
        });
        return { actualizadas: result.count };
    }
    async generarCuotasMensuales(mes, anio) {
        const now = new Date();
        const mesActual = now.getMonth() + 1;
        const anioActual = now.getFullYear();
        // Regla: solo permitir generar cuotas del mes en curso (evita backfill y meses futuros).
        if (anio !== anioActual || mes !== mesActual) {
            throw new errors_1.ConflictError('Solo se pueden generar cuotas del mes en curso.');
        }
        // Generar por disciplinas: todos los deportistas activos (cuenta activa). Si se agrega un
        // deportista a mitad de mes, al volver a ejecutar esta generación para ese mes se crea su cuota.
        const deportistas = await prisma_1.default.deportista.findMany({
            where: {
                estado: { not: 'INACTIVA' },
                cuenta: { activo: true },
            },
            include: {
                disciplina: true,
            },
        });
        const resultados = {
            cuotasGeneradas: 0,
            cuotasOmitidas: 0,
            montoTotal: 0,
            detalles: [],
        };
        const fechaEmision = new Date(anio, mes - 1, 1);
        const fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        for (const deportista of deportistas) {
            const cuotaExistente = await prisma_1.default.cuota.findFirst({
                where: {
                    deportistaId: deportista.id,
                    disciplinaId: deportista.disciplinaId,
                    nroCuota: mes,
                    anio: anio,
                },
            });
            if (cuotaExistente) {
                resultados.cuotasOmitidas++;
                continue;
            }
            // Si pertenece a un grupo familiar con cuotaHermano, todos los integrantes usan el mismo valor
            const integranteGrupo = await prisma_1.default.grupoFamiliarIntegrante.findFirst({
                where: { deportistaId: deportista.id },
                include: { grupo: true },
            });
            const precioDisciplina = Number(deportista.disciplina.precioMensual);
            const cuotaHermano = integranteGrupo?.grupo?.cuotaHermano != null
                ? Number(integranteGrupo.grupo.cuotaHermano)
                : null;
            const monto = integranteGrupo && cuotaHermano != null
                ? cuotaHermano
                : deportista.becado
                    ? montoBeca(precioDisciplina, deportista.cuotaBeca != null ? Number(deportista.cuotaBeca) : null)
                    : precioDisciplina;
            await prisma_1.default.cuota.create({
                data: {
                    nroCuota: mes,
                    anio: anio,
                    monto: monto,
                    fechaEmision: fechaEmision,
                    fechaVencimiento: fechaVencimiento,
                    disciplinaId: deportista.disciplinaId,
                    deportistaId: deportista.id,
                    periodicidad: client_1.Periodicidad.MENSUAL,
                },
            });
            resultados.cuotasGeneradas++;
            resultados.montoTotal += monto;
            resultados.detalles.push({
                deportistaId: deportista.id,
                nombre: `${deportista.nombre} ${deportista.apellido}`,
                monto: monto,
                usaCuotaHermano: integranteGrupo != null && cuotaHermano != null,
            });
        }
        return {
            mensaje: `Generación de cuotas completada para ${mes}/${anio}`,
            ...resultados,
        };
    }
    /**
     * Asigna la cuota del mes actual al deportista solo si ya hay cuotas generadas para ese mes
     * (p. ej. el admin ya ejecutó "Generar cuotas mensuales"). Si no hay ninguna cuota en curso
     * para el mes, no se genera ninguna. Si el deportista ya tiene esa cuota, no hace nada.
     */
    async asignarCuotaDelMesActual(deportistaId) {
        const now = new Date();
        const mes = now.getMonth() + 1;
        const anio = now.getFullYear();
        const hayCuotasDelMes = await prisma_1.default.cuota.findFirst({
            where: { anio, nroCuota: mes },
            select: { id: true },
        });
        if (!hayCuotasDelMes)
            return null;
        const deportista = await prisma_1.default.deportista.findUnique({
            where: { id: deportistaId },
            include: { disciplina: true },
        });
        if (!deportista)
            return null;
        const cuotaExistente = await prisma_1.default.cuota.findFirst({
            where: {
                deportistaId,
                disciplinaId: deportista.disciplinaId,
                nroCuota: mes,
                anio,
            },
        });
        if (cuotaExistente)
            return cuotaExistente;
        const integranteGrupo = await prisma_1.default.grupoFamiliarIntegrante.findFirst({
            where: { deportistaId },
            include: { grupo: true },
        });
        const precioDisciplina = Number(deportista.disciplina.precioMensual);
        const cuotaHermano = integranteGrupo?.grupo?.cuotaHermano != null
            ? Number(integranteGrupo.grupo.cuotaHermano)
            : null;
        const monto = integranteGrupo && cuotaHermano != null
            ? cuotaHermano
            : deportista.becado
                ? montoBeca(precioDisciplina, deportista.cuotaBeca != null ? Number(deportista.cuotaBeca) : null)
                : precioDisciplina;
        const fechaEmision = new Date(anio, mes - 1, 1);
        const fechaVencimiento = new Date(fechaEmision);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
        return prisma_1.default.cuota.create({
            data: {
                nroCuota: mes,
                anio,
                monto,
                fechaEmision,
                fechaVencimiento,
                disciplinaId: deportista.disciplinaId,
                deportistaId,
                periodicidad: client_1.Periodicidad.MENSUAL,
            },
        });
    }
    /**
     * Actualiza el monto solo de cuotas PENDIENTES y VENCIDAS cuando cambia el precio de la disciplina.
     * No toca cuotas PAGADAS: lo ya cobrado queda con el valor histórico (reportes correctos).
     * Respeta grupo familiar (cuotaHermano) y beca.
     */
    async actualizarMontosPorCambioPrecioDisciplina(disciplinaId, nuevoPrecio) {
        const cuotas = await prisma_1.default.cuota.findMany({
            where: {
                disciplinaId,
                estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
            },
            include: {
                deportista: {
                    include: {
                        grupoFamiliar: { include: { grupo: true } },
                    },
                },
            },
        });
        if (cuotas.length === 0)
            return 0;
        const redondeado = Math.round(nuevoPrecio * 100) / 100;
        await prisma_1.default.$transaction(cuotas.map((c) => {
            const d = c.deportista;
            const integranteGrupo = d.grupoFamiliar?.[0];
            const cuotaHermano = integranteGrupo?.grupo?.cuotaHermano != null
                ? Number(integranteGrupo.grupo.cuotaHermano)
                : null;
            const monto = integranteGrupo && cuotaHermano != null
                ? cuotaHermano
                : d.becado
                    ? montoBeca(redondeado, d.cuotaBeca != null ? Number(d.cuotaBeca) : null)
                    : redondeado;
            return prisma_1.default.cuota.update({
                where: { id: c.id },
                data: { monto: new client_1.Prisma.Decimal(monto) },
            });
        }));
        return cuotas.length;
    }
}
exports.CuotaService = CuotaService;
exports.cuotaService = new CuotaService();
//# sourceMappingURL=cuota.service.js.map