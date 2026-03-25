import { CreateDeportistaDTO, UpdateDeportistaDTO } from '../types/requests';
import { DeportistasQuery } from '../validators/deportista.validator';
export declare class DeportistaService {
    create(data: CreateDeportistaDTO): Promise<{
        adultosResponsables: {
            id: number;
            email: string;
            nombre: string;
            apellido: string;
            dni: string;
            telefono: string;
            deportistaId: number;
        }[];
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
        };
        categoria: {
            id: number;
            nombre: string;
        };
        subcategoria: {
            id: number;
            nombre: string;
            generoId: number | null;
            categoriaId: number;
            disciplinaId: number;
        } | null;
        cuenta: {
            id: number;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            createdAt: Date;
        };
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
    }>;
    getById(id: number): Promise<{
        adultosResponsables: {
            id: number;
            email: string;
            nombre: string;
            apellido: string;
            dni: string;
            telefono: string;
            deportistaId: number;
        }[];
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
        };
        categoria: {
            id: number;
            nombre: string;
        };
        subcategoria: {
            id: number;
            nombre: string;
            generoId: number | null;
            categoriaId: number;
            disciplinaId: number;
        } | null;
        cuenta: {
            id: number;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            createdAt: Date;
        };
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
    }>;
    getAll(query: DeportistasQuery): Promise<{
        data: {
            adultosResponsables: {
                id: number;
                email: string;
                nombre: string;
                apellido: string;
                dni: string;
                telefono: string;
                deportistaId: number;
            }[];
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
            };
            categoria: {
                id: number;
                nombre: string;
            };
            subcategoria: {
                id: number;
                nombre: string;
                generoId: number | null;
                categoriaId: number;
                disciplinaId: number;
            } | null;
            cuenta: {
                email: string;
                activo: boolean;
            };
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
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    update(id: number, data: UpdateDeportistaDTO): Promise<{
        adultosResponsables: {
            id: number;
            email: string;
            nombre: string;
            apellido: string;
            dni: string;
            telefono: string;
            deportistaId: number;
        }[];
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
        };
        categoria: {
            id: number;
            nombre: string;
        };
        subcategoria: {
            id: number;
            nombre: string;
            generoId: number | null;
            categoriaId: number;
            disciplinaId: number;
        } | null;
        cuenta: {
            id: number;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            createdAt: Date;
        };
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
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
    darDeAlta(id: number): Promise<{
        adultosResponsables: {
            id: number;
            email: string;
            nombre: string;
            apellido: string;
            dni: string;
            telefono: string;
            deportistaId: number;
        }[];
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
        };
        categoria: {
            id: number;
            nombre: string;
        };
        subcategoria: {
            id: number;
            nombre: string;
            generoId: number | null;
            categoriaId: number;
            disciplinaId: number;
        } | null;
        cuenta: {
            id: number;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            createdAt: Date;
        };
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
    }>;
    getConPagosPendientes(): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        dni: string;
        cantidadCuotasPendientes: number;
        montoTotalAdeudado: number;
        vencimientoProximo: Date;
    }[]>;
    getHistorial(deportistaId: number): Promise<{
        pagos: {
            id: number;
            fecha: Date;
            monto: import("@prisma/client/runtime/library").Decimal;
            medioPago: string | null;
            estado: import(".prisma/client").$Enums.EstadoPago;
            cuota: {
                nroCuota: number;
                anio: number;
                disciplina: string;
            };
        }[];
    }>;
    /** Solo el ID del deportista; para endpoints que no necesitan el perfil completo (ej. estado de cuenta). */
    getDeportistaIdByUserId(userId: number): Promise<number | null>;
    getByUserId(userId: number): Promise<{
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
        };
        categoria: {
            id: number;
            nombre: string;
        };
        subcategoria: {
            id: number;
            nombre: string;
            generoId: number | null;
            categoriaId: number;
            disciplinaId: number;
        } | null;
        adultosResponsables: {
            id: number;
            email: string;
            nombre: string;
            apellido: string;
            dni: string;
            telefono: string;
            deportistaId: number;
        }[];
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
    }>;
    /**
     * Sincronizar la lista de adultos responsables del deportista logueado.
     * Reemplaza todos los existentes por la lista enviada (puede ser vacía).
     */
    updateMiPerfilAdultos(userId: number, data: {
        adultosResponsables: Array<{
            nombre: string;
            apellido: string;
            dni: string;
            email: string;
            telefono: string;
        }>;
    }): Promise<{
        adultosResponsables: {
            id: number;
            email: string;
            nombre: string;
            apellido: string;
            dni: string;
            telefono: string;
            deportistaId: number;
        }[];
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
        };
        categoria: {
            id: number;
            nombre: string;
        };
        subcategoria: {
            id: number;
            nombre: string;
            generoId: number | null;
            categoriaId: number;
            disciplinaId: number;
        } | null;
        cuenta: {
            id: number;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            createdAt: Date;
        };
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
    }>;
    resetPassword(id: number, newPassword: string): Promise<{
        message: string;
        deportistaId: number;
    }>;
    resetPasswordByDni(dni: string, newPassword: string): Promise<{
        message: string;
        deportistaId: number;
    }>;
}
export declare const deportistaService: DeportistaService;
//# sourceMappingURL=deportista.service.d.ts.map