"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testData = exports.prismaTest = void 0;
exports.cleanDatabase = cleanDatabase;
exports.seedTestData = seedTestData;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
// Cliente de Prisma para tests de integración
exports.prismaTest = new client_1.PrismaClient({
    log: ['error'],
});
// Limpiar todas las tablas antes de los tests
async function cleanDatabase() {
    // Orden importante por las foreign keys
    await exports.prismaTest.pago.deleteMany();
    await exports.prismaTest.cuota.deleteMany();
    await exports.prismaTest.grupoFamiliarIntegrante.deleteMany();
    await exports.prismaTest.grupoFamiliar.deleteMany();
    await exports.prismaTest.deportista.deleteMany();
    await exports.prismaTest.administrativo.deleteMany();
    await exports.prismaTest.cuentaUsuario.deleteMany();
    await exports.prismaTest.subcategoria.deleteMany();
    await exports.prismaTest.disciplina.deleteMany();
    await exports.prismaTest.categoria.deleteMany();
    await exports.prismaTest.genero.deleteMany();
}
// Datos de prueba base
exports.testData = {
    disciplina: {
        nombre: 'Futbol Test',
        precioMensual: 5000,
    },
    admin: {
        email: 'admin.test@forever.com',
        password: 'Admin123!',
        nombre: 'Admin',
        apellido: 'Test',
        dni: '99999999',
    },
    deportista: {
        email: 'deportista.test@forever.com',
        password: 'Deportista123!',
        nombre: 'Juan',
        apellido: 'Perez',
        dni: '88888888',
        fechaNac: new Date('2000-01-15'),
    },
};
// Crear datos base necesarios para los tests
async function seedTestData() {
    const genero = await exports.prismaTest.genero.create({
        data: { nombre: 'Masculino' },
    });
    const categoria = await exports.prismaTest.categoria.create({
        data: { nombre: 'Mayores' },
    });
    const disciplina = await exports.prismaTest.disciplina.create({
        data: exports.testData.disciplina,
    });
    return { genero, categoria, disciplina };
}
// Conectar antes de todos los tests
async function connectDatabase() {
    await exports.prismaTest.$connect();
}
// Desconectar después de todos los tests
async function disconnectDatabase() {
    await exports.prismaTest.$disconnect();
}
//# sourceMappingURL=setup.integration.js.map