# EconomySim Backlog Tasks

This file is the short operational queue for autonomous vertical slices.

## Done

- [x] `P1-TASK-20260523-0024-player-resource-production-vertical.md` - player company can buy a resource and run manual production through domain, database, backend, simulation, frontend, tests, and docs.
- [x] `P1-TASK-20260524-0025-retail-price-sales-vertical.md` - player company can set a validated retail price and sell produced goods to population demand on tick.
- [x] `P1-TASK-20260524-0026-command-tick-auth-persistence-vertical.md` - first player loop now runs through session-bound command/tick handlers, normalized persistence contract, UI premise step, and balanced tick-1 stabilization.

## Next

1. `P1-TASK-20260524-0027-normalized-prisma-hydration.md` - read key operation entities from normalized Prisma tables with snapshot fallback.
2. `P1-TASK-20260524-0028-real-auth-rbac-session.md` - replace demo/header auth skeleton with real session lookup, user/player binding, and RBAC.
3. `P1-TASK-20260524-0029-command-batch-dependencies.md` - support dependent command batches such as create company + buy premise in one deterministic tick.
4. `P1-TASK-20260524-0030-browser-e2e-command-player-loop.md` - add browser E2E for the full UI player loop and assert playerId is not sent by operation forms.
5. `P1-TASK-player-margin-accounting` - track input cost, production quantity, retail revenue, gross margin, and simple profit/loss for player operations.
6. `P2-TASK-ui-operation-guidance` - add compact contextual hints and disabled-state reasons in Player Operations.
7. `P2-TASK-operation-analytics` - chart resource spend, production output, retail revenue, and margin after player sales.
