import { type FastifyInstance } from "fastify";
import { type WorldStore } from "./store";
export interface CreateApiOptions {
    readonly store?: WorldStore;
    readonly seed?: string;
    readonly logger?: boolean;
}
export declare function createApi(options?: CreateApiOptions): Promise<FastifyInstance>;
//# sourceMappingURL=server.d.ts.map