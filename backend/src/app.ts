import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import prisma from './config/prisma';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { globalApiRateLimiter } from './middlewares/rateLimit.middleware';

const app = express();

// Configuración de CORS (credentials: true para enviar cookies desde el frontend)
const corsOptions = {
  origin: env.FRONTEND_URL.split(',').map((url) => url.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares de seguridad
app.use(helmet());
app.use(cors(corsOptions));
app.use(cookieParser());

// Parseo de JSON y URL encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check (sin rate limit): solo indica que el proceso está vivo
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Readiness: comprueba que la base de datos responde (para probes en GCloud/Kubernetes)
app.get('/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      message: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

// Rate limit global para /api
app.use('/api', globalApiRateLimiter, routes);

// Manejador de rutas no encontradas
app.use(notFoundHandler);

// Manejador de errores global
app.use(errorHandler);

export default app;
