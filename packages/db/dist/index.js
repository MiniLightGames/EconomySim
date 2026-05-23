"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_INVARIANTS = void 0;
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
//# sourceMappingURL=index.js.map