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

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔄 [CRON JOB] Iniciando generación automática de cuotas`);
        console.log(`📅 Período: ${mes}/${anio}`);
        console.log(`⏰ Fecha/Hora: ${now.toLocaleString('es-AR')}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            const resultado = await cuotaService.generarCuotasMensuales(mes, anio);

            console.log('✅ [CRON JOB] Generación de cuotas completada exitosamente');
            console.log(`📊 Cuotas generadas: ${resultado.cuotasGeneradas}`);
            console.log(`⏭️  Cuotas omitidas: ${resultado.cuotasOmitidas}`);
            console.log(`💵 Monto total: $${resultado.montoTotal}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } catch (error) {
            console.error('❌ [CRON JOB] Error al generar cuotas mensuales');
            console.error('Error:', error);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
    });

    console.log('✅ Job de generación automática de cuotas iniciado');
    console.log('📅 Programado para ejecutarse el día 1 de cada mes a las 00:00');
};

/**
 * Job que actualiza el estado de las cuotas vencidas
 * Se ejecuta todos los días a las 01:00
 */
export const iniciarJobActualizacionVencidas = () => {
    // Cron expression: '0 1 * * *'
    // = Todos los días a las 01:00

    cron.schedule('0 1 * * *', async () => {
        const now = new Date();

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`🔄 [CRON JOB] Actualizando cuotas vencidas`);
        console.log(`⏰ Fecha/Hora: ${now.toLocaleString('es-AR')}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            const resultado = await cuotaService.actualizarVencidas();

            console.log('✅ [CRON JOB] Actualización de cuotas vencidas completada');
            console.log(`📊 Cuotas actualizadas: ${resultado.actualizadas}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } catch (error) {
            console.error('❌ [CRON JOB] Error al actualizar cuotas vencidas');
            console.error('Error:', error);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
    });

    console.log('✅ Job de actualización de cuotas vencidas iniciado');
    console.log('📅 Programado para ejecutarse todos los días a las 01:00');
};

/**
 * Inicializa todos los cron jobs del sistema
 */
export const iniciarTodosCronJobs = () => {
    console.log('\n🚀 Iniciando Cron Jobs del sistema...\n');

    iniciarJobGeneracionCuotas();
    iniciarJobActualizacionVencidas();

    console.log('\n✅ Todos los Cron Jobs han sido iniciados correctamente\n');
};
