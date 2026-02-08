import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { Rol, EstadoCuota } from '@prisma/client';

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

import prisma from '../config/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Cuota Module', () => {
  const adminUser = {
    id: 1,
    email: 'admin@test.com',
    password: 'hashed',
    rol: Rol.ADMINISTRATIVO,
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
    rol: Rol.DEPORTISTA,
    activo: true,
    intentosFallidos: 0,
    bloqueadoHasta: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminToken = jwt.sign(
    { id: 1, email: 'admin@test.com', rol: Rol.ADMINISTRATIVO },
    process.env.JWT_SECRET!
  );

  const deportistaToken = jwt.sign(
    { id: 2, email: 'deportista@test.com', rol: Rol.DEPORTISTA },
    process.env.JWT_SECRET!
  );

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
      const response = await request(app)
        .post('/api/cuotas/asignar')
        .send(cuotaData);

      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es Administrativo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);

      const response = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${deportistaToken}`)
        .send(cuotaData);

      expect(response.status).toBe(403);
    });

    it('deberia retornar 400 si faltan campos', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ deportistaId: 1 });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 404 si el deportista no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cuotaData);

      expect(response.status).toBe(404);
    });

    it('deberia retornar 409 si la cuota ya existe (mismo deportista, mes, año y disciplina)', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.cuota.findFirst as jest.Mock).mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cuotaData);

      expect(response.status).toBe(409);
    });

    it('permite crear cuota del mismo mes en otro año (no debe bloquear)', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.cuota.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.cuota.create as jest.Mock).mockResolvedValue({
        id: 1,
        nroCuota: 3,
        anio: 2024,
        monto: 5000,
        estadoCuota: EstadoCuota.PENDIENTE,
        disciplina: { nombre: 'Futbol' },
        deportista: { nombre: 'Juan' },
      });

      // Marzo 2024
      const res2024 = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          deportistaId: 1,
          nroCuota: 3,
          monto: 5000,
          fechaEmision: '2024-03-01',
          fechaVencimiento: '2024-03-31',
          disciplinaId: 1,
        });

      expect(res2024.status).toBe(201);

      // Marzo 2025 (mismo mes, otro año) — no debe bloquear
      (mockPrisma.cuota.create as jest.Mock).mockResolvedValue({
        id: 2,
        nroCuota: 3,
        anio: 2025,
        monto: 5000,
        estadoCuota: EstadoCuota.PENDIENTE,
        disciplina: { nombre: 'Futbol' },
        deportista: { nombre: 'Juan' },
      });

      const res2025 = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          deportistaId: 1,
          nroCuota: 3,
          monto: 5000,
          fechaEmision: '2025-03-01',
          fechaVencimiento: '2025-03-31',
          disciplinaId: 1,
        });

      expect(res2025.status).toBe(201);
      expect(mockPrisma.cuota.findFirst).toHaveBeenCalledTimes(2);
      // Verificar que findFirst se llamó con anio correcto en cada caso
      const findFirstCalls = (mockPrisma.cuota.findFirst as jest.Mock).mock.calls;
      expect(findFirstCalls[0][0].where.anio).toBe(2024);
      expect(findFirstCalls[1][0].where.anio).toBe(2025);
    });

    it('deberia retornar 201 al asignar cuota', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.cuota.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.cuota.create as jest.Mock).mockResolvedValue({
        id: 1,
        nroCuota: 1,
        monto: 5000,
        estadoCuota: EstadoCuota.PENDIENTE,
        disciplina: { nombre: 'Futbol' },
        deportista: { nombre: 'Juan' },
      });

      const response = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(cuotaData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/cuotas/predefinidas', () => {
    it('deberia retornar lista de cuotas predefinidas', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.disciplina.findMany as jest.Mock).mockResolvedValue([
        { id: 1, nombre: 'Futbol', precioMensual: 5000 },
        { id: 2, nombre: 'Basquet', precioMensual: 4500 },
      ]);

      const response = await request(app)
        .get('/api/cuotas/predefinidas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/cuotas/:id', () => {
    it('deberia retornar cuota por ID', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.cuota.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nroCuota: 1,
        monto: 5000,
        estadoCuota: EstadoCuota.PENDIENTE,
        disciplina: { nombre: 'Futbol' },
        deportista: { nombre: 'Juan' },
        pagos: [],
      });

      const response = await request(app)
        .get('/api/cuotas/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.nroCuota).toBe(1);
    });

    it('deberia retornar 404 si no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.cuota.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/cuotas/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/cuotas/:id', () => {
    it('deberia actualizar monto de cuota', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.cuota.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nroCuota: 1,
        monto: 5000,
      });
      (mockPrisma.cuota.update as jest.Mock).mockResolvedValue({
        id: 1,
        nroCuota: 1,
        monto: 6000,
        disciplina: { nombre: 'Futbol' },
        deportista: { nombre: 'Juan' },
      });

      const response = await request(app)
        .put('/api/cuotas/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ monto: 6000 });

      expect(response.status).toBe(200);
    });

    it('deberia retornar 400 si monto es negativo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .put('/api/cuotas/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ monto: -100 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/cuotas/mi-estado', () => {
    it('deberia retornar estado de cuenta del deportista logueado', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
        cuentaId: 2,
      });
      (mockPrisma.cuota.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          nroCuota: 1,
          monto: 5000,
          estadoCuota: EstadoCuota.PAGADA,
          pagos: [{ fechaPago: new Date(), medioPago: 'Mercado Pago' }],
        },
        {
          id: 2,
          nroCuota: 2,
          monto: 5000,
          estadoCuota: EstadoCuota.PENDIENTE,
          fechaVencimiento: new Date(),
          pagos: [],
        },
      ]);

      const response = await request(app)
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
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.cuota.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          nroCuota: 1,
          monto: 5000,
          estadoCuota: EstadoCuota.PENDIENTE,
          disciplina: { nombre: 'Futbol' },
          pagos: [],
        },
      ]);
      (mockPrisma.cuota.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/cuotas/deportista/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
    });
  });

  describe('GET /api/cuotas/estado-cuenta/:deportistaId', () => {
    it('deberia retornar 401 sin token', async () => {
      const response = await request(app).get('/api/cuotas/estado-cuenta/1');
      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es administrativo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);

      const response = await request(app)
        .get('/api/cuotas/estado-cuenta/1')
        .set('Authorization', `Bearer ${deportistaToken}`);

      expect(response.status).toBe(403);
    });

    it('deberia retornar estado de cuenta de un deportista', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
      });
      (mockPrisma.cuota.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          nroCuota: 1,
          monto: 5000,
          estadoCuota: EstadoCuota.PAGADA,
          fechaVencimiento: new Date(),
          pagos: [{ fechaPago: new Date(), medioPago: 'Mercado Pago' }],
        },
        {
          id: 2,
          nroCuota: 2,
          monto: 5000,
          estadoCuota: EstadoCuota.PENDIENTE,
          fechaVencimiento: new Date(),
          pagos: [],
        },
        {
          id: 3,
          nroCuota: 3,
          monto: 5000,
          estadoCuota: EstadoCuota.VENCIDA,
          fechaVencimiento: new Date(Date.now() - 86400000),
          pagos: [],
        },
      ]);

      const response = await request(app)
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
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/cuotas/estado-cuenta/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
