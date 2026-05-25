export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/** Backend espera DNI en el campo email (convención web). */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseUser {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
  apellido?: string;
  activo?: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: LoginResponseUser;
  };
  message?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  rol: string;
  loginId: string;
  deportistaId?: number;
  nombre?: string;
  apellido?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isBootstrapping: boolean;
  loading: boolean;
  login: (dni: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export interface DeportistaProfile {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}
