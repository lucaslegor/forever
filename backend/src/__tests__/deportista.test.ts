import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { Rol, EstadoDeportista, EstadoCuota } from '@prisma/client';

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

import prisma from '../config/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Deportista Module', () => {
  const adminUser = {
    id: 1,
    email: 'admin@test.com',
    password: 'hashed',
    rol: Rol.ADMINISTRATIVO,
    activo: true,
    intentosFallidos: 0,
    bloqueadoHasta: null,
  };

  const deportistaUser = {
    id: 2,
    email: 'deportista@test.com',
    password: 'hashed',
    rol: Rol.DEPORTISTA,
    activo: true,
    intentosFallidos: 0,
    bloqueadoHasta: null,
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

  describe('POST /api/deportistas', () => {
    const deportistaData = {
      nombre: 'Juan',
      apellido: 'Perez',
      dni: '12345678',
      fechaNac: '2000-01-15',
      generoId: 1,
      categoriaId: 1,
      disciplinaId: 1,
      email: 'juan@test.com',
      password: 'Password123',
    };

    it('deberia retornar 401 sin token', async () => {
      const response = await request(app)
        .post('/api/deportistas')
        .send(deportistaData);

      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es Administrativo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);

      const response = await request(app)
        .post('/api/deportistas')
        .set('Authorization', `Bearer ${deportistaToken}`)
        .send(deportistaData);

      expect(response.status).toBe(403);
    });

    it('deberia retornar 400 si faltan campos', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/deportistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Juan' });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 400 si el DNI es invalido', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/deportistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...deportistaData, dni: '123' });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 400 si la contrasena no tiene mayuscula', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/deportistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...deportistaData, password: 'password123' });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 201 y crear deportista exitosamente', async () => {
      // Mock findUnique for correct routing
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockImplementation((args) => {
        if (args.where.email === deportistaData.email) return Promise.resolve(null); // Check email unique
        if (args.where.id === 1) return Promise.resolve(adminUser); // Admin
        return Promise.resolve(null);
      });
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue(null); // DNI no existe

      // Mock transaction
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockPrisma));

      const createdDeportista = {
        id: 1,
        ...deportistaData,
        fechaNac: new Date(deportistaData.fechaNac),
        cuentaId: 3,
        estado: EstadoDeportista.AL_DIA,
        createdAt: new Date(),
        updatedAt: new Date(),
        disciplina: { nombre: 'Futbol' },
        cuenta: { email: deportistaData.email, rol: Rol.DEPORTISTA, activo: true, createdAt: new Date() },
      };

      (mockPrisma.cuentaUsuario.create as jest.Mock).mockResolvedValue({ id: 3, email: deportistaData.email, rol: Rol.DEPORTISTA });
      (mockPrisma.deportista.create as jest.Mock).mockResolvedValue(createdDeportista);
      (mockPrisma.deportista.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // Check DNI
        .mockResolvedValueOnce(createdDeportista); // Return created

      const response = await request(app)
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
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const existingDeportista = {
        id: 1,
        nombre: 'Juan',
      };

      (mockPrisma.deportista.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingDeportista) // Check existence
        .mockResolvedValueOnce({ ...existingDeportista, ...updateData, disciplina: {}, cuenta: {} }); // Return updated

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockPrisma));
      (mockPrisma.deportista.update as jest.Mock).mockResolvedValue({ ...existingDeportista, ...updateData });

      const response = await request(app)
        .put('/api/deportistas/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe(updateData.nombre);
    });

    it('deberia retornar 404 si el deportista no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/deportistas/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });

  });

  describe('GET /api/deportistas', () => {
    it('deberia retornar 200 con lista de deportistas', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Perez',
          dni: '12345678',
          estado: EstadoDeportista.AL_DIA,
          disciplina: { nombre: 'Futbol' },
          cuenta: { email: 'juan@test.com', activo: true },
        },
      ]);
      (mockPrisma.deportista.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/deportistas')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(1);
    });
  });

  describe('GET /api/deportistas/:id', () => {
    it('deberia retornar 200 con deportista', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
        dni: '12345678',
        disciplina: { nombre: 'Futbol' },
        cuenta: { email: 'juan@test.com' },
      });

      const response = await request(app)
        .get('/api/deportistas/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.nombre).toBe('Juan');
    });

    it('deberia retornar 404 si no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/deportistas/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/deportistas/pagos-pendientes', () => {
    it('deberia retornar deportistas con pagos pendientes', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          nombre: 'Juan',
          apellido: 'Perez',
          dni: '12345678',
          cuotas: [
            { monto: 1000, fechaVencimiento: new Date(), estadoCuota: EstadoCuota.PENDIENTE },
            { monto: 1000, fechaVencimiento: new Date(), estadoCuota: EstadoCuota.VENCIDA },
          ],
        },
      ]);

      const response = await request(app)
        .get('/api/deportistas/pagos-pendientes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].cantidadCuotasPendientes).toBe(2);
      expect(response.body.data[0].montoTotalAdeudado).toBe(2000);
    });
  });

  describe('DELETE /api/deportistas/:id', () => {
    it('deberia retornar 200 al dar de baja (desactivar cuenta)', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        cuentaId: 2,
        cuenta: {},
      });
      (mockPrisma.cuentaUsuario.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
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
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        apellido: 'Perez',
        cuentaId: 2,
        disciplina: { nombre: 'Futbol' },
      });

      const response = await request(app)
        .get('/api/deportistas/mi-perfil')
        .set('Authorization', `Bearer ${deportistaToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.nombre).toBe('Juan');
    });
  });

  describe('GET /api/deportistas/mi-historial', () => {
    it('deberia retornar 401 sin token', async () => {
      const response = await request(app).get('/api/deportistas/mi-historial');
      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es deportista', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .get('/api/deportistas/mi-historial')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
    });

    it('deberia retornar historial del deportista logueado', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Juan',
        cuentaId: 2,
      });
      (mockPrisma.pago.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          fechaPago: new Date(),
          monto: 5000,
          estadoPago: 'APROBADO',
          cuota: { nroCuota: 1, disciplina: { nombre: 'Futbol' } },
        },
      ]);

      const response = await request(app)
        .get('/api/deportistas/mi-historial')
        .set('Authorization', `Bearer ${deportistaToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/deportistas/:id/historial', () => {
    it('deberia retornar 401 sin token', async () => {
      const response = await request(app).get('/api/deportistas/1/historial');
      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es administrativo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);

      const response = await request(app)
        .get('/api/deportistas/1/historial')
        .set('Authorization', `Bearer ${deportistaToken}`);

      expect(response.status).toBe(403);
    });

    it('deberia retornar historial de pagos de un deportista', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Juan',
      });
      (mockPrisma.pago.findMany as jest.Mock).mockResolvedValue([
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

      const response = await request(app)
        .get('/api/deportistas/1/historial')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('deberia retornar 404 si el deportista no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/deportistas/999/historial')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});

