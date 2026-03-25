"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const app_1 = __importDefault(require("../../app"));
const setup_integration_1 = require("./setup.integration");
const client_1 = require("@prisma/client");
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
    let disciplinaId;
    let generoId;
    let categoriaId;
    let deportistaToken;
    let deportistaId;
    let _adminCuentaId = 0;
    let _adminToken = '';
    let _deportistaCuentaId = 0;
    void _adminCuentaId;
    void _adminToken;
    void _deportistaCuentaId;
    // Conectar y limpiar antes de todos los tests
    beforeAll(async () => {
        await (0, setup_integration_1.connectDatabase)();
        await (0, setup_integration_1.cleanDatabase)();
        const seedData = await (0, setup_integration_1.seedTestData)();
        disciplinaId = seedData.disciplina.id;
        generoId = seedData.genero.id;
        categoriaId = seedData.categoria.id;
    });
    // Limpiar y desconectar después de todos los tests
    afterAll(async () => {
        await (0, setup_integration_1.cleanDatabase)();
        await (0, setup_integration_1.disconnectDatabase)();
    });
    // ============================================================
    // TEST 1: Crear usuario Admin directamente en BD
    // ============================================================
    describe('1. Crear Admin en Base de Datos', () => {
        it('deberia crear un usuario admin directamente en la BD', async () => {
            const hashedPassword = await bcryptjs_1.default.hash(setup_integration_1.testData.admin.password, 10);
            // Crear cuenta de usuario
            const cuenta = await setup_integration_1.prismaTest.cuentaUsuario.create({
                data: {
                    email: setup_integration_1.testData.admin.email,
                    password: hashedPassword,
                    rol: client_1.Rol.ADMIN,
                    activo: true,
                },
            });
            // Crear administrativo asociado
            await setup_integration_1.prismaTest.administrativo.create({
                data: {
                    nombre: setup_integration_1.testData.admin.nombre,
                    apellido: setup_integration_1.testData.admin.apellido,
                    dni: setup_integration_1.testData.admin.dni,
                    cuentaId: cuenta.id,
                },
            });
            _adminCuentaId = cuenta.id;
            // Verificar que se creó correctamente
            const adminCreado = await setup_integration_1.prismaTest.cuentaUsuario.findUnique({
                where: { id: cuenta.id },
                include: { administrativo: true },
            });
            expect(adminCreado).not.toBeNull();
            expect(adminCreado?.email).toBe(setup_integration_1.testData.admin.email);
            expect(adminCreado?.rol).toBe(client_1.Rol.ADMIN);
            expect(adminCreado?.administrativo?.nombre).toBe(setup_integration_1.testData.admin.nombre);
            console.log('✅ Admin creado en BD:', adminCreado?.email);
        });
    });
    // ============================================================
    // TEST 2: Login del Admin via API
    // ============================================================
    describe('2. Login Admin via API', () => {
        it('deberia hacer login y obtener token JWT', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: setup_integration_1.testData.admin.email,
                password: setup_integration_1.testData.admin.password,
                captchaToken: 'test-token',
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.email).toBe(setup_integration_1.testData.admin.email);
            _adminToken = response.body.data.token;
            console.log('✅ Login exitoso, token obtenido');
        });
        it('deberia rechazar login con contraseña incorrecta', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: setup_integration_1.testData.admin.email,
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
            const hashedPassword = await bcryptjs_1.default.hash('Admin123!', 10);
            const cuentaAdmin = await setup_integration_1.prismaTest.cuentaUsuario.create({
                data: {
                    email: 'admin2.test@forever.com',
                    password: hashedPassword,
                    rol: client_1.Rol.ADMINISTRATIVO,
                    activo: true,
                },
            });
            await setup_integration_1.prismaTest.administrativo.create({
                data: {
                    nombre: 'Admin2',
                    apellido: 'Test',
                    dni: '77777777',
                    cuentaId: cuentaAdmin.id,
                },
            });
            // Login como administrativo
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });
            const adminToken2 = loginRes.body.data.token;
            const response = await (0, supertest_1.default)(app_1.default)
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
            const disciplinaEnBD = await setup_integration_1.prismaTest.disciplina.findUnique({
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
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });
            const token = loginRes.body.data.token;
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .set('Authorization', `Bearer ${token}`)
                .send({
                nombre: setup_integration_1.testData.deportista.nombre,
                apellido: setup_integration_1.testData.deportista.apellido,
                dni: setup_integration_1.testData.deportista.dni,
                email: setup_integration_1.testData.deportista.email,
                password: setup_integration_1.testData.deportista.password,
                disciplinaId: disciplinaId,
                generoId,
                categoriaId,
            });
            expect(response.status).toBe(201);
            expect(response.body.data.nombre).toBe(setup_integration_1.testData.deportista.nombre);
            expect(response.body.data.dni).toBe(setup_integration_1.testData.deportista.dni);
            deportistaId = response.body.data.id;
            // Verificar en la BD
            const deportistaEnBD = await setup_integration_1.prismaTest.deportista.findUnique({
                where: { id: deportistaId },
                include: { cuenta: true, disciplina: true },
            });
            expect(deportistaEnBD).not.toBeNull();
            expect(deportistaEnBD?.cuenta.email).toBe(setup_integration_1.testData.deportista.email);
            expect(deportistaEnBD?.disciplina.nombre).toBe('Futbol Test');
            _deportistaCuentaId = deportistaEnBD.cuentaId;
            console.log('✅ Deportista creado via API:', deportistaEnBD?.nombre, deportistaEnBD?.apellido);
        });
    });
    // ============================================================
    // TEST 5: Login del Deportista
    // ============================================================
    describe('5. Login Deportista', () => {
        it('deberia hacer login como deportista', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: setup_integration_1.testData.deportista.email,
                password: setup_integration_1.testData.deportista.password,
                captchaToken: 'test-token',
            });
            expect(response.status).toBe(200);
            expect(response.body.data.token).toBeDefined();
            expect(response.body.data.user.rol).toBe(client_1.Rol.DEPORTISTA);
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
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });
            const token = loginRes.body.data.token;
            const fechaEmision = new Date();
            const fechaVencimiento = new Date();
            fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 1);
            const response = await (0, supertest_1.default)(app_1.default)
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
            const cuotaEnBD = await setup_integration_1.prismaTest.cuota.findFirst({
                where: { deportistaId: deportistaId, nroCuota: 1 },
            });
            expect(cuotaEnBD).not.toBeNull();
            expect(cuotaEnBD?.estadoCuota).toBe(client_1.EstadoCuota.PENDIENTE);
            console.log('✅ Cuota asignada:', cuotaEnBD?.nroCuota, '- Monto:', cuotaEnBD?.monto.toString());
        });
    });
    // ============================================================
    // TEST 7: Deportista consulta su estado de cuenta
    // ============================================================
    describe('7. Consultar Estado de Cuenta', () => {
        it('deportista deberia ver su estado de cuenta', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
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
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });
            const token = loginRes.body.data.token;
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/deportistas')
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.data.data.length).toBeGreaterThan(0);
            const deportistaEnLista = response.body.data.data.find((d) => d.dni === setup_integration_1.testData.deportista.dni);
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
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'admin2.test@forever.com', password: 'Admin123!', captchaToken: 'test-token' });
            const token = loginRes.body.data.token;
            // Crear segundo deportista
            const depRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/deportistas')
                .set('Authorization', `Bearer ${token}`)
                .send({
                nombre: 'Maria',
                apellido: 'Perez',
                dni: '66666666',
                email: 'maria.test@forever.com',
                password: 'Maria123!',
                disciplinaId: disciplinaId,
                generoId,
                categoriaId,
            });
            const deportista2Id = depRes.body.data.id;
            // Crear grupo familiar
            const response = await (0, supertest_1.default)(app_1.default)
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
            const grupoEnBD = await setup_integration_1.prismaTest.grupoFamiliar.findFirst({
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
            const deportistaCompleto = await setup_integration_1.prismaTest.deportista.findUnique({
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
            expect(deportistaCompleto?.cuenta.email).toBe(setup_integration_1.testData.deportista.email);
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
//# sourceMappingURL=database.integration.test.js.map