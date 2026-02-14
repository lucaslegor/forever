import cron from 'node-cron';
import { cuotaService } from '../services/cuota.service';

/**
 * Job que genera automáticamente las cuotas mensuales
 * Se ejecuta el día 1 de cada mes a las 00:00
 */
export const iniciarJobGeneracionCuotas = () => {
    // Cron expression: '0 0 1 * *'
    // Minuto Hora Día Mes DíaSemana
    // 0      0    1   *   *
    // = A las 00:00 del día 1 de cada mes

    cron.schedule('0 0 1 * *', async () => {
        const now = new Date();
        const mes = now.getMonth() + 1; // getMonth() retorna 0-11
        const anio = now.getFullYear();

        try {
            await cuotaService.generarCuotasMensuales(mes, anio);
        } catch (_error) {
            // Error manejado silenciosamente; se puede reintentar en la siguiente ejecución
        }
    });
};

/**
 * Job que actualiza el estado de las cuotas vencidas
 * Se ejecuta todos los días a las 01:00
 */
export const iniciarJobActualizacionVencidas = () => {
    // Cron expression: '0 1 * * *'
    // = Todos los días a las 01:00

    cron.schedule('0 1 * * *', async () => {
        try {
            await cuotaService.actualizarVencidas();
        } catch (_error) {
            // Error manejado silenciosamente; se puede reintentar al día siguiente
        }
    });
};

/**
 * Inicializa todos los cron jobs del sistema
 */
export const iniciarTodosCronJobs = () => {
    iniciarJobGeneracionCuotas();
    iniciarJobActualizacionVencidas();
};
