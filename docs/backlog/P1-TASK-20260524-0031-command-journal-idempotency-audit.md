# P1-TASK-20260524-0031-command-journal-idempotency-audit

## Контекст

ТЗ требует, чтобы действия игрока проходили через backend validation, записывались в журнал `PlayerCommand`, применялись на simulation tick и оставляли проверяемый аудит. После задачи `0026` player operations уже проходят через command/tick, но долгоживущий журнал команд, межзапросная idempotency-защита и связь command -> events/metrics/financial transactions ещё не были закреплены как источник истины.

## Цель

Добавить command journal, idempotency keys и audit trail для всех player operation endpoints первого бизнесового среза, чтобы повторная отправка команды не создавала дубли, а каждая команда имела lifecycle records и ссылки на результаты тика.

## User Story

Как игрок, я могу повторно отправить один и тот же запрос из-за network retry без риска двойного создания компании, двойной покупки ресурса или двойного производства, а разработчик может открыть журнал команд и аудит, увидеть статус команды и связанные события, метрики и финансовые транзакции.

## Scope

- Domain получил `PlayerCommandRecordStatus` со статусами `received`, `validated`, `accepted`, `rejected`, `applied`, `failed`.
- Domain получил `PlayerCommandRecord` и `AuditLog`.
- `WorldState` хранит `playerCommands` и `auditLogs`.
- API получил `apps/api/src/command-journal.ts`.
- Все player operation endpoints первого loop требуют `Idempotency-Key` или `idempotencyKey`.
- Duplicate request с тем же playerId + scoped idempotency key возвращает сохранённый результат и пишет audit record `duplicate`, не вызывая новый tick.
- Command lifecycle пишет audit records: `received`, `validated`, `accepted`, `applied`, либо `rejected`/`failed`.
- Command records связываются с `eventIds`, `metricIds`, `financialTransactionIds`, `affectedEntityIds`.
- Prisma schema получила `PlayerCommandRecord` и расширенный `AuditLog`.
- PrismaWorldStore сохраняет command journal и audit logs вместе с normalized state и snapshot.
- API получил read endpoints `/commands` и `/audit-logs` для dev/debug review.
- Web API client отправляет idempotency headers для create company, buy/lease premise, buy resource, production run и retail price update.

## Out of scope

- Реальный external queue / Redis stream / BullMQ.
- Distributed lock/idempotency на уровне нескольких API replicas.
- Настоящая OAuth/JWT/session auth вместо demo session skeleton.
- CI, Docker, workspace, migrations pipeline.
- Полная normalized hydration из Prisma как read source.

## Technical Plan

1. Расширить domain state lifecycle entities.
2. Добавить API command journal executor around `validatePlayerCommandsAgainstWorld` and `runTick`.
3. Встроить idempotency enforcement в operation routes.
4. Сохранять command journal/audit records в snapshot + Prisma normalized tables.
5. Добавить UI idempotency headers.
6. Добавить regression API test на duplicate command.
7. Обновить backlog и архитектурную документацию.

## API Requirements

- Все mutating player operation endpoints первого loop должны требовать idempotency key.
- `playerId` остаётся session-bound и не доверяется из request body.
- Повтор того же idempotency key для того же player не создаёт новый tick-side effect.
- `/simulation/tick` с non-empty `commands` также требует idempotency key.
- Empty world tick может работать без player command journal.

## Data Changes

- New Prisma model: `PlayerCommandRecord`.
- Expanded Prisma model: `AuditLog` with command/idempotency/result/result-link fields.
- `WorldState` snapshot includes `playerCommands` and `auditLogs`.
- `WorldPersistenceContract` includes `appendPlayerCommand` and richer `appendAudit` contract.

## Tests

- Added API integration coverage for:
  - command record creation;
  - idempotent duplicate create-company retry;
  - audit lifecycle records;
  - duplicate audit record;
  - linked command event/metric/transaction ids.
- Updated existing player operation API calls to include idempotency headers.

## Acceptance Criteria

- A new player operation creates exactly one `PlayerCommandRecord`.
- The record moves through lifecycle and final status is `applied`, `rejected`, or `failed`.
- Repeating the same idempotency key for the same player returns duplicate result and does not create duplicate world side effects.
- Each command creates audit records with `userId`, `playerId`, `actionType`, `affectedEntityIds`, and `result`.
- Applied commands link to resulting events, metrics, and financial transactions when those outputs exist.
- Command journal and audit logs are persisted by snapshot and Prisma normalized writer.
- UI operation calls send idempotency keys.

## Проверки

- Domain + simulation-core source type check with temporary tsconfig: passed.
- Targeted API source type check with temporary stubs for external modules/workspace aliases: passed.
- TS transpile/syntax scan for modified API/web/core/db files: passed.
- Domain, simulation-core and db package `dist` outputs refreshed from checked source where applicable.
- API integration test sources updated for command journal/idempotency scenarios.
- Full workspace build/test intentionally out of scope until infrastructure tasks are restored.

## Risks

- Current idempotency is state-backed; true cross-replica atomic guarantees require DB unique constraints/migrations and distributed locks later.
- Prisma generated client must be regenerated in a real dev environment before DB-backed runtime can use the new models.
- Snapshot remains full recovery source until `0027-normalized-prisma-hydration` is completed.

## Follow-up

- `P1-TASK-20260524-0027-normalized-prisma-hydration.md`
- `P1-TASK-20260524-0028-real-auth-rbac-session.md`
- `P1-TASK-20260524-0029-command-batch-dependencies.md`
- `P1-TASK-20260524-0032-player-resource-logistics-delivery-loop.md`
