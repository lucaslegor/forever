import { CreatePagoDTO } from '../types/requests';
export declare class PagoService {
    crear(deportistaId: number, data: CreatePagoDTO): Promise<{
        pago: {
            cuota: {
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
                disciplinaId: number;
                deportistaId: number;
                nroCuota: number;
                monto: import("@prisma/client/runtime/library").Decimal;
                fechaEmision: Date;
                fechaVencimiento: Date;
                periodicidad: import(".prisma/client").$Enums.Periodicidad;
                anio: number;
                estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
                canceladaAt: Date | null;
                cancelacionMotivo: string | null;
                canceladaPorCuentaId: number | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deportistaId: number;
            monto: import("@prisma/client/runtime/library").Decimal;
            estadoPago: import(".prisma/client").$Enums.EstadoPago;
            fechaPago: Date;
            medioPago: string | null;
            linkComprobante: string | null;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            cuotaId: number;
        };
        initPoint: null;
        preferenceId: null;
    } | {
        pago: {
            cuota: {
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
                disciplinaId: number;
                deportistaId: number;
                nroCuota: number;
                monto: import("@prisma/client/runtime/library").Decimal;
                fechaEmision: Date;
                fechaVencimiento: Date;
                periodicidad: import(".prisma/client").$Enums.Periodicidad;
                anio: number;
                estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
                canceladaAt: Date | null;
                cancelacionMotivo: string | null;
                canceladaPorCuentaId: number | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deportistaId: number;
            monto: import("@prisma/client/runtime/library").Decimal;
            estadoPago: import(".prisma/client").$Enums.EstadoPago;
            fechaPago: Date;
            medioPago: string | null;
            linkComprobante: string | null;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            cuotaId: number;
        };
        initPoint: string;
        preferenceId: string;
    }>;
    /**
     * Sincroniza un pago con el estado de Mercado Pago. Solo permite al deportista dueño del pago.
     */
    syncPagoConMercadoPago(pagoId: number, mercadoPagoId: string, status: string, deportistaId: number): Promise<{
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
        cuota: {
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
            disciplinaId: number;
            deportistaId: number;
            nroCuota: number;
            monto: import("@prisma/client/runtime/library").Decimal;
            fechaEmision: Date;
            fechaVencimiento: Date;
            periodicidad: import(".prisma/client").$Enums.Periodicidad;
            anio: number;
            estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
            canceladaAt: Date | null;
            cancelacionMotivo: string | null;
            canceladaPorCuentaId: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deportistaId: number;
        monto: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaPago: Date;
        medioPago: string | null;
        linkComprobante: string | null;
        mercadoPagoId: string | null;
        mercadoPagoStatus: string | null;
        cuotaId: number;
    }>;
    confirmarPago(pagoId: number, mercadoPagoId: string, status: string): Promise<{
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
        cuota: {
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
            disciplinaId: number;
            deportistaId: number;
            nroCuota: number;
            monto: import("@prisma/client/runtime/library").Decimal;
            fechaEmision: Date;
            fechaVencimiento: Date;
            periodicidad: import(".prisma/client").$Enums.Periodicidad;
            anio: number;
            estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
            canceladaAt: Date | null;
            cancelacionMotivo: string | null;
            canceladaPorCuentaId: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deportistaId: number;
        monto: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaPago: Date;
        medioPago: string | null;
        linkComprobante: string | null;
        mercadoPagoId: string | null;
        mercadoPagoStatus: string | null;
        cuotaId: number;
    }>;
    getById(id: number): Promise<{
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
        cuota: {
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
            disciplinaId: number;
            deportistaId: number;
            nroCuota: number;
            monto: import("@prisma/client/runtime/library").Decimal;
            fechaEmision: Date;
            fechaVencimiento: Date;
            periodicidad: import(".prisma/client").$Enums.Periodicidad;
            anio: number;
            estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
            canceladaAt: Date | null;
            cancelacionMotivo: string | null;
            canceladaPorCuentaId: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deportistaId: number;
        monto: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaPago: Date;
        medioPago: string | null;
        linkComprobante: string | null;
        mercadoPagoId: string | null;
        mercadoPagoStatus: string | null;
        cuotaId: number;
    }>;
    getByMercadoPagoId(mercadoPagoId: string): Promise<({
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
        cuota: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            disciplinaId: number;
            deportistaId: number;
            nroCuota: number;
            monto: import("@prisma/client/runtime/library").Decimal;
            fechaEmision: Date;
            fechaVencimiento: Date;
            periodicidad: import(".prisma/client").$Enums.Periodicidad;
            anio: number;
            estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
            canceladaAt: Date | null;
            cancelacionMotivo: string | null;
            canceladaPorCuentaId: number | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        deportistaId: number;
        monto: import("@prisma/client/runtime/library").Decimal;
        estadoPago: import(".prisma/client").$Enums.EstadoPago;
        fechaPago: Date;
        medioPago: string | null;
        linkComprobante: string | null;
        mercadoPagoId: string | null;
        mercadoPagoStatus: string | null;
        cuotaId: number;
    }) | null>;
    getByDeportista(deportistaId: number, page?: number, limit?: number): Promise<{
        data: ({
            cuota: {
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
                disciplinaId: number;
                deportistaId: number;
                nroCuota: number;
                monto: import("@prisma/client/runtime/library").Decimal;
                fechaEmision: Date;
                fechaVencimiento: Date;
                periodicidad: import(".prisma/client").$Enums.Periodicidad;
                anio: number;
                estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
                canceladaAt: Date | null;
                cancelacionMotivo: string | null;
                canceladaPorCuentaId: number | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deportistaId: number;
            monto: import("@prisma/client/runtime/library").Decimal;
            estadoPago: import(".prisma/client").$Enums.EstadoPago;
            fechaPago: Date;
            medioPago: string | null;
            linkComprobante: string | null;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            cuotaId: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
export declare const pagoService: PagoService;
//# sourceMappingURL=pago.service.d.ts.map