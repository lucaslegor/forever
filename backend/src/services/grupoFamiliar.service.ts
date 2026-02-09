import prisma from '../config/prisma';
import { CreateGrupoFamiliarDTO, UpdateGrupoFamiliarDTO } from '../types/requests';
import { NotFoundError, ConflictError, ErrorMessages } from '../utils/errors';
export class GrupoFamiliarService {
  async create(data: CreateGrupoFamiliarDTO) {
    // Verificar que todos los deportistas existen
    const deportistaIds = data.integrantes.map((i) => i.deportistaId);
    const deportistas = await prisma.deportista.findMany({
      where: { id: { in: deportistaIds } },
    });

    if (deportistas.length !== deportistaIds.length) {
      throw new NotFoundError('Uno o mas deportistas no existen');
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
        cuotaHermano: data.cuotaHermano,
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
