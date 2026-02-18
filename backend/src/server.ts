import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';
import { iniciarJobPaseCategoria } from './jobs/paseCategoria.job';
import { Server } from 'http'; // Importamos tipos para TypeScript

const PORT = env.PORT || 3000;

/** Asegura que la tabla noticias tenga columnas publicada y deleted_at (por migraciones manuales/Supabase). */
async function ensureNoticiaColumns() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE noticias ADD COLUMN IF NOT EXISTS publicada BOOLEAN NOT NULL DEFAULT true`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE noticias ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`
    );
  } catch (e) {
    // Tabla no existe o ya tiene columnas; no bloquear arranque
  }
}

let server: Server; // Variable para guardar la instancia del servidor

async function main() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida.');

    await ensureNoticiaColumns();

    // Generación de cuotas solo manual desde el panel admin (crontab desactivado)
    iniciarJobPaseCategoria(); // Pase de categoría anual

    // Iniciar servidor y guardar la instancia
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Función para cierre limpio (evita EADDRINUSE)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  
  if (server) {
    server.close(async () => {
      console.log('🛑 Servidor HTTP cerrado.');
      await prisma.$disconnect();
      console.log('💾 Base de datos desconectada.');
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
};

// Manejo de señales de terminación
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

main();