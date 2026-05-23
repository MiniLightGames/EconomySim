# 19. Implementation Phases

## Phase 0 — Bootstrap

- pnpm/Turborepo monorepo.
- Shared TypeScript, ESLint, Vitest, and build gates.
- Minimal API, web, worker, constructor apps.
- Docker Compose for PostGIS, Redis, API, web, worker, constructor.
- GitHub Actions quality pipeline.

## Phase 1 — Domain Skeleton

- Durable entities for countries, cities, products, companies, banks, population cohorts, contracts, events, metrics, and snapshots.
- Prisma schema and seed preview.
- Read-only world API and UI map placeholder.

## Phase 2 — Tick Engine

- Deterministic tick pipeline.
- Command validation shell.
- Event, metric, and snapshot append records.
- Scenario regression tests.

## Phase 3 — First Vertical Slice

- Company registration command.
- Backend validation and audit log.
- Ledger-backed registration fee.
- Player company list and dashboard.

## Phase 4 — Production Readiness Track

- Security gates for auth, RBAC, rate limits, audit, and ledger races.
- Observability for API latency, queue size, tick duration, and economy anomaly alerts.
- Backup/restore drill and release/rollback playbook.
