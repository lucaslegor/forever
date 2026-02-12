import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { env } from '../config/env';
import { LoginDTO, RegisterDTO } from '../types/requests';
import { AuthResponse } from '../types/responses';
import { JwtPayload } from '../types';
import {
  UnauthorizedError,
  ConflictError,
  ForbiddenError,
  ErrorMessages,
} from '../utils/errors';
import { Rol } from '@prisma/client';

export class AuthService {
  async login(data: LoginDTO): Promise<AuthResponse> {
    // Intentar login por email O por DNI (deportista/admin)
    let cuenta = await prisma.cuentaUsuario.findUnique({
      where: { email: data.email },
      include: {
        deportista: true,
        administrativo: true,
      },
    });

    // Si no se encuentra por email, buscar por DNI de deportista
    if (!cuenta) {
      const deportista = await prisma.deportista.findUnique({
        where: { dni: data.email }, // El frontend envía DNI en el campo 'email'
        include: {
          cuenta: {
            include: {
              deportista: true,
              administrativo: true,
            },
          },
        },
      });
      if (deportista) cuenta = deportista.cuenta;
    }

    // Si tampoco, buscar por DNI de administrativo
    if (!cuenta) {
      const admin = await prisma.administrativo.findUnique({
        where: { dni: data.email }, // El frontend envía documento en el campo 'email'
        include: {
          cuenta: {
            include: {
              deportista: true,
              administrativo: true,
            },
          },
        },
      });
      if (admin) cuenta = admin.cuenta;
    }

    if (!cuenta) {
      throw new UnauthorizedError(ErrorMessages.INVALID_CREDENTIALS);
    }

    // Verificar si está bloqueado
    if (cuenta.bloqueadoHasta && cuenta.bloqueadoHasta > new Date()) {
      throw new ForbiddenError(ErrorMessages.USER_BLOCKED);
    }

    // Verificar si está activo
    if (!cuenta.activo) {
      throw new ForbiddenError(ErrorMessages.USER_INACTIVE);
    }

    const validPassword = await bcrypt.compare(data.password, cuenta.password);

    if (!validPassword) {
      await this.handleFailedLogin(cuenta.id);
      throw new UnauthorizedError(ErrorMessages.INVALID_CREDENTIALS);
    }

    // Reset intentos fallidos
    await prisma.cuentaUsuario.update({
      where: { id: cuenta.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null },
    });

    const token = this.generateToken({
      id: cuenta.id,
      email: cuenta.email,
      rol: cuenta.rol,
    });

    const perfil = cuenta.deportista || cuenta.administrativo;

    return {
      token,
      user: {
        id: cuenta.id,
        email: cuenta.email,
        rol: cuenta.rol,
        activo: cuenta.activo,
        nombre: perfil?.nombre,
        apellido: perfil?.apellido,
        deportistaId: cuenta.deportista?.id,
      },
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Verificar email único
    const existingEmail = await prisma.cuentaUsuario.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictError(ErrorMessages.EMAIL_EXISTS);
    }

    // Verificar DNI único
    const existingDni = await prisma.administrativo.findUnique({
      where: { dni: data.dni },
    });

    if (existingDni) {
      throw new ConflictError(ErrorMessages.DNI_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const cuenta = await prisma.$transaction(async (tx) => {
      const nuevaCuenta = await tx.cuentaUsuario.create({
        data: {
          email: data.email,
          password: hashedPassword,
          rol: data.rol as Rol,
        },
      });

      if (data.rol === 'ADMIN' || data.rol === 'ADMINISTRATIVO') {
        await tx.administrativo.create({
          data: {
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            cuentaId: nuevaCuenta.id,
          },
        });
      }

      return nuevaCuenta;
    });

    const token = this.generateToken({
      id: cuenta.id,
      email: cuenta.email,
      rol: cuenta.rol,
    });

    return {
      token,
      user: {
        id: cuenta.id,
        email: cuenta.email,
        rol: cuenta.rol,
        activo: true,
        nombre: data.nombre,
        apellido: data.apellido,
      },
    };
  }

  private generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }

  private async handleFailedLogin(cuentaId: number): Promise<void> {
    const cuenta = await prisma.cuentaUsuario.findUnique({
      where: { id: cuentaId },
    });

    if (!cuenta) return;

    const intentosFallidos = cuenta.intentosFallidos + 1;
    const updateData: { intentosFallidos: number; bloqueadoHasta?: Date } = {
      intentosFallidos,
    };

    if (intentosFallidos >= env.MAX_LOGIN_ATTEMPTS) {
      updateData.bloqueadoHasta = new Date(
        Date.now() + env.LOGIN_BLOCK_TIME * 60 * 1000
      );
    }

    await prisma.cuentaUsuario.update({
      where: { id: cuentaId },
      data: updateData,
    });
  }
}

export const authService = new AuthService();
