# EconomySim Backlog Tasks

This file is the short operational queue for autonomous vertical slices.

## Done

- [x] `P1-TASK-20260523-0024-player-resource-production-vertical.md` - player company can buy a resource and run manual production through domain, database, backend, simulation, frontend, tests, and docs.
- [x] `P1-TASK-20260524-0025-retail-price-sales-vertical.md` - player company can set a validated retail price and sell produced goods to population demand on tick.

## Next

1. `P1-TASK-browser-e2e-first-player-loop` - add Playwright/browser E2E for create company -> buy wheat -> produce bread -> set price -> next tick -> sale/news.
2. `P1-TASK-normalized-operations-persistence` - persist resource offers, purchases, production runs, retail price changes, and retail sale summaries to normalized Prisma tables in addition to snapshots.
3. `P1-TASK-player-margin-accounting` - track input cost, production quantity, retail revenue, gross margin, and simple profit/loss for player operations.
4. `P2-TASK-ui-operation-guidance` - add compact contextual hints and disabled-state reasons in Player Operations.
5. `P2-TASK-operation-analytics` - chart resource spend, production output, retail revenue, and margin after player sales.
