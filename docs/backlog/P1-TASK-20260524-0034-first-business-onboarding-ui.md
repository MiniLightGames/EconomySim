# P1-TASK-20260524-0034-first-business-onboarding-ui

## Контекст

Player Operations уже содержит actions первого vertical slice, но интерфейс пока выглядит как набор форм. ТЗ описывает первые 30 минут как управляемый путь: капитал -> карта -> страна -> компания -> помещение -> закупка -> производство -> цена -> продажи -> новости/отчёт.

## Цель

Сделать guided first-business flow, чтобы игрок понимал следующий шаг и последствия каждого действия.

## Scope

- Stepper: choose country, create company, buy/lease premise, buy wheat, produce bread, set price, run tick, review sales/news/margin.
- Disabled-state reasons для кнопок.
- Action result drawer: money delta, inventory delta, created entities, command/audit/event links.
- Highlight selected country/city/warehouse/route on map.

## Out of scope

- Полный tutorial engine.
- Переработка дизайна карты на MapLibre/PostGIS.

## Acceptance Criteria

- Игрок может пройти first business loop без знания внутренней модели.
- UI объясняет, почему действие недоступно.
- После тика видны продажи, новости и summary изменений.

## Status

Done in stage 7.

## Implementation Notes

- Added First Business stepper with the full 30-minute path.
- Added disabled-state reasons for missing warehouse, wheat, retail offer, and in-transit shipments.
- Added action result drawer and What changed this tick panel.
- Added map highlights for the selected country/city, warehouses, and active resource route.
