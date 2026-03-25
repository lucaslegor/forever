/**
 * Verifica el token de Cloudflare Turnstile contra la API de siteverify.
 * Si TURNSTILE_SECRET_KEY está vacío (desarrollo), retorna true sin llamar a la API.
 */
export declare function verifyTurnstile(token: string): Promise<boolean>;
export declare const captchaService: {
    verifyTurnstile: typeof verifyTurnstile;
};
//# sourceMappingURL=captcha.service.d.ts.map