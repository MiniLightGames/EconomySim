# P1-TASK-20260522-0010-first-retail-economy

## Контекст

Первый экономический цикл должен показать причины спроса, производства, цены и продаж.

## Цель

Сделать вертикальный retail food loop.

## Scope

- Population food need.
- Wheat resource and bread product chain.
- Farm/bakery/store facilities.
- Inventory lots and retail sales.
- Price manager reacting to demand and stock.
- UI for sales, demand, inventory, explanation.

## Out of scope

- Полная логистика между странами.
- Биржевой стакан.

## Acceptance Criteria

- Население покупает food product if available.
- Shortage raises price through explainable manager rule.
- Sales create events and metrics.
- UI explains profit/loss causes.

## Проверки

```bash
pnpm sim:test
pnpm test
pnpm build
```

## Риски

- Не создавать магический спрос или товары без inventory.

## Follow-up

- Добавить logistics delay as shortage driver.
