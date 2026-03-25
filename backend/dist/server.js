"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const paseCategoria_job_1 = require("./jobs/paseCategoria.job");
const PORT = env_1.env.PORT || 3000;
/** Asegura que la tabla noticias tenga columnas publicada y deleted_at (por migraciones manuales/Supabase). */
async function ensureNoticiaColumns() {
    try {
        await prisma_1.default.$executeRawUnsafe(`ALTER TABLE noticias ADD COLUMN IF NOT EXISTS publicada BOOLEAN NOT NULL DEFAULT true`);
        await prisma_1.default.$executeRawUnsafe(`ALTER TABLE noticias ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP(3)`);
    }
    catch (e) {
        // Tabla no existe o ya tiene columnas; no bloquear arranque
    }
}
let server; // Variable para guardar la instancia del servidor
async function main() {
    try {
        // Verificar conexión a la base de datos
        await prisma_1.default.$connect();
        console.log('✅ Conexión a base de datos establecida.');
        await ensureNoticiaColumns();
        // Generación de cuotas solo manual desde el panel admin (crontab desactivado)
        (0, paseCategoria_job_1.iniciarJobPaseCategoria)(); // Pase de categoría anual
        // Iniciar servidor y guardar la instancia
        server = app_1.default.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
// Función para cierre limpio (evita EADDRINUSE)
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    if (server) {
        server.close(async () => {
            console.log('🛑 Servidor HTTP cerrado.');
            await prisma_1.default.$disconnect();
            console.log('💾 Base de datos desconectada.');
            process.exit(0);
        });
    }
    else {
        await prisma_1.default.$disconnect();
        process.exit(0);
    }
};
// Manejo de señales de terminación
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
main();
//# sourceMappingURL=server.js.map