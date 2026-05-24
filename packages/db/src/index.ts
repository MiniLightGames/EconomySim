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

export const DB_INVARIANTS = [
  "Ledger entries must balance to zero per currency.",
  "Every command that changes durable state must be auditable.",
  "World events, metrics, and snapshots are append-only operational records."
] as const;

export function validateLedgerTransaction(transaction: LedgerTransactionInput): LedgerValidationResult {
  const errors: string[] = [];

  if (transaction.entries.length < 2) {
    errors.push("Ledger transactions require at least two entries.");
  }

  const totalsByCurrency = new Map<string, bigint>();

  for (const entry of transaction.entries) {
    totalsByCurrency.set(entry.currencyCode, (totalsByCurrency.get(entry.currencyCode) ?? 0n) + entry.amountMinor);
  }

  for (const [currencyCode, total] of totalsByCurrency) {
    if (total !== 0n) {
      errors.push(`Ledger entries for ${currencyCode} do not balance to zero.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function assertLedgerTransactionBalanced(transaction: LedgerTransactionInput): void {
  const result = validateLedgerTransaction(transaction);

  if (!result.ok) {
    throw new Error(result.errors.join(" "));
  }
}

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

export const PERSISTENCE_CONTRACT_NOTES = [
  "Snapshots remain the rollback safety layer.",
  "Companies, accounts, warehouses, production plans, offers, inventory lots, command records, audit logs, events, and metrics are durable normalized rows.",
  "Every player command stores idempotency key, lifecycle status, and links to resulting events, metrics, and financial transactions.",
  "All command writes must be executed inside a Prisma transaction boundary before the snapshot is appended.",
  "Auth binds user -> session -> player on the backend; request bodies are not trusted for playerId."
] as const;
