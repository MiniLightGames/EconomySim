# P1-TASK-20260524-0033-player-margin-accounting

## Status

Done — 2026-05-24.

## Контекст

Первый business loop уже создаёт компанию, покупает wheat, производит bread и продаёт его, но игроку не хватало понятной экономики операции: себестоимость, выручка, маржа, cash delta.

## Цель

Добавить базовый управленческий учёт для первого бизнеса игрока.

## Реализовано

- Lot-level cost basis для купленного wheat и shipment-delivered inventory.
- Weighted-average merge для inventory lots с одинаковым cost source.
- Cost-aware inventory consumption: списание количества теперь возвращает COGS.
- Allocation себестоимости inputs на produced bread inventory.
- `ManualProductionRun` хранит `inputCostMinor`, `outputUnitCostMinor`, `outputTotalCostMinor`.
- `ProductSoldEvent` хранит `revenueMinor`, `costOfGoodsSoldMinor`, `grossMarginMinor`, `grossMarginRate`.
- Добавлены metrics:
  - `production.manual.input_cost_minor`;
  - `production.manual.output_unit_cost_minor`;
  - `market.sales.cogs_minor`;
  - `market.sales.gross_margin_minor`;
  - `market.sales.gross_margin_rate`.
- Добавлены profitability explanations для продаж населению.
- Prisma persistence обновлён для inventory cost basis и manual production cost fields.
- UI Player Operations получил P&L / Margin карточку: revenue, COGS, gross margin, cash delta, input cost, inventory cost, resource spend, margin rate.

## Out of scope

- Полная бухгалтерия/налоги/амортизация.
- Multi-currency accounting.
- Нормальная P&L statement по периодам с accrual accounting.
- FIFO/LIFO policy selector; текущий прототип использует cost-aware lot consumption по порядку lots и weighted merge для совместимых lots.

## Acceptance Criteria

- [x] UI показывает revenue, cost, gross margin и cash delta после sales tick.
- [x] Retail sale events связаны с revenue, COGS и gross margin metadata.
- [x] Gross margin отражается в metrics и explanation layer.
- [x] Inventory не создаёт прибыль без cost basis для player-loop resources/production.
- [x] Persistence сохраняет cost basis и production cost allocation fields.
