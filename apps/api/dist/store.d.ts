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
interface PrismaWriteDelegate {
    upsert?(args: unknown): Promise<unknown>;
    create?(args: unknown): Promise<unknown>;
    createMany?(args: unknown): Promise<unknown>;
}
export interface PrismaClientLike {
    readonly snapshot: PrismaSnapshotDelegate;
    readonly company?: PrismaWriteDelegate;
    readonly warehouse?: PrismaWriteDelegate;
    readonly bankAccount?: PrismaWriteDelegate;
    readonly creditScore?: PrismaWriteDelegate;
    readonly productionPlan?: PrismaWriteDelegate;
    readonly retailOffer?: PrismaWriteDelegate;
    readonly inventoryLot?: PrismaWriteDelegate;
    readonly resourcePurchase?: PrismaWriteDelegate;
    readonly manualProductionRun?: PrismaWriteDelegate;
    readonly retailPriceChange?: PrismaWriteDelegate;
    readonly financialTransaction?: PrismaWriteDelegate;
    readonly playerCommandRecord?: PrismaWriteDelegate;
    readonly event?: PrismaWriteDelegate;
    readonly metric?: PrismaWriteDelegate;
    readonly auditLog?: PrismaWriteDelegate;
    $transaction?<T>(fn: (tx: PrismaClientLike) => Promise<T>): Promise<T>;
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
    private writeTransaction;
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