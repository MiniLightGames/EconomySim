# P2-TASK-20260522-0011-simulation-regression

## Контекст

Симуляция легко ломается незаметными изменениями формул.

## Цель

Создать regression suite для multi-tick scenarios.

## Scope

- Shortage raises price.
- Bad logistics creates shortage.
- Bank bankruptcy burns deposits if no insurance.
- Money supply growth causes inflation.
- War damages infrastructure.

## Out of scope

- Полный баланс production-ready экономики.

## Acceptance Criteria

- Сценарии имеют initial state, commands, ticks, expected metric ranges.
- Regression failures block merge.
- Metrics explain failure signals.

## Проверки

```bash
pnpm sim:test
```

## Риски

- Expected ranges должны быть устойчивыми, а не подогнанными к одной реализации.

## Follow-up

- Добавить dashboard трендов regression metrics.
