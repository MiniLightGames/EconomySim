# Player Resource and Production Vertical

## Summary

The first playable company loop now has explicit backend-validated actions:

1. Create a player company.
2. Buy a resource from a B2B resource offer.
3. Store the resource in the player company's warehouse.
4. Run a manual production order.
5. See updated inventory, player money, events, metrics, and news in the web UI.

This closes the onboarding gap left after UX polish: "buy resource" and "produce good" are now real game actions instead of passive signals.

## Domain

- `ResourceOffer` is a B2B seller price for resources and inputs.
- `ResourcePurchase` records a completed player resource purchase.
- `ManualProductionRun` records a manual production order and its consumed inputs.
- `ResourcePurchaseTransaction` is a balanced ledger transaction type.

Retail household goods still clear through retail offers. Resource purchases are separate from the exchange order book and from population retail demand.

## Backend

New endpoints:

- `GET /resources/offers`
- `GET /resources/purchases`
- `POST /resources/purchase`
- `GET /production/plans`
- `GET /production/runs`
- `POST /production/run`

The API validates player ownership, active offers, available inventory, account balance, company warehouse ownership, price limits, licenses, and production inputs before simulation-core mutates state.

## Simulation

`buyResource` transfers inventory from seller warehouse to buyer warehouse and debits the player account through a balanced ledger transaction.

`runManualProduction` consumes recipe inputs from the company warehouse and creates output inventory. Technology input-efficiency effects are applied, so expected input consumption can be lower than the base recipe.

Both operations call `assertNoInvalidEconomyValues` and create events, metrics, and corporate news.

## Frontend

The game screen has a `Player Operations` panel:

- company selector;
- resource offer selector;
- quantity and max-price inputs;
- production quantity input;
- owned inventory view;
- last action summary.

The top money HUD now reads the actual player bank account when it is present.

The follow-up retail price and sales controls are implemented in `docs/30_RETAIL_PRICE_SALES_VERTICAL.md`.

## Data

Prisma models were added for:

- `ResourceOffer`;
- `ResourcePurchase`;
- `ManualProductionRun`.

The snapshot store remains the runtime source of truth for this phase; normalized tables are ready for a later persistence split.

## Tests

Coverage added:

- simulation-core resource purchase moves inventory and balances ledger entries;
- simulation-core manual production consumes inputs and creates output inventory;
- API integration creates a company, buys wheat, produces bread, and verifies persisted inventory.
