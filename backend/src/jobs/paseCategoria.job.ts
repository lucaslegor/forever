import cron from 'node-cron';
import prisma from '../config/prisma';
import { ejecutarPaseCategoriaFutbolMasculino } from '../services/paseCategoria.service';

const CONFIG_CLAVE_ULTIMO_ANIO = 'pase_categoria_ultimo_anio';

/**
 * Job que ejecuta el pase de categoría anual (Fútbol masculino) cuando cambia el año.
 * Se corre todos los días a las 00:10; solo ejecuta el pase si el año actual es mayor
 * al último año registrado, así funciona para todos los años (2026, 2027, ...).
 */
export const iniciarJobPaseCategoria = () => {
    // Todos los días a las 00:10
    cron.schedule('10 0 * * *', async () => {
        const anioActual = new Date().getFullYear();

        try {
            const config = await prisma.config.findUnique({
                where: { clave: CONFIG_CLAVE_ULTIMO_ANIO },
            });

            const ultimoAnio = config ? parseInt(config.valor, 10) : 0;
            if (Number.isNaN(ultimoAnio)) return;

            if (anioActual <= ultimoAnio) return;

            await ejecutarPaseCategoriaFutbolMasculino();

            await prisma.config.upsert({
                where: { clave: CONFIG_CLAVE_ULTIMO_ANIO },
                create: { clave: CONFIG_CLAVE_ULTIMO_ANIO, valor: String(anioActual) },
                update: { valor: String(anioActual) },
            });
        } catch (_error) {
            // Error manejado silenciosamente; se reintentará al día siguiente
        }
    });
};
