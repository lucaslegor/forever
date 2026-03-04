/**
 * Estructura de una noticia.
 * Misma forma para listado, detalle y futuro formulario de administración.
 * El admin solo completará: titulo, fecha, resumen, contenido, imagenes (URLs tras subir archivos).
 */
export interface Noticia {
    id: number;
    titulo: string;
    fecha: string; // ISO date: YYYY-MM-DD
    resumen: string;
    contenido: string;
    imagenes: string[]; // URLs de fotos (ej: desde backend o /uploads/noticias/xxx.jpg)
    /** Solo en listado admin */
    publicada?: boolean;
}
