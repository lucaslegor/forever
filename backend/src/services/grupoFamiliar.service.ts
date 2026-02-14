import prisma from '../config/prisma';
import { CreateGrupoFamiliarDTO, UpdateGrupoFamiliarDTO } from '../types/requests';
import { NotFoundError, ConflictError, ErrorMessages } from '../utils/errors';
import { becaService } from './beca.service';

export class GrupoFamiliarService {
  async create(data: CreateGrupoFamiliarDTO) {
    // Verificar que todos los deportistas existen y traer disciplina para calcular cuota familiar
    const deportistaIds = data.integrantes.map((i) => i.deportistaId);
    const deportistas = await prisma.deportista.findMany({
      where: { id: { in: deportistaIds } },
      include: { disciplina: { select: { precioMensual: true } } },
    });

    if (deportistas.length !== deportistaIds.length) {
      throw new NotFoundError('Uno o mas deportistas no existen');
    }

    // Cuota familiar = valor cuota (precio disciplina) × 1.6; el dirigente puede actualizarla después
    const principal = data.integrantes.find((i) => i.esPrincipal) || data.integrantes[0];
    const deportistaPrincipal = deportistas.find((d) => d.id === principal.deportistaId);
    const precioMensual = deportistaPrincipal?.disciplina?.precioMensual
      ? Number(deportistaPrincipal.disciplina.precioMensual)
      : 0;
    const cuotaFamiliarAuto = Math.round(precioMensual * 1.6 * 100) / 100;

    // Verificar que ningún deportista esté ya en otro grupo familiar
    const integrantesEnOtroGrupo = await prisma.grupoFamiliarIntegrante.findMany({
      where: { deportistaId: { in: deportistaIds } },
      include: { grupo: { select: { id: true } } },
    });
    if (integrantesEnOtroGrupo.length > 0) {
      throw new ConflictError(ErrorMessages.GRUPO_FAMILIAR_DEPORTISTA_EN_OTRO);
    }

    // Verificar que no exista un grupo con la misma composición
    const existingGroups = await prisma.grupoFamiliar.findMany({
      include: {
        integrantes: true,
      },
    });

    for (const group of existingGroups) {
      const existingIds = group.integrantes.map((i) => i.deportistaId).sort();
      const newIds = deportistaIds.sort();
      if (
        existingIds.length === newIds.length &&
        existingIds.every((id, index) => id === newIds[index])
      ) {
        throw new ConflictError(ErrorMessages.GRUPO_FAMILIAR_DUPLICATE);
      }
    }

    const grupo = await prisma.grupoFamiliar.create({
      data: {
        nombre: data.nombre,
        titularDni: data.titularDni,
        cuotaHermano: data.cuotaHermano ?? (cuotaFamiliarAuto > 0 ? cuotaFamiliarAuto : undefined),
        integrantes: {
          create: data.integrantes.map((i) => ({
            deportistaId: i.deportistaId,
            esPrincipal: i.esPrincipal || false,
          })),
        },
      },
      include: {
        integrantes: {
          include: {
            deportista: true,
          },
        },
      },
    });

    // Quitar beca individual a quienes se agregan al grupo (no pueden tener ambos beneficios)
    for (const i of data.integrantes) {
      try {
        await becaService.quitarBecaSiBecado(i.deportistaId);
      } catch {
        // Ignorar si no estaba becado o otro error
      }
    }

    return grupo;
  }

  async getByDeportistaId(deportistaId: number) {
    const integrantes = await prisma.grupoFamiliarIntegrante.findMany({
      where: { deportistaId },
      include: {
        grupo: {
          include: {
            integrantes: {
              include: {
                deportista: {
                  include: {
                    disciplina: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const grupos = integrantes.map((i) => i.grupo);
    return grupos;
  }

  async getById(id: number) {
    const grupo = await prisma.grupoFamiliar.findUnique({
      where: { id },
      include: {
        integrantes: {
          include: {
            deportista: {
              include: {
                disciplina: true,
              },
            },
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundError(ErrorMessages.GRUPO_FAMILIAR_NOT_FOUND);
    }

    return grupo;
  }

  async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [grupos, total] = await Promise.all([
      prisma.grupoFamiliar.findMany({
        skip,
        take: limit,
        include: {
          integrantes: {
            include: {
              deportista: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.grupoFamiliar.count(),
    ]);

    return {
      data: grupos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, data: UpdateGrupoFamiliarDTO) {
    const grupo = await prisma.grupoFamiliar.findUnique({
      where: { id },
    });

    if (!grupo) {
      throw new NotFoundError(ErrorMessages.GRUPO_FAMILIAR_NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      // Actualizar grupo familiar
      await tx.grupoFamiliar.update({
        where: { id },
        data: {
          nombre: data.nombre,
          titularDni: data.titularDni,
          cuotaHermano: data.cuotaHermano,
        },
      });

      if (data.integrantes) {
        const newDeportistaIds = data.integrantes.map((i) => i.deportistaId);
        // Deportistas que ya están en OTRO grupo (excluir el actual)
        const enOtroGrupo = await tx.grupoFamiliarIntegrante.findMany({
          where: {
            deportistaId: { in: newDeportistaIds },
            grupoId: { not: id },
          },
        });
        if (enOtroGrupo.length > 0) {
          throw new ConflictError(ErrorMessages.GRUPO_FAMILIAR_DEPORTISTA_EN_OTRO);
        }

        // Eliminar integrantes actuales
        await tx.grupoFamiliarIntegrante.deleteMany({
          where: { grupoId: id },
        });

        // Crear nuevos integrantes
        for (const integrante of data.integrantes) {
          await tx.grupoFamiliarIntegrante.create({
            data: {
              grupoId: id,
              deportistaId: integrante.deportistaId,
              esPrincipal: integrante.esPrincipal || false,
            },
          });
        }
      }
    });

    // Quitar beca individual a quienes quedan en el grupo (no pueden tener ambos beneficios)
    if (data.integrantes) {
      for (const i of data.integrantes) {
        try {
          await becaService.quitarBecaSiBecado(i.deportistaId);
        } catch {
          // Ignorar
        }
      }
    }

    return this.getById(id);
  }

  async delete(id: number) {
    const grupo = await prisma.grupoFamiliar.findUnique({
      where: { id },
    });

    if (!grupo) {
      throw new NotFoundError(ErrorMessages.GRUPO_FAMILIAR_NOT_FOUND);
    }

    await prisma.grupoFamiliar.delete({
      where: { id },
    });

    return { message: 'Grupo familiar eliminado correctamente' };
  }
}

export const grupoFamiliarService = new GrupoFamiliarService();
