import request from 'supertest';
import app from '../../app';
import { Rol } from '@prisma/client';

/**
 * TESTS DE INTEGRACIÓN - API con datos del Seed
 * 
 * Estos tests asumen que ya se ejecutó `npx prisma db seed`
 * Usan los datos del seed.ts para validar que la API funciona correctamente.
 * 
 * Para ejecutar: npm run test:integration
 */

describe('Tests de API con datos del Seed', () => {
    let adminToken: string;
    let deportistaToken: string;

    // Credenciales del seed (captchaToken requerido por el schema; en test el backend no verifica si secret vacío)
    const adminCredentials = {
        email: 'admin@club.com',
        password: 'Admin123',
        captchaToken: 'test-token',
    };

    const deportistaCredentials = {
        email: 'juan.perez@mail.com',
        password: 'Juan1234',
        captchaToken: 'test-token',
    };

    // ============================================================
    // AUTH: Login Tests
    // ============================================================
    describe('Auth - Login', () => {
        it('deberia hacer login como admin', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(adminCredentials);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.rol).toBe(Rol.ADMIN);

            adminToken = response.body.data.token;
            console.log('✅ Login admin exitoso');
        });

        it('deberia hacer login como deportista', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(deportistaCredentials);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.rol).toBe(Rol.DEPORTISTA);

            deportistaToken = response.body.data.token;
            console.log('✅ Login deportista exitoso');
        });

        it('deberia rechazar login con credenciales incorrectas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'admin@club.com', password: 'incorrecta', captchaToken: 'test-token' });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            console.log('✅ Login rechazado correctamente');
        });

        it('deberia rechazar acceso sin token', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.status).toBe(401);
            console.log('✅ Acceso sin token rechazado');
        });

        it('deberia obtener perfil con token válido', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe(adminCredentials.email);
            console.log('✅ Perfil obtenido correctamente');
        });
    });

    // ============================================================
    // DISCIPLINAS
    // ============================================================
    describe('Disciplinas', () => {
        it('deberia listar disciplinas (cualquier usuario autenticado)', async () => {
            const response = await request(app)
                .get('/api/disciplinas')
                .set('Authorization', `Bearer ${deportistaToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.length).toBeGreaterThanOrEqual(3); // Fútbol, Natación, Tenis

            const nombres = response.body.data.map((d: any) => d.nombre);
            expect(nombres).toContain('Fútbol');
            expect(nombres).toContain('Natación');
            expect(nombres).toContain('Tenis');

            console.log('✅ Disciplinas listadas:', response.body.data.length);
        });

        it('deberia crear disciplina (solo admin) o devolver 409 si ya existe', async () => {
            const response = await request(app)
                .post('/api/disciplinas')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nombre: 'Hockey Test',
                    precioMensual: 12000,
                });

            // Puede ser 201 (primera ejecución) o 409 (ya existe)
            expect([201, 409]).toContain(response.status);
            console.log('✅ Disciplina test:', response.status === 201 ? 'creada' : 'ya existía');
        });

        it('deportista NO deberia poder crear disciplina', async () => {
            const response = await request(app)
                .post('/api/disciplinas')
                .set('Authorization', `Bearer ${deportistaToken}`)
                .send({
                    nombre: 'Voley Test',
                    precioMensual: 10000,
                });

            expect(response.status).toBe(403);
            console.log('✅ Deportista no puede crear disciplinas (403)');
        });
    });

    // ============================================================
    // DEPORTISTAS
    // ============================================================
    describe('Deportistas', () => {
        it('admin deberia listar deportistas', async () => {
            const response = await request(app)
                .get('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(4);

            // Verificar que están los del seed
            const dnis = response.body.data.data.map((d: any) => d.dni);
            expect(dnis).toContain('40123456'); // Juan Pérez
            expect(dnis).toContain('41234567'); // María López
            expect(dnis).toContain('39876543'); // Pedro González

            console.log('✅ Deportistas listados:', response.body.data.total);
        });

        it('deportista deberia ver su propio perfil', async () => {
            const response = await request(app)
                .get('/api/deportistas/mi-perfil')
                .set('Authorization', `Bearer ${deportistaToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.nombre).toBe('Juan');
            expect(response.body.data.apellido).toBe('Pérez');
            console.log('✅ Perfil deportista obtenido');
        });

        it('deberia buscar deportista por DNI', async () => {
            const response = await request(app)
                .get('/api/deportistas?dni=40123456')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.data.length).toBe(1);
            expect(response.body.data.data[0].nombre).toBe('Juan');
            console.log('✅ Búsqueda por DNI funciona');
        });

    });

    // ============================================================
    // CUOTAS
    // ============================================================
    describe('Cuotas', () => {
        it('deportista deberia ver su estado de cuenta', async () => {
            const response = await request(app)
                .get('/api/cuotas/mi-estado')
                .set('Authorization', `Bearer ${deportistaToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('cuotasPagadas');
            expect(response.body.data).toHaveProperty('cuotasPendientes');
            expect(response.body.data).toHaveProperty('totalAdeudado');
            console.log('✅ Estado de cuenta obtenido - Adeuda:', response.body.data.totalAdeudado);
        });

        it('deberia obtener cuotas predefinidas', async () => {
            const response = await request(app)
                .get('/api/cuotas/predefinidas')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            console.log('✅ Cuotas predefinidas obtenidas');
        });

        it('admin deberia poder asignar cuota o devolver 409 si ya existe', async () => {
            // Obtener ID de un deportista
            const depResponse = await request(app)
                .get('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`);

            const deportista = depResponse.body.data.data.find((d: any) => d.dni === '41234567'); // María López

            const fechaEmision = new Date();
            const fechaVencimiento = new Date();
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);

            // Usar timestamp para número único de cuota
            const uniqueCuotaNum = Math.floor(Date.now() / 1000) % 10000;

            const response = await request(app)
                .post('/api/cuotas/asignar')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    deportistaId: deportista.id,
                    nroCuota: uniqueCuotaNum,
                    monto: 18000,
                    fechaEmision: fechaEmision.toISOString(),
                    fechaVencimiento: fechaVencimiento.toISOString(),
                    disciplinaId: deportista.disciplina.id,
                });

            // Puede ser 201 (creada) o 409 (ya existe)
            expect([201, 409]).toContain(response.status);
            console.log('✅ Cuota test:', response.status === 201 ? 'asignada' : 'ya existía');
        });

        it('deportista NO deberia poder asignar cuotas', async () => {
            const response = await request(app)
                .post('/api/cuotas/asignar')
                .set('Authorization', `Bearer ${deportistaToken}`)
                .send({
                    deportistaId: 1,
                    nroCuota: 100,
                    monto: 5000,
                    fechaEmision: new Date().toISOString(),
                    fechaVencimiento: new Date().toISOString(),
                    disciplinaId: 1,
                });

            expect(response.status).toBe(403);
            console.log('✅ Deportista no puede asignar cuotas (403)');
        });
    });

    // ============================================================
    // GRUPOS FAMILIARES
    // ============================================================
    describe('Grupos Familiares', () => {
        it('admin deberia listar grupos familiares', async () => {
            const response = await request(app)
                .get('/api/grupos-familiares')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            // El seed crea "Familia Pérez"
            const familiaPerez = response.body.data.find((g: any) => g.nombre === 'Familia Pérez');
            expect(familiaPerez).toBeDefined();
            console.log('✅ Grupos familiares listados');
        });

        it('deportista NO deberia poder listar grupos familiares', async () => {
            const response = await request(app)
                .get('/api/grupos-familiares')
                .set('Authorization', `Bearer ${deportistaToken}`);

            expect(response.status).toBe(403);
            console.log('✅ Deportista no puede listar grupos (403)');
        });
    });

    // ============================================================
    // PAGOS
    // ============================================================
    describe('Pagos', () => {
        it('deportista deberia ver sus propios pagos', async () => {
            const response = await request(app)
                .get('/api/pagos/mis-pagos')
                .set('Authorization', `Bearer ${deportistaToken}`);

            expect(response.status).toBe(200);
            console.log('✅ Deportista puede ver sus pagos');
        });

        it('admin deberia poder consultar pagos de un deportista', async () => {
            // Obtener ID de un deportista
            const depResponse = await request(app)
                .get('/api/deportistas')
                .set('Authorization', `Bearer ${adminToken}`);

            const deportistaId = depResponse.body.data.data[0].id;

            const response = await request(app)
                .get(`/api/pagos/deportista/${deportistaId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            console.log('✅ Admin puede consultar pagos de deportista');
        });
    });

    // ============================================================
    // USERS
    // ============================================================
    describe('Users', () => {
        it('admin deberia listar usuarios', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.data.length).toBeGreaterThanOrEqual(6); // Admin + secretaria + 4 deportistas
            console.log('✅ Usuarios listados:', response.body.data.total);
        });

        it('deportista NO deberia poder listar usuarios', async () => {
            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${deportistaToken}`);

            expect(response.status).toBe(403);
            console.log('✅ Deportista no puede listar usuarios (403)');
        });

        it('usuario deberia poder ver su perfil', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${deportistaToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.email).toBe(deportistaCredentials.email);
            console.log('✅ Perfil de usuario obtenido');
        });
    });

    // ============================================================
    // GENERACIÓN MENSUAL DE CUOTAS
    // ============================================================
    describe('Generación Mensual de Cuotas', () => {
        it('admin deberia poder generar cuotas mensuales', async () => {
            const now = new Date();
            const mesActual = now.getMonth() + 1;
            const anioActual = now.getFullYear();
            const response = await request(app)
                .post('/api/cuotas/generar-mensual')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    mes: mesActual,
                    anio: anioActual,
                });

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('cuotasGeneradas');
            expect(response.body.data).toHaveProperty('montoTotal');
            console.log('✅ Cuotas mensuales generadas:', response.body.data.cuotasGeneradas);
        });

        it('admin NO deberia poder generar cuotas de meses pasados', async () => {
            const now = new Date();
            const mesActual = now.getMonth() + 1;
            const anioActual = now.getFullYear();
            const mesPasado = mesActual === 1 ? 12 : mesActual - 1;
            const anioPasado = mesActual === 1 ? anioActual - 1 : anioActual;

            const response = await request(app)
                .post('/api/cuotas/generar-mensual')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    mes: mesPasado,
                    anio: anioPasado,
                });

            expect(response.status).toBe(409);
            console.log('✅ Mes pasado bloqueado (409)');
        });

        it('admin NO deberia poder generar cuotas de meses futuros', async () => {
            const now = new Date();
            const mesActual = now.getMonth() + 1;
            const anioActual = now.getFullYear();
            const mesFuturo = mesActual === 12 ? 1 : mesActual + 1;
            const anioFuturo = mesActual === 12 ? anioActual + 1 : anioActual;

            const response = await request(app)
                .post('/api/cuotas/generar-mensual')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    mes: mesFuturo,
                    anio: anioFuturo,
                });

            expect(response.status).toBe(409);
            console.log('✅ Mes futuro bloqueado (409)');
        });

        it('deportista NO deberia poder generar cuotas', async () => {
            const response = await request(app)
                .post('/api/cuotas/generar-mensual')
                .set('Authorization', `Bearer ${deportistaToken}`)
                .send({
                    mes: 12,
                    anio: 2026,
                });

            expect(response.status).toBe(403);
            console.log('✅ Deportista no puede generar cuotas (403)');
        });

        it('deberia validar mes y anio', async () => {
            const response = await request(app)
                .post('/api/cuotas/generar-mensual')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    mes: 13, // Inválido
                    anio: 2026,
                });

            expect(response.status).toBe(400);
            console.log('✅ Validación de mes funciona');
        });
    });
});
