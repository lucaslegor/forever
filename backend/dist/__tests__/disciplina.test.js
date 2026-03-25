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
        },
        disciplina: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        deportista: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };
    return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});
const prisma_1 = __importDefault(require("../config/prisma"));
const mockPrisma = prisma_1.default;
describe('Disciplina Module', () => {
    const adminUser = {
        id: 1,
        email: 'admin@test.com',
        password: 'hashed',
        rol: client_1.Rol.ADMINISTRATIVO,
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
    const adminToken = jsonwebtoken_1.default.sign({ id: 1, email: 'admin@test.com', rol: client_1.Rol.ADMINISTRATIVO }, process.env.JWT_SECRET);
    const deportistaToken = jsonwebtoken_1.default.sign({ id: 2, email: 'deportista@test.com', rol: client_1.Rol.DEPORTISTA }, process.env.JWT_SECRET);
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/disciplinas', () => {
        const disciplinaData = {
            nombre: 'Futbol',
            precioMensual: 5000,
        };
        it('deberia retornar 401 sin token', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/disciplinas')
                .send(disciplinaData);
            expect(response.status).toBe(401);
        });
        it('deberia retornar 403 si no es Administrativo', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/disciplinas')
                .set('Authorization', `Bearer ${deportistaToken}`)
                .send(disciplinaData);
            expect(response.status).toBe(403);
        });
        it('deberia retornar 400 si falta nombre', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/disciplinas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ precioMensual: 5000 });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 400 si precio es negativo', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/disciplinas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...disciplinaData, precioMensual: -100 });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 409 si el nombre ya existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue({ id: 1 });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/disciplinas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(disciplinaData);
            expect(response.status).toBe(409);
        });
        it('deberia retornar 201 al crear disciplina', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue(null);
            mockPrisma.disciplina.create.mockResolvedValue({
                id: 1,
                nombre: 'Futbol',
                precioMensual: 5000,
                activa: true,
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/disciplinas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(disciplinaData);
            expect(response.status).toBe(201);
            expect(response.body.data.nombre).toBe('Futbol');
        });
    });
    describe('GET /api/disciplinas', () => {
        it('deberia retornar lista de disciplinas', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findMany.mockResolvedValue([
                { id: 1, nombre: 'Futbol', precioMensual: 5000, activa: true, _count: { deportistas: 10 } },
                { id: 2, nombre: 'Basquet', precioMensual: 4500, activa: true, _count: { deportistas: 8 } },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/disciplinas')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
        });
        it('deberia filtrar disciplinas activas por defecto', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findMany.mockResolvedValue([
                { id: 1, nombre: 'Futbol', activa: true },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/disciplinas')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });
        it('deberia incluir inactivas si se solicita', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findMany.mockResolvedValue([
                { id: 1, nombre: 'Futbol', activa: true },
                { id: 2, nombre: 'Tenis', activa: false },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/disciplinas?includeInactive=true')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
        });
    });
    describe('GET /api/disciplinas/:id', () => {
        it('deberia retornar disciplina por ID', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Futbol',
                precioMensual: 5000,
                activa: true,
                _count: { deportistas: 10 },
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/disciplinas/1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.nombre).toBe('Futbol');
        });
        it('deberia retornar 404 si no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/disciplinas/999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
        });
    });
    describe('PUT /api/disciplinas/:id', () => {
        it('deberia actualizar precio mensual', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Futbol',
                precioMensual: 5000,
            });
            mockPrisma.disciplina.update.mockResolvedValue({
                id: 1,
                nombre: 'Futbol',
                precioMensual: 6000,
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/disciplinas/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ precioMensual: 6000 });
            expect(response.status).toBe(200);
        });
        it('deberia desactivar disciplina', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Futbol',
                activa: true,
            });
            mockPrisma.disciplina.update.mockResolvedValue({
                id: 1,
                nombre: 'Futbol',
                activa: false,
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/disciplinas/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ activa: false });
            expect(response.status).toBe(200);
        });
        it('deberia retornar 409 si nombre duplicado', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique
                .mockResolvedValueOnce({ id: 1, nombre: 'Futbol' })
                .mockResolvedValueOnce({ id: 2, nombre: 'Basquet' });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/disciplinas/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nombre: 'Basquet' });
            expect(response.status).toBe(409);
        });
    });
    describe('GET /api/disciplinas/:id/deportistas', () => {
        it('deberia retornar deportistas de una disciplina', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.deportista.findMany.mockResolvedValue([
                { id: 1, nombre: 'Juan', apellido: 'Perez', cuenta: { email: 'juan@test.com' } },
                { id: 2, nombre: 'Maria', apellido: 'Garcia', cuenta: { email: 'maria@test.com' } },
            ]);
            mockPrisma.deportista.count.mockResolvedValue(2);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/disciplinas/1/deportistas')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.data).toHaveLength(2);
        });
        it('deberia retornar 404 si disciplina no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/disciplinas/999/deportistas')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
        });
    });
});
//# sourceMappingURL=disciplina.test.js.map