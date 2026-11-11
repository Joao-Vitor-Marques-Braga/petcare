export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(entityName: string, identifier?: string) {
    const message = identifier
      ? `${entityName} com identificador '${identifier}' não foi encontrado.`
      : `${entityName} não encontrado.`;
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 422, details);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
