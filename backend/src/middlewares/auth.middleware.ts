import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { env } from '../config/env';
import prisma from '../config/prisma';
import { ErrorMessages } from '../utils/errors';
import { Rol } from '@prisma/client';

/** Email del admin principal (único que puede crear otros admins y gestionar administradores) */
export const PRINCIPAL_ADMIN_EMAIL = env.PRINCIPAL_ADMIN_EMAIL;

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader && authHeader.split(' ')[1];
    const cookieToken = req.cookies?.[env.AUTH_COOKIE_NAME];
    const token = bearerToken || cookieToken;

    if (!token) {
      res.status(401).json({
        success: false,
        error: ErrorMessages.TOKEN_NOT_PROVIDED,
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const cuenta = await prisma.cuentaUsuario.findUnique({
      where: { id: decoded.id },
    });

    if (!cuenta) {
      res.status(401).json({
        success: false,
        error: ErrorMessages.USER_NOT_FOUND,
      });
      return;
    }

    if (!cuenta.activo) {
      res.status(403).json({
        success: false,
        error: ErrorMessages.USER_INACTIVE,
      });
      return;
    }

    if (cuenta.bloqueadoHasta && cuenta.bloqueadoHasta > new Date()) {
      res.status(403).json({
        success: false,
        error: ErrorMessages.USER_BLOCKED,
      });
      return;
    }

    req.user = {
      id: cuenta.id,
      email: cuenta.email,
      rol: cuenta.rol,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: ErrorMessages.TOKEN_EXPIRED,
      });
      return;
    }
    res.status(403).json({
      success: false,
      error: ErrorMessages.TOKEN_INVALID,
    });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.rol !== Rol.ADMIN) {
    res.status(403).json({
      success: false,
      error: ErrorMessages.ADMIN_REQUIRED,
    });
    return;
  }
  next();
};

export const requireAdministrativo = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const rol = req.user?.rol;
  if (rol !== Rol.ADMIN && rol !== Rol.ADMINISTRATIVO) {
    res.status(403).json({
      success: false,
      error: ErrorMessages.ADMINISTRATIVO_REQUIRED,
    });
    return;
  }
  next();
};

/** Solo el admin principal (admin@foreverclub.com) puede crear admins, listar usuarios y restablecer contraseñas de admins */
export const requirePrincipalAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const email = req.user?.email?.toLowerCase();
  if (email !== PRINCIPAL_ADMIN_EMAIL) {
    res.status(403).json({
      success: false,
      error: ErrorMessages.PRINCIPAL_ADMIN_REQUIRED,
    });
    return;
  }
  next();
};

export const requireDeportista = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.rol !== Rol.DEPORTISTA) {
    res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de Deportista',
    });
    return;
  }
  next();
};

export const requireSelfOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const requestedId = parseInt(req.params.id as string, 10);
  const userId = req.user?.id;
  const userRol = req.user?.rol;

  if (userRol === Rol.ADMIN || userId === requestedId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: 'No tiene permisos para acceder a este recurso',
  });
};
