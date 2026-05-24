import type { FastifyReply, FastifyRequest } from "fastify";
export type AuthRole = "player" | "developer" | "admin";
export interface AuthenticatedPlayerSession {
    readonly userId: string;
    readonly sessionId: string;
    readonly playerId: string;
    readonly roles: readonly AuthRole[];
    readonly expiresAt: string | null;
    readonly source: "repository" | "demo";
}
export interface AuthSessionRepository {
    resolveSession(token: string): Promise<AuthenticatedPlayerSession | null>;
    close?(): Promise<void>;
}
export interface AuthPreHandlerOptions {
    readonly allowDemoFallback: boolean;
}
export declare class InMemoryAuthSessionRepository implements AuthSessionRepository {
    private readonly sessions;
    constructor(sessions?: Readonly<Record<string, AuthenticatedPlayerSession>>);
    resolveSession(token: string): Promise<AuthenticatedPlayerSession | null>;
}
export interface PrismaAuthClientLike {
    readonly session?: {
        findFirst(args: unknown): Promise<unknown | null>;
    };
    $disconnect?(): Promise<void>;
}
export declare class PrismaAuthSessionRepository implements AuthSessionRepository {
    private readonly prisma;
    constructor(prisma: PrismaAuthClientLike);
    resolveSession(token: string): Promise<AuthenticatedPlayerSession | null>;
    close(): Promise<void>;
}
export declare function createAuthPreHandler(repository: AuthSessionRepository, options: AuthPreHandlerOptions): (request: FastifyRequest, _reply: FastifyReply) => Promise<void>;
export declare function resolvePlayerSession(request: FastifyRequest): AuthenticatedPlayerSession;
export declare function bindCommandToSession<T extends object>(command: T, session: AuthenticatedPlayerSession): Omit<T, "playerId"> & {
    readonly playerId: string;
};
export declare function requireRole(request: FastifyRequest, acceptedRoles: readonly AuthRole[]): AuthenticatedPlayerSession;
declare module "fastify" {
    interface FastifyRequest {
        authSession?: AuthenticatedPlayerSession;
    }
}
//# sourceMappingURL=auth.d.ts.map