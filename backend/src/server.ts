import app from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const PORT = env.PORT;

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

async function main() {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();

    await ensureNoticiaColumns();

    // Generación de cuotas solo manual desde el panel admin (crontab desactivado)

    // Iniciar servidor
    app.listen(PORT);
  } catch (_error: unknown) {
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
