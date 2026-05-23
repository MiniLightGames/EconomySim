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
//# sourceMappingURL=index.d.ts.map