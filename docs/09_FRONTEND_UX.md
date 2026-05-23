# 09. Frontend UX

## Стиль

EconomySim должен выглядеть как игра, но сохранять глубину аналитической системы.

## Главный экран

2D карта мира:

- страны;
- границы;
- города;
- дороги;
- порты;
- ресурсы;
- здания;
- торговые маршруты;
- зоны войны;
- новости.

## Постоянные элементы

- деньги игрока;
- дата мира;
- компании;
- рынки;
- контракты;
- новости;
- рейтинг по странам;
- уведомления.

## Основные экраны

- World Map
- Country Overview
- City Economy
- Company Dashboard
- Market Screen
- Exchange Terminal
- Contract Builder
- Bank & Credit
- Logistics Planner
- News Feed
- Constructor Editor

## Первые 30 минут игрока

1. Игрок видит карту и стартовый капитал.
2. Получает 3 пути: магазин, ферма/производство, инвестиции.
3. Выбирает страну.
4. Видит налоги, спрос, рейтинг, риски.
5. Регистрирует компанию.
6. Покупает или арендует землю/помещение.
7. Нанимает менеджера.
8. Закупает ресурсы/товары.
9. Получает первые продажи.
10. Видит причины прибыли/убытка.

## Объяснимость

Любое значимое изменение должно иметь explanation panel:

```text
Цена хлеба выросла на 12%:
- пшеница подорожала на 5%;
- порт перегружен;
- зарплаты выросли;
- спрос вырос после миграции.
```

## UI states

Каждый экран обязан иметь:

- loading;
- empty;
- error;
- success;
- permission denied;
- explanation.

## Phase 5 Implementation

The first playable web UI is implemented in `apps/web` as a Next.js game cockpit connected to the Fastify API.

- The main screen is a 2D SVG world map rendered from domain country polygons and city coordinates.
- The top HUD displays player money, current tick, current date, and the `Следующий тик` command.
- The UI fetches world, summary, markets, news, and metrics through the Next proxy `/api/backend/:path*`.
- The tick button calls `POST /simulation/tick`, then refreshes all visible panels.
- The company form calls `POST /companies` and shows the new player company after backend validation.
- Country, city, player company, market, metrics, news, API error, empty, and success states are visible.

Known follow-up:

- Replace temporary UI treasury calculation with backend player account state.
- Add Playwright e2e tests for tick and company creation.
- Add map zoom/pan and richer economic overlays.
