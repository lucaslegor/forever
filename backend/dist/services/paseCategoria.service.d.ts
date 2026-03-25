export interface PaseCategoriaResult {
    actualizados: number;
    detalle: Array<{
        deportistaId: number;
        nombreCompleto: string;
        desde: string;
        hacia: string;
    }>;
    errores: string[];
}
/**
 * Ejecuta el pase de categoría anual para Fútbol masculino.
 * - Infantiles: 6→7→8→9→10→11; 11 años → Pre-novena (Juveniles).
 * - Juveniles: Pre-novena→…→Quinta; Quinta → Cuarta (Mayores).
 * - Mayores no se modifica.
 */
export declare function ejecutarPaseCategoriaFutbolMasculino(): Promise<PaseCategoriaResult>;
//# sourceMappingURL=paseCategoria.service.d.ts.map