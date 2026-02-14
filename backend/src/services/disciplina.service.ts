import prisma from '../config/prisma';
import { CreateDisciplinaDTO, UpdateDisciplinaDTO } from '../types/requests';
import { NotFoundError, ConflictError, ErrorMessages } from '../utils/errors';
import { cuotaService } from './cuota.service';

export class DisciplinaService {
  async create(data: CreateDisciplinaDTO) {
    const existing = await prisma.disciplina.findUnique({
      where: { nombre: data.nombre },
    });

    if (existing) {
      throw new ConflictError(ErrorMessages.DISCIPLINA_NAME_EXISTS);
    }

    const disciplina = await prisma.disciplina.create({
      data: {
        nombre: data.nombre,
        precioMensual: data.precioMensual,
        activa: true,
      },
    });

    // Verificación read-after-write: detecta problemas con pooler (ej. Supabase sin pgbouncer=true)
    const persisted = await prisma.disciplina.findUnique({
      where: { id: disciplina.id },
    });
    if (!persisted) {
      throw new Error(
        'La disciplina no se persistió en la base de datos. Si usás Supabase, agregá ?pgbouncer=true a DATABASE_URL o usá la conexión directa (puerto 5432).'
      );
    }

    return disciplina;
  }

  async getById(id: number) {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id },
      include: {
        _count: {
          select: { deportistas: true },
        },
      },
    });

    if (!disciplina) {
      throw new NotFoundError(ErrorMessages.DISCIPLINA_NOT_FOUND);
    }

    return disciplina;
  }

  async getAll(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { activa: true };

    const disciplinas = await prisma.disciplina.findMany({
      where,
      include: {
        _count: {
          select: { deportistas: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    return disciplinas;
  }

  async update(id: number, data: UpdateDisciplinaDTO) {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id },
    });

    if (!disciplina) {
      throw new NotFoundError(ErrorMessages.DISCIPLINA_NOT_FOUND);
    }

    if (data.nombre && data.nombre !== disciplina.nombre) {
      const existing = await prisma.disciplina.findUnique({
        where: { nombre: data.nombre },
      });

      if (existing) {
        throw new ConflictError(ErrorMessages.DISCIPLINA_NAME_EXISTS);
      }
    }

    const updated = await prisma.disciplina.update({
      where: { id },
      data: {
        nombre: data.nombre,
        precioMensual: data.precioMensual,
        activa: data.activa,
      },
    });

    // Si se actualizó el valor mensual, recalcular montos de cuotas pendientes/vencidas de esta disciplina
    if (data.precioMensual !== undefined) {
      await cuotaService.actualizarMontosPorCambioPrecioDisciplina(id, Number(updated.precioMensual));
    }

    return updated;
  }

  async getDeportistas(id: number, page: number = 1, limit: number = 10) {
    const disciplina = await prisma.disciplina.findUnique({
      where: { id },
    });

    if (!disciplina) {
      throw new NotFoundError(ErrorMessages.DISCIPLINA_NOT_FOUND);
    }

    const skip = (page - 1) * limit;

    const [deportistas, total] = await Promise.all([
      prisma.deportista.findMany({
        where: { disciplinaId: id },
        skip,
        take: limit,
        include: {
          cuenta: {
            select: { email: true },
          },
        },
        orderBy: { apellido: 'asc' },
      }),
      prisma.deportista.count({ where: { disciplinaId: id } }),
    ]);

    return {
      data: deportistas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const disciplinaService = new DisciplinaService();
