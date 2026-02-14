import prisma from '../config/prisma';
import { EstadoPago, EstadoCuota } from '@prisma/client';

export interface RecaudacionPorClasificacionRow {
  disciplinaId: number;
  disciplinaNombre: string;
  generoId: number;
  generoNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  subcategoriaId: number | null;
  subcategoriaNombre: string | null;
  totalRecaudado: number;
  cantidadPagos: number;
}

export interface DeportistasPorDisciplinaRow {
  disciplinaId: number;
  disciplinaNombre: string;
  cantidad: number;
}

export interface CuotasPendientesVencidas {
  pendientes: number;
  vencidas: number;
  total: number;
}

export interface PagosPorMedioRow {
  medio: string;
  cantidad: number;
  montoTotal: number;
}

export interface DashboardStats {
  recaudacionPorClasificacion: RecaudacionPorClasificacionRow[];
  deportistasPorDisciplina: DeportistasPorDisciplinaRow[];
  cuotasPendientesVencidas: CuotasPendientesVencidas;
  pagosPorMedio: PagosPorMedioRow[];
  totalRecaudado: number;
}

export interface DeudorRow {
  deportistaId: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  disciplinaNombre: string;
  categoriaNombre: string;
  subcategoriaNombre: string | null;
  generoNombre: string;
  /** Nombre del grupo familiar si es integrante (evita doble conteo al sumar montos). */
  grupoFamiliarNombre: string | null;
  cuotasImpagas: { nroCuota: number; anio: number; monto: number; estado: string; fechaVencimiento: string }[];
  montoTotalAdeudado: number;
}

export class DashboardService {
  async getStats(anio?: number, mes?: number): Promise<DashboardStats> {
    const wherePago: { estadoPago: EstadoPago; fechaPago?: { gte: Date; lt: Date } } = {
      estadoPago: EstadoPago.APROBADO,
    };
    if (anio != null && mes != null) {
      wherePago.fechaPago = {
        gte: new Date(anio, mes - 1, 1),
        lt: new Date(anio, mes, 1),
      };
    }

    const pagos = await prisma.pago.findMany({
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
    const countedGrupoPeriod = new Set<string>();
    const recaudacionMap = new Map<
      string,
      { total: number; count: number; row: Omit<RecaudacionPorClasificacionRow, 'totalRecaudado' | 'cantidadPagos'> }
    >();
    const pagosPorMedioMap = new Map<string, { cantidad: number; montoTotal: number }>();
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
        if (countedGrupoPeriod.has(grupoKey)) skip = true;
        else countedGrupoPeriod.add(grupoKey);
      }
      if (skip) continue;

      const monto = Number(p.monto);
      const medio = p.medioPago ?? 'Sin especificar';
      const prevMedio = pagosPorMedioMap.get(medio);
      if (prevMedio) {
        prevMedio.cantidad += 1;
        prevMedio.montoTotal += monto;
      } else {
        pagosPorMedioMap.set(medio, { cantidad: 1, montoTotal: monto });
      }

      const disc = c?.disciplina ?? d.disciplina;
      const key = `${disc.id}-${d.genero.id}-${d.categoria.id}-${d.subcategoriaId ?? 'null'}`;
      totalRecaudado += monto;
      const prev = recaudacionMap.get(key);
      if (prev) {
        prev.total += monto;
        prev.count += 1;
      } else {
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
    const recaudacionDeduped: RecaudacionPorClasificacionRow[] = Array.from(recaudacionMap.values()).map((v) => ({
      ...v.row,
      totalRecaudado: v.total,
      cantidadPagos: v.count,
    }));

    const pagosPorMedio: PagosPorMedioRow[] = Array.from(pagosPorMedioMap.entries()).map(([medio, v]) => ({
      medio,
      cantidad: v.cantidad,
      montoTotal: v.montoTotal,
    }));

    const deportistasPorDisciplina = await prisma.deportista.groupBy({
      by: ['disciplinaId'],
      _count: { id: true },
    });
    const disciplinas = await prisma.disciplina.findMany({ where: { id: { in: deportistasPorDisciplina.map((d) => d.disciplinaId) } } });
    const discMap = new Map(disciplinas.map((d) => [d.id, d.nombre]));
    const deportistasPorDisciplinaRows: DeportistasPorDisciplinaRow[] = deportistasPorDisciplina.map((d) => ({
      disciplinaId: d.disciplinaId,
      disciplinaNombre: discMap.get(d.disciplinaId) ?? '',
      cantidad: d._count.id,
    }));

    const cuotasPendientes = await prisma.cuota.count({ where: { estadoCuota: EstadoCuota.PENDIENTE } });
    const cuotasVencidas = await prisma.cuota.count({ where: { estadoCuota: EstadoCuota.VENCIDA } });

    return {
      recaudacionPorClasificacion: recaudacionDeduped.sort((a, b) => b.totalRecaudado - a.totalRecaudado),
      deportistasPorDisciplina: deportistasPorDisciplinaRows.sort((a, b) => b.cantidad - a.cantidad),
      cuotasPendientesVencidas: { pendientes: cuotasPendientes, vencidas: cuotasVencidas, total: cuotasPendientes + cuotasVencidas },
      pagosPorMedio,
      totalRecaudado,
    };
  }

  async getDeudores(filters?: {
    disciplinaId?: number;
    generoId?: number;
    categoriaId?: number;
    subcategoriaId?: number;
    anio?: number;
    mes?: number;
  }): Promise<DeudorRow[]> {
    const deportistaWhere: Record<string, unknown> = {};
    if (filters?.disciplinaId != null) deportistaWhere.disciplinaId = filters.disciplinaId;
    if (filters?.generoId != null) deportistaWhere.generoId = filters.generoId;
    if (filters?.categoriaId != null) deportistaWhere.categoriaId = filters.categoriaId;
    if (filters?.subcategoriaId != null) deportistaWhere.subcategoriaId = filters.subcategoriaId;

    const cuotaWhere: Record<string, unknown> = {
      estadoCuota: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] },
    };
    if (filters?.anio != null) cuotaWhere.anio = filters.anio;
    if (filters?.mes != null) cuotaWhere.nroCuota = filters.mes;
    if (Object.keys(deportistaWhere).length > 0) cuotaWhere.deportista = deportistaWhere;

    const cuotasImpagas = await prisma.cuota.findMany({
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

    const byDeportista = new Map<
      number,
      {
        deportista: typeof cuotasImpagas[0]['deportista'];
        cuotas: typeof cuotasImpagas;
      }
    >();
    for (const c of cuotasImpagas) {
      const d = c.deportista;
      const existing = byDeportista.get(d.id);
      if (existing) {
        existing.cuotas.push(c);
      } else {
        byDeportista.set(d.id, { deportista: d, cuotas: [c] });
      }
    }

    const rows: DeudorRow[] = [];
    for (const [, { deportista: d, cuotas }] of byDeportista) {
      let montoTotalAdeudado = 0;
      const cuotasImpagasList = cuotas.map((c) => {
        const m = Number(c.monto);
        montoTotalAdeudado += m;
        return {
          nroCuota: c.nroCuota,
          anio: c.anio,
          monto: m,
          estado: c.estadoCuota as string,
          fechaVencimiento: c.fechaVencimiento.toISOString().slice(0, 10),
        };
      });
      const email = d.cuenta?.email ?? '';
      const grupoFamiliarNombre = (d as any).grupoFamiliar?.[0]?.grupo?.nombre ?? null;
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

export const dashboardService = new DashboardService();
