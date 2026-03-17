import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../app';
import {
  prismaTest,
  cleanDatabase,
  seedTestData,
  connectDatabase,
  disconnectDatabase,
  testData,
} from './setup.integration';
import { Rol, EstadoCuota } from '@prisma/client';

/**
 * TESTS DE INTEGRACIÓN - Base de Datos Real
 *
 * ADVERTENCIA: Estos tests modifican la base de datos real.
 * Asegurate de usar una base de datos de desarrollo/test.
 *
 * Para ejecutar solo estos tests:
 * npm test -- --testPathPatterns=integration
 */

describe('Tests de Integración - Base de Datos Real', () => {
  let disciplinaId: number;
  let generoId: number;
  let categoriaId: number;
  let deportistaToken: string;
  let deportistaId: number;

  // Conectar y limpiar antes de todos los tests
  beforeAll(async () => {
    await connectDatabase();
    await cleanDatabase();
    const seedData = await seedTestData();
    disciplinaId = seedData.disciplina.id;
    generoId = seedData.genero.id;
    categoriaId = seedData.categoria.id;
  });

  // Limpiar y desconectar después de todos los tests
  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
  });

  // ============================================================
  // TEST 1: Crear usuario Admin directamente en BD
  // ============================================================
  describe('1. Crear Admin en Base de Datos', () => {
    it('deberia crear un usuario admin directamente en la BD', async () => {
      const hashedPassword = await bcrypt.hash(testData.admin.password, 10);

      // Crear cuenta de usuario
      const cuenta = await prismaTest.cuentaUsuario.create({
        data: {
          email: testData.admin.email,
          password: hashedPassword,
          rol: Rol.ADMIN,
          activo: true,
        },
      });

      // Crear administrativo asociado
      await prismaTest.administrativo.create({
        data: {
          nombre: testData.admin.nombre,
          apellido: testData.admin.apellido,
          dni: testData.admin.dni,
          cuentaId: cuenta.id,
        },
      });

      _adminCuentaId = cuenta.id;

      // Verificar que se creó correctamente
      const adminCreado = await prismaTest.cuentaUsuario.findUnique({
        where: { id: cuenta.id },
        include: { administrativo: true },
      });

      expect(adminCreado).not.toBeNull();
      expect(adminCreado?.email).toBe(testData.admin.email);
      expect(adminCreado?.rol).toBe(Rol.ADMIN);
      expect(adminCreado?.administrativo?.nombre).toBe(testData.admin.nombre);

      console.log('✅ Admin creado en BD:', adminCreado?.email);
    });
  });

  // ============================================================
  // TEST 2: Login del Admin via API
  // ============================================================
  describe('2. Login Admin via API', () => {
    it('deberia hacer login y obtener token JWT', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password,
          captchaToken: 'test-token',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(testData.admin.email);

      _adminToken = response.body.data.token;

      console.log('✅ Login exitoso, token obtenido');
    });

    it('deberia rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.admin.email,
          password: 'ContraseñaIncorrecta123!',
          captchaToken: 'test-token',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      console.log('✅ Login rechazado correctamente con contraseña incorrecta');
    });
  });

  // ============================================================
  // TEST 3: Crear Disciplina via API
  // ============================================================
  describe('3. Crear Disciplina via API', () => {
    it('deberia crear una nueva disciplina', async () => {
      // Primero creamos un administrativo para poder crear disciplinas
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const cuentaAdmin = await prismaTest.cuentaUsuario.create({
        data: {
          email: 'admin2.test@forever.com',
          password: hashedPassword,
          rol: Rol.ADMINISTRATIVO,
          activo: true,
        },
      });
      await prismaTest.administrativo.create({
        data: {
          nombre: 'Admin2',
          apellido: 'Test',
          dni: '77777777',
          cuentaId: cuentaAdmin.id,
        },
      });

      // Login como administrativo
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });

      const adminToken2 = loginRes.body.data.token;

      const response = await request(app)
        .post('/api/disciplinas')
        .set('Authorization', `Bearer ${adminToken2}`)
        .send({
          nombre: 'Basquet Test',
          precioMensual: 4500,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.nombre).toBe('Basquet Test');
      expect(response.body.data.precioMensual).toBe('4500');

      // Verificar en la BD
      const disciplinaEnBD = await prismaTest.disciplina.findUnique({
        where: { nombre: 'Basquet Test' },
      });
      expect(disciplinaEnBD).not.toBeNull();

      console.log('✅ Disciplina creada via API:', response.body.data.nombre);
    });
  });

  // ============================================================
  // TEST 4: Crear Deportista via API
  // ============================================================
  describe('4. Crear Deportista via API', () => {
    it('deberia crear un deportista completo', async () => {
      // Login como administrativo
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });

      const token = loginRes.body.data.token;

      const response = await request(app)
        .post('/api/deportistas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: testData.deportista.nombre,
          apellido: testData.deportista.apellido,
          dni: testData.deportista.dni,
          fechaNac: '2000-01-15',
          email: testData.deportista.email,
          password: testData.deportista.password,
          disciplinaId: disciplinaId,
          generoId,
          categoriaId,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.nombre).toBe(testData.deportista.nombre);
      expect(response.body.data.dni).toBe(testData.deportista.dni);

      deportistaId = response.body.data.id;

      // Verificar en la BD
      const deportistaEnBD = await prismaTest.deportista.findUnique({
        where: { id: deportistaId },
        include: { cuenta: true, disciplina: true },
      });

      expect(deportistaEnBD).not.toBeNull();
      expect(deportistaEnBD?.cuenta.email).toBe(testData.deportista.email);
      expect(deportistaEnBD?.disciplina.nombre).toBe('Futbol Test');

      _deportistaCuentaId = deportistaEnBD!.cuentaId;

      console.log('✅ Deportista creado via API:', deportistaEnBD?.nombre, deportistaEnBD?.apellido);
    });
  });

  // ============================================================
  // TEST 5: Login del Deportista
  // ============================================================
  describe('5. Login Deportista', () => {
    it('deberia hacer login como deportista', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testData.deportista.email,
          password: testData.deportista.password,
          captchaToken: 'test-token',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.rol).toBe(Rol.DEPORTISTA);

      deportistaToken = response.body.data.token;

      console.log('✅ Login deportista exitoso');
    });
  });

  // ============================================================
  // TEST 6: Asignar Cuota al Deportista
  // ============================================================
  describe('6. Asignar Cuota', () => {
    it('deberia asignar una cuota al deportista', async () => {
      // Login como administrativo
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });

      const token = loginRes.body.data.token;

      const fechaEmision = new Date();
      const fechaVencimiento = new Date();
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

      const response = await request(app)
        .post('/api/cuotas/asignar')
        .set('Authorization', `Bearer ${token}`)
        .send({
          deportistaId: deportistaId,
          nroCuota: 1,
          monto: 5000,
          fechaEmision: fechaEmision.toISOString(),
          fechaVencimiento: fechaVencimiento.toISOString(),
          disciplinaId: disciplinaId,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.nroCuota).toBe(1);
      expect(response.body.data.monto).toBe('5000');

      // Verificar en la BD
      const cuotaEnBD = await prismaTest.cuota.findFirst({
        where: { deportistaId: deportistaId, nroCuota: 1 },
      });

      expect(cuotaEnBD).not.toBeNull();
      expect(cuotaEnBD?.estadoCuota).toBe(EstadoCuota.PENDIENTE);

      console.log('✅ Cuota asignada:', cuotaEnBD?.nroCuota, '- Monto:', cuotaEnBD?.monto.toString());
    });
  });

  // ============================================================
  // TEST 7: Deportista consulta su estado de cuenta
  // ============================================================
  describe('7. Consultar Estado de Cuenta', () => {
    it('deportista deberia ver su estado de cuenta', async () => {
      const response = await request(app)
        .get('/api/cuotas/mi-estado')
        .set('Authorization', `Bearer ${deportistaToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.cuotasPendientes.length).toBeGreaterThan(0);
      expect(response.body.data.totalAdeudado).toBe(5000);

      console.log('✅ Estado de cuenta consultado - Deuda:', response.body.data.totalAdeudado);
    });
  });

  // ============================================================
  // TEST 8: Listar Deportistas (Admin)
  // ============================================================
  describe('8. Listar Deportistas', () => {
    it('admin deberia poder listar deportistas', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });

      const token = loginRes.body.data.token;

      const response = await request(app)
        .get('/api/deportistas')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBeGreaterThan(0);

      const deportistaEnLista = response.body.data.data.find(
        (d: any) => d.dni === testData.deportista.dni
      );
      expect(deportistaEnLista).toBeDefined();

      console.log('✅ Deportistas listados:', response.body.data.total);
    });
  });

  // ============================================================
  // TEST 9: Crear Grupo Familiar
  // ============================================================
  describe('9. Crear Grupo Familiar', () => {
    it('deberia crear un grupo familiar con 2 deportistas', async () => {
      // Crear segundo deportista
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });

      const token = loginRes.body.data.token;

      // Crear segundo deportista
      const depRes = await request(app)
        .post('/api/deportistas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Maria',
          apellido: 'Perez',
          dni: '66666666',
          fechaNac: '2005-05-20',
          email: 'maria.test@forever.com',
          password: 'Maria123!',
          disciplinaId: disciplinaId,
          generoId,
          categoriaId,
        });

      const deportista2Id = depRes.body.data.id;

      // Crear grupo familiar
      const response = await request(app)
        .post('/api/grupos-familiares')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Familia Perez Test',
          titularDni: '12345678',
          integrantes: [
            { deportistaId: deportistaId, esPrincipal: true },
            { deportistaId: deportista2Id, esPrincipal: false },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.nombre).toBe('Familia Perez Test');
      expect(response.body.data.integrantes.length).toBe(2);

      // Verificar en la BD
      const grupoEnBD = await prismaTest.grupoFamiliar.findFirst({
        where: { nombre: 'Familia Perez Test' },
        include: { integrantes: true },
      });

      expect(grupoEnBD).not.toBeNull();
      expect(grupoEnBD?.integrantes.length).toBe(2);

      console.log('✅ Grupo familiar creado:', grupoEnBD?.nombre);
    });
  });

  // ============================================================
  // TEST 10: Verificar Integridad de Datos
  // ============================================================
  describe('10. Verificar Integridad de Datos', () => {
    it('deberia verificar que todos los datos están correctamente relacionados', async () => {
      // Obtener deportista con todas sus relaciones
      const deportistaCompleto = await prismaTest.deportista.findUnique({
        where: { id: deportistaId },
        include: {
          cuenta: true,
          disciplina: true,
          cuotas: true,
          grupoFamiliar: { include: { grupo: true } },
        },
      });

      expect(deportistaCompleto).not.toBeNull();

      // Verificar relaciones
      expect(deportistaCompleto?.cuenta.email).toBe(testData.deportista.email);
      expect(deportistaCompleto?.disciplina.nombre).toBe('Futbol Test');
      expect(deportistaCompleto?.cuotas.length).toBeGreaterThan(0);
      expect(deportistaCompleto?.grupoFamiliar.length).toBeGreaterThan(0);

      console.log('✅ Integridad de datos verificada');
      console.log('   - Email:', deportistaCompleto?.cuenta.email);
      console.log('   - Disciplina:', deportistaCompleto?.disciplina.nombre);
      console.log('   - Cuotas:', deportistaCompleto?.cuotas.length);
      console.log('   - Grupos Familiares:', deportistaCompleto?.grupoFamiliar.length);
    });
  });
});
