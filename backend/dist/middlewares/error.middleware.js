"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../utils/errors");
const env_1 = require("../config/env");
const errorHandler = (err, _req, res, _next) => {
    // Errores de aplicación personalizados
    if (err instanceof errors_1.AppError) {
        if (err instanceof errors_1.ValidationError) {
            res.status(err.statusCode).json({
                success: false,
                error: err.message,
                errors: err.errors,
            });
            return;
        }
        if (err instanceof errors_1.UserBlockedError && err.bloqueadoHasta) {
            res.status(err.statusCode).json({
                success: false,
                error: err.message,
                bloqueadoHasta: err.bloqueadoHasta.toISOString(),
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
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
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
                const target = err.meta?.target || [];
                let message = 'El registro ya existe';
                if (target.includes('email')) {
                    message = errors_1.ErrorMessages.EMAIL_EXISTS;
                }
                else if (target.includes('dni')) {
                    message = errors_1.ErrorMessages.DNI_EXISTS;
                }
                else if (target.includes('nombre')) {
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
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        const detail = env_1.env.NODE_ENV === 'development' ? err.message : 'Error de validacion en los datos';
        res.status(400).json({
            success: false,
            error: detail,
        });
        return;
    }
    // Error genérico
    res.status(500).json({
        success: false,
        error: env_1.env.NODE_ENV === 'development' ? err.message : errors_1.ErrorMessages.SERVER_ERROR,
        ...(env_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, _next) => {
    res.status(404).json({
        success: false,
        error: `Ruta no encontrada: ${req.method} ${req.path}`,
    });
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map