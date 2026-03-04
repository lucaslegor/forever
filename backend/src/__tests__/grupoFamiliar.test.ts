import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { Rol } from '@prisma/client';

// Mock prisma
jest.mock('../config/prisma', () => {
  const mockPrisma = {
    cuentaUsuario: {
      findUnique: jest.fn(),
    },
    deportista: {
      findMany: jest.fn(),
    },
    grupoFamiliar: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    grupoFamiliarIntegrante: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  return { __esModule: true, default: mockPrisma, prisma: mockPrisma };
});

import prisma from '../config/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Grupo Familiar Module', () => {
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

  describe('POST /api/grupos-familiares', () => {
    const grupoData = {
      nombre: 'Familia Perez',
      titularDni: '12345678',
      integrantes: [
        { deportistaId: 1, esPrincipal: true },
        { deportistaId: 2, esPrincipal: false },
      ],
    };

    it('deberia retornar 401 sin token', async () => {
      const response = await request(app)
        .post('/api/grupos-familiares')
        .send(grupoData);

      expect(response.status).toBe(401);
    });

    it('deberia retornar 403 si no es Administrativo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(deportistaUser);

      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${deportistaToken}`)
        .send(grupoData);

      expect(response.status).toBe(403);
    });

    it('deberia retornar 400 si faltan integrantes', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Familia Perez' });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 400 si hay menos de 2 integrantes', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Familia Perez',
          integrantes: [{ deportistaId: 1, esPrincipal: true }],
        });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 400 si no hay integrante principal', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);

      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Familia Perez',
          integrantes: [
            { deportistaId: 1, esPrincipal: false },
            { deportistaId: 2, esPrincipal: false },
          ],
        });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 404 si algun deportista no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findMany as jest.Mock).mockResolvedValue([{ id: 1 }]);

      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(grupoData);

      expect(response.status).toBe(404);
    });

    it('deberia retornar 201 al crear grupo familiar', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findMany as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);
      (mockPrisma.grupoFamiliar.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.grupoFamiliar.create as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Familia Perez',
        integrantes: [
          { deportistaId: 1, esPrincipal: true, deportista: { nombre: 'Juan' } },
          { deportistaId: 2, esPrincipal: false, deportista: { nombre: 'Pedro' } },
        ],
      });

      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(grupoData);

      expect(response.status).toBe(201);
      expect(response.body.data.nombre).toBe('Familia Perez');
    });

    it('deberia retornar 409 si el grupo ya existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.deportista.findMany as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);
      (mockPrisma.grupoFamiliar.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          integrantes: [{ deportistaId: 1 }, { deportistaId: 2 }],
        },
      ]);

      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(grupoData);

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/grupos-familiares', () => {
    it('deberia retornar lista de grupos familiares', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.grupoFamiliar.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          nombre: 'Familia Perez',
          integrantes: [
            { deportista: { nombre: 'Juan' } },
            { deportista: { nombre: 'Pedro' } },
          ],
        },
      ]);
      (mockPrisma.grupoFamiliar.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/grupos-familiares')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(1);
    });
  });

  describe('GET /api/grupos-familiares/:id', () => {
    it('deberia retornar grupo familiar por ID', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.grupoFamiliar.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Familia Perez',
        integrantes: [
          { deportista: { nombre: 'Juan', disciplina: { nombre: 'Futbol' } } },
        ],
      });

      const response = await request(app)
        .get('/api/grupos-familiares/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.nombre).toBe('Familia Perez');
    });

    it('deberia retornar 404 si no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.grupoFamiliar.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/grupos-familiares/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/grupos-familiares/:id', () => {
    it('deberia actualizar nombre del grupo', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.grupoFamiliar.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 1,
          nombre: 'Familia Perez',
        })
        .mockResolvedValueOnce({
          id: 1,
          nombre: 'Familia Garcia',
          integrantes: [],
        });

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (callback: any) => {
        return callback({
          grupoFamiliar: { update: jest.fn().mockResolvedValue({}) },
          grupoFamiliarIntegrante: { deleteMany: jest.fn(), create: jest.fn() },
        });
      });

      const response = await request(app)
        .put('/api/grupos-familiares/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nombre: 'Familia Garcia' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/grupos-familiares/:id', () => {
    it('deberia eliminar grupo familiar', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.grupoFamiliar.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        nombre: 'Familia Perez',
      });
      (mockPrisma.grupoFamiliar.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete('/api/grupos-familiares/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.message).toContain('eliminado');
    });

    it('deberia retornar 404 si no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(adminUser);
      (mockPrisma.grupoFamiliar.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/grupos-familiares/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
