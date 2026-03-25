/** Horas válidas para turnos: 14 a 23 y 0, 1 (00:00 y 01:00) */
export declare const HORAS_TURNO: number[];
export declare const MONTO_SENA = 10;
export declare class ReservaCanchaService {
    /** Cancela reservas con seña por transferencia que ya vencieron (20 min) y no fueron pagadas */
    cancelarReservasTransferenciaVencidas(): Promise<number>;
    /** Disponibilidad: slots ocupados = seña pagada O transferencia aún no vencida */
    getOcupadosPorFecha(fecha: string): Promise<number[]>;
    /** Listar reservas (admin): por defecto desde hoy, opcional filtro fecha */
    list(fechaDesde?: string, fechaHasta?: string): Promise<{
        id: number;
        fecha: string;
        hora: number;
        nombreCliente: string;
        telefono: string;
        email: string | null;
        montoSena: number;
        senaPagada: boolean;
        senaMetodoPago: string | null;
        senaExpiraAt: string | null;
        restoPagado: boolean;
        montoTotal: number | null;
        notas: string | null;
        canceladaAt: string | null;
        createdAt: string;
    }[]>;
    /** Crear reserva (público o admin). metodoPago: 'mercadopago' (default) o 'transferencia' */
    create(data: {
        fecha: string;
        hora: number;
        nombreCliente: string;
        telefono: string;
        email?: string;
        notas?: string;
        metodoPago?: 'mercadopago' | 'transferencia';
    }): Promise<{
        reserva: {
            id: number;
            fecha: string;
            hora: number;
            nombreCliente: string;
            telefono: string;
            email: string | null;
            montoSena: number;
            senaPagada: boolean;
            senaMetodoPago: string | null;
            senaExpiraAt: string | null;
            restoPagado: boolean;
            createdAt: string;
        };
        metodoPago: "transferencia";
        whatsappLink: string;
        expiraAt: string | null;
        minutosParaPagar: number;
        initPoint?: undefined;
        preferenceId?: undefined;
    } | {
        reserva: {
            id: number;
            fecha: string;
            hora: number;
            nombreCliente: string;
            telefono: string;
            email: string | null;
            montoSena: number;
            senaPagada: boolean;
            senaMetodoPago: string | null;
            senaExpiraAt: string | null;
            restoPagado: boolean;
            createdAt: string;
        };
        metodoPago: "mercadopago";
        initPoint: string;
        preferenceId: string;
        whatsappLink?: undefined;
        expiraAt?: undefined;
        minutosParaPagar?: undefined;
    } | {
        reserva: {
            id: number;
            fecha: string;
            hora: number;
            nombreCliente: string;
            telefono: string;
            email: string | null;
            montoSena: number;
            senaPagada: boolean;
            senaMetodoPago: string | null;
            senaExpiraAt: string | null;
            restoPagado: boolean;
            createdAt: string;
        };
        metodoPago: "mercadopago";
        whatsappLink?: undefined;
        expiraAt?: undefined;
        minutosParaPagar?: undefined;
        initPoint?: undefined;
        preferenceId?: undefined;
    }>;
    /** Marcar seña pagada / resto pagado (admin) */
    updatePagos(id: number, data: {
        senaPagada?: boolean;
        restoPagado?: boolean;
        montoTotal?: number;
    }): Promise<{
        id: number;
        fecha: string;
        hora: number;
        senaPagada: boolean;
        restoPagado: boolean;
        montoTotal: number | null;
    }>;
    /** Actualizar reserva (admin): notas, monto total */
    update(id: number, data: {
        notas?: string;
        montoTotal?: number;
    }): Promise<{
        id: number;
        fecha: string;
        hora: number;
        nombreCliente: string;
        telefono: string;
        email: string | null;
        montoSena: number;
        senaPagada: boolean;
        restoPagado: boolean;
        montoTotal: number | null;
        notas: string | null;
    }>;
    /** Eliminar/cancelar reserva (admin) */
    /** Cancela la reserva (soft-delete: set canceladaAt). El turno queda libre para nuevas reservas. No se puede cancelar si el resto ya está pagado. */
    delete(id: number): Promise<{
        ok: boolean;
    }>;
}
export declare const reservaCanchaService: ReservaCanchaService;
//# sourceMappingURL=reservaCancha.service.d.ts.map