import { describe, expect, it } from "vitest";
import { assertLedgerTransactionBalanced, validateLedgerTransaction } from "../src";

describe("ledger transaction validation", () => {
  it("accepts a balanced two-sided transaction", () => {
    const result = validateLedgerTransaction({
      transactionType: "company_registration_fee",
      idempotencyKey: "tx-1",
      tick: 1,
      entries: [
        { accountId: "player-cash", amountMinor: -10_000n, currencyCode: "NCR" },
        { accountId: "state-fees", amountMinor: 10_000n, currencyCode: "NCR" }
      ]
    });

    expect(result).toEqual({ ok: true, errors: [] });
  });

  it("rejects unbalanced money movement", () => {
    expect(() =>
      assertLedgerTransactionBalanced({
        transactionType: "unsafe_money_change",
        idempotencyKey: "tx-2",
        tick: 1,
        entries: [
          { accountId: "player-cash", amountMinor: 50_000n, currencyCode: "NCR" },
          { accountId: "nowhere", amountMinor: 0n, currencyCode: "NCR" }
        ]
      })
    ).toThrow("Ledger entries for NCR do not balance to zero.");
  });
});
