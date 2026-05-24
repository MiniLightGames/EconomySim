# 33. Normalized Prisma read model

## Цель

Этап `P1-TASK-20260524-0027-normalized-prisma-hydration` переводит ключевой player loop с snapshot-first загрузки на normalized read model. Snapshot остаётся safety/recovery layer, но API больше не обязан доверять только JSON payload для компаний, счетов, складов, инвентаря, production/retail операций, событий, метрик, новостей, объяснений и финансовых транзакций.

## Read path

`PrismaWorldStore.loadWorld()` теперь работает так:

1. Загружает последний `Snapshot` как базу мира и fallback.
2. Читает normalized tables для ключевых сущностей player loop.
3. Мержит normalized rows поверх snapshot по `id`.
4. Сортирует append-only потоки по `tick/id`.
5. Прогоняет `upgradeWorldState()` для совместимости старых snapshots.

Если normalized delegates отсутствуют или ещё пустые, store возвращает snapshot без падения. Это сохраняет возможность восстановления и локального запуска на неполной БД.

## Hydrated normalized tables

- `Company`
- `BankAccount`
- `CreditScore`
- `Warehouse`
- `InventoryLot`
- `ProductionPlan`
- `RetailOffer`
- `ResourceOffer`
- `ResourcePurchase`
- `ManualProductionRun`
- `RetailPriceChange`
- `FinancialTransaction` + nested `FinancialEntry`
- `Event`
- `Metric`
- `NewsItem`
- `EventCause`
- `EventImpact`
- `Explanation`
- `PlayerCommandRecord`
- `AuditLog`

## Write path

`saveWorld()` по-прежнему выполняется в transaction boundary:

1. upsert normalized rows;
2. append snapshot.

Добавлена persistence-запись для:

- `ResourceOffer`;
- `FinancialTransaction` с nested `FinancialEntry`;
- `NewsItem`;
- `EventCause`;
- `EventImpact`;
- `Explanation`.

## Consistency status

Добавлен `PersistenceConsistencyStatus`:

- `snapshotTick` — тик последнего snapshot;
- `normalizedLatestTick` — максимальный тик среди normalized player-loop rows;
- `normalizedSources` — список прочитанных normalized источников с количеством строк;
- `status` — `consistent`, `snapshot-only`, `normalized-ahead`, `snapshot-ahead`, `empty`, `degraded` и т.д.

API exposes:

- `GET /persistence/consistency`;
- поле `persistence` в `GET /health`;
- поле `persistence` в `GET /world/summary`.

## Cleanup

Старый helper `addCompanyToWorld()` удалён из API store. Создание компании теперь не имеет instant-mutation пути и остаётся только command/tick операцией.

## Ограничения

- Full-world hydration для government/war/crime/ecology пока остаётся snapshot-backed.
- Настоящие DB migrations/Prisma client regeneration остаются вне scope инфраструктуры.
- Merge strategy intentionally pragmatic: snapshot base + normalized override по `id`, чтобы не потерять static seed entities.
