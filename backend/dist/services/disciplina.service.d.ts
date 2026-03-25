import { CreateDisciplinaDTO, UpdateDisciplinaDTO } from '../types/requests';
export declare class DisciplinaService {
    create(data: CreateDisciplinaDTO): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        precioMensual: import("@prisma/client/runtime/library").Decimal;
        activa: boolean;
    }>;
    getById(id: number): Promise<{
        _count: {
            deportistas: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        precioMensual: import("@prisma/client/runtime/library").Decimal;
        activa: boolean;
    }>;
    getAll(includeInactive?: boolean): Promise<({
        _count: {
            deportistas: number;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        precioMensual: import("@prisma/client/runtime/library").Decimal;
        activa: boolean;
    })[]>;
    update(id: number, data: UpdateDisciplinaDTO): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        precioMensual: import("@prisma/client/runtime/library").Decimal;
        activa: boolean;
    }>;
    getDeportistas(id: number, page?: number, limit?: number): Promise<{
        data: ({
            cuenta: {
                email: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            apellido: string;
            dni: string;
            cuentaId: number;
            fechaNac: Date;
            generoId: number;
            categoriaId: number;
            subcategoriaId: number | null;
            estado: import(".prisma/client").$Enums.EstadoDeportista;
            disciplinaId: number;
            becado: boolean;
            cuotaBeca: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
export declare const disciplinaService: DisciplinaService;
//# sourceMappingURL=disciplina.service.d.ts.map