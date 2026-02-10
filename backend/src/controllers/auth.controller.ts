import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { LoginInput, RegisterInput } from '../validators/auth.validator';
import { AuthenticatedRequest } from '../types';
import { env, authCookieMaxAgeSeconds } from '../config/env';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: authCookieMaxAgeSeconds * 1000, // Express espera milisegundos
};

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as LoginInput;
      const result = await authService.login(data);
      res.cookie(env.AUTH_COOKIE_NAME, result.token, cookieOptions);
      sendSuccess(res, { user: result.user }, 'Inicio de sesion exitoso');
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = req.body as RegisterInput;
      const result = await authService.register(data);
      res.cookie(env.AUTH_COOKIE_NAME, result.token, cookieOptions);
      sendCreated(res, { user: result.user }, 'Usuario registrado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie(env.AUTH_COOKIE_NAME, {
        path: '/',
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      sendSuccess(res, { ok: true }, 'Sesion cerrada');
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autorizado' });
        return;
      }
      sendSuccess(res, req.user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
