"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
// Mock prisma antes de importar servicios
jest.mock('../config/prisma', () => {
    const mockPrisma = {
        cuentaUsuario: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        deportista: {
            findUnique: jest.fn(),
        },
        administrativo: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});
const prisma_1 = __importDefault(require("../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const mockPrisma = prisma_1.default;
/** Payload mínimo para pasar validación de login (CAPTCHA requerido en schema). */
const loginCaptcha = { captchaToken: 'test-token' };
describe('Auth Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/login', () => {
        it('deberia retornar 400 si el email no es valido', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, email: 'invalid-email', password: 'Password123' });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Error de validacion');
        });
        it('deberia retornar 400 si la contrasena es muy corta', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, email: 'test@example.com', password: '123' });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('deberia retornar 400 si falta email', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, password: 'Password123' });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 400 si falta contrasena', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, email: 'test@example.com' });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 401 si el usuario no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, email: 'noexiste@example.com', password: 'Password123' });
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Email o contrasena incorrectos');
        });
        it('deberia retornar 403 si el usuario esta inactivo', async () => {
            const hashedPassword = await bcryptjs_1.default.hash('Password123', 10);
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: hashedPassword,
                rol: client_1.Rol.ADMIN,
                activo: false,
                intentosFallidos: 0,
                bloqueadoHasta: null,
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'Password123' });
            expect(response.status).toBe(403);
        });
        it('deberia retornar 403 si el usuario esta bloqueado', async () => {
            const hashedPassword = await bcryptjs_1.default.hash('Password123', 10);
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: hashedPassword,
                rol: client_1.Rol.ADMIN,
                activo: true,
                intentosFallidos: 5,
                bloqueadoHasta: new Date(Date.now() + 60000),
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, email: 'test@example.com', password: 'Password123' });
            expect(response.status).toBe(403);
        });
        it('deberia retornar 200 con token si las credenciales son correctas', async () => {
            const hashedPassword = await bcryptjs_1.default.hash('Password123', 10);
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: hashedPassword,
                rol: client_1.Rol.ADMIN,
                activo: true,
                intentosFallidos: 0,
                bloqueadoHasta: null,
                administrativo: { nombre: 'Admin', apellido: 'Test' },
                deportista: null,
            });
            mockPrisma.cuentaUsuario.update.mockResolvedValue({});
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, email: 'test@example.com', password: 'Password123' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.email).toBe('test@example.com');
        });
        it('deberia hacer login por DNI de administrativo con formato con puntos', async () => {
            const hashedPassword = await bcryptjs_1.default.hash('AdminPass123', 10);
            const cuentaAdmin = {
                id: 2,
                email: '30123456@admin.forever',
                password: hashedPassword,
                rol: client_1.Rol.ADMINISTRATIVO,
                activo: true,
                intentosFallidos: 0,
                bloqueadoHasta: null,
                deportista: null,
                administrativo: { nombre: 'Juan', apellido: 'Admin' },
            };
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(null);
            mockPrisma.deportista.findUnique.mockResolvedValue(null);
            mockPrisma.administrativo.findUnique.mockResolvedValue({
                dni: '30123456',
                cuentaId: 2,
                cuenta: cuentaAdmin,
            });
            mockPrisma.cuentaUsuario.update.mockResolvedValue({});
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ ...loginCaptcha, email: '30.123.456', password: 'AdminPass123' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.email).toBe('30123456@admin.forever');
            expect(mockPrisma.administrativo.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { dni: '30123456' } }));
        });
    });
    describe('GET /api/auth/me', () => {
        it('deberia retornar 401 si no hay token', async () => {
            const response = await (0, supertest_1.default)(app_1.default).get('/api/auth/me');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
        it('deberia retornar 403 con token invalido', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');
            expect(response.status).toBe(403);
        });
    });
});
//# sourceMappingURL=auth.test.js.map