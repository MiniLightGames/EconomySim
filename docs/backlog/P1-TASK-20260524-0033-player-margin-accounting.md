# P1-TASK-20260524-0033-player-margin-accounting

## Контекст

Первый business loop уже создаёт компанию, покупает wheat, производит bread и продаёт его, но игроку не хватает понятной экономики операции: себестоимость, выручка, маржа, cash delta.

## Цель

Добавить базовый управленческий учёт для первого бизнеса игрока.

## Scope

- Lot-level cost basis для купленного wheat.
- Allocation себестоимости на produced bread.
- Retail revenue по продажам населению.
- Gross margin по company/product/tick.
- UI карточка P&L для player operations.
- Explanation/news для прибыли или убытка.

## Out of scope

- Полная бухгалтерия/налоги/амортизация.
- Multi-currency accounting.

## Acceptance Criteria

- UI показывает revenue, cost, gross margin и cash delta после sales tick.
- Financial transactions связаны с command/events/metrics.
- Inventory не может создавать прибыль без cost basis.
