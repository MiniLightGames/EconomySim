# EconomySim Backlog Tasks

This file is the short operational queue for autonomous vertical slices.

## Done

- [x] `P1-TASK-20260523-0024-player-resource-production-vertical.md` - player company can buy a resource and run manual production through domain, database, backend, simulation, frontend, tests, and docs.
- [x] `P1-TASK-20260524-0025-retail-price-sales-vertical.md` - player company can set a validated retail price and sell produced goods to population demand on tick.
- [x] `P1-TASK-20260524-0026-command-tick-auth-persistence-vertical.md` - first player loop now runs through session-bound command/tick handlers, normalized persistence contract, UI premise step, and balanced tick-1 stabilization.
- [x] `P1-TASK-20260524-0031-command-journal-idempotency-audit.md` - player operations now create command journal records, require idempotency keys, prevent duplicate retries, and write audit links to events/metrics/financial transactions.
- [x] `P1-TASK-20260524-0027-normalized-prisma-hydration.md` - Prisma read path now hydrates key player-loop entities from normalized tables, persists finance/news/explainability rows, exposes consistency status, and keeps snapshots as fallback.
- [x] `P1-TASK-20260524-0028-real-auth-rbac-session.md` - API now resolves user/session/player binding through auth repositories, rejects forged player identity, and protects developer/admin debug routes with RBAC.
- [x] `P1-TASK-20260524-0029-command-batch-dependencies.md` - `/simulation/tick` now supports dependent command batches with temporary refs, deterministic dependency ordering, all-or-nothing rollback, partial mode, and command results.
- [x] `P1-TASK-20260524-0032-player-resource-logistics-delivery-loop.md` - player resource purchases now support pickup/direct and shipment delivery modes; in-transit resources cannot be used for production until delivered.
- [x] `P1-TASK-20260524-0033-player-margin-accounting.md` - player operations now track lot-level cost basis, production cost allocation, retail COGS, gross margin, cash delta, and P&L UI.
- [x] `P1-TASK-20260524-0034-first-business-onboarding-ui.md` - Player Operations now has a guided First Business stepper, disabled-state reasons, action result drawer, map highlights, and What changed this tick summaries.
- [x] `P1-TASK-20260524-0035-land-premise-lease-model.md` - land parcels and premises are now distinct domain/read-model entities with zoning, purchase/lease economics, recurring rent/maintenance, and UI premise selection.

## Next

1. `P1-TASK-20260524-0036-seed-scale-balance-v1.md` - expand the seed world toward prototype scale after player-loop accounting is stable.
2. `P1-TASK-20260524-0030-browser-e2e-command-player-loop.md` - cover the guided player loop with browser-level regression tests.
3. `P2-TASK-operation-analytics` - chart resource spend, production output, retail revenue, and margin after player sales.
