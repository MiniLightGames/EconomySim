import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
export interface ApiErrorBody {
    readonly error: {
        readonly code: string;
        readonly message: string;
        readonly details?: unknown;
    };
}
export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown | undefined;
    constructor(statusCode: number, code: string, message: string, details?: unknown | undefined);
}
export declare function notFound(code: string, message: string, details?: unknown): ApiError;
export declare function badRequest(code: string, message: string, details?: unknown): ApiError;
export declare function unauthorized(code: string, message: string, details?: unknown): ApiError;
export declare function forbidden(code: string, message: string, details?: unknown): ApiError;
export declare function toErrorBody(code: string, message: string, details?: unknown): ApiErrorBody;
export declare function apiErrorHandler(error: FastifyError | ApiError | ZodError, _request: FastifyRequest, reply: FastifyReply): unknown;
//# sourceMappingURL=errors.d.ts.map