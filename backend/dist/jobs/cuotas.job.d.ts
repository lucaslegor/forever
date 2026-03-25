/**
 * Job que genera automáticamente las cuotas mensuales
 * Se ejecuta el día 1 de cada mes a las 00:00
 */
export declare const iniciarJobGeneracionCuotas: () => void;
/**
 * Job que actualiza el estado de las cuotas vencidas
 * Se ejecuta todos los días a las 01:00
 */
export declare const iniciarJobActualizacionVencidas: () => void;
/**
 * Inicializa todos los cron jobs del sistema
 */
export declare const iniciarTodosCronJobs: () => void;
//# sourceMappingURL=cuotas.job.d.ts.map