export declare class ClasificacionService {
    getGeneros(): Promise<{
        id: number;
        nombre: string;
    }[]>;
    getCategorias(): Promise<{
        id: number;
        nombre: string;
    }[]>;
    createCategoria(nombre: string): Promise<{
        id: number;
        nombre: string;
    }>;
    deleteCategoria(id: number): Promise<{
        id: number;
        nombre: string;
    }>;
    getSubcategorias(disciplinaId?: number, categoriaId?: number, generoId?: number): Promise<({
        disciplina: {
            id: number;
            nombre: string;
        };
        genero: {
            id: number;
            nombre: string;
        } | null;
        categoria: {
            id: number;
            nombre: string;
        };
    } & {
        id: number;
        nombre: string;
        generoId: number | null;
        categoriaId: number;
        disciplinaId: number;
    })[]>;
    getOpcionesCompletas(): Promise<{
        generos: {
            id: number;
            nombre: string;
        }[];
        categorias: {
            id: number;
            nombre: string;
        }[];
        disciplinas: {
            id: number;
            nombre: string;
            precioMensual: import("@prisma/client/runtime/library").Decimal;
        }[];
        subcategoriasPorKey: Record<string, {
            id: number;
            nombre: string;
        }[]>;
        categoriasExcepcion: Record<string, string[]>;
    }>;
    createSubcategoria(data: {
        nombre: string;
        disciplinaNombre: string;
        categoriaNombre: string;
        generoNombre?: string;
    }): Promise<{
        disciplina: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            precioMensual: import("@prisma/client/runtime/library").Decimal;
            activa: boolean;
        };
        genero: {
            id: number;
            nombre: string;
        } | null;
        categoria: {
            id: number;
            nombre: string;
        };
    } & {
        id: number;
        nombre: string;
        generoId: number | null;
        categoriaId: number;
        disciplinaId: number;
    }>;
    deleteSubcategoria(id: number): Promise<{
        id: number;
        nombre: string;
        generoId: number | null;
        categoriaId: number;
        disciplinaId: number;
    }>;
}
export declare const clasificacionService: ClasificacionService;
//# sourceMappingURL=clasificacion.service.d.ts.map