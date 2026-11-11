"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRuleError = exports.ValidationError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    details;
    constructor(message, statusCode = 400, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(entityName, identifier) {
        const message = identifier
            ? `${entityName} com identificador '${identifier}' não foi encontrado.`
            : `${entityName} não encontrado.`;
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 422, details);
    }
}
exports.ValidationError = ValidationError;
class BusinessRuleError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
exports.BusinessRuleError = BusinessRuleError;
