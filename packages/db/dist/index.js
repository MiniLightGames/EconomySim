"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERSISTENCE_CONTRACT_NOTES = exports.DB_INVARIANTS = void 0;
exports.validateLedgerTransaction = validateLedgerTransaction;
exports.assertLedgerTransactionBalanced = assertLedgerTransactionBalanced;
exports.DB_INVARIANTS = [
    "Ledger entries must balance to zero per currency.",
    "Every command that changes durable state must be auditable.",
    "World events, metrics, and snapshots are append-only operational records."
];
function validateLedgerTransaction(transaction) {
    const errors = [];
    if (transaction.entries.length < 2) {
        errors.push("Ledger transactions require at least two entries.");
    }
    const totalsByCurrency = new Map();
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
function assertLedgerTransactionBalanced(transaction) {
    const result = validateLedgerTransaction(transaction);
    if (!result.ok) {
        throw new Error(result.errors.join(" "));
    }
}
exports.PERSISTENCE_CONTRACT_NOTES = [
    "Snapshots remain the rollback safety layer, not the primary read path for the player operations loop.",
    "Companies, accounts, warehouses, production plans, offers, inventory lots, command records, audit logs, events, metrics, news, explanations, and financial transactions are durable normalized rows.",
    "Prisma reads hydrate the key player loop from normalized tables and merge it over the latest snapshot fallback.",
    "Consistency status must expose snapshot tick vs normalized latest tick for API health, debugging, and recovery decisions.",
    "Every player command stores idempotency key, lifecycle status, and links to resulting events, metrics, and financial transactions.",
    "All command writes must be executed inside a Prisma transaction boundary before the snapshot is appended.",
    "Auth binds user -> session -> player on the backend; request bodies are not trusted for playerId."
];
//# sourceMappingURL=index.js.map