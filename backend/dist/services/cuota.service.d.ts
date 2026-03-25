import { AsignarCuotaDTO, UpdateCuotaDTO } from '../types/requests';
import { CuotasQuery, ListCuotasQuery } from '../validators/cuota.validator';
import { Prisma } from '@prisma/client';
export declare class CuotaService {
    asignar(data: AsignarCuotaDTO): Promise<{
        disciplina: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            precioMensual: Prisma.Decimal;
            activa: boolean;
        };
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
            cuotaBeca: Prisma.Decimal | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        disciplinaId: number;
        deportistaId: number;
        nroCuota: number;
        monto: Prisma.Decimal;
        fechaEmision: Date;
        fechaVencimiento: Date;
        periodicidad: import(".prisma/client").$Enums.Periodicidad;
        anio: number;
        estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
        canceladaAt: Date | null;
        cancelacionMotivo: string | null;
        canceladaPorCuentaId: number | null;
    }>;
    getById(id: number): Promise<{
        disciplina: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            precioMensual: Prisma.Decimal;
            activa: boolean;
        };
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
            cuotaBeca: Prisma.Decimal | null;
        };
        pagos: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deportistaId: number;
            monto: Prisma.Decimal;
            estadoPago: import(".prisma/client").$Enums.EstadoPago;
            fechaPago: Date;
            medioPago: string | null;
            linkComprobante: string | null;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            cuotaId: number;
        }[];
        canceladaPorCuenta: {
            id: number;
            email: string;
            password: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            intentosFallidos: number;
            bloqueadoHasta: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | {
            id: number;
            email: string;
            password: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            intentosFallidos: number;
            bloqueadoHasta: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        disciplinaId: number;
        deportistaId: number;
        nroCuota: number;
        monto: Prisma.Decimal;
        fechaEmision: Date;
        fechaVencimiento: Date;
        periodicidad: import(".prisma/client").$Enums.Periodicidad;
        anio: number;
        estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
        canceladaAt: Date | null;
        cancelacionMotivo: string | null;
        canceladaPorCuentaId: number | null;
    }>;
    update(id: number, data: UpdateCuotaDTO): Promise<{
        disciplina: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            precioMensual: Prisma.Decimal;
            activa: boolean;
        };
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
            cuotaBeca: Prisma.Decimal | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        disciplinaId: number;
        deportistaId: number;
        nroCuota: number;
        monto: Prisma.Decimal;
        fechaEmision: Date;
        fechaVencimiento: Date;
        periodicidad: import(".prisma/client").$Enums.Periodicidad;
        anio: number;
        estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
        canceladaAt: Date | null;
        cancelacionMotivo: string | null;
        canceladaPorCuentaId: number | null;
    }>;
    getPredefinidas(disciplinaId?: number): Promise<{
        disciplinaId: number;
        disciplinaNombre: string;
        montoMensual: Prisma.Decimal;
    }[]>;
    getEstadoCuenta(deportistaId: number): Promise<{
        deportista: {
            id: number;
            nombre: string;
            apellido: string;
        };
        cuotasPagadas: {
            id: number;
            nroCuota: number;
            monto: Prisma.Decimal;
            fechaPago: Date;
            medioPago: string | null;
            disciplina: string;
        }[];
        cuotasPendientes: {
            id: number;
            nroCuota: number;
            anio: number;
            monto: number | Prisma.Decimal;
            fechaVencimiento: Date;
            estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
            disciplina: string;
        }[];
        totalAdeudado: number;
        esTitularGrupoFamiliar: boolean;
    }>;
    getByDeportista(deportistaId: number, query: CuotasQuery): Promise<{
        data: ({
            disciplina: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                nombre: string;
                precioMensual: Prisma.Decimal;
                activa: boolean;
            };
            pagos: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                deportistaId: number;
                monto: Prisma.Decimal;
                estadoPago: import(".prisma/client").$Enums.EstadoPago;
                fechaPago: Date;
                medioPago: string | null;
                linkComprobante: string | null;
                mercadoPagoId: string | null;
                mercadoPagoStatus: string | null;
                cuotaId: number;
            }[];
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            disciplinaId: number;
            deportistaId: number;
            nroCuota: number;
            monto: Prisma.Decimal;
            fechaEmision: Date;
            fechaVencimiento: Date;
            periodicidad: import(".prisma/client").$Enums.Periodicidad;
            anio: number;
            estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
            canceladaAt: Date | null;
            cancelacionMotivo: string | null;
            canceladaPorCuentaId: number | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /** Listado para admin: todas las cuotas con filtros anio, mes, estado, disciplina */
    getAll(query: ListCuotasQuery): Promise<{
        data: {
            id: number;
            deportistaId: number;
            disciplinaId: number;
            deportistaNombre: string;
            disciplina: string;
            genero: string;
            categoria: string;
            subcategoria: string;
            mes: number;
            anio: number;
            monto: number;
            formaPago: string;
            estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
            fechaPago: Date;
            canceladaAt: any;
            cancelacionMotivo: any;
            canceladaPor: any;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
    /** Borrar todas las cuotas de una generación (mes + año + disciplina). Elimina pagos asociados y luego las cuotas. */
    deletePorGeneracion(anio: number, mes: number, disciplinaId: number): Promise<{
        message: string;
        eliminadas: number;
    }>;
    /** Borrar todas las cuotas de un mes/año (toda la generación del mes). */
    deletePorMes(anio: number, mes: number): Promise<{
        message: string;
        eliminadas: number;
    }>;
    /** Marcar cuota como pagada en efectivo (admin). Si es el titular del grupo familiar, marca como pagadas las cuotas del mismo período de todos los miembros. */
    marcarPagadaEfectivo(id: number): Promise<{
        disciplina: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            precioMensual: Prisma.Decimal;
            activa: boolean;
        };
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
            cuotaBeca: Prisma.Decimal | null;
        };
        pagos: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deportistaId: number;
            monto: Prisma.Decimal;
            estadoPago: import(".prisma/client").$Enums.EstadoPago;
            fechaPago: Date;
            medioPago: string | null;
            linkComprobante: string | null;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            cuotaId: number;
        }[];
        canceladaPorCuenta: {
            id: number;
            email: string;
            password: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            intentosFallidos: number;
            bloqueadoHasta: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | {
            id: number;
            email: string;
            password: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            intentosFallidos: number;
            bloqueadoHasta: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        disciplinaId: number;
        deportistaId: number;
        nroCuota: number;
        monto: Prisma.Decimal;
        fechaEmision: Date;
        fechaVencimiento: Date;
        periodicidad: import(".prisma/client").$Enums.Periodicidad;
        anio: number;
        estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
        canceladaAt: Date | null;
        cancelacionMotivo: string | null;
        canceladaPorCuentaId: number | null;
    }>;
    /** Cancelar deuda de una cuota (admin). Solo si está PENDIENTE o VENCIDA. */
    cancelarDeuda(id: number, motivo: string, canceladaPorCuentaId: number): Promise<{
        disciplina: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nombre: string;
            precioMensual: Prisma.Decimal;
            activa: boolean;
        };
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
            cuotaBeca: Prisma.Decimal | null;
        };
        pagos: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            deportistaId: number;
            monto: Prisma.Decimal;
            estadoPago: import(".prisma/client").$Enums.EstadoPago;
            fechaPago: Date;
            medioPago: string | null;
            linkComprobante: string | null;
            mercadoPagoId: string | null;
            mercadoPagoStatus: string | null;
            cuotaId: number;
        }[];
        canceladaPorCuenta: {
            id: number;
            email: string;
            password: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            intentosFallidos: number;
            bloqueadoHasta: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | {
            id: number;
            email: string;
            password: string;
            rol: import(".prisma/client").$Enums.Rol;
            activo: boolean;
            intentosFallidos: number;
            bloqueadoHasta: Date | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        disciplinaId: number;
        deportistaId: number;
        nroCuota: number;
        monto: Prisma.Decimal;
        fechaEmision: Date;
        fechaVencimiento: Date;
        periodicidad: import(".prisma/client").$Enums.Periodicidad;
        anio: number;
        estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
        canceladaAt: Date | null;
        cancelacionMotivo: string | null;
        canceladaPorCuentaId: number | null;
    }>;
    actualizarVencidas(): Promise<{
        actualizadas: number;
    }>;
    generarCuotasMensuales(mes: number, anio: number): Promise<{
        cuotasGeneradas: number;
        cuotasOmitidas: number;
        montoTotal: number;
        detalles: Array<{
            deportistaId: number;
            nombre: string;
            monto: number;
            usaCuotaHermano: boolean;
        }>;
        mensaje: string;
    }>;
    /**
     * Asigna la cuota del mes actual al deportista solo si ya hay cuotas generadas para ese mes
     * (p. ej. el admin ya ejecutó "Generar cuotas mensuales"). Si no hay ninguna cuota en curso
     * para el mes, no se genera ninguna. Si el deportista ya tiene esa cuota, no hace nada.
     */
    asignarCuotaDelMesActual(deportistaId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        disciplinaId: number;
        deportistaId: number;
        nroCuota: number;
        monto: Prisma.Decimal;
        fechaEmision: Date;
        fechaVencimiento: Date;
        periodicidad: import(".prisma/client").$Enums.Periodicidad;
        anio: number;
        estadoCuota: import(".prisma/client").$Enums.EstadoCuota;
        canceladaAt: Date | null;
        cancelacionMotivo: string | null;
        canceladaPorCuentaId: number | null;
    } | null>;
    /**
     * Actualiza el monto solo de cuotas PENDIENTES y VENCIDAS cuando cambia el precio de la disciplina.
     * No toca cuotas PAGADAS: lo ya cobrado queda con el valor histórico (reportes correctos).
     * Respeta grupo familiar (cuotaHermano) y beca.
     */
    actualizarMontosPorCambioPrecioDisciplina(disciplinaId: number, nuevoPrecio: number): Promise<number>;
}
export declare const cuotaService: CuotaService;
//# sourceMappingURL=cuota.service.d.ts.map