import { UpdateProfileDTO, AssignRoleDTO } from '../types/requests';
export declare class UserService {
    getProfile(userId: number): Promise<{
        administrativo: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            apellido: string;
            dni: string;
            cuentaId: number;
        } | null;
        deportista: ({
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
        }) | null;
        id: number;
        email: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        intentosFallidos: number;
        bloqueadoHasta: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: number, data: UpdateProfileDTO): Promise<{
        administrativo: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            apellido: string;
            dni: string;
            cuentaId: number;
        } | null;
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
        } | null;
        id: number;
        email: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        intentosFallidos: number;
        bloqueadoHasta: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignRole(_userId: number, targetUserId: number, data: AssignRoleDTO): Promise<{
        id: number;
        email: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        intentosFallidos: number;
        bloqueadoHasta: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllUsers(page?: number, limit?: number): Promise<{
        data: {
            administrativo: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                nombre: string;
                apellido: string;
                dni: string;
                cuentaId: number;
            } | null;
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
            } | null;
            id: number;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            intentosFallidos: number;
            bloqueadoHasta: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    resetAdminPassword(adminId: number, newPassword: string): Promise<{
        message: string;
    }>;
    setAdminActivo(principalUserId: number, adminId: number, activo: boolean): Promise<{
        activo: boolean;
    }>;
}
export declare const userService: UserService;
//# sourceMappingURL=user.service.d.ts.map