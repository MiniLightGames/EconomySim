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
export interface AuthUserRecord {
    readonly id: string;
    readonly email: string | null;
    readonly displayName: string;
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
export interface WorldPersistenceContract {
    readonly mode: "snapshot-plus-normalized";
    saveSnapshotAndCoreEntities(input: {
        readonly state: unknown;
        readonly tick: number;
        readonly stateHash: string;
    }): Promise<void>;
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
export declare const PERSISTENCE_CONTRACT_NOTES: readonly ["Snapshots remain the rollback safety layer.", "Companies, accounts, warehouses, production plans, offers, inventory lots, command records, audit logs, events, and metrics are durable normalized rows.", "Every player command stores idempotency key, lifecycle status, and links to resulting events, metrics, and financial transactions.", "All command writes must be executed inside a Prisma transaction boundary before the snapshot is appended.", "Auth binds user -> session -> player on the backend; request bodies are not trusted for playerId."];
//# sourceMappingURL=index.d.ts.map