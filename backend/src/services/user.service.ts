import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { UpdateProfileDTO, AssignRoleDTO } from '../types/requests';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ErrorMessages,
} from '../utils/errors';
import { Rol } from '@prisma/client';

export class UserService {
  async getProfile(userId: number) {
    const cuenta = await prisma.cuentaUsuario.findUnique({
      where: { id: userId },
      include: {
        deportista: {
          include: {
            disciplina: true,
          },
        },
        administrativo: true,
      },
    });

    if (!cuenta) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    const { password, ...cuentaSinPassword } = cuenta;
    return cuentaSinPassword;
  }

  async updateProfile(userId: number, data: UpdateProfileDTO) {
    const cuenta = await prisma.cuentaUsuario.findUnique({
      where: { id: userId },
    });

    if (!cuenta) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    // Verificar email único si se está actualizando
    if (data.email && data.email !== cuenta.email) {
      const existingEmail = await prisma.cuentaUsuario.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        throw new ConflictError(ErrorMessages.EMAIL_EXISTS);
      }
    }

    const updateData: { email?: string; password?: string } = {};

    if (data.email) {
      updateData.email = data.email;
    }

    if (data.password) {
      if (!data.currentPassword) {
        throw new BadRequestError('La contraseña actual es requerida para cambiar la contraseña');
      }
      const passwordValid = await bcrypt.compare(data.currentPassword, cuenta.password);
      if (!passwordValid) {
        throw new BadRequestError('La contraseña actual es incorrecta');
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedCuenta = await prisma.cuentaUsuario.update({
      where: { id: userId },
      data: updateData,
      include: {
        deportista: true,
        administrativo: true,
      },
    });

    const { password, ...cuentaSinPassword } = updatedCuenta;
    return cuentaSinPassword;
  }

  async assignRole(_userId: number, targetUserId: number, data: AssignRoleDTO) {
    const targetCuenta = await prisma.cuentaUsuario.findUnique({
      where: { id: targetUserId },
    });

    if (!targetCuenta) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    // Validar regla de al menos 1 Admin
    if (targetCuenta.rol === Rol.ADMIN && data.rol !== 'ADMIN') {
      const adminCount = await prisma.cuentaUsuario.count({
        where: { rol: Rol.ADMIN, activo: true },
      });

      if (adminCount <= 1) {
        throw new BadRequestError(ErrorMessages.LAST_ADMIN);
      }
    }

    const updatedCuenta = await prisma.cuentaUsuario.update({
      where: { id: targetUserId },
      data: { rol: data.rol as Rol },
    });

    const { password, ...cuentaSinPassword } = updatedCuenta;
    return cuentaSinPassword;
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.cuentaUsuario.findMany({
        skip,
        take: limit,
        include: {
          deportista: true,
          administrativo: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cuentaUsuario.count(),
    ]);

    return {
      data: users.map(({ password, ...user }) => user),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async resetAdminPassword(adminId: number, newPassword: string) {
    const admin = await prisma.administrativo.findUnique({
      where: { id: adminId },
      include: { cuenta: true },
    });

    if (!admin) {
      throw new NotFoundError('Administrativo no encontrado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.cuentaUsuario.update({
      where: { id: admin.cuentaId },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña restablecida correctamente' };
  }

  async setAdminActivo(principalUserId: number, adminId: number, activo: boolean) {
    const admin = await prisma.administrativo.findUnique({
      where: { id: adminId },
      include: { cuenta: true },
    });

    if (!admin) {
      throw new NotFoundError('Administrativo no encontrado');
    }

    if (admin.cuentaId === principalUserId) {
      throw new BadRequestError('No podés desactivar tu propia cuenta');
    }

    await prisma.cuentaUsuario.update({
      where: { id: admin.cuentaId },
      data: { activo },
    });

    return { activo };
  }
}

export const userService = new UserService();
