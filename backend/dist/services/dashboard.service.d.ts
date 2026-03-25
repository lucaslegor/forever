export interface RecaudacionPorClasificacionRow {
    disciplinaId: number;
    disciplinaNombre: string;
    generoId: number;
    generoNombre: string;
    categoriaId: number;
    categoriaNombre: string;
    subcategoriaId: number | null;
    subcategoriaNombre: string | null;
    totalRecaudado: number;
    cantidadPagos: number;
}
export interface DeportistasPorDisciplinaRow {
    disciplinaId: number;
    disciplinaNombre: string;
    cantidad: number;
}
export interface CuotasPendientesVencidas {
    pendientes: number;
    vencidas: number;
    total: number;
    /** Monto total por cobrar de cuotas pendientes */
    montoPendientes: number;
    /** Monto total por cobrar de cuotas vencidas */
    montoVencidas: number;
}
export interface PagosPorMedioRow {
    medio: string;
    cantidad: number;
    montoTotal: number;
}
export interface DashboardStats {
    recaudacionPorClasificacion: RecaudacionPorClasificacionRow[];
    deportistasPorDisciplina: DeportistasPorDisciplinaRow[];
    cuotasPendientesVencidas: CuotasPendientesVencidas;
    pagosPorMedio: PagosPorMedioRow[];
    totalRecaudado: number;
}
export interface DeudorRow {
    deportistaId: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    disciplinaNombre: string;
    categoriaNombre: string;
    subcategoriaNombre: string | null;
    generoNombre: string;
    /** Nombre del grupo familiar si es integrante (evita doble conteo al sumar montos). */
    grupoFamiliarNombre: string | null;
    cuotasImpagas: {
        nroCuota: number;
        anio: number;
        monto: number;
        estado: string;
        fechaVencimiento: string;
    }[];
    montoTotalAdeudado: number;
}
export declare class DashboardService {
    getStats(anio?: number, mes?: number): Promise<DashboardStats>;
    getDeudores(filters?: {
        disciplinaId?: number;
        generoId?: number;
        categoriaId?: number;
        subcategoriaId?: number;
        anio?: number;
        mes?: number;
    }): Promise<DeudorRow[]>;
}
export declare const dashboardService: DashboardService;
//# sourceMappingURL=dashboard.service.d.ts.map