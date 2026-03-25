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
        deportista: {
            findUnique: jest.fn(),
        },
        disciplina: {
            findMany: jest.fn(),
        },
        cuota: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
    };
    return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});
const prisma_1 = __importDefault(require("../config/prisma"));
const mockPrisma = prisma_1.default;
describe('Cuota Module', () => {
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
    describe('POST /api/cuotas/asignar', () => {
        const cuotaData = {
            deportistaId: 1,
            nroCuota: 1,
            monto: 5000,
            fechaEmision: '2024-01-01T00:00:00.000Z',
            fechaVencimiento: '2024-01-31T00:00:00.000Z',
            disciplinaId: 1,
        };
        it('deberia retornar 401 sin token', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/cuotas/asignar')
                .send(cuotaData);
            expect(response.status).toBe(401);
        });
        it('deberia retornar 403 si no es Administrativo', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/cuotas/asignar')
                .set('Authorization', `Bearer ${deportistaToken}`)
                .send(cuotaData);
            expect(response.status).toBe(403);
        });
        it('deberia retornar 400 si faltan campos', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/cuotas/asignar')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ deportistaId: 1 });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 404 si el deportista no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/cuotas/asignar')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(cuotaData);
            expect(response.status).toBe(404);
        });
        it('deberia retornar 409 si la cuota ya existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.cuota.findFirst.mockResolvedValue({ id: 1 });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/cuotas/asignar')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(cuotaData);
            expect(response.status).toBe(409);
        });
        it('deberia retornar 201 al asignar cuota', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.cuota.findFirst.mockResolvedValue(null);
            mockPrisma.cuota.create.mockResolvedValue({
                id: 1,
                nroCuota: 1,
                monto: 5000,
                estadoCuota: client_1.EstadoCuota.PENDIENTE,
                disciplina: { nombre: 'Futbol' },
                deportista: { nombre: 'Juan' },
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/cuotas/asignar')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(cuotaData);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
        });
    });
    describe('GET /api/cuotas/predefinidas', () => {
        it('deberia retornar lista de cuotas predefinidas', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.disciplina.findMany.mockResolvedValue([
                { id: 1, nombre: 'Futbol', precioMensual: 5000 },
                { id: 2, nombre: 'Basquet', precioMensual: 4500 },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/predefinidas')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(2);
        });
    });
    describe('GET /api/cuotas/:id', () => {
        it('deberia retornar cuota por ID', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.cuota.findUnique.mockResolvedValue({
                id: 1,
                nroCuota: 1,
                monto: 5000,
                estadoCuota: client_1.EstadoCuota.PENDIENTE,
                disciplina: { nombre: 'Futbol' },
                deportista: { nombre: 'Juan' },
                pagos: [],
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.nroCuota).toBe(1);
        });
        it('deberia retornar 404 si no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.cuota.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
        });
    });
    describe('PUT /api/cuotas/:id', () => {
        it('deberia actualizar monto de cuota', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.cuota.findUnique.mockResolvedValue({
                id: 1,
                nroCuota: 1,
                monto: 5000,
            });
            mockPrisma.cuota.update.mockResolvedValue({
                id: 1,
                nroCuota: 1,
                monto: 6000,
                disciplina: { nombre: 'Futbol' },
                deportista: { nombre: 'Juan' },
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/cuotas/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ monto: 6000 });
            expect(response.status).toBe(200);
        });
        it('deberia retornar 400 si monto es negativo', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/cuotas/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ monto: -100 });
            expect(response.status).toBe(400);
        });
    });
    describe('GET /api/cuotas/mi-estado', () => {
        it('deberia retornar estado de cuenta del deportista logueado', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Juan',
                apellido: 'Perez',
                cuentaId: 2,
            });
            mockPrisma.cuota.findMany.mockResolvedValue([
                {
                    id: 1,
                    nroCuota: 1,
                    monto: 5000,
                    estadoCuota: client_1.EstadoCuota.PAGADA,
                    pagos: [{ fechaPago: new Date(), medioPago: 'Mercado Pago' }],
                },
                {
                    id: 2,
                    nroCuota: 2,
                    monto: 5000,
                    estadoCuota: client_1.EstadoCuota.PENDIENTE,
                    fechaVencimiento: new Date(),
                    pagos: [],
                },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/mi-estado')
                .set('Authorization', `Bearer ${deportistaToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.cuotasPagadas).toHaveLength(1);
            expect(response.body.data.cuotasPendientes).toHaveLength(1);
            expect(response.body.data.totalAdeudado).toBe(5000);
        });
    });
    describe('GET /api/cuotas/deportista/:deportistaId', () => {
        it('deberia retornar cuotas de un deportista', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.cuota.findMany.mockResolvedValue([
                {
                    id: 1,
                    nroCuota: 1,
                    monto: 5000,
                    estadoCuota: client_1.EstadoCuota.PENDIENTE,
                    disciplina: { nombre: 'Futbol' },
                    pagos: [],
                },
            ]);
            mockPrisma.cuota.count.mockResolvedValue(1);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/deportista/1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.data).toHaveLength(1);
        });
    });
    describe('GET /api/cuotas/estado-cuenta/:deportistaId', () => {
        it('deberia retornar 401 sin token', async () => {
            const response = await (0, supertest_1.default)(app_1.default).get('/api/cuotas/estado-cuenta/1');
            expect(response.status).toBe(401);
        });
        it('deberia retornar 403 si no es administrativo', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/estado-cuenta/1')
                .set('Authorization', `Bearer ${deportistaToken}`);
            expect(response.status).toBe(403);
        });
        it('deberia retornar estado de cuenta de un deportista', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Juan',
                apellido: 'Perez',
            });
            mockPrisma.cuota.findMany.mockResolvedValue([
                {
                    id: 1,
                    nroCuota: 1,
                    monto: 5000,
                    estadoCuota: client_1.EstadoCuota.PAGADA,
                    fechaVencimiento: new Date(),
                    pagos: [{ fechaPago: new Date(), medioPago: 'Mercado Pago' }],
                },
                {
                    id: 2,
                    nroCuota: 2,
                    monto: 5000,
                    estadoCuota: client_1.EstadoCuota.PENDIENTE,
                    fechaVencimiento: new Date(),
                    pagos: [],
                },
                {
                    id: 3,
                    nroCuota: 3,
                    monto: 5000,
                    estadoCuota: client_1.EstadoCuota.VENCIDA,
                    fechaVencimiento: new Date(Date.now() - 86400000),
                    pagos: [],
                },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/estado-cuenta/1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.cuotasPagadas).toHaveLength(1);
            expect(response.body.data.cuotasPendientes).toHaveLength(1);
            expect(response.body.data.cuotasVencidas).toHaveLength(1);
            expect(response.body.data.totalAdeudado).toBe(10000);
        });
        it('deberia retornar 404 si el deportista no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/cuotas/estado-cuenta/999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
        });
    });
});
//# sourceMappingURL=cuota.test.js.map