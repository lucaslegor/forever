import { PrismaClient } from '@prisma/client';

// Cliente de Prisma para tests de integración
export const prismaTest = new PrismaClient({
  log: ['error'],
});

// Limpiar todas las tablas antes de los tests
export async function cleanDatabase() {
  // Orden importante por las foreign keys
  await prismaTest.pago.deleteMany();
  await prismaTest.cuota.deleteMany();
  await prismaTest.grupoFamiliarIntegrante.deleteMany();
  await prismaTest.grupoFamiliar.deleteMany();
  await prismaTest.deportista.deleteMany();
  await prismaTest.administrativo.deleteMany();
  await prismaTest.cuentaUsuario.deleteMany();
  await prismaTest.subcategoria.deleteMany();
  await prismaTest.disciplina.deleteMany();
  await prismaTest.categoria.deleteMany();
  await prismaTest.genero.deleteMany();
}

// Datos de prueba base
export const testData = {
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
export async function seedTestData() {
  const genero = await prismaTest.genero.create({
    data: { nombre: 'Masculino' },
  });
  const categoria = await prismaTest.categoria.create({
    data: { nombre: 'Mayores' },
  });
  const disciplina = await prismaTest.disciplina.create({
    data: testData.disciplina,
  });
  return { genero, categoria, disciplina };
}

// Conectar antes de todos los tests
export async function connectDatabase() {
  await prismaTest.$connect();
}

// Desconectar después de todos los tests
export async function disconnectDatabase() {
  await prismaTest.$disconnect();
}
