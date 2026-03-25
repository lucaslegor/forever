"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
// Asegurar pool de conexiones suficiente para evitar "Timed out fetching a new connection"
// (si DATABASE_URL no tiene connection_limit, usar 10 por defecto)
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connection_limit')) {
    const sep = process.env.DATABASE_URL.includes('?') ? '&' : '?';
    process.env.DATABASE_URL += `${sep}connection_limit=10&connect_timeout=15`;
}
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        // Desactivar prepared statements para evitar el error "prepared statement already exists"
        // Esto puede ocurrir con tsx watch y hot reload
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
// Cerrar la conexión al terminar el proceso
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map