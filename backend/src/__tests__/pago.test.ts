import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { Rol, EstadoCuota, EstadoPago } from '@prisma/client';

// Mock mercadopago service (no llamar a la API en tests)
jest.mock('../services/mercadopago.service', () => ({
  crearPreferenciaPago: jest.fn().mockResolvedValue({
    initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=test',
    preferenceId: 'test-pref-id',
  }),
  getPaymentById: jest.fn().mockImplementation((id: string) =>
    id === 'MP_INEXISTENTE' ? Promise.resolve(null) : Promise.resolve({ external_reference: '1', status: 'approved' })
  ),
}));

// Mock prisma
jest.mock('../config/prisma', () => {
  const mockPrisma = {
    cuentaUsuario: {
      findUnique: jest.fn(),
    },
    deportista: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cuota: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    pago: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});

import prisma from '../config/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Pago Module', () => {
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

  describe('POST /api/pagos/crear', () => {
    const pagoData = {
      cuotaId: 1,
      medioPago: 'Mercado Pago',
    };

    it('deberia retornar 401 sin token', async () => {
      const response = await request(app)
        .post('/api/pagos/crear')
        .send(pagoData);

      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es Deportista', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/pagos/crear')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(pagoData);

      expect(response.status).toBe(403);
    });

    it('deberia retornar 400 si falta cuotaId', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);

      const response = await request(app)
        .post('/api/pagos/crear')
        .set('Authorization', `Bearer ${deportistaToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('deberia retornar 404 si la cuota no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        cuentaId: 2,
      });
      (mockPrisma.cuota.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/pagos/crear')
        .set('Authorization', `Bearer ${deportistaToken}`)
        .send(pagoData);

      expect(response.status).toBe(404);
    });

    it('deberia retornar 400 si la cuota ya esta pagada', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        cuentaId: 2,
      });
      (mockPrisma.cuota.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        deportistaId: 1,
        estadoCuota: EstadoCuota.PAGADA,
      });

      const response = await request(app)
        .post('/api/pagos/crear')
        .set('Authorization', `Bearer ${deportistaToken}`)
        .send(pagoData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('pagada');
    });

    it('deberia retornar 201 al crear pago', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        cuentaId: 2,
      });
      (mockPrisma.cuota.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        deportistaId: 1,
        monto: 5000,
        estadoCuota: EstadoCuota.PENDIENTE,
        deportista: { id: 1 },
        disciplina: { nombre: 'Futbol' },
      });
      (mockPrisma.cuota.findFirst as jest.Mock).mockResolvedValue(null);
      (mockPrisma.pago.create as jest.Mock).mockResolvedValue({
        id: 1,
        fechaPago: new Date(),
        monto: 5000,
        estadoPago: EstadoPago.PENDIENTE,
        medioPago: 'Mercado Pago',
        cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
      });

      const response = await request(app)
        .post('/api/pagos/crear')
        .set('Authorization', `Bearer ${deportistaToken}`)
        .send(pagoData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pago');
      expect(response.body.data).toHaveProperty('initPoint');
    });
  });

  describe('POST /api/pagos/webhook', () => {
    it('deberia responder 200 cuando no existe el pago', async () => {
      // Cuando el pago no existe, el webhook simplemente responde OK sin hacer nada
      (mockPrisma.pago.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/pagos/webhook')
        .send({
          type: 'payment',
          data: { id: 'MP_INEXISTENTE' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.received).toBe(true);
    });

    it('deberia responder 200 para otros tipos de webhook', async () => {
      const response = await request(app)
        .post('/api/pagos/webhook')
        .send({
          type: 'other_event',
          data: { id: '123' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.received).toBe(true);
    });
  });

  describe('GET /api/pagos/:id', () => {
    it('deberia retornar pago por ID', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.pago.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        fechaPago: new Date(),
        monto: 5000,
        estadoPago: EstadoPago.APROBADO,
        cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
        deportista: { nombre: 'Juan' },
      });

      const response = await request(app)
        .get('/api/pagos/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.monto).toBe(5000);
    });

    it('deberia retornar 404 si no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.pago.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/pagos/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/pagos/mis-pagos', () => {
    it('deberia retornar pagos del deportista logueado', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        cuentaId: 2,
      });
      (mockPrisma.pago.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          fechaPago: new Date(),
          monto: 5000,
          estadoPago: EstadoPago.APROBADO,
          cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
        },
      ]);
      (mockPrisma.pago.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/pagos/mis-pagos')
        .set('Authorization', `Bearer ${deportistaToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
    });
  });

  describe('GET /api/pagos/deportista/:deportistaId', () => {
    it('deberia retornar 401 sin token', async () => {
      const response = await request(app).get('/api/pagos/deportista/1');
      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es administrativo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);

      const response = await request(app)
        .get('/api/pagos/deportista/1')
        .set('Authorization', `Bearer ${deportistaToken}`);

      expect(response.status).toBe(403);
    });

    it('deberia retornar pagos de un deportista', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.pago.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          fechaPago: new Date(),
          monto: 5000,
          estadoPago: EstadoPago.APROBADO,
          medioPago: 'Mercado Pago',
          cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
        },
        {
          id: 2,
          fechaPago: new Date(),
          monto: 4500,
          estadoPago: EstadoPago.PENDIENTE,
          medioPago: 'Efectivo',
          cuota: { nroCuota: 2, disciplina: { nombre: 'Futbol' } },
        },
      ]);
      (mockPrisma.pago.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/pagos/deportista/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
    });

    it('deberia filtrar pagos por estado', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.pago.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          fechaPago: new Date(),
          monto: 5000,
          estadoPago: EstadoPago.APROBADO,
          cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
        },
      ]);
      (mockPrisma.pago.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/pagos/deportista/1?estado=APROBADO')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
    });
  });

  describe('POST /api/pagos/:id/confirmar', () => {
    it('deberia confirmar pago manualmente', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.pago.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 1,
          cuotaId: 1,
          deportistaId: 1,
          cuota: { id: 1 },
        })
        .mockResolvedValueOnce({
          id: 1,
          estadoPago: EstadoPago.APROBADO,
          cuota: { disciplina: { nombre: 'Futbol' } },
          deportista: { nombre: 'Juan' },
        });

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback({
          pago: { update: jest.fn().mockResolvedValue({}) },
          cuota: { update: jest.fn().mockResolvedValue({}), count: jest.fn().mockResolvedValue(0) },
          deportista: { update: jest.fn().mockResolvedValue({}) },
        });
      });

      const response = await request(app)
        .post('/api/pagos/1/confirmar')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ mercadoPagoId: 'MP123', status: 'approved' });

      expect(response.status).toBe(200);
    });
  });
});
