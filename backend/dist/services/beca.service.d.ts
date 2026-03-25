export declare class BecaService {
    /** Listar todos los deportistas becados */
    getAll(page?: number, limit?: number): Promise<{
        data: {
            id: number;
            nombre: string;
            apellido: string;
            dni: string;
            disciplina: string;
            precioMensual: number;
            cuotaBeca: number | null;
            montoEfectivo: number;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /** Dar beca a un deportista. Opcional: cuotaBeca (monto fijo para casos excepcionales). No se puede becar a quien ya está en un grupo familiar. */
    becar(deportistaId: number, cuotaBeca?: number): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        dni: string;
        becado: boolean;
        cuotaBeca: number | null;
        disciplina: string;
        precioMensual: number;
        montoEfectivo: number;
    }>;
    /** Quitar beca solo si está becado (usado al agregar a grupo familiar). No lanza si no tiene beca. */
    quitarBecaSiBecado(deportistaId: number): Promise<void>;
    /** Quitar beca a un deportista. Las cuotas pendientes pasan al precio normal de la disciplina. */
    quitarBeca(deportistaId: number): Promise<{
        ok: boolean;
        message: string;
    }>;
    /** Actualizar el monto de cuota beca (casos excepcionales). Actualiza cuotas pendientes a ese monto. */
    updateCuotaBeca(deportistaId: number, monto: number): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        dni: string;
        becado: boolean;
        cuotaBeca: number | null;
        disciplina: string;
        precioMensual: number;
        montoEfectivo: number;
    }>;
    getByDeportistaId(deportistaId: number): Promise<{
        id: number;
        nombre: string;
        apellido: string;
        dni: string;
        becado: boolean;
        cuotaBeca: number | null;
        disciplina: string;
        precioMensual: number;
        montoEfectivo: number;
    }>;
}
export declare const becaService: BecaService;
//# sourceMappingURL=beca.service.d.ts.map