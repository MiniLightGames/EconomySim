# P1-TASK-20260522-0007-tick-engine

## Контекст

Simulation Core должен быть независимым от API, UI и DB.

## Цель

Создать детерминированный tick pipeline scaffold.

## Scope

- `runTick(state, commands, seed)`.
- Command validation shell.
- Event/metric/snapshot append.
- Worker integration.
- Scenario smoke test for one game day.

## Out of scope

- Полная экономика производства/спроса.
- Очередь команд в Redis.

## Acceptance Criteria

- Tick увеличивает игровое время на 1 час.
- Некорректные команды отклоняются явно.
- Каждый tick создаёт event, metrics и snapshot.
- PopulationCohort создаёт спрос на food/housing/transport/medicine/entertainment.
- Компании производят товары по production plans.
- Розничные покупки уменьшают склад, создают выручку и unmet demand при дефиците.
- Tick не создаёт отрицательные, NaN или Infinity значения в экономических полях.

## Проверки

```bash
pnpm sim:test
pnpm --filter @economysim/worker test
```

## Риски

- Важно не смешать чистое ядро с инфраструктурой.

## Follow-up

- Подключить Redis/DB command queue.
- Добавить production costs, wages and ledger-backed projections.
- Добавить price manager, который меняет retail price по спросу и запасам.
