"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalApiRateLimiter = exports.reservaPublicRateLimiter = exports.webhookRateLimiter = exports.loginRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
/** Ventana en ms (15 min) */
const WINDOW_MS = 15 * 60 * 1000;
/** Respuesta cuando se supera el límite */
const limitResponse = {
    success: false,
    error: 'Demasiados intentos. Intentá de nuevo más tarde.',
};
/**
 * Rate limit para login (anti fuerza bruta).
 * Desarrollo: 100 intentos / 15 min (para no bloquear al probar).
 * Producción: 20 intentos / 15 min.
 */
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS,
    max: env_1.env.NODE_ENV === 'test'
        ? 1000
        : env_1.env.NODE_ENV === 'development'
            ? 100
            : 20,
    message: limitResponse,
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Rate limit para webhook de Mercado Pago (evitar abuso).
 * Por IP: 200 requests cada 15 minutos (MP puede enviar varias notificaciones por pago).
 */
exports.webhookRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS,
    max: env_1.env.NODE_ENV === 'test' ? 10000 : 200,
    message: limitResponse,
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Rate limit para crear reserva de cancha (ruta pública).
 * Por IP: 15 reservas cada 15 min en prod; más alto en dev/test.
 */
exports.reservaPublicRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS,
    max: env_1.env.NODE_ENV === 'test' ? 1000 : env_1.env.NODE_ENV === 'development' ? 50 : 15,
    message: limitResponse,
    standardHeaders: true,
    legacyHeaders: false,
});
/** Rutas de solo lectura que no consumen cupo del rate limit (evitan 429 en carga inicial). */
function skipReadOnlyPaths(req) {
    if (req.method !== 'GET')
        return false;
    const raw = req.originalUrl ?? req.url ?? req.path ?? '';
    const path = (raw.split('?')[0] || '').replace(/\/$/, '');
    const normalized = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
    return (normalized === '/api/noticias' ||
        normalized.startsWith('/api/noticias/') ||
        normalized === '/api/users/profile' ||
        normalized.includes('/reservas-cancha/disponibilidad'));
}
/**
 * Rate limit global para toda la API.
 * En desarrollo no se aplica (skip siempre) para evitar 429 al cargar noticias/perfil.
 * En producción: GET a noticias, profile y disponibilidad no cuentan; resto 1000/15 min.
 */
exports.globalApiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MS,
    max: env_1.env.NODE_ENV === 'test' ? 10000 : env_1.env.NODE_ENV === 'development' ? 10000 : 1000,
    message: limitResponse,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, _res) => env_1.env.NODE_ENV === 'development' || env_1.env.NODE_ENV === 'test' ? true : skipReadOnlyPaths(req),
});
//# sourceMappingURL=rateLimit.middleware.js.map