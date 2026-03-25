"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../app"));
const client_1 = require("@prisma/client");
// Mock prisma
jest.mock('../config/prisma', () => {
    const mockPrisma = {
        cuentaUsuario: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
        },
    };
    return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});
const prisma_1 = __importDefault(require("../config/prisma"));
const mockPrisma = prisma_1.default;
describe('User Module', () => {
    const adminUser = {
        id: 1,
        email: 'admin@test.com',
        password: 'hashed',
        rol: client_1.Rol.ADMIN,
        activo: true,
        intentosFallidos: 0,
        bloqueadoHasta: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const deportistaUser = {
        id: 2,
        email: 'deportista@test.com',
        password: 'hashed',
        rol: client_1.Rol.DEPORTISTA,
        activo: true,
        intentosFallidos: 0,
        bloqueadoHasta: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    const adminToken = jsonwebtoken_1.default.sign({ id: 1, email: 'admin@test.com', rol: client_1.Rol.ADMIN }, process.env.JWT_SECRET);
    const deportistaToken = jsonwebtoken_1.default.sign({ id: 2, email: 'deportista@test.com', rol: client_1.Rol.DEPORTISTA }, process.env.JWT_SECRET);
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /api/users', () => {
        it('deberia retornar 401 si no hay token', async () => {
            const response = await (0, supertest_1.default)(app_1.default).get('/api/users');
            expect(response.status).toBe(401);
        });
        it('deberia retornar 403 si no es Admin', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/users')
                .set('Authorization', `Bearer ${deportistaToken}`);
            expect(response.status).toBe(403);
        });
        it('deberia retornar 200 con lista de usuarios para Admin', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.cuentaUsuario.findMany.mockResolvedValue([
                { ...adminUser, deportista: null, administrativo: null },
                { ...deportistaUser, deportista: null, administrativo: null },
            ]);
            mockPrisma.cuentaUsuario.count.mockResolvedValue(2);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data).toHaveLength(2);
        });
    });
    describe('GET /api/users/profile', () => {
        it('deberia retornar 200 con perfil del usuario', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue({
                ...adminUser,
                deportista: null,
                administrativo: { nombre: 'Admin', apellido: 'Test' },
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe('admin@test.com');
        });
    });
    describe('PUT /api/users/profile', () => {
        it('deberia retornar 400 si el email es invalido', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ email: 'invalid-email' });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 200 al actualizar perfil', async () => {
            mockPrisma.cuentaUsuario.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(null);
            mockPrisma.cuentaUsuario.update.mockResolvedValue({
                ...adminUser,
                email: 'newemail@test.com',
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ email: 'newemail@test.com' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('PUT /api/users/:id/role', () => {
        it('deberia retornar 400 si el rol es invalido', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/2/role')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ rol: 'INVALID_ROL' });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 403 si no es Admin', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/3/role')
                .set('Authorization', `Bearer ${deportistaToken}`)
                .send({ rol: 'ADMINISTRATIVO' });
            expect(response.status).toBe(403);
        });
        it('deberia retornar 200 al cambiar rol', async () => {
            mockPrisma.cuentaUsuario.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(deportistaUser);
            mockPrisma.cuentaUsuario.count.mockResolvedValue(2);
            mockPrisma.cuentaUsuario.update.mockResolvedValue({
                ...deportistaUser,
                rol: client_1.Rol.ADMINISTRATIVO,
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/2/role')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ rol: 'ADMINISTRATIVO' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
        it('deberia retornar 400 si es el ultimo Admin', async () => {
            mockPrisma.cuentaUsuario.findUnique
                .mockResolvedValueOnce(adminUser)
                .mockResolvedValueOnce(adminUser);
            mockPrisma.cuentaUsuario.count.mockResolvedValue(1);
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/users/1/role')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ rol: 'DEPORTISTA' });
            expect(response.status).toBe(400);
            expect(response.body.error).toContain('al menos un Administrador');
        });
    });
});
//# sourceMappingURL=user.test.js.map