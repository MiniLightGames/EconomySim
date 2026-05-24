export interface LedgerEntryInput {
    readonly accountId: string;
    readonly amountMinor: bigint;
    readonly currencyCode: string;
}
export interface LedgerTransactionInput {
    readonly transactionType: string;
    readonly idempotencyKey: string;
    readonly tick: number;
    readonly entries: readonly LedgerEntryInput[];
}
export interface LedgerValidationResult {
    readonly ok: boolean;
    readonly errors: readonly string[];
}
export declare const DB_INVARIANTS: readonly ["Ledger entries must balance to zero per currency.", "Every command that changes durable state must be auditable.", "World events, metrics, and snapshots are append-only operational records."];
export declare function validateLedgerTransaction(transaction: LedgerTransactionInput): LedgerValidationResult;
export declare function assertLedgerTransactionBalanced(transaction: LedgerTransactionInput): void;
export type AuthRole = "player" | "developer" | "admin";
export interface AuthUserRecord {
    readonly id: string;
    readonly email: string | null;
    readonly displayName: string;
    readonly role: AuthRole;
}
export interface PlayerRecord {
    readonly id: string;
    readonly userId: string;
    readonly defaultCurrencyCode: string;
}
export interface SessionRecord {
    readonly id: string;
    readonly userId: string;
    readonly playerId: string;
    readonly expiresAt: Date;
    readonly revokedAt: Date | null;
}
export interface AuthSessionBinding {
    readonly userId: string;
    readonly sessionId: string;
    readonly playerId: string;
    readonly roles: readonly AuthRole[];
    readonly expiresAt: Date;
}
export type PlayerCommandRecordStatus = "received" | "validated" | "accepted" | "rejected" | "applied" | "failed";
export interface PlayerCommandJournalInput {
    readonly id: string;
    readonly commandId: string;
    readonly idempotencyKey: string;
    readonly status: PlayerCommandRecordStatus;
    readonly commandType: string;
    readonly command: unknown;
    readonly userId: string;
    readonly playerId: string;
    readonly tickReceived: number;
    readonly tickScheduled: number;
    readonly tickApplied: number | null;
    readonly resultEventIds: readonly string[];
    readonly resultMetricIds: readonly string[];
    readonly resultFinancialTransactionIds: readonly string[];
    readonly affectedEntityIds: readonly string[];
}
export interface NormalizedWorldReadModel {
    readonly companies: readonly unknown[];
    readonly accounts: readonly unknown[];
    readonly landParcels: readonly unknown[];
    readonly premises: readonly unknown[];
    readonly warehouses: readonly unknown[];
    readonly inventoryLots: readonly unknown[];
    readonly productionPlans: readonly unknown[];
    readonly retailOffers: readonly unknown[];
    readonly resourceOffers: readonly unknown[];
    readonly shipments: readonly unknown[];
    readonly resourcePurchases: readonly unknown[];
    readonly manualProductionRuns: readonly unknown[];
    readonly retailPriceChanges: readonly unknown[];
    readonly financialTransactions: readonly unknown[];
    readonly events: readonly unknown[];
    readonly metrics: readonly unknown[];
    readonly news: readonly unknown[];
    readonly eventCauses: readonly unknown[];
    readonly eventImpacts: readonly unknown[];
    readonly explanations: readonly unknown[];
    readonly playerCommands: readonly PlayerCommandJournalInput[];
    readonly auditLogs: readonly unknown[];
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
export interface WorldPersistenceContract {
    readonly mode: "snapshot-plus-normalized";
    saveSnapshotAndCoreEntities(input: {
        readonly state: unknown;
        readonly tick: number;
        readonly stateHash: string;
    }): Promise<void>;
    loadSnapshotAndNormalizedReadModel(): Promise<{
        readonly snapshotState: unknown | null;
        readonly normalized: NormalizedWorldReadModel;
        readonly consistency: PersistenceConsistencyStatus;
    }>;
    appendPlayerCommand(input: PlayerCommandJournalInput): Promise<void>;
    appendAudit(input: {
        readonly userId: string | null;
        readonly playerId: string | null;
        readonly actionType: string;
        readonly commandId: string | null;
        readonly idempotencyKey: string | null;
        readonly payloadHash: string;
        readonly tick: number;
        readonly result: "received" | "validated" | "accepted" | "rejected" | "applied" | "failed" | "duplicate";
        readonly affectedEntities: readonly string[];
        readonly eventIds: readonly string[];
        readonly metricIds: readonly string[];
        readonly financialTransactionIds: readonly string[];
    }): Promise<void>;
}
export declare const PERSISTENCE_CONTRACT_NOTES: readonly ["Snapshots remain the rollback safety layer, not the primary read path for the player operations loop.", "Companies, accounts, land parcels, premises, warehouses, production plans, offers, inventory lots, shipments, resource purchases, command records, audit logs, events, metrics, news, explanations, and financial transactions are durable normalized rows.", "Inventory lots persist unit and total cost basis so player-loop margin can be reconstructed from normalized rows.", "Manual production runs persist input and output cost allocation so produced inventory has an auditable cost basis.", "Land parcels and premises persist zoning, ownership, acquisition mode, and recurring cost fields separate from warehouses.", "Prisma reads hydrate the key player loop from normalized tables and merge it over the latest snapshot fallback.", "Consistency status must expose snapshot tick vs normalized latest tick for API health, debugging, and recovery decisions.", "Every player command stores idempotency key, lifecycle status, temporary refs when present, and links to resulting events, metrics, and financial transactions.", "All command writes must be executed inside a Prisma transaction boundary before the snapshot is appended.", "Dependent command batches must persist resolved command records and command result links so snapshots remain replayable.", "Auth binds user -> session -> player on the backend; request bodies and identity headers are not trusted for playerId.", "RBAC starts with player, developer, and admin roles; developer/admin gates protect debug, rollback, snapshot, and constructor-publish operations."];
//# sourceMappingURL=index.d.ts.map