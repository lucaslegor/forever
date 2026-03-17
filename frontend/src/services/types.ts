export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  captchaToken: string;
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
      /** Nombre del usuario (deportista/administrativo), si aplica */
      nombre?: string;
      /** Disciplina del deportista para menú/fixture, si aplica */
      disciplinaNombre?: string;
    };
    /** Ya no se envía: el token va en cookie HttpOnly */
    token?: string;
  };
}
