"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarTodosCronJobs = exports.iniciarJobActualizacionVencidas = exports.iniciarJobGeneracionCuotas = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const cuota_service_1 = require("../services/cuota.service");
/**
 * Job que genera automáticamente las cuotas mensuales
 * Se ejecuta el día 1 de cada mes a las 00:00
 */
const iniciarJobGeneracionCuotas = () => {
    // Cron expression: '0 0 1 * *'
    // Minuto Hora Día Mes DíaSemana
    // 0      0    1   *   *
    // = A las 00:00 del día 1 de cada mes
    node_cron_1.default.schedule('0 0 1 * *', async () => {
        const now = new Date();
        const mes = now.getMonth() + 1; // getMonth() retorna 0-11
        const anio = now.getFullYear();
        try {
            await cuota_service_1.cuotaService.generarCuotasMensuales(mes, anio);
        }
        catch (_error) {
            // Error manejado silenciosamente; se puede reintentar en la siguiente ejecución
        }
    });
};
exports.iniciarJobGeneracionCuotas = iniciarJobGeneracionCuotas;
/**
 * Job que actualiza el estado de las cuotas vencidas
 * Se ejecuta todos los días a las 01:00
 */
const iniciarJobActualizacionVencidas = () => {
    // Cron expression: '0 1 * * *'
    // = Todos los días a las 01:00
    node_cron_1.default.schedule('0 1 * * *', async () => {
        try {
            await cuota_service_1.cuotaService.actualizarVencidas();
        }
        catch (_error) {
            // Error manejado silenciosamente; se puede reintentar al día siguiente
        }
    });
};
exports.iniciarJobActualizacionVencidas = iniciarJobActualizacionVencidas;
/**
 * Inicializa todos los cron jobs del sistema
 */
const iniciarTodosCronJobs = () => {
    (0, exports.iniciarJobGeneracionCuotas)();
    (0, exports.iniciarJobActualizacionVencidas)();
};
exports.iniciarTodosCronJobs = iniciarTodosCronJobs;
//# sourceMappingURL=cuotas.job.js.map