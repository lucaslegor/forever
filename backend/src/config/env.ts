import path from 'path';
import dotenv from 'dotenv';

// Cargar .env: primero cwd, luego backend (con override para que backend/.env gane)
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

/** En producción JWT_SECRET es obligatorio y debe ser fuerte (32+ caracteres). */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (isProduction) {
    if (!secret || secret === 'default-secret-change-me' || secret.length < 32) {
      throw new Error(
        'En producción JWT_SECRET es obligatorio en .env y debe tener al menos 32 caracteres aleatorios. ' +
          'Generá uno con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
    return secret;
  }
  return secret || 'default-secret-change-me';
}

/** sameSite: "lax" para mismo dominio; "none" solo si front y API están en dominios distintos (requiere secure: true). */
const COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax';
/** secure: true en producción; si front y API son cross-origin, usar COOKIE_SAME_SITE=none y esta en true. */
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || (process.env.COOKIE_SECURE !== 'false' && isProduction);

export const env = {
  NODE_ENV: NODE_ENV,
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: getJwtSecret(),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  MERCADOPAGO_SUCCESS_URL: process.env.MERCADOPAGO_SUCCESS_URL || '',
  MERCADOPAGO_FAILURE_URL: process.env.MERCADOPAGO_FAILURE_URL || '',
  MERCADOPAGO_PENDING_URL: process.env.MERCADOPAGO_PENDING_URL || '',
  MERCADOPAGO_WEBHOOK_URL: process.env.MERCADOPAGO_WEBHOOK_URL || '',
  /** Clave secreta de Webhooks (Tus integraciones > Webhooks). Opcional; si está definida se valida x-signature. */
  MERCADOPAGO_WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  LOGIN_BLOCK_TIME: parseInt(process.env.LOGIN_BLOCK_TIME || '15', 10),
  CLUB_NAME: process.env.CLUB_NAME || 'Club Deportivo Forever',
  /** Nombre de la cookie HttpOnly donde se guarda el JWT */
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || 'forever_token',
  /** Email del admin principal (único que puede crear otros admins y restablecer sus contraseñas) */
  PRINCIPAL_ADMIN_EMAIL: (process.env.PRINCIPAL_ADMIN_EMAIL || 'admin@foreverclub.com').toLowerCase(),
  /** WhatsApp del club para transferencia de seña (código país + número sin +). Ej: 5492211234567 */
  CLUB_WHATSAPP_NUMBER: process.env.CLUB_WHATSAPP_NUMBER || '5492211234567',
  /** Cookie: sameSite ("lax" por defecto; "none" si front y API en dominios distintos). */
  COOKIE_SAME_SITE,
  /** Cookie: secure (true en producción; obligatorio si COOKIE_SAME_SITE=none). */
  COOKIE_SECURE,
};

/** Convierte JWT_EXPIRES_IN (ej: '7d', '24h') a segundos para maxAge de cookie */
function jwtExpiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60; // default 7 días
  const n = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'd') return n * 24 * 60 * 60;
  if (unit === 'h') return n * 60 * 60;
  if (unit === 'm') return n * 60;
  return n;
}

export const authCookieMaxAgeSeconds = jwtExpiresInToSeconds(env.JWT_EXPIRES_IN);
export default env;
