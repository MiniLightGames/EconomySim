import type { Company, WorldState } from "@economysim/domain";
export interface StoreHealth {
    readonly kind: "memory" | "prisma";
    readonly status: "ok" | "degraded";
    readonly message?: string;
}
export interface WorldStore {
    readonly kind: "memory" | "prisma";
    loadWorld(): Promise<WorldState>;
    saveWorld(state: WorldState): Promise<void>;
    health(): Promise<StoreHealth>;
    close(): Promise<void>;
}
export declare class InMemoryWorldStore implements WorldStore {
    readonly kind: "memory";
    private state;
    constructor(initialState?: WorldState);
    loadWorld(): Promise<WorldState>;
    saveWorld(state: WorldState): Promise<void>;
    health(): Promise<StoreHealth>;
    close(): Promise<void>;
}
interface PrismaSnapshotRecord {
    readonly payload: unknown;
}
interface PrismaSnapshotDelegate {
    findFirst(args: unknown): Promise<PrismaSnapshotRecord | null>;
    create(args: unknown): Promise<unknown>;
}
export interface PrismaClientLike {
    readonly snapshot: PrismaSnapshotDelegate;
    $queryRawUnsafe(query: string): Promise<unknown>;
    $disconnect(): Promise<void>;
}
export declare class PrismaWorldStore implements WorldStore {
    private readonly prisma;
    private readonly seed;
    readonly kind: "prisma";
    private saveSequence;
    constructor(prisma: PrismaClientLike, seed?: string);
    loadWorld(): Promise<WorldState>;
    saveWorld(state: WorldState): Promise<void>;
    health(): Promise<StoreHealth>;
    close(): Promise<void>;
}
export declare function addCompanyToWorld(state: WorldState, input: {
    readonly playerId: string;
    readonly countryId: string;
    readonly name: string;
}): {
    readonly state: WorldState;
    readonly company: Company;
};
export {};
//# sourceMappingURL=store.d.ts.map