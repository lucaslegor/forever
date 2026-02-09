import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
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
};

export default env;
