# P1-TASK-20260524-0029-command-batch-dependencies

## Статус

Done — реализовано в этапе 4.

## Контекст

The API first player loop previously applied one operation per tick. A multi-command `/simulation/tick` request could not create a company and buy its premise in the same batch unless the second command already knew a post-create id and simulation validation could see prior command effects.

## Цель

Support dependent command batches without breaking deterministic tick processing.

## User Story

Как разработчик сценариев, я хочу отправить batch команд с temporary refs, чтобы один тик мог создать компанию и выполнить зависящие от неё стартовые действия.

## Реализовано

- Добавлены optional batch hints в `PlayerCommand`:
  - `temporaryRef`, например `$company:create-1`;
  - `dependsOn`, где можно ссылаться на `commandId` или `temporaryRef`.
- `/simulation/tick` принимает `failurePolicy`:
  - `all_or_nothing` по умолчанию;
  - `partial` для явного частичного применения.
- API строит dependency graph, сортирует команды topologically и резолвит временные ссылки до запуска тика.
- `CreateCompanyCommand` может произвести временную ссылку на deterministic `companyId`.
- `BuyLandCommand` может использовать `companyId: "$company:create-1"` и примениться в том же tick после создания компании.
- `BuyLandCommand` также публикует deterministic aliases для будущих зависимостей:
  - `$premise:x` / `$premise:x:warehouse`;
  - `$premise:x:productionPlan`;
  - `$premise:x:retailOffer`.
- `simulation-core` теперь валидирует и применяет команды sequentially against staged tick state, поэтому later commands видят эффекты earlier commands.
- `runJournaledCommandBatch()` возвращает `batch.commandResults`:
  - `createdCompanyId`;
  - `warehouseId`;
  - `productionPlanId`;
  - `retailOfferId`;
  - `resourcePurchaseId`;
  - `productionRunId`;
  - `retailPriceChangeId`;
  - linked event/metric/financial transaction ids.
- `all_or_nothing` rollback не сохраняет partial world mutation, если одна команда batch rejected.
- `partial` сохраняет applied commands и clearly marks rejected commands.

## Scope

- Temporary command refs.
- Dependency graph/resolution phase.
- Deterministic ID reservation/prediction for command outputs.
- Atomic rollback for default batch failure policy.
- Partial apply mode with explicit statuses.
- API command results.

## Out of scope

- Distributed queue and concurrent multiplayer conflict resolution.
- Full command queue worker.
- UI batch builder.

## API Requirements

`POST /simulation/tick` accepts:

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
      "lotId": "demo-lot-1",
      "mode": "lease"
    }
  ]
}
```

Response includes `batch`, `commandRecords`, and `commandResults`.

## Проверки

- Domain + simulation-core source type check: passed.
- API targeted source type check with external module stubs: passed.
- API/domain/simulation emitted JS syntax check: passed.
- Manual deterministic batch check: create company + buy premise in one tick: passed.
- Manual `all_or_nothing` rollback check: rejected second command leaves tick at 0 and no company mutation: passed.
- Manual `partial` check: first command applied, second rejected, statuses are explicit: passed.

## Risks

- Batch UX can hide cause/effect if surfaced as one big black-box action; UI should keep guided single-step flow until onboarding needs batch shortcuts.
- True distributed idempotency/locking still belongs to later infrastructure/queue work.

## Follow-up

- Use dependent batches in browser E2E once test infrastructure is in scope.
- Extend refs to logistics delivery and margin accounting commands when those commands exist.
