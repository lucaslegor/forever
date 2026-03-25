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
            create: jest.fn(),
            update: jest.fn(),
        },
        deportista: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        pago: {
            findMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});
const prisma_1 = __importDefault(require("../config/prisma"));
const mockPrisma = prisma_1.default;
describe('Deportista Module', () => {
    const adminUser = {
        id: 1,
        email: 'admin@test.com',
        password: 'hashed',
        rol: client_1.Rol.ADMINISTRATIVO,
        activo: true,
        intentosFallidos: 0,
        bloqueadoHasta: null,
    };
    const deportistaUser = {
        id: 2,
        email: 'deportista@test.com',
        password: 'hashed',
        rol: client_1.Rol.DEPORTISTA,
        activo: true,
        intentosFallidos: 0,
        bloqueadoHasta: null,
    };
    const adminToken = jsonwebtoken_1.default.sign({ id: 1, email: 'admin@test.com', rol: client_1.Rol.ADMINISTRATIVO }, process.env.JWT_SECRET);
    const deportistaToken = jsonwebtoken_1.default.sign({ id: 2, email: 'deportista@test.com', rol: client_1.Rol.DEPORTISTA }, process.env.JWT_SECRET);
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/deportistas', () => {
        const deportistaData = {
            nombre: 'Juan',
            apellido: 'Perez',
            dni: '12345678',
            generoId: 1,
            categoriaId: 1,
            disciplinaId: 1,
            email: 'juan@test.com',
            password: 'Password123',
        };
        it('deberia retornar 401 sin token', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .send(deportistaData);
            expect(response.status).toBe(401);
        });
        it('deberia retornar 403 si no es Administrativo', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .set('Authorization', `Bearer ${deportistaToken}`)
                .send(deportistaData);
            expect(response.status).toBe(403);
        });
        it('deberia retornar 400 si faltan campos', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ nombre: 'Juan' });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 400 si el DNI es invalido', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...deportistaData, dni: '123' });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 400 si la contrasena no tiene mayuscula', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ ...deportistaData, password: 'password123' });
            expect(response.status).toBe(400);
        });
        it('deberia retornar 201 y crear deportista exitosamente', async () => {
            // Mock findUnique for correct routing
            mockPrisma.cuentaUsuario.findUnique.mockImplementation((args) => {
                if (args.where.email === deportistaData.email)
                    return Promise.resolve(null); // Check email unique
                if (args.where.id === 1)
                    return Promise.resolve(adminUser); // Admin
                return Promise.resolve(null);
            });
            mockPrisma.deportista.findUnique.mockResolvedValue(null); // DNI no existe
            // Mock transaction
            mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
            const createdDeportista = {
                id: 1,
                ...deportistaData,
                cuentaId: 3,
                estado: client_1.EstadoDeportista.AL_DIA,
                createdAt: new Date(),
                updatedAt: new Date(),
                disciplina: { nombre: 'Futbol' },
                cuenta: { email: deportistaData.email, rol: client_1.Rol.DEPORTISTA, activo: true, createdAt: new Date() },
            };
            mockPrisma.cuentaUsuario.create.mockResolvedValue({ id: 3, email: deportistaData.email, rol: client_1.Rol.DEPORTISTA });
            mockPrisma.deportista.create.mockResolvedValue(createdDeportista);
            mockPrisma.deportista.findUnique
                .mockResolvedValueOnce(null) // Check DNI
                .mockResolvedValueOnce(createdDeportista); // Return created
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(deportistaData);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.nombre).toBe(deportistaData.nombre);
        });
    });
    describe('PUT /api/deportistas/:id', () => {
        const updateData = {
            nombre: 'Juan Actualizado',
        };
        it('deberia retornar 200 y actualizar deportista correctamente', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const existingDeportista = {
                id: 1,
                nombre: 'Juan',
            };
            mockPrisma.deportista.findUnique
                .mockResolvedValueOnce(existingDeportista) // Check existence
                .mockResolvedValueOnce({ ...existingDeportista, ...updateData, disciplina: {}, cuenta: {} }); // Return updated
            mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
            mockPrisma.deportista.update.mockResolvedValue({ ...existingDeportista, ...updateData });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/deportistas/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.nombre).toBe(updateData.nombre);
        });
        it('deberia retornar 404 si el deportista no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/deportistas/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);
            expect(response.status).toBe(404);
        });
    });
    describe('GET /api/deportistas', () => {
        it('deberia retornar 200 con lista de deportistas', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findMany.mockResolvedValue([
                {
                    id: 1,
                    nombre: 'Juan',
                    apellido: 'Perez',
                    dni: '12345678',
                    estado: client_1.EstadoDeportista.AL_DIA,
                    disciplina: { nombre: 'Futbol' },
                    cuenta: { email: 'juan@test.com', activo: true },
                },
            ]);
            mockPrisma.deportista.count.mockResolvedValue(1);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.data).toHaveLength(1);
        });
    });
    describe('GET /api/deportistas/:id', () => {
        it('deberia retornar 200 con deportista', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Juan',
                apellido: 'Perez',
                dni: '12345678',
                disciplina: { nombre: 'Futbol' },
                cuenta: { email: 'juan@test.com' },
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.nombre).toBe('Juan');
        });
        it('deberia retornar 404 si no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
        });
    });
    describe('GET /api/deportistas/pagos-pendientes', () => {
        it('deberia retornar deportistas con pagos pendientes', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findMany.mockResolvedValue([
                {
                    id: 1,
                    nombre: 'Juan',
                    apellido: 'Perez',
                    dni: '12345678',
                    cuotas: [
                        { monto: 1000, fechaVencimiento: new Date(), estadoCuota: client_1.EstadoCuota.PENDIENTE },
                        { monto: 1000, fechaVencimiento: new Date(), estadoCuota: client_1.EstadoCuota.VENCIDA },
                    ],
                },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/pagos-pendientes')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data[0].cantidadCuotasPendientes).toBe(2);
            expect(response.body.data[0].montoTotalAdeudado).toBe(2000);
        });
    });
    describe('DELETE /api/deportistas/:id', () => {
        it('deberia retornar 200 al dar de baja (desactivar cuenta)', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Juan',
                cuentaId: 2,
                cuenta: {},
            });
            mockPrisma.cuentaUsuario.update.mockResolvedValue({});
            const response = await (0, supertest_1.default)(app_1.default)
                .delete('/api/deportistas/1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.message).toContain('baja');
            expect(mockPrisma.cuentaUsuario.update).toHaveBeenCalledWith({
                where: { id: 2 },
                data: { activo: false },
            });
        });
    });
    describe('GET /api/deportistas/mi-perfil', () => {
        it('deberia retornar perfil del deportista logueado', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Juan',
                apellido: 'Perez',
                cuentaId: 2,
                disciplina: { nombre: 'Futbol' },
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/mi-perfil')
                .set('Authorization', `Bearer ${deportistaToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.nombre).toBe('Juan');
        });
    });
    describe('GET /api/deportistas/mi-historial', () => {
        it('deberia retornar 401 sin token', async () => {
            const response = await (0, supertest_1.default)(app_1.default).get('/api/deportistas/mi-historial');
            expect(response.status).toBe(401);
        });
        it('deberia retornar 403 si no es deportista', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/mi-historial')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(403);
        });
        it('deberia retornar historial del deportista logueado', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Juan',
                cuentaId: 2,
            });
            mockPrisma.pago.findMany.mockResolvedValue([
                {
                    id: 1,
                    fechaPago: new Date(),
                    monto: 5000,
                    estadoPago: 'APROBADO',
                    cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
                },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/mi-historial')
                .set('Authorization', `Bearer ${deportistaToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
    describe('GET /api/deportistas/:id/historial', () => {
        it('deberia retornar 401 sin token', async () => {
            const response = await (0, supertest_1.default)(app_1.default).get('/api/deportistas/1/historial');
            expect(response.status).toBe(401);
        });
        it('deberia retornar 403 si no es administrativo', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(deportistaUser);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/1/historial')
                .set('Authorization', `Bearer ${deportistaToken}`);
            expect(response.status).toBe(403);
        });
        it('deberia retornar historial de pagos de un deportista', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue({
                id: 1,
                nombre: 'Juan',
            });
            mockPrisma.pago.findMany.mockResolvedValue([
                {
                    id: 1,
                    fechaPago: new Date(),
                    monto: 5000,
                    estadoPago: 'APROBADO',
                    cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
                },
                {
                    id: 2,
                    fechaPago: new Date(),
                    monto: 4500,
                    estadoPago: 'PENDIENTE',
                    cuota: { nroCuota: 2, disciplina: { nombre: 'Futbol' } },
                },
            ]);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/1/historial')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
        it('deberia retornar 404 si el deportista no existe', async () => {
            mockPrisma.cuentaUsuario.findUnique.mockResolvedValue(adminUser);
            mockPrisma.deportista.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas/999/historial')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
        });
    });
});
//# sourceMappingURL=deportista.test.js.map