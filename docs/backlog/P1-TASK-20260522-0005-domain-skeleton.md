# P1-TASK-20260522-0005-domain-skeleton

## Контекст

Вертикальные срезы требуют общих доменных типов и seed мира.

## Цель

Создать минимальную доменную модель первого прототипа.

## Scope

- Country, City, Product, Company, Bank, PopulationCohort, Contract.
- Event, Metric, Snapshot.
- PlayerCommand union.
- Initial world seed.

## Out of scope

- Полная формула спроса.
- Все сущности поздних фаз.

## Acceptance Criteria

- Domain package экспортирует типы и seed.
- Seed содержит страны, города, товары, банк и population cohorts.
- Тесты подтверждают non-empty world и инварианты.

## Проверки

```bash
pnpm --filter @economysim/domain test
pnpm typecheck
```

## Риски

- Ранние типы не должны закрепить плохую экономическую модель.

## Follow-up

- Добавить ADR по money/accounting projections vs ledger source of truth.
