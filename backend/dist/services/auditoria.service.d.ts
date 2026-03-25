export declare const ACCIONES: {
    readonly DEPORTISTA_ALTA: "DEPORTISTA_ALTA";
    readonly DEPORTISTA_BAJA: "DEPORTISTA_BAJA";
    readonly DEPORTISTA_REACTIVAR: "DEPORTISTA_REACTIVAR";
    readonly DEPORTISTA_ACTUALIZACION: "DEPORTISTA_ACTUALIZACION";
    readonly PAGO_CONFIRMAR: "PAGO_CONFIRMAR";
    readonly CUOTA_MARCAR_PAGADA: "CUOTA_MARCAR_PAGADA";
    readonly CUOTA_CANCELAR_DEUDA: "CUOTA_CANCELAR_DEUDA";
    readonly DISCIPLINA_ALTA: "DISCIPLINA_ALTA";
    readonly DISCIPLINA_ACTUALIZACION: "DISCIPLINA_ACTUALIZACION";
    readonly ADMIN_DESACTIVAR: "ADMIN_DESACTIVAR";
    readonly ADMIN_ACTIVAR: "ADMIN_ACTIVAR";
    readonly ADMIN_RESET_PASSWORD: "ADMIN_RESET_PASSWORD";
    readonly DEPORTISTA_RESET_PASSWORD: "DEPORTISTA_RESET_PASSWORD";
    readonly CUENTA_CAMBIO_CONTRASEÑA: "CUENTA_CAMBIO_CONTRASEÑA";
    readonly GRUPO_FAMILIAR_CREAR: "GRUPO_FAMILIAR_CREAR";
    readonly GRUPO_FAMILIAR_ACTUALIZACION: "GRUPO_FAMILIAR_ACTUALIZACION";
    readonly GRUPO_FAMILIAR_BAJA: "GRUPO_FAMILIAR_BAJA";
};
export interface RegistrarAuditoriaInput {
    cuentaId: number | null;
    accion: string;
    entidad: string;
    entidadId?: number | null;
    detalles?: string | null;
    ip?: string | null;
    userAgent?: string | null;
}
export declare class AuditoriaService {
    registrar(data: RegistrarAuditoriaInput): Promise<void>;
    listar(filters: {
        cuentaId?: number;
        entidad?: string;
        accion?: string;
        desde?: Date;
        hasta?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        data: {
            id: number;
            cuentaId: number | null;
            email: string | null;
            rol: import(".prisma/client").$Enums.Rol | null;
            accion: string;
            entidad: string;
            entidadId: number | null;
            detalles: string | null;
            ip: string | null;
            userAgent: string | null;
            createdAt: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
export declare const auditoriaService: AuditoriaService;
//# sourceMappingURL=auditoria.service.d.ts.map