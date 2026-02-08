import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const PORT = env.PORT;

async function main() {
  if (!env.DATABASE_URL || env.DATABASE_URL.trim() === '') {
    console.error('ERROR: DATABASE_URL no está definida en .env');
    process.exit(1);
  }
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('Conectado a la base de datos');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Entorno: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  console.log('Cerrando conexiones...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cerrando conexiones...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
