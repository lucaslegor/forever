import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken, requireAdministrativo, requirePrincipalAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// POST /api/auth/login - CU01 (rate limit anti fuerza bruta)
router.post('/login', loginRateLimiter, validateBody(loginSchema), authController.login.bind(authController));

// POST /api/auth/register - CU02 (solo admin principal: admin@foreverclub.com)
router.post(
  '/register',
  authenticateToken,
  requireAdministrativo,
  requirePrincipalAdmin,
  validateBody(registerSchema),
  authController.register.bind(authController)
);

// GET /api/auth/me - Obtener usuario autenticado
router.get('/me', authenticateToken, authController.me.bind(authController));

// POST /api/auth/logout - Cerrar sesion (borra cookie HttpOnly)
router.post('/logout', authController.logout.bind(authController));

export default router;
