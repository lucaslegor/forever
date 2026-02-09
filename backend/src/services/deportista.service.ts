import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { CreateDeportistaDTO, UpdateDeportistaDTO } from '../types/requests';
import { DeportistasQuery } from '../validators/deportista.validator';
import {
  NotFoundError,
  ConflictError,
  ErrorMessages,
} from '../utils/errors';
import { Rol, EstadoDeportista, EstadoCuota } from '@prisma/client';

export class DeportistaService {
  async create(data: CreateDeportistaDTO) {
    // Verificar email único
    const existingEmail = await prisma.cuentaUsuario.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictError(ErrorMessages.EMAIL_EXISTS);
    }

    // Verificar DNI único
    const existingDni = await prisma.deportista.findUnique({
      where: { dni: data.dni },
    });

    if (existingDni) {
      throw new ConflictError(ErrorMessages.DEPORTISTA_DNI_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const deportista = await prisma.$transaction(async (tx) => {
      // Crear cuenta
      const cuenta = await tx.cuentaUsuario.create({
        data: {
          email: data.email,
          password: hashedPassword,
          rol: Rol.DEPORTISTA,
        },
      });

      const fechaNacDate = new Date(data.fechaNac);
      if (Number.isNaN(fechaNacDate.getTime())) {
        throw new Error(`Fecha de nacimiento invalida: ${data.fechaNac}`);
      }

      const createData: Parameters<typeof tx.deportista.create>[0]['data'] = {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        fechaNac: fechaNacDate,
        genero: { connect: { id: Number(data.generoId) } },
        categoria: { connect: { id: Number(data.categoriaId) } },
        disciplina: { connect: { id: Number(data.disciplinaId) } },
        cuenta: { connect: { id: cuenta.id } },
      };
      if (data.subcategoriaId != null && Number(data.subcategoriaId) > 0) {
        createData.subcategoria = { connect: { id: Number(data.subcategoriaId) } };
      }
      if (data.obraSocial != null && data.obraSocial !== '') createData.obraSocial = data.obraSocial;
      if (data.telefonos != null && data.telefonos !== '') createData.telefonos = data.telefonos;
      if (data.enfermedades != null && data.enfermedades !== '') createData.enfermedades = data.enfermedades;

      const nuevoDeportista = await tx.deportista.create({ data: createData });

      // Si es menor (Juveniles/Infantiles), crear adulto responsable
      if (data.adultoResponsable) {
        await tx.adultoResponsable.create({
          data: {
            deportistaId: nuevoDeportista.id,
            nombre: data.adultoResponsable.nombre,
            apellido: data.adultoResponsable.apellido,
            dni: data.adultoResponsable.dni,
            email: data.adultoResponsable.email,
            telefono: data.adultoResponsable.telefono,
          },
        });
      }

      return nuevoDeportista;
    });

    return this.getById(deportista.id);
  }

  async getById(id: number) {
    const deportista = await prisma.deportista.findUnique({
      where: { id },
      include: {
        disciplina: true,
        genero: true,
        categoria: true,
        subcategoria: true,
        adultoResponsable: true,
        cuenta: {
          select: {
            id: true,
            email: true,
            rol: true,
            activo: true,
            createdAt: true,
          },
        },
      },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    return deportista;
  }

  async getAll(query: DeportistasQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(10000, Math.max(1, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.estado) {
      where.estado = query.estado as EstadoDeportista;
    }

    if (query.disciplinaId) {
      where.disciplinaId = query.disciplinaId;
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { apellido: { contains: query.search, mode: 'insensitive' } },
        { dni: { contains: query.search } },
      ];
    }

    const [deportistas, total] = await Promise.all([
      prisma.deportista.findMany({
        where,
        skip,
        take: limit,
        include: {
          disciplina: true,
          genero: true,
          categoria: true,
          subcategoria: true,
          adultoResponsable: true,
          cuenta: {
            select: { email: true, activo: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deportista.count({ where }),
    ]);

    return {
      data: deportistas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: number, data: UpdateDeportistaDTO) {
    const deportista = await prisma.deportista.findUnique({
      where: { id },
      include: { adultoResponsable: true },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      // Actualizar deportista
      await tx.deportista.update({
        where: { id },
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          fechaNac: data.fechaNac ? new Date(data.fechaNac) : undefined,
          generoId: data.generoId,
          categoriaId: data.categoriaId,
          subcategoriaId: data.subcategoriaId,
          obraSocial: data.obraSocial,
          disciplinaId: data.disciplinaId,
          telefonos: data.telefonos,
          enfermedades: data.enfermedades,
        },
      });

      // Actualizar o crear adulto responsable si se proporciona
      if (data.adultoResponsable) {
        if (deportista.adultoResponsable) {
          await tx.adultoResponsable.update({
            where: { deportistaId: id },
            data: data.adultoResponsable,
          });
        } else {
          await tx.adultoResponsable.create({
            data: {
              deportistaId: id,
              nombre: data.adultoResponsable.nombre!,
              apellido: data.adultoResponsable.apellido!,
              dni: data.adultoResponsable.dni!,
              email: data.adultoResponsable.email!,
              telefono: data.adultoResponsable.telefono!,
            },
          });
        }
      }
    });

    return this.getById(id);
  }

  async delete(id: number) {
    const deportista = await prisma.deportista.findUnique({
      where: { id },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    await prisma.deportista.delete({
      where: { id },
    });

    return { message: 'Deportista eliminado correctamente' };
  }

  async getConPagosPendientes() {
    const deportistas = await prisma.deportista.findMany({
      where: {
        cuotas: {
          some: {
            estadoCuota: {
              in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA],
            },
          },
        },
      },
      include: {
        cuotas: {
          where: {
            estadoCuota: {
              in: [EstadoCuota.PENDIENTE, EstadoCuota.VENCIDA],
            },
          },
          orderBy: { fechaVencimiento: 'asc' },
        },
      },
    });

    return deportistas.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      apellido: d.apellido,
      dni: d.dni,
      cantidadCuotasPendientes: d.cuotas.length,
      montoTotalAdeudado: d.cuotas.reduce(
        (sum, c) => sum + Number(c.monto),
        0
      ),
      vencimientoProximo: d.cuotas[0]?.fechaVencimiento || null,
    }));
  }

  async getHistorial(deportistaId: number) {
    const deportista = await prisma.deportista.findUnique({
      where: { id: deportistaId },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    const pagos = await prisma.pago.findMany({
      where: { deportistaId },
      include: {
        cuota: {
          include: { disciplina: true },
        },
      },
      orderBy: { fechaPago: 'desc' },
    });

    return {
      pagos: pagos.map((p) => ({
        id: p.id,
        fecha: p.fechaPago,
        monto: p.monto,
        medioPago: p.medioPago,
        estado: p.estadoPago,
        cuota: {
          nroCuota: p.cuota.nroCuota,
          anio: p.cuota.anio,
          disciplina: p.cuota.disciplina.nombre,
        },
      })),
    };
  }

  async getByUserId(userId: number) {
    const deportista = await prisma.deportista.findUnique({
      where: { cuentaId: userId },
      include: {
        disciplina: true,
        genero: true,
        categoria: true,
        subcategoria: true,
        adultoResponsable: true,
      },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    return deportista;
  }

  async resetPassword(id: number, newPassword: string) {
    const deportista = await prisma.deportista.findUnique({
      where: { id },
      include: { cuenta: true },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.cuentaUsuario.update({
      where: { id: deportista.cuentaId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña restablecida correctamente' };
  }

  async resetPasswordByDni(dni: string, newPassword: string) {
    const deportista = await prisma.deportista.findUnique({
      where: { dni },
    });

    if (!deportista) {
      throw new NotFoundError(ErrorMessages.DEPORTISTA_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.cuentaUsuario.update({
      where: { id: deportista.cuentaId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña restablecida correctamente' };
  }
}

export const deportistaService = new DeportistaService();
