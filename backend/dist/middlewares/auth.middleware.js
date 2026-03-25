"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSelfOrAdmin = exports.requireDeportista = exports.requirePrincipalAdmin = exports.requireAdministrativo = exports.requireAdmin = exports.authenticateToken = exports.PRINCIPAL_ADMIN_EMAIL = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../config/prisma"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
/** Email del admin principal (único que puede crear otros admins y gestionar administradores) */
exports.PRINCIPAL_ADMIN_EMAIL = env_1.env.PRINCIPAL_ADMIN_EMAIL;
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader && authHeader.split(' ')[1];
        const cookieToken = req.cookies?.[env_1.env.AUTH_COOKIE_NAME];
        const token = bearerToken || cookieToken;
        if (!token) {
            res.status(401).json({
                success: false,
                error: errors_1.ErrorMessages.TOKEN_NOT_PROVIDED,
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET, { algorithms: ['HS256'] });
        const cuenta = await prisma_1.default.cuentaUsuario.findUnique({
            where: { id: decoded.id },
        });
        if (!cuenta) {
            res.status(401).json({
                success: false,
                error: errors_1.ErrorMessages.USER_NOT_FOUND,
            });
            return;
        }
        if (!cuenta.activo) {
            res.status(403).json({
                success: false,
                error: errors_1.ErrorMessages.USER_INACTIVE,
            });
            return;
        }
        if (cuenta.bloqueadoHasta && cuenta.bloqueadoHasta > new Date()) {
            res.status(403).json({
                success: false,
                error: errors_1.ErrorMessages.USER_BLOCKED,
                bloqueadoHasta: cuenta.bloqueadoHasta.toISOString(),
            });
            return;
        }
        req.user = {
            id: cuenta.id,
            email: cuenta.email,
            rol: cuenta.rol,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: errors_1.ErrorMessages.TOKEN_EXPIRED,
            });
            return;
        }
        res.status(403).json({
            success: false,
            error: errors_1.ErrorMessages.TOKEN_INVALID,
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (req.user?.rol !== client_1.Rol.ADMIN) {
        res.status(403).json({
            success: false,
            error: errors_1.ErrorMessages.ADMIN_REQUIRED,
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireAdministrativo = (req, res, next) => {
    const rol = req.user?.rol;
    if (rol !== client_1.Rol.ADMIN && rol !== client_1.Rol.ADMINISTRATIVO) {
        res.status(403).json({
            success: false,
            error: errors_1.ErrorMessages.ADMINISTRATIVO_REQUIRED,
        });
        return;
    }
    next();
};
exports.requireAdministrativo = requireAdministrativo;
/** Solo el admin principal (admin@foreverclub.com) puede crear admins, listar usuarios y restablecer contraseñas de admins */
const requirePrincipalAdmin = (req, res, next) => {
    const email = req.user?.email?.toLowerCase();
    if (email !== exports.PRINCIPAL_ADMIN_EMAIL) {
        res.status(403).json({
            success: false,
            error: errors_1.ErrorMessages.PRINCIPAL_ADMIN_REQUIRED,
        });
        return;
    }
    next();
};
exports.requirePrincipalAdmin = requirePrincipalAdmin;
const requireDeportista = (req, res, next) => {
    if (req.user?.rol !== client_1.Rol.DEPORTISTA) {
        res.status(403).json({
            success: false,
            error: 'Acceso denegado. Se requiere rol de Deportista',
        });
        return;
    }
    next();
};
exports.requireDeportista = requireDeportista;
const requireSelfOrAdmin = (req, res, next) => {
    const requestedId = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const userRol = req.user?.rol;
    if (userRol === client_1.Rol.ADMIN || userId === requestedId) {
        next();
        return;
    }
    res.status(403).json({
        success: false,
        error: 'No tiene permisos para acceder a este recurso',
    });
};
exports.requireSelfOrAdmin = requireSelfOrAdmin;
//# sourceMappingURL=auth.middleware.js.map