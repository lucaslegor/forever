"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class DashboardService {
    async getStats(anio, mes) {
        // Filtrar por período de la cuota (mes/año que se paga), no por fecha del pago
        const wherePago = {
            estadoPago: client_1.EstadoPago.APROBADO,
        };
        if (anio != null) {
            wherePago.cuota = { anio: anio };
            if (mes != null) {
                wherePago.cuota.nroCuota = mes;
            }
        }
        const pagos = await prisma_1.default.pago.findMany({
            where: wherePago,
            include: {
                cuota: { include: { disciplina: true } },
                deportista: {
                    include: {
                        disciplina: true,
                        genero: true,
                        categoria: true,
                        subcategoria: true,
                        grupoFamiliar: { include: { grupo: true } },
                    },
                },
            },
        });
        // Evitar doble conteo: si el grupo familiar pagó una sola vez (ej. $16000), hay un Pago por cada
        // integrante con ese monto; solo contamos una vez por (grupoId, anio, nroCuota).
        const countedGrupoPeriod = new Set();
        const recaudacionMap = new Map();
        const pagosPorMedioMap = new Map();
        let totalRecaudado = 0;
        for (const p of pagos) {
            const d = p.deportista;
            const c = p.cuota;
            const grupoFam = d.grupoFamiliar?.[0];
            const grupo = grupoFam?.grupo;
            const tieneCuotaHermano = grupo?.cuotaHermano != null;
            let skip = false;
            if (tieneCuotaHermano && c) {
                const grupoKey = `${grupoFam.grupoId}-${c.anio}-${c.nroCuota}`;
                if (countedGrupoPeriod.has(grupoKey))
                    skip = true;
                else
                    countedGrupoPeriod.add(grupoKey);
            }
            if (skip)
                continue;
            const monto = Number(p.monto);
            const medio = p.medioPago ?? 'Sin especificar';
            const prevMedio = pagosPorMedioMap.get(medio);
            if (prevMedio) {
                prevMedio.cantidad += 1;
                prevMedio.montoTotal += monto;
            }
            else {
                pagosPorMedioMap.set(medio, { cantidad: 1, montoTotal: monto });
            }
            const disc = c?.disciplina ?? d.disciplina;
            const key = `${disc.id}-${d.genero.id}-${d.categoria.id}-${d.subcategoriaId ?? 'null'}`;
            totalRecaudado += monto;
            const prev = recaudacionMap.get(key);
            if (prev) {
                prev.total += monto;
                prev.count += 1;
            }
            else {
                recaudacionMap.set(key, {
                    total: monto,
                    count: 1,
                    row: {
                        disciplinaId: disc.id,
                        disciplinaNombre: disc.nombre,
                        generoId: d.genero.id,
                        generoNombre: d.genero.nombre,
                        categoriaId: d.categoria.id,
                        categoriaNombre: d.categoria.nombre,
                        subcategoriaId: d.subcategoriaId,
                        subcategoriaNombre: d.subcategoria?.nombre ?? null,
                    },
                });
            }
        }
        const recaudacionDeduped = Array.from(recaudacionMap.values()).map((v) => ({
            ...v.row,
            totalRecaudado: v.total,
            cantidadPagos: v.count,
        }));
        const pagosPorMedio = Array.from(pagosPorMedioMap.entries()).map(([medio, v]) => ({
            medio,
            cantidad: v.cantidad,
            montoTotal: v.montoTotal,
        }));
        const deportistasPorDisciplina = await prisma_1.default.deportista.groupBy({
            by: ['disciplinaId'],
            _count: { id: true },
        });
        const disciplinas = await prisma_1.default.disciplina.findMany({ where: { id: { in: deportistasPorDisciplina.map((d) => d.disciplinaId) } } });
        const discMap = new Map(disciplinas.map((d) => [d.id, d.nombre]));
        const deportistasPorDisciplinaRows = deportistasPorDisciplina.map((d) => ({
            disciplinaId: d.disciplinaId,
            disciplinaNombre: discMap.get(d.disciplinaId) ?? '',
            cantidad: d._count.id,
        }));
        const [aggPendientes, aggVencidas] = await Promise.all([
            prisma_1.default.cuota.aggregate({
                where: { estadoCuota: client_1.EstadoCuota.PENDIENTE },
                _count: { id: true },
                _sum: { monto: true },
            }),
            prisma_1.default.cuota.aggregate({
                where: { estadoCuota: client_1.EstadoCuota.VENCIDA },
                _count: { id: true },
                _sum: { monto: true },
            }),
        ]);
        const cuotasPendientes = aggPendientes._count.id;
        const cuotasVencidas = aggVencidas._count.id;
        const montoPendientes = Number(aggPendientes._sum.monto ?? 0);
        const montoVencidas = Number(aggVencidas._sum.monto ?? 0);
        return {
            recaudacionPorClasificacion: recaudacionDeduped.sort((a, b) => b.totalRecaudado - a.totalRecaudado),
            deportistasPorDisciplina: deportistasPorDisciplinaRows.sort((a, b) => b.cantidad - a.cantidad),
            cuotasPendientesVencidas: {
                pendientes: cuotasPendientes,
                vencidas: cuotasVencidas,
                total: cuotasPendientes + cuotasVencidas,
                montoPendientes,
                montoVencidas,
            },
            pagosPorMedio,
            totalRecaudado,
        };
    }
    async getDeudores(filters) {
        const deportistaWhere = {};
        if (filters?.disciplinaId != null)
            deportistaWhere.disciplinaId = filters.disciplinaId;
        if (filters?.generoId != null)
            deportistaWhere.generoId = filters.generoId;
        if (filters?.categoriaId != null)
            deportistaWhere.categoriaId = filters.categoriaId;
        if (filters?.subcategoriaId != null)
            deportistaWhere.subcategoriaId = filters.subcategoriaId;
        const cuotaWhere = {
            estadoCuota: { in: [client_1.EstadoCuota.PENDIENTE, client_1.EstadoCuota.VENCIDA] },
        };
        if (filters?.anio != null)
            cuotaWhere.anio = filters.anio;
        if (filters?.mes != null)
            cuotaWhere.nroCuota = filters.mes;
        if (Object.keys(deportistaWhere).length > 0)
            cuotaWhere.deportista = deportistaWhere;
        const cuotasImpagas = await prisma_1.default.cuota.findMany({
            where: cuotaWhere,
            include: {
                deportista: {
                    include: {
                        cuenta: true,
                        disciplina: true,
                        genero: true,
                        categoria: true,
                        subcategoria: true,
                        grupoFamiliar: { include: { grupo: true } },
                    },
                },
            },
            orderBy: [{ deportistaId: 'asc' }, { anio: 'desc' }, { nroCuota: 'desc' }],
        });
        const byDeportista = new Map();
        for (const c of cuotasImpagas) {
            const d = c.deportista;
            const existing = byDeportista.get(d.id);
            if (existing) {
                existing.cuotas.push(c);
            }
            else {
                byDeportista.set(d.id, { deportista: d, cuotas: [c] });
            }
        }
        const rows = [];
        for (const [, { deportista: d, cuotas }] of byDeportista) {
            let montoTotalAdeudado = 0;
            const cuotasImpagasList = cuotas.map((c) => {
                const m = Number(c.monto);
                montoTotalAdeudado += m;
                return {
                    nroCuota: c.nroCuota,
                    anio: c.anio,
                    monto: m,
                    estado: c.estadoCuota,
                    fechaVencimiento: c.fechaVencimiento.toISOString().slice(0, 10),
                };
            });
            const email = d.cuenta?.email ?? '';
            const grupoFamiliarNombre = d.grupoFamiliar?.[0]?.grupo?.nombre ?? null;
            rows.push({
                deportistaId: d.id,
                nombre: d.nombre,
                apellido: d.apellido,
                dni: d.dni,
                email,
                disciplinaNombre: d.disciplina?.nombre ?? '',
                categoriaNombre: d.categoria?.nombre ?? '',
                subcategoriaNombre: d.subcategoria?.nombre ?? null,
                generoNombre: d.genero?.nombre ?? '',
                grupoFamiliarNombre,
                cuotasImpagas: cuotasImpagasList,
                montoTotalAdeudado,
            });
        }
        return rows.sort((a, b) => b.montoTotalAdeudado - a.montoTotalAdeudado);
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map