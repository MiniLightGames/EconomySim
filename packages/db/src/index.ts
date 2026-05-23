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
