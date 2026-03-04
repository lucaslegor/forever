import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError, ValidationError, ErrorMessages } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Errores de aplicación personalizados
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      res.status(err.statusCode).json({
        success: false,
        error: err.message,
        errors: err.errors,
      });
      return;
    }
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P1001':
      case 'P1002':
      case 'P1008':
        // P1001: Can't reach DB | P1002: Timeout | P1008: Timeout
        res.status(503).json({
          success: false,
          error: 'El servicio no está disponible. Revisá tu conexión o intentá más tarde.',
        });
        return;
      case 'P2002': {
        const target = (err.meta?.target as string[]) || [];
        let message = 'El registro ya existe';
        if (target.includes('email')) {
          message = ErrorMessages.EMAIL_EXISTS;
        } else if (target.includes('dni')) {
          message = ErrorMessages.DNI_EXISTS;
        } else if (target.includes('nombre')) {
          message = 'Ya existe un registro con ese nombre';
        }
        res.status(409).json({
          success: false,
          error: message,
        });
        return;
      }
      case 'P2025':
        res.status(404).json({
          success: false,
          error: 'Registro no encontrado',
        });
        return;
      case 'P2003':
        res.status(400).json({
          success: false,
          error: 'Referencia invalida a otro registro',
        });
        return;
      default:
        res.status(400).json({
          success: false,
          error: 'Error en la base de datos',
        });
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    const detail = env.NODE_ENV === 'development' ? err.message : 'Error de validacion en los datos';
    res.status(400).json({
      success: false,
      error: detail,
    });
    return;
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'development' ? err.message : ErrorMessages.SERVER_ERROR,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
};
