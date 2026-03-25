export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
/** Error cuando la cuenta está bloqueada por intentos fallidos; incluye hasta cuándo está bloqueada */
export declare class UserBlockedError extends ForbiddenError {
    readonly bloqueadoHasta?: Date | undefined;
    constructor(message?: string, bloqueadoHasta?: Date | undefined);
}
export declare class ValidationError extends AppError {
    readonly errors: Record<string, string[]>;
    constructor(message?: string, errors?: Record<string, string[]>);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string);
}
export declare const ErrorMessages: {
    readonly INVALID_CREDENTIALS: "Email o contrasena incorrectos";
    readonly USER_NOT_FOUND: "Usuario no encontrado";
    readonly USER_INACTIVE: "Usuario inhabilitado, contacte al administrador";
    readonly USER_BLOCKED: "Usuario bloqueado temporalmente por intentos fallidos";
    readonly TOKEN_EXPIRED: "La sesion ha caducado, vuelva a iniciar sesion";
    readonly TOKEN_INVALID: "Token invalido";
    readonly TOKEN_NOT_PROVIDED: "Token no proporcionado";
    readonly EMAIL_EXISTS: "El email ya esta registrado en el sistema";
    readonly DNI_EXISTS: "El DNI ya esta registrado en el sistema";
    readonly WEAK_PASSWORD: "La contrasena debe tener al menos 8 caracteres y una mayuscula";
    readonly INVALID_EMAIL_FORMAT: "Formato de email incorrecto";
    readonly ADMIN_REQUIRED: "Acceso denegado. Se requiere rol de Administrador";
    readonly ADMINISTRATIVO_REQUIRED: "Acceso denegado. Se requiere rol de Administrativo";
    readonly PRINCIPAL_ADMIN_REQUIRED: "Solo el administrador principal puede realizar esta acción";
    readonly LAST_ADMIN: "No se puede cambiar el rol. Debe haber al menos un Administrador en el sistema";
    readonly DEPORTISTA_NOT_FOUND: "Deportista no encontrado";
    readonly DEPORTISTA_DNI_EXISTS: "Ya existe un deportista con ese DNI";
    readonly CUOTA_NOT_FOUND: "Cuota no encontrada";
    readonly CUOTA_ALREADY_ASSIGNED: "La cuota ya esta asignada al deportista para este periodo";
    readonly CUOTA_ALREADY_PAID: "La cuota ya fue pagada";
    readonly CUOTA_NOT_PENDING: "Solo se pueden pagar cuotas en estado Pendiente";
    readonly PAGO_NOT_FOUND: "Pago no encontrado";
    readonly PAYMENT_SERVICE_UNAVAILABLE: "El servicio de pagos no esta disponible en este momento";
    readonly GRUPO_FAMILIAR_NOT_FOUND: "Grupo familiar no encontrado";
    readonly GRUPO_FAMILIAR_DUPLICATE: "Ya existe un grupo familiar con la misma composicion";
    readonly GRUPO_FAMILIAR_DEPORTISTA_EN_OTRO: "Uno o mas deportistas ya pertenecen a otro grupo familiar. Elimine el grupo anterior para poder agregarlos.";
    readonly DISCIPLINA_NOT_FOUND: "Disciplina no encontrada";
    readonly DISCIPLINA_NAME_EXISTS: "Ya existe una disciplina con ese nombre";
    readonly SUBCATEGORIA_TIENE_DEPORTISTAS: "No se puede eliminar la subcategoría porque tiene deportistas asociados. Reasigná o eliminá los jugadores primero.";
    readonly CATEGORIA_TIENE_DEPORTISTAS: "No se puede eliminar la categoría porque tiene deportistas asociados. Reasigná o eliminá los jugadores primero.";
    readonly REQUIRED_FIELDS: "Complete todos los campos obligatorios";
    readonly INVALID_DATE_RANGE: "El rango de fechas es invalido";
    readonly SERVER_ERROR: "Error interno del servidor";
};
//# sourceMappingURL=errors.d.ts.map