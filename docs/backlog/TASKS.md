# EconomySim Backlog Tasks

This file is the short operational queue for autonomous vertical slices.

## Done

- [x] `P1-TASK-20260523-0024-player-resource-production-vertical.md` - player company can buy a resource and run manual production through domain, database, backend, simulation, frontend, tests, and docs.
- [x] `P1-TASK-20260524-0025-retail-price-sales-vertical.md` - player company can set a validated retail price and sell produced goods to population demand on tick.
- [x] `P1-TASK-20260524-0026-command-tick-auth-persistence-vertical.md` - first player loop now runs through session-bound command/tick handlers, normalized persistence contract, UI premise step, and balanced tick-1 stabilization.
- [x] `P1-TASK-20260524-0031-command-journal-idempotency-audit.md` - player operations now create command journal records, require idempotency keys, prevent duplicate retries, and write audit links to events/metrics/financial transactions.
- [x] `P1-TASK-20260524-0027-normalized-prisma-hydration.md` - Prisma read path now hydrates key player-loop entities from normalized tables, persists finance/news/explainability rows, exposes consistency status, and keeps snapshots as fallback.

## Next

1. `P1-TASK-20260524-0028-real-auth-rbac-session.md` - replace demo/header auth skeleton with real session lookup, user/player binding, and RBAC.
2. `P1-TASK-20260524-0029-command-batch-dependencies.md` - support dependent command batches such as create company + buy premise in one deterministic tick.
3. `P1-TASK-20260524-0032-player-resource-logistics-delivery-loop.md` - make player resource purchases create shipments/reservations before inventory becomes usable.
4. `P1-TASK-20260524-0033-player-margin-accounting.md` - track input cost, production quantity, retail revenue, gross margin, and simple profit/loss for player operations.
5. `P1-TASK-20260524-0034-first-business-onboarding-ui.md` - turn the player operations panel into a guided first-business stepper with disabled-state reasons and action result summaries.
6. `P2-TASK-ui-operation-guidance` - add compact contextual hints and disabled-state reasons in Player Operations.
7. `P2-TASK-operation-analytics` - chart resource spend, production output, retail revenue, and margin after player sales.
