import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const PORT = env.PORT;

async function main() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('Conectado a la base de datos');

    // Generación de cuotas solo manual desde el panel admin (crontab desactivado)

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Entorno: ${env.NODE_ENV}`);
    });
  } catch (error: unknown) {
    console.error('Error al iniciar el servidor:', error);
    const err = error as { code?: string; message?: string };
    if (err?.code === 'P1001') {
      console.error('\n--- No se pudo conectar a la base de datos ---');
      console.error('• Si usás Supabase: entrá al dashboard y verificá que el proyecto no esté pausado (Restore si aparece pausado).');
      console.error('• Revisá que DATABASE_URL en .env sea correcta (usuario, contraseña, host, puerto).');
      console.error('• Probá conexión directa con puerto 5432 en lugar del pooler 6543.');
    }
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
