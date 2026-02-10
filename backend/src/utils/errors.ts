export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string = 'Error de validacion', errors: Record<string, string[]> = {}) {
    super(message, 400);
    this.errors = errors;
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'El recurso ya existe') {
    super(message, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Solicitud invalida') {
    super(message, 400);
  }
}

// Errores específicos del dominio
export const ErrorMessages = {
  // Auth
  INVALID_CREDENTIALS: 'Email o contrasena incorrectos',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_INACTIVE: 'Usuario inhabilitado, contacte al administrador',
  USER_BLOCKED: 'Usuario bloqueado temporalmente por intentos fallidos',
  TOKEN_EXPIRED: 'La sesion ha caducado, vuelva a iniciar sesion',
  TOKEN_INVALID: 'Token invalido',
  TOKEN_NOT_PROVIDED: 'Token no proporcionado',

  // Registration
  EMAIL_EXISTS: 'El email ya esta registrado en el sistema',
  DNI_EXISTS: 'El DNI ya esta registrado en el sistema',
  WEAK_PASSWORD: 'La contrasena debe tener al menos 8 caracteres y una mayuscula',
  INVALID_EMAIL_FORMAT: 'Formato de email incorrecto',

  // Roles
  ADMIN_REQUIRED: 'Acceso denegado. Se requiere rol de Administrador',
  ADMINISTRATIVO_REQUIRED: 'Acceso denegado. Se requiere rol de Administrativo',
  PRINCIPAL_ADMIN_REQUIRED: 'Solo el administrador principal puede realizar esta acción',
  LAST_ADMIN: 'No se puede cambiar el rol. Debe haber al menos un Administrador en el sistema',

  // Deportista
  DEPORTISTA_NOT_FOUND: 'Deportista no encontrado',
  DEPORTISTA_DNI_EXISTS: 'Ya existe un deportista con ese DNI',

  // Cuota
  CUOTA_NOT_FOUND: 'Cuota no encontrada',
  CUOTA_ALREADY_ASSIGNED: 'La cuota ya esta asignada al deportista para este periodo',
  CUOTA_ALREADY_PAID: 'La cuota ya fue pagada',
  CUOTA_NOT_PENDING: 'Solo se pueden pagar cuotas en estado Pendiente',

  // Pago
  PAGO_NOT_FOUND: 'Pago no encontrado',
  PAYMENT_SERVICE_UNAVAILABLE: 'El servicio de pagos no esta disponible en este momento',

  // Grupo Familiar
  GRUPO_FAMILIAR_NOT_FOUND: 'Grupo familiar no encontrado',
  GRUPO_FAMILIAR_DUPLICATE: 'Ya existe un grupo familiar con la misma composicion',

  // Disciplina
  DISCIPLINA_NOT_FOUND: 'Disciplina no encontrada',
  DISCIPLINA_NAME_EXISTS: 'Ya existe una disciplina con ese nombre',

  // General
  REQUIRED_FIELDS: 'Complete todos los campos obligatorios',
  INVALID_DATE_RANGE: 'El rango de fechas es invalido',
  SERVER_ERROR: 'Error interno del servidor',
} as const;
