import { type FastifyInstance } from "fastify";
import { type AuthSessionRepository } from "./auth";
import { type WorldStore } from "./store";
export interface CreateApiOptions {
    readonly store?: WorldStore;
    readonly authRepository?: AuthSessionRepository;
    readonly seed?: string;
    readonly logger?: boolean;
    readonly allowDemoAuth?: boolean;
}
export declare function createApi(options?: CreateApiOptions): Promise<FastifyInstance>;
declare module "fastify" {
    interface FastifyInstance {
        worldStore: WorldStore;
        authRepository: AuthSessionRepository;
    }
}
//# sourceMappingURL=server.d.ts.map