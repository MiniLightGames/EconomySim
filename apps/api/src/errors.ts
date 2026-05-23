import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export interface ApiErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}

export function notFound(code: string, message: string, details?: unknown): ApiError {
  return new ApiError(404, code, message, details);
}

export function badRequest(code: string, message: string, details?: unknown): ApiError {
  return new ApiError(400, code, message, details);
}

export function toErrorBody(code: string, message: string, details?: unknown): ApiErrorBody {
  return {
    error: {
      code,
      message,
      ...(details === undefined ? {} : { details })
    }
  };
}

export function apiErrorHandler(error: FastifyError | ApiError | ZodError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send(toErrorBody(error.code, error.message, error.details));
  }

  if (error instanceof ZodError) {
    return reply.status(400).send(toErrorBody("VALIDATION_ERROR", "Request validation failed.", error.flatten()));
  }

  const statusCode = typeof error.statusCode === "number" && error.statusCode >= 400 ? error.statusCode : 500;
  const code = statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR";
  const message = statusCode >= 500 ? "Internal server error." : error.message;

  return reply.status(statusCode).send(toErrorBody(code, message));
}
