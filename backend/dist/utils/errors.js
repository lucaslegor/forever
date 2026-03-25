"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.BadRequestError = exports.ConflictError = exports.ValidationError = exports.UserBlockedError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 400, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
/** Error cuando la cuenta está bloqueada por intentos fallidos; incluye hasta cuándo está bloqueada */
class UserBlockedError extends ForbiddenError {
    bloqueadoHasta;
    constructor(message = 'Usuario bloqueado temporalmente por intentos fallidos', bloqueadoHasta) {
        super(message);
        this.bloqueadoHasta = bloqueadoHasta;
        Object.setPrototypeOf(this, UserBlockedError.prototype);
    }
}
exports.UserBlockedError = UserBlockedError;
class ValidationError extends AppError {
    errors;
    constructor(message = 'Error de validacion', errors = {}) {
        super(message, 400);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends AppError {
    constructor(message = 'El recurso ya existe') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends AppError {
    constructor(message = 'Solicitud invalida') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
// Errores específicos del dominio
exports.ErrorMessages = {
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
    GRUPO_FAMILIAR_DEPORTISTA_EN_OTRO: 'Uno o mas deportistas ya pertenecen a otro grupo familiar. Elimine el grupo anterior para poder agregarlos.',
    // Disciplina / Clasificación
    DISCIPLINA_NOT_FOUND: 'Disciplina no encontrada',
    DISCIPLINA_NAME_EXISTS: 'Ya existe una disciplina con ese nombre',
    SUBCATEGORIA_TIENE_DEPORTISTAS: 'No se puede eliminar la subcategoría porque tiene deportistas asociados. Reasigná o eliminá los jugadores primero.',
    CATEGORIA_TIENE_DEPORTISTAS: 'No se puede eliminar la categoría porque tiene deportistas asociados. Reasigná o eliminá los jugadores primero.',
    // General
    REQUIRED_FIELDS: 'Complete todos los campos obligatorios',
    INVALID_DATE_RANGE: 'El rango de fechas es invalido',
    SERVER_ERROR: 'Error interno del servidor',
};
//# sourceMappingURL=errors.js.map