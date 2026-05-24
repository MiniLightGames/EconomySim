# P1-TASK-20260524-0032-player-resource-logistics-delivery-loop

## Контекст

Player resource purchase сейчас завершает закупку и переносит inventory в buyer warehouse на том же command tick. Для DoD прототипа логистика должна влиять на доступность ресурсов и производство.

## Цель

Сделать закупку ресурса игроком логистическим контуром: заказ -> резерв у продавца -> shipment -> delivery -> inventory доступен для производства.

## Scope

- Добавить delivery mode в `BuyResourceCommand`.
- Создавать shipment/reservation для non-local purchase.
- Блокировать production run, если входной ресурс ещё в пути.
- Добавить события/news для ordered/in transit/delivered.
- Отобразить shipment status в UI first business flow.

## Out of scope

- Полный рынок перевозчиков и тендеры.
- Распределённые очереди/воркеры.

## Acceptance Criteria

- Player purchase can create a shipment instead of instant inventory.
- Production cannot consume reserved/in-transit wheat.
- Delivery tick moves inventory to buyer warehouse.
- UI shows the delivery state.
