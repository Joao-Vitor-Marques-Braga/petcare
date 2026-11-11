"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const AppError_js_1 = require("../../shared/errors/AppError.js");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return res.status(422).json({
            status: 'error',
            message: 'Erro de validação dos dados enviados.',
            errors: formattedErrors,
        });
    }
    if (err instanceof AppError_js_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            details: err.details,
        });
    }
    console.error('[UNHANDLED ERROR]', err);
    return res.status(500).json({
        status: 'error',
        message: 'Erro interno no servidor.',
    });
}
