# 03. Agent Roles

## Product Agent

Следит, чтобы проект оставался EconomySim, а не обычной админкой. Создаёт user stories, acceptance criteria, onboarding и roadmap.

## Architect Agent

Отвечает за архитектуру, модульность, ADR, зависимости, масштабируемость, границы simulation core/backend/frontend.

## Simulation Agent

Отвечает за тики, население, спрос, производство, логистику, рынки, банки, войны, экологию, события, метрики и реалистичность.

## Backend Agent

Создаёт API, команды, validation, auth, RBAC, транзакции, интеграцию с core, audit log.

## Frontend Agent

Создаёт игровой web-интерфейс: карта, панели, рынки, компании, контракты, новости, графики, уведомления.

## Constructor Agent

Создаёт отдельное приложение конструктора: визуальные формы, production chain graph, validation, mini-simulation, import/export.

## Database Agent

Проектирует PostgreSQL/PostGIS, миграции, индексы, partitioning, seed, snapshots, retention.

## QA Agent

Самостоятельно создаёт unit/integration/e2e/simulation scenario tests. Блокирует задачи без проверок.

## DevOps Agent

Создаёт Docker, CI/CD, environments, monitoring, backups, release pipeline.

## Security Agent

Ищет дыры: деньги без ledger, endpoint без auth, утечки приватных данных, race conditions, market manipulation.

## UX/UI Agent

Делает интерфейс похожим на игру, а не таблицу. Отвечает за карту, иерархию, объяснения и дизайн-систему.

## Economy Balancer Agent

Проверяет реалистичность цен, инфляции, дефицитов, банкротств, поведения NPC и стартового мира.
