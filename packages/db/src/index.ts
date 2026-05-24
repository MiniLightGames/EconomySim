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
  readonly warehouses: readonly unknown[];
  readonly inventoryLots: readonly unknown[];
  readonly productionPlans: readonly unknown[];
  readonly retailOffers: readonly unknown[];
  readonly resourceOffers: readonly unknown[];
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

export const PERSISTENCE_CONTRACT_NOTES = [
  "Snapshots remain the rollback safety layer, not the primary read path for the player operations loop.",
  "Companies, accounts, warehouses, production plans, offers, inventory lots, command records, audit logs, events, metrics, news, explanations, and financial transactions are durable normalized rows.",
  "Prisma reads hydrate the key player loop from normalized tables and merge it over the latest snapshot fallback.",
  "Consistency status must expose snapshot tick vs normalized latest tick for API health, debugging, and recovery decisions.",
  "Every player command stores idempotency key, lifecycle status, and links to resulting events, metrics, and financial transactions.",
  "All command writes must be executed inside a Prisma transaction boundary before the snapshot is appended.",
  "Auth binds user -> session -> player on the backend; request bodies and identity headers are not trusted for playerId.",
  "RBAC starts with player, developer, and admin roles; developer/admin gates protect debug, rollback, snapshot, and constructor-publish operations."
] as const;
