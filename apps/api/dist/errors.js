"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.notFound = notFound;
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.toErrorBody = toErrorBody;
exports.apiErrorHandler = apiErrorHandler;
const zod_1 = require("zod");
class ApiError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
exports.ApiError = ApiError;
function notFound(code, message, details) {
    return new ApiError(404, code, message, details);
}
function badRequest(code, message, details) {
    return new ApiError(400, code, message, details);
}
function unauthorized(code, message, details) {
    return new ApiError(401, code, message, details);
}
function forbidden(code, message, details) {
    return new ApiError(403, code, message, details);
}
function toErrorBody(code, message, details) {
    return {
        error: {
            code,
            message,
            ...(details === undefined ? {} : { details })
        }
    };
}
function apiErrorHandler(error, _request, reply) {
    if (error instanceof ApiError) {
        return reply.status(error.statusCode).send(toErrorBody(error.code, error.message, error.details));
    }
    if (error instanceof zod_1.ZodError) {
        return reply.status(400).send(toErrorBody("VALIDATION_ERROR", "Request validation failed.", error.flatten()));
    }
    const statusCode = typeof error.statusCode === "number" && error.statusCode >= 400 ? error.statusCode : 500;
    const code = statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR";
    const message = statusCode >= 500 ? "Internal server error." : error.message;
    return reply.status(statusCode).send(toErrorBody(code, message));
}
//# sourceMappingURL=errors.js.map