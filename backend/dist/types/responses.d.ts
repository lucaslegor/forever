export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
}
export interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        rol: string;
        activo: boolean;
        nombre?: string;
        apellido?: string;
        /** Solo para rol DEPORTISTA; evita llamar a getMiPerfil solo para el ID */
        deportistaId?: number;
        /** Nombre de la disciplina del deportista (para menú condicional, ej. fixture LAPF / hockey) */
        disciplinaNombre?: string;
    };
}
export interface EstadoCuentaResponse {
    deportista: {
        id: number;
        nombre: string;
        apellido: string;
    };
    cuotasPagadas: {
        id: number;
        nroCuota: number;
        monto: number;
        fechaPago: Date;
        medioPago: string | null;
    }[];
    cuotasPendientes: {
        id: number;
        nroCuota: number;
        monto: number;
        fechaVencimiento: Date;
        estadoCuota: string;
    }[];
    totalAdeudado: number;
}
export interface HistorialPagosResponse {
    pagos: {
        id: number;
        fecha: Date;
        monto: number;
        medioPago: string | null;
        estado: string;
        cuota: {
            nroCuota: number;
            disciplina: string;
        };
    }[];
}
export interface DeportistaConPagosPendientesResponse {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    cantidadCuotasPendientes: number;
    montoTotalAdeudado: number;
    vencimientoProximo: Date | null;
}
//# sourceMappingURL=responses.d.ts.map