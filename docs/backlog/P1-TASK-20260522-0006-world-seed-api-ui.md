# P1-TASK-20260522-0006-world-seed-api-ui

## Контекст

Игроку нужен первый экран мира, а агентам нужен проверяемый API surface.

## Цель

Сделать seed мира доступным через API и базовый UI.

## Scope

- `GET /api/world/status`.
- `GET /api/world/map`.
- `GET /api/world/ticks/current`.
- Next.js web dashboard with map placeholder.
- Loading/error/empty/permission/explanation state placeholders.

## Out of scope

- Realtime updates.
- Настоящая MapLibre карта.

## Acceptance Criteria

- API возвращает текущий tick, date, countries, cities, products.
- Web показывает карту-заглушку, summary и next action.
- UI не раскрывает приватные данные компаний.

## Проверки

```bash
pnpm --filter @economysim/api test
pnpm --filter @economysim/web build
```

## Риски

- Static placeholder не должен стать финальной картой.

## Follow-up

- Подключить MapLibre слой стран/городов.
