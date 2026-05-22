# 05. Roadmap 0 → Production

## Phase 0 — Bootstrap

- создать monorepo;
- создать apps/packages;
- настроить TypeScript, lint, tests;
- Docker Compose: postgres/postgis, redis;
- CI;
- health endpoint;
- базовая web-страница.

## Phase 1 — Domain Skeleton

- Country, City, Product, Company, Bank, PopulationCohort, Contract;
- миграции;
- seed маленького мира;
- API отдаёт страны/города/товары;
- UI показывает карту-заглушку и список стран.

## Phase 2 — Simulation Tick Engine

- tick loop;
- command queue;
- event log;
- metrics;
- snapshot interface;
- worker;
- UI показывает дату мира.

## Phase 3 — First Economy Vertical Slice

- население потребляет еду;
- ферма производит ресурс;
- фабрика/пекарня производит товар;
- магазин продаёт товар;
- цена меняется менеджером по спросу/запасам;
- игрок создаёт компанию;
- UI показывает продажи, спрос, запасы.

## Phase 4 — Logistics

- склады;
- cargo batches;
- маршруты;
- стоимость/срок/риск;
- пробки/перегрузка;
- линии доставки на карте;
- дефицит из-за логистики.

## Phase 5 — Finance

- банки;
- счета;
- кредиты;
- проценты;
- дефолты;
- банкротства;
- ledger и audit.

## Phase 6 — Markets and Contracts

- розничные магазины;
- оптовые контракты;
- биржевой стакан для сырья/валют/акций/облигаций;
- штрафы;
- аукционы банкротства.

## Phase 7 — Government and Politics

- налоги;
- бюджет;
- законы-шаблоны;
- выборы NPC;
- голосование игрока при активах/инвестициях;
- пропаганда и СМИ.

## Phase 8 — Constructor MVP

- product/resource editor;
- production chain graph;
- validation;
- mini-simulation;
- import/export;
- publication workflow.

## Phase 9 — War, Technology, Ecology, Crime

- война по ячейкам;
- разрушение инфраструктуры;
- военные закупки;
- R&D;
- загрязнение;
- чёрные рынки;
- расследования и штрафы.

## Phase 10 — Production Hardening

- load tests;
- security audit;
- backups;
- restore drill;
- monitoring;
- alerts;
- release/rollback playbook;
- documentation complete.
