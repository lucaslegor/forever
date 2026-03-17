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
  UserBlockedError,
  ErrorMessages,
} from '../utils/errors';
import { Prisma, Rol } from '@prisma/client';

type CuentaConPerfil = Prisma.CuentaUsuarioGetPayload<{
  include: {
    deportista: { include: { disciplina: true } };
    administrativo: true;
  };
}>;

export class AuthService {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const raw = (data.email || '').trim();
    const isEmail = raw.includes('@');
    const emailForLookup = isEmail ? raw.toLowerCase() : raw;
    const dniNorm = raw.replace(/\D/g, '');

    // Intentar login por email (solo si parece email) o por DNI (deportista/admin)
    let cuenta: CuentaConPerfil | null = null;

    if (isEmail) {
      cuenta = await prisma.cuentaUsuario.findUnique({
        where: { email: emailForLookup },
        include: {
          deportista: { include: { disciplina: true } },
          administrativo: true,
        },
      });
    }

    // Si no se encontró por email: con 7 u 8 dígitos buscar por DNI o por email de admin (patrón usado al crear: dni@admin.forever)
    if (!cuenta && dniNorm.length >= 7 && dniNorm.length <= 8) {
      const deportista = await prisma.deportista.findUnique({
        where: { dni: dniNorm },
        include: {
          cuenta: {
            include: {
              deportista: { include: { disciplina: true } },
              administrativo: true,
            },
          },
        },
      });
      if (deportista) cuenta = deportista.cuenta;
    }

    if (!cuenta && dniNorm.length >= 7 && dniNorm.length <= 8) {
      const admin = await prisma.administrativo.findUnique({
        where: { dni: dniNorm },
        include: {
          cuenta: {
            include: {
              deportista: { include: { disciplina: true } },
              administrativo: true,
            },
          },
        },
      });
      if (admin) cuenta = admin.cuenta;
    }

    // Respaldo: admins creados desde el panel tienen email {dni}@admin.forever
    if (!cuenta && dniNorm.length >= 7 && dniNorm.length <= 8) {
      const cuentaAdmin = await prisma.cuentaUsuario.findUnique({
        where: { email: `${dniNorm}@admin.forever`.toLowerCase() },
        include: {
          deportista: { include: { disciplina: true } },
          administrativo: true,
        },
      });
      if (cuentaAdmin?.administrativo) cuenta = cuentaAdmin;
    }

    if (!cuenta) {
      throw new UnauthorizedError(ErrorMessages.INVALID_CREDENTIALS);
    }

    // Verificar si está bloqueado (incluir hasta cuándo para mostrarlo al usuario)
    if (cuenta.bloqueadoHasta && cuenta.bloqueadoHasta > new Date()) {
      throw new UserBlockedError(ErrorMessages.USER_BLOCKED, cuenta.bloqueadoHasta);
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
        disciplinaNombre: cuenta.deportista?.disciplina?.nombre,
      },
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const emailNorm = data.email.trim().toLowerCase();
    const dniNorm = data.dni.replace(/\D/g, '');

    // Verificar email único
    const existingEmail = await prisma.cuentaUsuario.findUnique({
      where: { email: emailNorm },
    });

    if (existingEmail) {
      throw new ConflictError(ErrorMessages.EMAIL_EXISTS);
    }

    // Verificar DNI único (solo para admins)
    if (data.rol === 'ADMIN' || data.rol === 'ADMINISTRATIVO') {
      const existingDni = await prisma.administrativo.findUnique({
        where: { dni: dniNorm },
      });
      if (existingDni) {
        throw new ConflictError(ErrorMessages.DNI_EXISTS);
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const cuenta = await prisma.$transaction(async (tx) => {
      const nuevaCuenta = await tx.cuentaUsuario.create({
        data: {
          email: emailNorm,
          password: hashedPassword,
          rol: data.rol as Rol,
        },
      });

      if (data.rol === 'ADMIN' || data.rol === 'ADMINISTRATIVO') {
        await tx.administrativo.create({
          data: {
            nombre: data.nombre,
            apellido: data.apellido,
            dni: dniNorm,
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
      algorithm: 'HS256',
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
