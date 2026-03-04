export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      email: string;
      rol: string;
      activo: boolean;
      deportistaId?: number;
    };
    /** Ya no se envía: el token va en cookie HttpOnly */
    token?: string;
  };
}
