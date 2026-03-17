import request from 'supertest';
import app from '../app';

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

import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { Rol } from '@prisma/client';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

/** Payload mínimo para pasar validación de login (CAPTCHA requerido en schema). */
const loginCaptcha = { captchaToken: 'test-token' };

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('deberia retornar 400 si el email no es valido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, email: 'invalid-email', password: 'Password123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Error de validacion');
    });

    it('deberia retornar 400 si la contrasena es muy corta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, email: 'test@example.com', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('deberia retornar 400 si falta email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, password: 'Password123' });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 400 si falta contrasena', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, email: 'test@example.com' });

      expect(response.status).toBe(400);
    });

    it('deberia retornar 401 si el usuario no existe', async () => {
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, email: 'noexiste@example.com', password: 'Password123' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Email o contrasena incorrectos');
    });

    it('deberia retornar 403 si el usuario esta inactivo', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        rol: Rol.ADMIN,
        activo: false,
        intentosFallidos: 0,
        bloqueadoHasta: null,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password123' });

      expect(response.status).toBe(403);
    });

    it('deberia retornar 403 si el usuario esta bloqueado', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        rol: Rol.ADMIN,
        activo: true,
        intentosFallidos: 5,
        bloqueadoHasta: new Date(Date.now() + 60000),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, email: 'test@example.com', password: 'Password123' });

      expect(response.status).toBe(403);
    });

    it('deberia retornar 200 con token si las credenciales son correctas', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        rol: Rol.ADMIN,
        activo: true,
        intentosFallidos: 0,
        bloqueadoHasta: null,
        administrativo: { nombre: 'Admin', apellido: 'Test' },
        deportista: null,
      });
      (mockPrisma.cuentaUsuario.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, email: 'test@example.com', password: 'Password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('deberia hacer login por DNI de administrativo con formato con puntos', async () => {
      const hashedPassword = await bcrypt.hash('AdminPass123', 10);
      const cuentaAdmin = {
        id: 2,
        email: '30123456@admin.forever',
        password: hashedPassword,
        rol: Rol.ADMINISTRATIVO,
        activo: true,
        intentosFallidos: 0,
        bloqueadoHasta: null,
        deportista: null,
        administrativo: { nombre: 'Juan', apellido: 'Admin' },
      };
      (mockPrisma.cuentaUsuario.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.deportista.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.administrativo.findUnique as jest.Mock).mockResolvedValue({
        dni: '30123456',
        cuentaId: 2,
        cuenta: cuentaAdmin,
      });
      (mockPrisma.cuentaUsuario.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...loginCaptcha, email: '30.123.456', password: 'AdminPass123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('30123456@admin.forever');
      expect(mockPrisma.administrativo.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { dni: '30123456' } })
      );
    });
  });

  describe('GET /api/auth/me', () => {
    it('deberia retornar 401 si no hay token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('deberia retornar 403 con token invalido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });
  });
});
