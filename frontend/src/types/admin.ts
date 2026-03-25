/** Adulto responsable (cuando categoría es Infantil o Juvenil) */
export interface AdultoResponsable {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono: string;
}

/** Deportista (cuenta): ingreso con DNI + contraseña; crear con datos + contraseña inicial */
export interface Deportista {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    disciplina: string;
    genero: string;
    categoria: string;
    subcategoria: string;
    adultoResponsable?: AdultoResponsable | null;
    adultosResponsables?: AdultoResponsable[];
    activo: boolean;
}

/** Cuota para admin: filtrar por deportista y marcar efectivo como pagada */
export interface CuotaAdmin {
    id: number;
    deportistaId: number;
    deportistaNombre: string;
    disciplina: string;
    genero: string;
    categoria: string;
    subcategoria: string;
    mes: number;
    anio: number;
    monto: number;
    /** 'efectivo' = pago en efectivo; 'sistema' = transferencia/tarjeta/online */
    formaPago: 'efectivo' | 'sistema' | '';
    estadoCuota: 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'CANCELADA';
    fechaPago?: string;
    canceladaAt?: string | null;
    cancelacionMotivo?: string | null;
    canceladaPor?: string | null;
}

/** Grupo familiar para admin: crear, modificar, borrar; titular paga la cuota */
export interface GrupoFamiliarAdmin {
    id: number;
    /** DNI del miembro que es titular (desde su perfil se paga la cuota) */
    titularDni: string;
    miembros: { id: number; nombre: string; apellido: string; dni: string }[];
    /** Monto de la cuota para hermanos (descuento familiar) */
    cuotaHermano?: number;
}

/** Usuario admin: ingreso con documento + contraseña */
export interface AdminUser {
    id: number;
    /** ID de la cuenta (cuentaUsuario) para saber si es el usuario actual */
    cuentaId?: number;
    documento: string;
    nombre: string;
    activo: boolean;
}

/** Disciplina con valor (ABM, actualizar valor) */
export interface Disciplina {
    id: number;
    nombre: string;
    valorMensual: number;
    activo: boolean;
}
