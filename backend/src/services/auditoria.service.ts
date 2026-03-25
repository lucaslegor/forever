import prisma from '../config/prisma';

export const ACCIONES = {
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
} as const;

export interface RegistrarAuditoriaInput {
  cuentaId: number | null;
  accion: string;
  entidad: string;
  entidadId?: number | null;
  detalles?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export class AuditoriaService {
  async registrar(data: RegistrarAuditoriaInput): Promise<void> {
    try {
      await prisma.auditoriaLog.create({
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
    } catch (_err) {
      // Fallo silencioso para no interrumpir el flujo; la auditoría es no crítica
    }
  }

  async listar(filters: {
    cuentaId?: number;
    entidad?: string;
    accion?: string;
    desde?: Date;
    hasta?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 50));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.cuentaId != null) where.cuentaId = filters.cuentaId;
    if (filters.entidad) where.entidad = filters.entidad;
    if (filters.accion) where.accion = filters.accion;
    if (filters.desde || filters.hasta) {
      where.createdAt = {};
      if (filters.desde) (where.createdAt as Record<string, Date>).gte = filters.desde;
      if (filters.hasta) (where.createdAt as Record<string, Date>).lte = filters.hasta;
    }

    const [logs, total] = await Promise.all([
      prisma.auditoriaLog.findMany({
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
      prisma.auditoriaLog.count({ where }),
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

export const auditoriaService = new AuditoriaService();
