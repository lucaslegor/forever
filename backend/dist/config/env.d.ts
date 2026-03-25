export declare const env: {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    FRONTEND_URL: string;
    MERCADOPAGO_ACCESS_TOKEN: string;
    MERCADOPAGO_PUBLIC_KEY: string;
    MERCADOPAGO_SUCCESS_URL: string;
    MERCADOPAGO_FAILURE_URL: string;
    MERCADOPAGO_PENDING_URL: string;
    MERCADOPAGO_WEBHOOK_URL: string;
    /** Clave secreta de Webhooks (Tus integraciones > Webhooks). Opcional; si está definida se valida x-signature. */
    MERCADOPAGO_WEBHOOK_SECRET: string;
    /** Email del vendedor (cuenta MP). Si el pagador usa el mismo email (ej. en Sandbox), se fuerza email fantasma para evitar auto-compra. Opcional. */
    MERCADOPAGO_SELLER_EMAIL: string | undefined;
    MAX_LOGIN_ATTEMPTS: number;
    LOGIN_BLOCK_TIME: number;
    CLUB_NAME: string;
    /** Nombre de la cookie HttpOnly donde se guarda el JWT */
    AUTH_COOKIE_NAME: string;
    /** Email del admin principal (único que puede crear otros admins y restablecer sus contraseñas) */
    PRINCIPAL_ADMIN_EMAIL: string;
    /** WhatsApp del club para transferencia de seña (código país + número sin +). Ej: 5492211234567 */
    CLUB_WHATSAPP_NUMBER: string;
    /** Cloudflare Turnstile: clave secreta para verificar CAPTCHA en backend. Vacío en dev = skip verificación. */
    TURNSTILE_SECRET_KEY: string;
    /** URL de verificación Turnstile (opcional; por defecto la oficial). */
    TURNSTILE_VERIFY_URL: string;
    /** Cookie: sameSite ("lax" por defecto; "none" si front y API en dominios distintos). */
    COOKIE_SAME_SITE: "lax" | "strict" | "none";
    /** Cookie: secure (true en producción; obligatorio si COOKIE_SAME_SITE=none). */
    COOKIE_SECURE: boolean;
};
export declare const authCookieMaxAgeSeconds: number;
export default env;
//# sourceMappingURL=env.d.ts.map