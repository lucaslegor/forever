"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarJobPaseCategoria = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../config/prisma"));
const paseCategoria_service_1 = require("../services/paseCategoria.service");
const CONFIG_CLAVE_ULTIMO_ANIO = 'pase_categoria_ultimo_anio';
/**
 * Job que ejecuta el pase de categoría anual (Fútbol masculino) cuando cambia el año.
 * Se corre todos los días a las 00:10; solo ejecuta el pase si el año actual es mayor
 * al último año registrado, así funciona para todos los años (2026, 2027, ...).
 */
const iniciarJobPaseCategoria = () => {
    // Todos los días a las 00:10
    node_cron_1.default.schedule('10 0 * * *', async () => {
        const anioActual = new Date().getFullYear();
        try {
            const config = await prisma_1.default.config.findUnique({
                where: { clave: CONFIG_CLAVE_ULTIMO_ANIO },
            });
            const ultimoAnio = config ? parseInt(config.valor, 10) : 0;
            if (Number.isNaN(ultimoAnio))
                return;
            if (anioActual <= ultimoAnio)
                return;
            await (0, paseCategoria_service_1.ejecutarPaseCategoriaFutbolMasculino)();
            await prisma_1.default.config.upsert({
                where: { clave: CONFIG_CLAVE_ULTIMO_ANIO },
                create: { clave: CONFIG_CLAVE_ULTIMO_ANIO, valor: String(anioActual) },
                update: { valor: String(anioActual) },
            });
        }
        catch (_error) {
            // Error manejado silenciosamente; se reintentará al día siguiente
        }
    });
};
exports.iniciarJobPaseCategoria = iniciarJobPaseCategoria;
//# sourceMappingURL=paseCategoria.job.js.map