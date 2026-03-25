"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendCreated = sendCreated;
exports.sendError = sendError;
exports.sendNotFound = sendNotFound;
exports.sendUnauthorized = sendUnauthorized;
exports.sendForbidden = sendForbidden;
exports.sendValidationError = sendValidationError;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, message, statusCode = 200) {
    const response = {
        success: true,
        data,
        message,
    };
    return res.status(statusCode).json(response);
}
function sendCreated(res, data, message = 'Recurso creado exitosamente') {
    return sendSuccess(res, data, message, 201);
}
function sendError(res, error, statusCode = 400, errors) {
    const response = {
        success: false,
        error,
        errors,
    };
    return res.status(statusCode).json(response);
}
function sendNotFound(res, message = 'Recurso no encontrado') {
    return sendError(res, message, 404);
}
function sendUnauthorized(res, message = 'No autorizado') {
    return sendError(res, message, 401);
}
function sendForbidden(res, message = 'Acceso denegado') {
    return sendError(res, message, 403);
}
function sendValidationError(res, errors) {
    return sendError(res, 'Error de validacion', 400, errors);
}
function sendPaginated(res, data, total, page, limit) {
    const response = {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
    return res.status(200).json({
        success: true,
        ...response,
    });
}
//# sourceMappingURL=response.js.map