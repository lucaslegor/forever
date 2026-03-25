/**
 * Rate limit para login (anti fuerza bruta).
 * Desarrollo: 100 intentos / 15 min (para no bloquear al probar).
 * Producción: 20 intentos / 15 min.
 */
export declare const loginRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limit para webhook de Mercado Pago (evitar abuso).
 * Por IP: 200 requests cada 15 minutos (MP puede enviar varias notificaciones por pago).
 */
export declare const webhookRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limit para crear reserva de cancha (ruta pública).
 * Por IP: 15 reservas cada 15 min en prod; más alto en dev/test.
 */
export declare const reservaPublicRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Rate limit global para toda la API.
 * En desarrollo no se aplica (skip siempre) para evitar 429 al cargar noticias/perfil.
 * En producción: GET a noticias, profile y disponibilidad no cuentan; resto 1000/15 min.
 */
export declare const globalApiRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map