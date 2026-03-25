"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captchaService = void 0;
exports.verifyTurnstile = verifyTurnstile;
const env_1 = require("../config/env");
/**
 * Verifica el token de Cloudflare Turnstile contra la API de siteverify.
 * Si TURNSTILE_SECRET_KEY está vacío (desarrollo), retorna true sin llamar a la API.
 */
async function verifyTurnstile(token) {
    if (!token || typeof token !== 'string' || !token.trim()) {
        return false;
    }
    const secret = env_1.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        return true;
    }
    const verifyUrl = env_1.env.TURNSTILE_VERIFY_URL;
    const body = new URLSearchParams({
        secret,
        response: token.trim(),
    });
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!res.ok) {
            return false;
        }
        const data = (await res.json());
        return data.success === true;
    }
    catch {
        return false;
    }
}
exports.captchaService = { verifyTurnstile };
//# sourceMappingURL=captcha.service.js.map