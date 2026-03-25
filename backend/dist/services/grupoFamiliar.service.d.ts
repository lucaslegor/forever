import { CreateGrupoFamiliarDTO, UpdateGrupoFamiliarDTO } from '../types/requests';
export declare class GrupoFamiliarService {
    create(data: CreateGrupoFamiliarDTO): Promise<{
        integrantes: ({
            deportista: {
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
            };
        } & {
            deportistaId: number;
            grupoId: number;
            esPrincipal: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        titularDni: string | null;
        cuotaHermano: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getByDeportistaId(deportistaId: number): Promise<({
        integrantes: ({
            deportista: {
                disciplina: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    nombre: string;
                    precioMensual: import("@prisma/client/runtime/library").Decimal;
                    activa: boolean;
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
            };
        } & {
            deportistaId: number;
            grupoId: number;
            esPrincipal: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        titularDni: string | null;
        cuotaHermano: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getById(id: number): Promise<{
        integrantes: ({
            deportista: {
                disciplina: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    nombre: string;
                    precioMensual: import("@prisma/client/runtime/library").Decimal;
                    activa: boolean;
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
            };
        } & {
            deportistaId: number;
            grupoId: number;
            esPrincipal: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        titularDni: string | null;
        cuotaHermano: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getAll(page?: number, limit?: number): Promise<{
        data: ({
            integrantes: ({
                deportista: {
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
                };
            } & {
                deportistaId: number;
                grupoId: number;
                esPrincipal: boolean;
            })[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            titularDni: string | null;
            cuotaHermano: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    update(id: number, data: UpdateGrupoFamiliarDTO): Promise<{
        integrantes: ({
            deportista: {
                disciplina: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    nombre: string;
                    precioMensual: import("@prisma/client/runtime/library").Decimal;
                    activa: boolean;
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
            };
        } & {
            deportistaId: number;
            grupoId: number;
            esPrincipal: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        nombre: string;
        titularDni: string | null;
        cuotaHermano: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
    /**
     * Recalcula cuotaHermano para todos los grupos cuyo titular (esPrincipal) está en la disciplina dada.
     * Se usa cuando se actualiza el precio de una disciplina (misma fórmula: precio × 1,5).
     */
    actualizarCuotaHermanoPorCambioPrecioDisciplina(disciplinaId: number, nuevoPrecioMensual: number): Promise<void>;
}
export declare const grupoFamiliarService: GrupoFamiliarService;
//# sourceMappingURL=grupoFamiliar.service.d.ts.map