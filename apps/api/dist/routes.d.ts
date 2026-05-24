import type { FastifyInstance } from "fastify";
import type { WorldStore } from "./store";
export interface RouteDependencies {
    readonly store: WorldStore;
    readonly seed: string;
}
export declare function registerRoutes(app: FastifyInstance, dependencies: RouteDependencies): Promise<void>;
//# sourceMappingURL=routes.d.ts.map