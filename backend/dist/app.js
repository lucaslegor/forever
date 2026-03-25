"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const app = (0, express_1.default)();
// Configuración de CORS (credentials: true para enviar cookies desde el frontend)
const corsOptions = {
    origin: env_1.env.FRONTEND_URL.split(',').map((url) => url.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
// Middlewares de seguridad
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
// Parseo de JSON y URL encoded
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
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
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.status(200).json({
            success: true,
            message: 'ready',
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        res.status(503).json({
            success: false,
            message: 'Database unavailable',
            timestamp: new Date().toISOString(),
        });
    }
});
// Rate limit global para /api
app.use('/api', rateLimit_middleware_1.globalApiRateLimiter, routes_1.default);
// Manejador de rutas no encontradas
app.use(error_middleware_1.notFoundHandler);
// Manejador de errores global
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map