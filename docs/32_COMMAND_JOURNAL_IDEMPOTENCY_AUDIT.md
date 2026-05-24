# 32. Command Journal, Idempotency and Audit

## Назначение

Этот слой закрепляет поток player operations как долговременную цепочку:

```text
request -> session binding -> idempotency key -> PlayerCommandRecord -> backend validation -> runTick -> events/metrics/financialTransactions -> AuditLog -> persistence
```

Цель — сделать действия игрока воспроизводимыми, проверяемыми и безопасными от повторной отправки одного и того же запроса.

## Domain objects

### PlayerCommandRecord

`PlayerCommandRecord` — запись намерения игрока и результата применения команды.

Ключевые поля:

- `commandId` — deterministic command id, который попадает в events/transactions metadata.
- `idempotencyKey` — ключ повторяемости запроса, scoped per command in batch.
- `status` — lifecycle: `received`, `validated`, `accepted`, `rejected`, `applied`, `failed`.
- `command` — исходная session-bound command payload.
- `userId`, `playerId` — identity, установленная backend session layer.
- `resultEventIds`, `resultMetricIds`, `resultFinancialTransactionIds` — ссылки на результаты тика.
- `affectedEntityIds` — player/company/account/warehouse/entity links для audit review.

### AuditLog

`AuditLog` фиксирует каждую важную фазу:

- `received` — запрос принят и записан в journal.
- `validated` — backend/domain validation прошла.
- `accepted` — simulation core принял команду к применению.
- `applied` — команда дала итоговое состояние и result links.
- `rejected` — backend или simulation validation отклонила команду.
- `failed` — execution path упал.
- `duplicate` — повторный idempotency key не вызвал новый tick-side effect.

## API rules

Mutating player operation endpoints первого loop требуют `Idempotency-Key` или `idempotencyKey`:

- `POST /companies`
- `POST /land/purchase`
- `POST /resources/purchase`
- `POST /production/run`
- `POST /retail/offers/:id/price`
- `POST /simulation/tick` when `commands.length > 0`

Empty world tick remains allowed without command journal, because it is a scheduler/dev operation rather than explicit player intent.

## Duplicate behavior

Для одного `playerId` и одного scoped `idempotencyKey` повторный запрос:

1. не создаёт новый `PlayerCommandRecord`;
2. не запускает новый `runTick` для этой команды;
3. пишет `AuditLog.result = duplicate`;
4. возвращает сохранённые command links на events/metrics/financial transactions.

Это защищает первый бизнесовый loop от двойного создания компаний, двойной покупки wheat, двойного production run и повторной смены цены при network retry.

## Persistence contract

`PrismaWorldStore.saveWorld()` сохраняет:

1. normalized state records;
2. `PlayerCommandRecord`;
3. `AuditLog`;
4. snapshot as safety layer.

Snapshot остаётся полным recovery source до завершения normalized hydration stage.

## Known limitations

- Idempotency сейчас state-backed. Абсолютная multi-replica гарантия требует DB unique indexes, migrations and transactional command enqueue.
- Auth ещё skeleton. `userId`/`playerId` уже backend-bound, но real session provider будет отдельной задачей.
- Command batch dependencies ещё не реализованы: create company + buy premise в одном batch требует отдельного resolver.
