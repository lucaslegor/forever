"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
class AuthService {
    async login(data) {
        const raw = (data.email || '').trim();
        const isEmail = raw.includes('@');
        const emailForLookup = isEmail ? raw.toLowerCase() : raw;
        const dniNorm = raw.replace(/\D/g, '');
        // Intentar login por email (solo si parece email) o por DNI (deportista/admin)
        let cuenta = null;
        if (isEmail) {
            cuenta = await prisma_1.default.cuentaUsuario.findUnique({
                where: { email: emailForLookup },
                include: {
                    deportista: { include: { disciplina: true } },
                    administrativo: true,
                },
            });
        }
        // Si no se encontró por email: con 7 u 8 dígitos buscar por DNI o por email de admin (patrón usado al crear: dni@admin.forever)
        if (!cuenta && dniNorm.length >= 7 && dniNorm.length <= 8) {
            const deportista = await prisma_1.default.deportista.findUnique({
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
            if (deportista)
                cuenta = deportista.cuenta;
        }
        if (!cuenta && dniNorm.length >= 7 && dniNorm.length <= 8) {
            const admin = await prisma_1.default.administrativo.findUnique({
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
            if (admin)
                cuenta = admin.cuenta;
        }
        // Respaldo: admins creados desde el panel tienen email {dni}@admin.forever
        if (!cuenta && dniNorm.length >= 7 && dniNorm.length <= 8) {
            const cuentaAdmin = await prisma_1.default.cuentaUsuario.findUnique({
                where: { email: `${dniNorm}@admin.forever`.toLowerCase() },
                include: {
                    deportista: { include: { disciplina: true } },
                    administrativo: true,
                },
            });
            if (cuentaAdmin?.administrativo)
                cuenta = cuentaAdmin;
        }
        if (!cuenta) {
            throw new errors_1.UnauthorizedError(errors_1.ErrorMessages.INVALID_CREDENTIALS);
        }
        // Verificar si está bloqueado (incluir hasta cuándo para mostrarlo al usuario)
        if (cuenta.bloqueadoHasta && cuenta.bloqueadoHasta > new Date()) {
            throw new errors_1.UserBlockedError(errors_1.ErrorMessages.USER_BLOCKED, cuenta.bloqueadoHasta);
        }
        // Verificar si está activo
        if (!cuenta.activo) {
            throw new errors_1.ForbiddenError(errors_1.ErrorMessages.USER_INACTIVE);
        }
        const validPassword = await bcryptjs_1.default.compare(data.password, cuenta.password);
        if (!validPassword) {
            await this.handleFailedLogin(cuenta.id);
            throw new errors_1.UnauthorizedError(errors_1.ErrorMessages.INVALID_CREDENTIALS);
        }
        // Reset intentos fallidos
        await prisma_1.default.cuentaUsuario.update({
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
    async register(data) {
        const emailNorm = data.email.trim().toLowerCase();
        const dniNorm = data.dni.replace(/\D/g, '');
        // Verificar email único
        const existingEmail = await prisma_1.default.cuentaUsuario.findUnique({
            where: { email: emailNorm },
        });
        if (existingEmail) {
            throw new errors_1.ConflictError(errors_1.ErrorMessages.EMAIL_EXISTS);
        }
        // Verificar DNI único (solo para admins)
        if (data.rol === 'ADMIN' || data.rol === 'ADMINISTRATIVO') {
            const existingDni = await prisma_1.default.administrativo.findUnique({
                where: { dni: dniNorm },
            });
            if (existingDni) {
                throw new errors_1.ConflictError(errors_1.ErrorMessages.DNI_EXISTS);
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const cuenta = await prisma_1.default.$transaction(async (tx) => {
            const nuevaCuenta = await tx.cuentaUsuario.create({
                data: {
                    email: emailNorm,
                    password: hashedPassword,
                    rol: data.rol,
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
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
            algorithm: 'HS256',
        });
    }
    async handleFailedLogin(cuentaId) {
        const cuenta = await prisma_1.default.cuentaUsuario.findUnique({
            where: { id: cuentaId },
        });
        if (!cuenta)
            return;
        const intentosFallidos = cuenta.intentosFallidos + 1;
        const updateData = {
            intentosFallidos,
        };
        if (intentosFallidos >= env_1.env.MAX_LOGIN_ATTEMPTS) {
            updateData.bloqueadoHasta = new Date(Date.now() + env_1.env.LOGIN_BLOCK_TIME * 60 * 1000);
        }
        await prisma_1.default.cuentaUsuario.update({
            where: { id: cuentaId },
            data: updateData,
        });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map