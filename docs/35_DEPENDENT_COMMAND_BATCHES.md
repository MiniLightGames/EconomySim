# Dependent command batches

Stage 4 adds deterministic dependent command batches to the player command pipeline.

## Why

The first player loop can stay as guided UI steps, but API and tests need a deterministic way to submit multi-step intents such as:

1. create company;
2. buy or lease a premise for that newly created company;
3. later, use created warehouse / production plan / offer ids.

This follows the required EconomySim flow: frontend sends commands, backend validates rights/session/idempotency, commands enter the journal, simulation applies them on tick, and backend returns events/metrics/news/results.

## Temporary references

Commands may now include:

- `temporaryRef`: produced by the command;
- `dependsOn`: explicit dependencies by `commandId` or `temporaryRef`.

Example:

```json
{
  "failurePolicy": "all_or_nothing",
  "commands": [
    {
      "type": "CreateCompanyCommand",
      "commandId": "cmd-create-company",
      "temporaryRef": "$company:create-1",
      "countryId": "demo-country-north-coast",
      "name": "Nova Foods"
    },
    {
      "type": "BuyLandCommand",
      "commandId": "cmd-buy-premise",
      "companyId": "$company:create-1",
      "cityId": "demo-city-harborview",
      "lotId": "demo-harborview-starter-premise",
      "mode": "lease"
    }
  ]
}
```

The API resolves `$company:create-1` to the deterministic company id before the tick is executed.

## Dependency ordering

The API builds a graph from:

- explicit `dependsOn` entries;
- implicit temporary references inside command fields.

Commands are sorted topologically before entering `runTick()`.

## Failure policy

`all_or_nothing` is the default. If any command is rejected by simulation validation, the batch is rejected and partial world mutation is not saved.

`partial` is explicit. Accepted commands are applied and rejected commands are recorded as rejected.

## Command results

`/simulation/tick` now returns `batch.commandResults` with stable ids:

- `createdCompanyId`;
- `warehouseId`;
- `productionPlanId`;
- `retailOfferId`;
- `resourcePurchaseId`;
- `productionRunId`;
- `retailPriceChangeId`;
- event, metric and financial transaction links.

## Core change

`simulation-core` validates and applies accepted player commands sequentially against staged tick state. This lets later commands see companies, warehouses, production plans and retail offers created earlier in the same tick.

## Current limits

- UI still uses the safer step-by-step flow.
- Distributed concurrency and database-level command queues remain out of scope.
- Future commands should add explicit result aliases when they produce entities needed by later commands.
