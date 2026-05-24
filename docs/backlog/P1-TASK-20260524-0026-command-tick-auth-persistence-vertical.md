# P1-TASK-20260524-0026-command-tick-auth-persistence-vertical

## Контекст

ТЗ требует, чтобы действия игрока проходили через единый поток: frontend -> backend validation -> player command / command journal -> simulation tick -> state/events/metrics/news -> persistence. До этой задачи часть player operations выполнялась прямыми backend/domain mutations: создание компании шло через `addCompanyToWorld`, покупка ресурса и manual production вызывались как instant helpers, а `playerId` принимался от клиента.

## Цель

Перевести первый бизнесовый вертикальный срез на command/tick model, добавить session-bound player identity skeleton, зафиксировать persistence contract поверх Prisma normalized writes + snapshot safety layer и убрать шоковые tick-1 black markets/war effects.

## User Story

Как игрок, я могу зарегистрировать компанию, купить/арендовать помещение, купить wheat, произвести bread, поставить retail price и увидеть продажи/новости после тика, при этом backend сам привязывает действие к моей сессии, а состояние сохраняется через транзакционный persistence contract.

## Scope

- `CreateCompanyCommand` теперь создаёт player company внутри `runTick`.
- `BuyLandCommand` теперь приобретает starter premise, создаёт warehouse, bread production plan, retail offer и стартовую лицензию внутри `runTick`.
- Добавлены `BuyResourceCommand` и `RunManualProductionCommand`.
- Existing `SetRetailPriceCommand` сохранён как tick-applied command.
- API endpoints `/companies`, `/land/purchase`, `/resources/purchase`, `/production/run`, `/retail/offers/:id/price` используют command/tick route.
- API больше не требует `playerId` в операционных body; `playerId` берётся из session skeleton headers/demo session.
- `/simulation/tick` перезаписывает входящий `playerId` session-bound значением.
- UI Player Operations получил шаг `Buy / Lease Premise` между регистрацией компании и операциями wheat/bread.
- Prisma schema получила auth skeleton models `User`, `Player`, `Session`.
- PrismaWorldStore получил транзакционный `persistNormalizedWorldState` для key entities + snapshot.
- Tick-1 balance: black markets не генерируются на первом стабилизационном тике, война записывает intensity metric без capture/damage/occupation на tick 1.

## Out of scope

- Реальный OAuth/JWT provider, password login, RBAC и refresh tokens.
- Полная нормализованная hydration из Prisma вместо snapshot load.
- Migrations/CI/docker/root workspace restoration.
- Multiplayer idempotency and distributed command queue.

## Technical Plan

1. Расширить domain `PlayerCommand` union.
2. Реализовать command handlers в `simulation-core` перед основными системами экономики.
3. Обновить API schemas/routes/validation на session-bound commands.
4. Добавить lightweight auth module `apps/api/src/auth.ts`.
5. Расширить store persistence contract normalized upserts inside `$transaction`.
6. Обновить UI flow и disabled guidance для операций без premise.
7. Добавить/обновить regression tests для command vertical, crime delayed market creation and war stabilization.
8. Обновить compiled `packages/domain/dist` and `packages/simulation-core/dist` from source check build.

## UI Requirements

- После создания компании показать сообщение: нужно купить или арендовать помещение.
- Если player company без warehouse, скрыть/заблокировать wheat/bread operations и показать CTA `Buy / Lease Premise`.
- После покупки помещения показать готовность warehouse/production plan/retail offer.

## API Requirements

- Операционные endpoints не принимают доверенный `playerId` от клиента.
- `resolvePlayerSession` возвращает `{ userId, sessionId, playerId }`.
- `bindCommandToSession` перезаписывает `playerId` в любой player command.
- Все операции сохраняют state только после accepted `runTick` result.

## Data Changes

- New Prisma auth models: `User`, `Player`, `Session`.
- Key normalized upserts for `Company`, `BankAccount`, `CreditScore`, `Warehouse`, `InventoryLot`, `ProductionPlan`, `RetailOffer`, `ResourcePurchase`, `ManualProductionRun`, `RetailPriceChange`, recent `Event`, recent `Metric`.
- Snapshot remains safety source for full world restore.

## Tests

- Added command-only player vertical slice regression in `packages/simulation-core/test/tick.test.ts`.
- Added tick-1 balance regression in `packages/simulation-core/test/tick.test.ts`.
- Updated black-market banned-product scenario to assert market generation after stabilization, not on first tick.
- Updated war scenarios to run after one stabilization tick.

## Acceptance Criteria

- `CreateCompanyCommand` creates company and command news/events on tick.
- `BuyLandCommand` creates premise assets and a ledger transaction on tick.
- `BuyResourceCommand` moves inventory and writes balanced ledger transaction on tick.
- `RunManualProductionCommand` consumes inputs and creates bread output on tick.
- `SetRetailPriceCommand` applies before demand in its tick.
- Subsequent tick can sell player bread to households.
- Tick 1 from initial world has no black-market avalanche, war damage, or occupations.
- API route bodies no longer require playerId for the first player loop.

## Проверки

- `tsc` source check for `packages/domain/src/index.ts` + `packages/simulation-core/src/index.ts` with temporary tsconfig: passed.
- API temporary type check with stubs for external modules and workspace path aliases: passed.
- TS syntax transpile check for modified API/web/core/db/test files: passed.
- Manual compiled-node scenario for create company -> buy premise -> buy wheat -> produce bread -> set price -> tick sale: passed.
- Manual compiled-node tick-1 balance check: `blackMarketsAfterTick1=0`, `warDamageAfterTick1=0`, `occupationsAfterTick1=0`.

## Risks

- API/web package dist was not rebuilt because root workspace infrastructure and external dependencies are intentionally out of scope. Source code was updated; domain/core dist was refreshed.
- `PrismaWorldStore.loadWorld` still hydrates from snapshot first; normalized tables are written as contract/read-model base but not yet source of truth.
- `CreateCompanyCommand` followed by `BuyLandCommand` in the same multi-command tick still needs command dependency resolution; the public API uses one command/tick per operation.

## Follow-up

- `P1-TASK-20260524-0027-normalized-prisma-hydration.md`
- `P1-TASK-20260524-0028-real-auth-rbac-session.md`
- `P1-TASK-20260524-0029-command-batch-dependencies.md`
- `P1-TASK-20260524-0030-browser-e2e-command-player-loop.md`
