# 31. Command/Tick player loop, auth skeleton, persistence contract

## Summary

The first player business loop is now implemented as backend-validated, session-bound commands applied by `simulation-core` on ticks:

```text
CreateCompanyCommand
  -> BuyLandCommand
  -> BuyResourceCommand
  -> RunManualProductionCommand
  -> SetRetailPriceCommand
  -> next demand tick sells retail bread
```

The old instant route shape is no longer used by the API for company creation, resource purchase, manual production or retail price updates. Legacy pure helpers remain in `simulation-core` for scenario tests and low-level utilities, but player-facing operations should use commands.

## Command model

| Command | Tick effect |
|---|---|
| `CreateCompanyCommand` | Creates registered player company, company bank account, credit score, event, metric and news. |
| `BuyLandCommand` | Creates starter premise/warehouse, bread production plan, retail offer and active food license; records `LandPremiseTransaction`. |
| `BuyResourceCommand` | Moves inventory from resource offer seller warehouse to player warehouse; records `ResourcePurchase`, event, metric, news and balanced `ResourcePurchaseTransaction`. |
| `RunManualProductionCommand` | Consumes player warehouse inputs and writes output inventory; records `ManualProductionRun`, event, metric and news. |
| `SetRetailPriceCommand` | Updates retail offer price before population demand; records price change, event, metric and news. |

## API contract

Operation endpoints no longer accept trusted `playerId` in request bodies:

- `POST /companies`
- `POST /land/purchase`
- `POST /resources/purchase`
- `POST /production/run`
- `POST /retail/offers/:id/price`

The API resolves a session with `resolvePlayerSession()` and binds all player commands through `bindCommandToSession()`. In the current skeleton this uses development/demo headers with fallback to `player-1`; production auth is tracked in `P1-TASK-20260524-0028-real-auth-rbac-session.md`.

`POST /simulation/tick` also overwrites command `playerId` with the session-bound player id before validation and `runTick`.

## UI flow

The Player Operations panel now has an explicit premise step:

1. Register company.
2. Buy/lease premise.
3. Buy wheat.
4. Produce bread.
5. Set retail price.
6. Run next tick and inspect sales/news.

Without a premise, the UI shows a `Buy / Lease Premise` card and prevents the player from attempting resource/production operations that require a warehouse.

## Persistence contract

`PrismaWorldStore.saveWorld()` writes in one transaction:

1. normalized key entities as read-model/upsert rows;
2. full snapshot as recovery/safety layer.

Currently normalized writes include companies, bank accounts, credit scores, warehouses, inventory lots, production plans, retail offers, resource purchases, manual production runs, retail price changes, recent events and recent metrics.

Snapshot remains the load source of truth until `P1-TASK-20260524-0027-normalized-prisma-hydration.md` is implemented.

## Tick-1 stabilization

Initial world tick should be close to equilibrium. To avoid immediate noisy cascades:

- black-market generation is skipped on the first stabilizing tick;
- active wars emit intensity metrics on tick 1 but do not immediately capture territory, destroy infrastructure or create occupations.

War and black-market mechanics still activate after the initial stabilization tick, and explicit illegal trades continue to resolve normally.

## Verification notes

Manual compiled-node scenario passed:

```text
create company -> buy premise -> buy wheat -> produce bread -> set retail price -> next tick sale
```

The same scenario produced player `ProductSoldEvent`s and preserved economic invariant checks. Tick-1 balance check returned zero black markets, zero war damage and zero occupations.
