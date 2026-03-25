import { Rol, Periodicidad } from '@prisma/client';

// =============================================================================
// AUTH DTOs
// =============================================================================

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  telefono?: string;
  rol: Rol;
}

// =============================================================================
// USER DTOs
// =============================================================================

export interface UpdateProfileDTO {
  email?: string;
  telefono?: string;
  currentPassword?: string;
  password?: string;
}

export interface AssignRoleDTO {
  rol: Rol;
}

// =============================================================================
// DEPORTISTA DTOs
// =============================================================================

export interface CreateAdultoResponsableDTO {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
}

export interface CreateDeportistaDTO {
  nombre: string;
  apellido: string;
  dni: string;
  generoId: number;
  categoriaId: number;
  subcategoriaId?: number;
  disciplinaId: number;
  email: string;
  password: string;
  adultoResponsable?: CreateAdultoResponsableDTO;
}

export interface UpdateDeportistaDTO {
  nombre?: string;
  apellido?: string;
  generoId?: number;
  categoriaId?: number;
  subcategoriaId?: number | null;
  disciplinaId?: number;
  adultoResponsable?: Partial<CreateAdultoResponsableDTO>;
  adultosResponsables?: Partial<CreateAdultoResponsableDTO>[];
}

// =============================================================================
// GRUPO FAMILIAR DTOs
// =============================================================================

export interface GrupoFamiliarIntegranteDTO {
  deportistaId: number;
  esPrincipal?: boolean;
}

export interface CreateGrupoFamiliarDTO {
  nombre: string;
  titularDni: string;
  cuotaHermano?: number;
  integrantes: GrupoFamiliarIntegranteDTO[];
}

export interface UpdateGrupoFamiliarDTO {
  nombre?: string;
  titularDni?: string;
  cuotaHermano?: number;
  integrantes?: GrupoFamiliarIntegranteDTO[];
}

// =============================================================================
// CUOTA DTOs
// =============================================================================

export interface CreateCuotaDTO {
  nroCuota: number;
  monto: number;
  fechaEmision: string;
  fechaVencimiento: string;
  periodicidad?: Periodicidad;
  disciplinaId: number;
  deportistaId: number;
}

export interface UpdateCuotaDTO {
  monto?: number;
  fechaVencimiento?: string;
  periodicidad?: Periodicidad;
}

export interface AsignarCuotaDTO {
  deportistaId: number;
  nroCuota: number;
  monto: number;
  fechaEmision: string;
  fechaVencimiento: string;
  disciplinaId: number;
}

export interface GenerarCuotasDTO {
  mes: number;
  anio: number;
}

// =============================================================================
// PAGO DTOs
// =============================================================================

export interface CreatePagoDTO {
  cuotaId: number;
  medioPago?: string;
}

// =============================================================================
// DISCIPLINA DTOs
// =============================================================================

export interface CreateDisciplinaDTO {
  nombre: string;
  precioMensual: number;
}

export interface UpdateDisciplinaDTO {
  nombre?: string;
  precioMensual?: number;
  activa?: boolean;
}

// =============================================================================
// NOTICIA DTOs
// =============================================================================

export interface CreateNoticiaDTO {
  titulo: string;
  fecha: string;
  resumen: string;
  contenido: string;
  autorId?: number;
  imagenes: string[];
}

export interface UpdateNoticiaDTO {
  titulo?: string;
  fecha?: string;
  resumen?: string;
  contenido?: string;
  imagenes?: string[];
}

// =============================================================================
// PASSWORD RESET DTOs
// =============================================================================

export interface ResetPasswordDTO {
  newPassword: string;
}
