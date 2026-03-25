"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schemas) => {
    return async (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.params) {
                const parsedParams = await schemas.params.parseAsync(req.params);
                Object.assign(req.params, parsedParams);
            }
            if (schemas.query) {
                const parsedQuery = await schemas.query.parseAsync(req.query);
                Object.assign(req.query, parsedQuery);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join('.');
                    if (!formattedErrors[path]) {
                        formattedErrors[path] = [];
                    }
                    formattedErrors[path].push(issue.message);
                });
                res.status(400).json({
                    success: false,
                    error: 'Error de validacion',
                    errors: formattedErrors,
                });
                return;
            }
            next(error);
        }
    };
};
exports.validate = validate;
const validateBody = (schema) => (0, exports.validate)({ body: schema });
exports.validateBody = validateBody;
const validateParams = (schema) => (0, exports.validate)({ params: schema });
exports.validateParams = validateParams;
const validateQuery = (schema) => (0, exports.validate)({ query: schema });
exports.validateQuery = validateQuery;
//# sourceMappingURL=validation.middleware.js.map