"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const captcha_service_1 = require("../services/captcha.service");
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const cookieOptions = {
    httpOnly: true,
    secure: env_1.env.COOKIE_SECURE,
    sameSite: env_1.env.COOKIE_SAME_SITE,
    path: '/',
    maxAge: env_1.authCookieMaxAgeSeconds * 1000, // Express espera milisegundos
};
class AuthController {
    async login(req, res, next) {
        try {
            const data = req.body;
            const valid = await captcha_service_1.captchaService.verifyTurnstile(data.captchaToken);
            if (!valid) {
                res.status(400).json({
                    success: false,
                    error: 'La verificación de seguridad falló. Intentá de nuevo.',
                });
                return;
            }
            const result = await auth_service_1.authService.login(data);
            res.cookie(env_1.env.AUTH_COOKIE_NAME, result.token, cookieOptions);
            (0, response_1.sendSuccess)(res, { user: result.user }, 'Inicio de sesion exitoso');
        }
        catch (error) {
            next(error);
        }
    }
    async register(req, res, next) {
        try {
            const data = req.body;
            const result = await auth_service_1.authService.register(data);
            // No establecer cookie: quien llama es el admin principal ya logueado; no reemplazar su sesión
            (0, response_1.sendCreated)(res, { user: result.user }, 'Usuario registrado exitosamente');
        }
        catch (error) {
            next(error);
        }
    }
    async logout(_req, res, next) {
        try {
            res.clearCookie(env_1.env.AUTH_COOKIE_NAME, {
                path: '/',
                httpOnly: true,
                secure: env_1.env.COOKIE_SECURE,
                sameSite: env_1.env.COOKIE_SAME_SITE,
            });
            (0, response_1.sendSuccess)(res, { ok: true }, 'Sesion cerrada');
        }
        catch (error) {
            next(error);
        }
    }
    async me(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, error: 'No autorizado' });
                return;
            }
            (0, response_1.sendSuccess)(res, req.user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map