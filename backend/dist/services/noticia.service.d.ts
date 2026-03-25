import { CreateNoticiaDTO, UpdateNoticiaDTO } from '../types/requests';
export declare class NoticiaService {
    create(data: CreateNoticiaDTO): Promise<{
        autor: {
            nombre: string;
            apellido: string;
        } | null;
        imagenes: {
            id: number;
            url: string;
            orden: number;
            noticiaId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        fecha: Date;
        resumen: string;
        contenido: string;
        publicada: boolean;
        deletedAt: Date | null;
        autorId: number | null;
    }>;
    /** Formatea fecha a YYYY-MM-DD (Prisma puede devolver Date o string según driver/DB) */
    private formatFecha;
    /** Listado público: solo publicadas y no eliminadas */
    getAll(): Promise<{
        id: number;
        titulo: string;
        fecha: string;
        resumen: string;
        contenido: string;
        imagenes: string[];
        autor: string | undefined;
    }[]>;
    /** Detalle público: solo si está publicada y no eliminada */
    getById(id: number, onlyPublic?: boolean): Promise<{
        id: number;
        titulo: string;
        fecha: string;
        resumen: string;
        contenido: string;
        publicada: boolean;
        imagenes: string[];
        autor: string | undefined;
    }>;
    /** Listado para admin: todas las no eliminadas (con publicada) */
    getAllAdmin(): Promise<{
        id: number;
        titulo: string;
        fecha: string;
        resumen: string;
        contenido: string;
        publicada: boolean;
        imagenes: string[];
        autor: string | undefined;
    }[]>;
    update(id: number, data: UpdateNoticiaDTO): Promise<{
        id: number;
        titulo: string;
        fecha: string;
        resumen: string;
        contenido: string;
        publicada: boolean;
        imagenes: string[];
        autor: string | undefined;
    }>;
    /** Soft delete: marca deletedAt (no se muestra en público ni en listado admin) */
    delete(id: number): Promise<{
        message: string;
    }>;
    setPublicada(id: number, publicada: boolean): Promise<{
        id: number;
        titulo: string;
        fecha: string;
        resumen: string;
        contenido: string;
        publicada: boolean;
        imagenes: string[];
        autor: string | undefined;
    }>;
}
export declare const noticiaService: NoticiaService;
//# sourceMappingURL=noticia.service.d.ts.map