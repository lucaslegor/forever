import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

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
export const loginRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max:
    env.NODE_ENV === 'test'
      ? 1000
      : env.NODE_ENV === 'development'
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
export const webhookRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: env.NODE_ENV === 'test' ? 10000 : 200,
  message: limitResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limit global para toda la API (opcional).
 * Por IP: 300 requests cada 15 minutos.
 */
export const globalApiRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: env.NODE_ENV === 'test' ? 10000 : 300,
  message: limitResponse,
  standardHeaders: true,
  legacyHeaders: false,
});
