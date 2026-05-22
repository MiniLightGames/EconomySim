# 02. Multi-Agent Process

## Цель

Организовать автономную разработку EconomySim несколькими AI-агентами.

## Роли агентов

- **Product Agent** — продукт, сценарии, приоритеты.
- **Architect Agent** — архитектура, границы модулей, ADR.
- **Simulation Agent** — ядро симуляции, экономика, тики.
- **Backend Agent** — API, auth, transactions, validation.
- **Frontend Agent** — web UI, карта, панели, UX.
- **Constructor Agent** — конструктор данных и цепочек.
- **Database Agent** — схема, миграции, индексы, PostGIS.
- **QA Agent** — тесты, e2e, regression, scenario tests.
- **DevOps Agent** — Docker, CI/CD, deploy, observability.
- **Security Agent** — auth, anti-cheat, audit, exploits.
- **UX/UI Agent** — игровое ощущение, дизайн-система.
- **Economy Balancer Agent** — реалистичность экономики, баланс.
- **Release Manager Agent** — релизы, rollback, production readiness.

## Правило самостоятельной постановки задач

Если агент видит пробел, он обязан:

1. описать проблему;
2. создать задачу в `docs/backlog/`;
3. оценить приоритет;
4. выполнить, если задача в его зоне;
5. передать другому агенту, если задача вне его зоны.

## Формат задачи

```md
# P1-TASK-YYYYMMDD-HHMM-short-name

## Контекст
## Цель
## Scope
## Out of scope
## Acceptance Criteria
## Проверки
## Риски
## Follow-up
```

## Правило вертикальных срезов

Каждая важная функция должна проходить полный путь:

БД → доменная логика → API → UI → тесты → docs → метрики.

Пример: создание компании, покупка земли, производство товара, продажа товара, кредит.

## Эскалация человеку

Только если решение влияет на монетизацию, legal, бренд или необратимую потерю данных. В остальных случаях агент выбирает вариант, максимально похожий на реальный мир.
