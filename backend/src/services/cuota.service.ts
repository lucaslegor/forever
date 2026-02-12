import prisma from '../config/prisma';
import { AsignarCuotaDTO, UpdateCuotaDTO } from '../types/requests';
import { CuotasQuery, ListCuotasQuery } from '../validators/cuota.validator';
import {
  NotFoundError,
  ConflictError,
  ErrorMessages,
} from '../utils/errors';
import { Prisma, EstadoCuota, EstadoPago, Periodicidad } from '@prisma/client';

export class CuotaService {
  async asignar(data: AsignarCuotaDTO) {
    // Verificar que el deportista existe
    const deportista = await prisma.deportista.findUnique({
      where: { id: data.deportistaId },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    // Verificar que no exista cuota para el mismo período
    const existingCuota = await prisma.cuota.findFirst({
      where: {
        deportistaId: data.deportistaId,
        nroCuota: data.nroCuota,
        disciplinaId: data.disciplinaId,
      },
    });

    if (existingCuota) {
      throw new ConflictError(ErrorMessages.CUOTA_ALREADY_ASSIGNED);
    }

    const fechaEmision = new Date(data.fechaEmision);

    const cuota = await prisma.cuota.create({
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

  async getById(id: number) {
    const cuota = await prisma.cuota.findUnique({
      where: { id },
      include: {
        disciplina: true,
        deportista: true,
        pagos: true,
      },
    });

    if (!cuota) {
      throw new NotFoundError(ErrorMessages.CUOTA_NOT_FOUND);
    }

    return cuota;
  }

  async update(id: number, data: UpdateCuotaDTO) {
    const cuota = await prisma.cuota.findUnique({
      where: { id },
    });

    if (!cuota) {
      throw new NotFoundError(ErrorMessages.CUOTA_NOT_FOUND);
    }

    const updatedCuota = await prisma.cuota.update({
      where: { id },
      data: {
        monto: data.monto,
        fechaVencimiento: data.fechaVencimiento
          ? new Date(data.fechaVencimiento)
          : undefined,
        periodicidad: data.periodicidad as Periodicidad,
      },
      include: {
        disciplina: true,
        deportista: true,
      },
    });

    return updatedCuota;
  }

  async getPredefinidas(disciplinaId?: number) {
    const where: any = {};
    if (disciplinaId) {
      where.disciplinaId = disciplinaId;
    }

    const disciplinas = await prisma.disciplina.findMany({
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

  async getEstadoCuenta(deportistaId: number) {
    await this.actualizarVencidas();

    const [deportista, cuotas, integranteGrupo] = await Promise.all([
      prisma.deportista.findUnique({
        where: { id: deportistaId },
        select: { id: true, nombre: true, apellido: true, dni: true },
      }),
      prisma.cuota.findMany({
        where: { deportistaId },
        include: {
          disciplina: { select: { nombre: true } },
          pagos: {
            where: { estadoPago: 'APROBADO' },
          },
        },
        orderBy: { nroCuota: 'asc' },
      }),
      prisma.grupoFamiliarIntegrante.findFirst({
        where: { deportistaId, esPrincipal: false },
        include: { grupo: { select: { cuotaHermano: true, titularDni: true } } },
      }),
    ]);

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    const montoGrupoFamiliar =
      integranteGrupo?.grupo?.cuotaHermano != null
        ? Number(integranteGrupo.grupo.cuotaHermano)
        : null;

    const cuotasPagadas = cuotas
      .filter((c) => c.estadoCuota === EstadoCuota.PAGADA)
      .map((c) => ({
        id: c.id,
        nroCuota: c.nroCuota,
        monto: c.monto,
        fechaPago: c.pagos[0]?.fechaPago,
        medioPago: c.pagos[0]?.medioPago,
        disciplina: c.disciplina?.nombre ?? null,
      }));

    const pendientesRaw = cuotas.filter((c) => c.estadoCuota !== EstadoCuota.PAGADA);

    const cuotasAActualizar = pendientesRaw.filter(
      (c) => montoGrupoFamiliar != null && Number(c.monto) !== montoGrupoFamiliar
    );
    if (cuotasAActualizar.length > 0) {
      await prisma.$transaction(
        cuotasAActualizar.map((c) =>
          prisma.cuota.update({
            where: { id: c.id },
            data: { monto: new Prisma.Decimal(montoGrupoFamiliar!) },
          })
        )
      );
    }

    const cuotasPendientes = pendientesRaw.map((c) => {
      const monto = montoGrupoFamiliar != null && Number(c.monto) !== montoGrupoFamiliar
        ? montoGrupoFamiliar
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

    const totalAdeudado = cuotasPendientes.reduce(
      (sum, c) => sum + Number(c.monto),
      0
    );

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

  async getByDeportista(deportistaId: number, query: CuotasQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = { deportistaId };

    if (query.estado) {
      where.estadoCuota = query.estado as EstadoCuota;
    }

    const [cuotas, total] = await Promise.all([
      prisma.cuota.findMany({
        where,
        skip,
        take: limit,
        include: {
          disciplina: true,
          pagos: true,
        },
        orderBy: { nroCuota: 'desc' },
      }),
      prisma.cuota.count({ where }),
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
  async getAll(query: ListCuotasQuery) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 200);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.anio != null) where.anio = typeof query.anio === 'number' ? query.anio : parseInt(String(query.anio), 10);
    if (query.mes != null) where.nroCuota = typeof query.mes === 'number' ? query.mes : parseInt(String(query.mes), 10);
    if (query.estado) where.estadoCuota = query.estado as EstadoCuota;
    if (query.disciplinaId != null) where.disciplinaId = typeof query.disciplinaId === 'number' ? query.disciplinaId : parseInt(String(query.disciplinaId), 10);

    const [cuotas, total] = await Promise.all([
      prisma.cuota.findMany({
        where,
        skip,
        take: limit,
        include: {
          disciplina: { select: { nombre: true } },
          deportista: {
            include: {
              genero: { select: { nombre: true } },
              categoria: { select: { nombre: true } },
              subcategoria: { select: { nombre: true } },
              grupoFamiliar: { include: { grupo: true } },
            },
          },
          pagos: {
            where: { estadoPago: EstadoPago.APROBADO },
            take: 1,
            orderBy: { fechaPago: 'desc' },
          },
        },
        orderBy: [{ anio: 'desc' }, { nroCuota: 'desc' }],
      }),
      prisma.cuota.count({ where }),
    ]);

    const data = cuotas.map((c) => {
      const pago = c.pagos[0];
      const formaPago = !pago ? '' : (pago.medioPago?.toLowerCase().includes('efectivo') ? 'efectivo' : 'sistema');
      const integranteGrupo = (c.deportista as any).grupoFamiliar?.[0];
      const cuotaHermano = integranteGrupo?.grupo?.cuotaHermano != null ? Number(integranteGrupo.grupo.cuotaHermano) : null;
      const monto = cuotaHermano != null ? cuotaHermano : Number(c.monto);
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
        monto,
        formaPago,
        estadoCuota: c.estadoCuota,
        fechaPago: pago?.fechaPago,
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

  async delete(id: number) {
    const cuota = await prisma.cuota.findUnique({
      where: { id },
      include: { pagos: true },
    });
    if (!cuota) throw new NotFoundError(ErrorMessages.CUOTA_NOT_FOUND);
    if (cuota.pagos.some((p) => p.estadoPago === EstadoPago.APROBADO)) {
      throw new ConflictError('No se puede borrar una cuota que ya tiene un pago aprobado');
    }
    await prisma.pago.deleteMany({ where: { cuotaId: id } });
    await prisma.cuota.delete({ where: { id } });
    return { message: 'Cuota eliminada' };
  }

  /** Borrar todas las cuotas de una generación (mes + año + disciplina). Elimina pagos asociados y luego las cuotas. */
  async deletePorGeneracion(anio: number, mes: number, disciplinaId: number) {
    const cuotas = await prisma.cuota.findMany({
      where: { anio, nroCuota: mes, disciplinaId },
      select: { id: true },
    });
    const ids = cuotas.map((c) => c.id);
    if (ids.length === 0) {
      return { message: 'No hay cuotas para esta generación', eliminadas: 0 };
    }
    await prisma.pago.deleteMany({ where: { cuotaId: { in: ids } } });
    const result = await prisma.cuota.deleteMany({ where: { id: { in: ids } } });
    return { message: `Generación eliminada: ${result.count} cuota(s)`, eliminadas: result.count };
  }

  /** Borrar todas las cuotas de un mes/año (toda la generación del mes). */
  async deletePorMes(anio: number, mes: number) {
    const anioNum = typeof anio === 'number' ? anio : parseInt(String(anio), 10);
    const mesNum = typeof mes === 'number' ? mes : parseInt(String(mes), 10);
    const cuotas = await prisma.cuota.findMany({
      where: { anio: anioNum, nroCuota: mesNum },
      select: { id: true },
    });
    const ids = cuotas.map((c) => c.id);
    if (ids.length === 0) {
      return { message: 'No hay cuotas para este mes', eliminadas: 0 };
    }
    await prisma.pago.deleteMany({ where: { cuotaId: { in: ids } } });
    const result = await prisma.cuota.deleteMany({ where: { id: { in: ids } } });
    return { message: `Generación del mes eliminada: ${result.count} cuota(s)`, eliminadas: result.count };
  }

  /** Marcar cuota como pagada en efectivo (admin). Si es el titular del grupo familiar, marca como pagadas las cuotas del mismo período de todos los miembros. */
  async marcarPagadaEfectivo(id: number) {
    const cuota = await prisma.cuota.findUnique({
      where: { id },
      include: { pagos: { where: { estadoPago: EstadoPago.APROBADO } } },
    });
    if (!cuota) throw new NotFoundError(ErrorMessages.CUOTA_NOT_FOUND);
    if (cuota.estadoCuota === EstadoCuota.PAGADA) {
      throw new ConflictError(ErrorMessages.CUOTA_ALREADY_PAID);
    }

    const fechaPago = new Date();
    const steps: Prisma.PrismaPromise<unknown>[] = [
      prisma.pago.create({
        data: {
          cuotaId: id,
          deportistaId: cuota.deportistaId,
          monto: cuota.monto,
          fechaPago,
          medioPago: 'efectivo',
          estadoPago: EstadoPago.APROBADO,
        },
      }),
      prisma.cuota.update({
        where: { id },
        data: { estadoCuota: EstadoCuota.PAGADA },
      }),
    ];

    // Si pertenece a un grupo familiar, marcar como pagadas las cuotas del mismo período de todos los demás miembros (titular o no)
    const integrante = await prisma.grupoFamiliarIntegrante.findFirst({
      where: { deportistaId: cuota.deportistaId },
      select: { grupoId: true },
    });

    if (integrante) {
      const otrosIntegrantes = await prisma.grupoFamiliarIntegrante.findMany({
        where: {
          grupoId: integrante.grupoId,
          deportistaId: { not: cuota.deportistaId },
        },
        select: { deportistaId: true },
      });
      const otrosIds = otrosIntegrantes.map((o) => o.deportistaId);
      const cuotasGrupo = await prisma.cuota.findMany({
        where: {
          deportistaId: { in: otrosIds },
          anio: cuota.anio,
          nroCuota: cuota.nroCuota,
          disciplinaId: cuota.disciplinaId,
          estadoCuota: { in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA] },
        },
      });
      for (const c of cuotasGrupo) {
        steps.push(
          prisma.pago.create({
            data: {
              cuotaId: c.id,
              deportistaId: c.deportistaId,
              monto: c.monto,
              fechaPago,
              medioPago: 'efectivo',
              estadoPago: EstadoPago.APROBADO,
            },
          })
        );
        steps.push(
          prisma.cuota.update({
            where: { id: c.id },
            data: { estadoCuota: EstadoCuota.PAGADA },
          })
        );
      }
    }

    await prisma.$transaction(steps);
    return this.getById(id);
  }

  async actualizarVencidas() {
    const now = new Date();

    const result = await prisma.cuota.updateMany({
      where: {
        estadoCuota: EstadoCuota.PENDIENTE,
        fechaVencimiento: { lt: now },
      },
      data: {
        estadoCuota: EstadoCuota.VENCIDA,
      },
    });

    return { actualizadas: result.count };
  }

  async generarCuotasMensuales(mes: number, anio: number) {
    const now = new Date();
    const mesActual = now.getMonth() + 1;
    const anioActual = now.getFullYear();
    if (anio > anioActual || (anio === anioActual && mes > mesActual)) {
      throw new ConflictError(
        'Solo se pueden generar cuotas a partir del primer día del mes correspondiente. Las cuotas tienen un plazo de 30 días; no es posible generar cuotas de meses futuros.'
      );
    }

    // Generar por disciplinas: todos los deportistas activos (cuenta activa). Si se agrega un
    // deportista a mitad de mes, al volver a ejecutar esta generación para ese mes se crea su cuota.
    const deportistas = await prisma.deportista.findMany({
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
      detalles: [] as Array<{
        deportistaId: number;
        nombre: string;
        monto: number;
        usaCuotaHermano: boolean;
      }>,
    };

    const fechaEmision = new Date(anio, mes - 1, 1);
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    for (const deportista of deportistas) {
      const cuotaExistente = await prisma.cuota.findFirst({
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
      const integranteGrupo = await prisma.grupoFamiliarIntegrante.findFirst({
        where: { deportistaId: deportista.id },
        include: { grupo: true },
      });

      const precioDisciplina = Number(deportista.disciplina.precioMensual);
      const cuotaHermano = integranteGrupo?.grupo?.cuotaHermano != null
        ? Number(integranteGrupo.grupo.cuotaHermano)
        : null;
      const monto = (integranteGrupo && cuotaHermano != null)
        ? cuotaHermano
        : precioDisciplina;

      await prisma.cuota.create({
        data: {
          nroCuota: mes,
          anio: anio,
          monto: monto,
          fechaEmision: fechaEmision,
          fechaVencimiento: fechaVencimiento,
          disciplinaId: deportista.disciplinaId,
          deportistaId: deportista.id,
          periodicidad: Periodicidad.MENSUAL,
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
  async asignarCuotaDelMesActual(deportistaId: number) {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const anio = now.getFullYear();

    const hayCuotasDelMes = await prisma.cuota.findFirst({
      where: { anio, nroCuota: mes },
      select: { id: true },
    });
    if (!hayCuotasDelMes) return null;

    const deportista = await prisma.deportista.findUnique({
      where: { id: deportistaId },
      include: { disciplina: true },
    });
    if (!deportista) return null;

    const cuotaExistente = await prisma.cuota.findFirst({
      where: {
        deportistaId,
        disciplinaId: deportista.disciplinaId,
        nroCuota: mes,
        anio,
      },
    });
    if (cuotaExistente) return cuotaExistente;

    const integranteGrupo = await prisma.grupoFamiliarIntegrante.findFirst({
      where: { deportistaId },
      include: { grupo: true },
    });
    const precioDisciplina = Number(deportista.disciplina.precioMensual);
    const cuotaHermano = integranteGrupo?.grupo?.cuotaHermano != null
      ? Number(integranteGrupo.grupo.cuotaHermano)
      : null;
    const monto = (integranteGrupo && cuotaHermano != null) ? cuotaHermano : precioDisciplina;

    const fechaEmision = new Date(anio, mes - 1, 1);
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    return prisma.cuota.create({
      data: {
        nroCuota: mes,
        anio,
        monto,
        fechaEmision,
        fechaVencimiento,
        disciplinaId: deportista.disciplinaId,
        deportistaId,
        periodicidad: Periodicidad.MENSUAL,
      },
    });
  }
}

export const cuotaService = new CuotaService();
