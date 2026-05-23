# P1-TASK-20260522-0009-ledger-audit-foundation

## Контекст

Безопасность денег — один из главных инвариантов EconomySim.

## Цель

Сделать ledger и audit foundation перед финансовыми vertical slices.

## Scope

- Ledger accounts, transactions, entries.
- Per-currency zero-sum validation.
- Audit log schema and helpers.
- Idempotency keys.
- Race-condition tests for payment-like operations.

## Out of scope

- Полный банковский продукт.
- Страхование вкладов.

## Acceptance Criteria

- Невозможно принять unbalanced ledger transaction.
- Любая важная command operation создаёт audit payload.
- Tests cover duplicated idempotency keys and concurrent debit attempts.

## Проверки

```bash
pnpm --filter @economysim/db test
pnpm test
```

## Риски

- Ledger должен быть источником истины, projections вторичны.

## Follow-up

- Добавить account balance projection rebuild.
