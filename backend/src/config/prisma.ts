import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Asegurar pool de conexiones suficiente para evitar "Timed out fetching a new connection"
// (si DATABASE_URL no tiene connection_limit, usar 10 por defecto)
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connection_limit')) {
  const sep = process.env.DATABASE_URL.includes('?') ? '&' : '?';
  process.env.DATABASE_URL += `${sep}connection_limit=10&connect_timeout=15`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Desactivar prepared statements para evitar el error "prepared statement already exists"
    // Esto puede ocurrir con tsx watch y hot reload
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Cerrar la conexión al terminar el proceso
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
