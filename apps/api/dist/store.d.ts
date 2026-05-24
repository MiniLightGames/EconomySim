import type { WorldState } from "@economysim/domain";
export interface StoreHealth {
    readonly kind: "memory" | "prisma";
    readonly status: "ok" | "degraded";
    readonly message?: string;
}
export interface PersistenceConsistencyStatus {
    readonly mode: "memory" | "snapshot-plus-normalized";
    readonly status: "memory" | "empty" | "consistent" | "snapshot-only" | "normalized-ahead" | "snapshot-ahead" | "diverged" | "degraded";
    readonly snapshotTick: number | null;
    readonly normalizedLatestTick: number | null;
    readonly hydratedFromNormalized: boolean;
    readonly snapshotFallbackAvailable: boolean;
    readonly normalizedSources: readonly string[];
    readonly message?: string;
}
export interface WorldStore {
    readonly kind: "memory" | "prisma";
    loadWorld(): Promise<WorldState>;
    saveWorld(state: WorldState): Promise<void>;
    consistencyStatus(): Promise<PersistenceConsistencyStatus>;
    health(): Promise<StoreHealth>;
    close(): Promise<void>;
}
export declare class InMemoryWorldStore implements WorldStore {
    readonly kind: "memory";
    private state;
    constructor(initialState?: WorldState);
    loadWorld(): Promise<WorldState>;
    saveWorld(state: WorldState): Promise<void>;
    consistencyStatus(): Promise<PersistenceConsistencyStatus>;
    health(): Promise<StoreHealth>;
    close(): Promise<void>;
}
interface PrismaSnapshotRecord {
    readonly tick?: number;
    readonly createdAt?: Date | string;
    readonly payload: unknown;
}
interface PrismaSnapshotDelegate {
    findFirst(args: unknown): Promise<PrismaSnapshotRecord | null>;
    create(args: unknown): Promise<unknown>;
}
interface PrismaReadWriteDelegate {
    findFirst?(args: unknown): Promise<unknown | null>;
    findMany?(args?: unknown): Promise<unknown[]>;
    upsert?(args: unknown): Promise<unknown>;
    create?(args: unknown): Promise<unknown>;
    createMany?(args: unknown): Promise<unknown>;
}
export interface PrismaClientLike {
    readonly snapshot: PrismaSnapshotDelegate;
    readonly company?: PrismaReadWriteDelegate;
    readonly warehouse?: PrismaReadWriteDelegate;
    readonly bankAccount?: PrismaReadWriteDelegate;
    readonly creditScore?: PrismaReadWriteDelegate;
    readonly productionPlan?: PrismaReadWriteDelegate;
    readonly retailOffer?: PrismaReadWriteDelegate;
    readonly inventoryLot?: PrismaReadWriteDelegate;
    readonly resourceOffer?: PrismaReadWriteDelegate;
    readonly resourcePurchase?: PrismaReadWriteDelegate;
    readonly manualProductionRun?: PrismaReadWriteDelegate;
    readonly retailPriceChange?: PrismaReadWriteDelegate;
    readonly financialTransaction?: PrismaReadWriteDelegate;
    readonly playerCommandRecord?: PrismaReadWriteDelegate;
    readonly event?: PrismaReadWriteDelegate;
    readonly metric?: PrismaReadWriteDelegate;
    readonly auditLog?: PrismaReadWriteDelegate;
    readonly newsItem?: PrismaReadWriteDelegate;
    readonly eventCause?: PrismaReadWriteDelegate;
    readonly eventImpact?: PrismaReadWriteDelegate;
    readonly explanation?: PrismaReadWriteDelegate;
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
    consistencyStatus(): Promise<PersistenceConsistencyStatus>;
    health(): Promise<StoreHealth>;
    close(): Promise<void>;
}
export {};
//# sourceMappingURL=store.d.ts.map