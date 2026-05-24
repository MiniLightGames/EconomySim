import type { FastifyRequest } from "fastify";
export interface AuthenticatedPlayerSession {
    readonly userId: string;
    readonly sessionId: string;
    readonly playerId: string;
}
export declare function resolvePlayerSession(request: FastifyRequest): AuthenticatedPlayerSession;
export declare function bindCommandToSession<T extends object>(command: T, session: AuthenticatedPlayerSession): Omit<T, "playerId"> & {
    readonly playerId: string;
};
//# sourceMappingURL=auth.d.ts.map