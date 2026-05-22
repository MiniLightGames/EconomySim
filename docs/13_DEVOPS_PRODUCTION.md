# 13. DevOps and Production

## Environments

- local;
- dev;
- staging;
- production.

## Local Docker Compose

Сервисы:

- postgres + postgis;
- redis;
- api;
- web;
- worker;
- constructor.

## CI pipeline

1. install;
2. lint;
3. typecheck;
4. tests;
5. build;
6. docker build;
7. e2e smoke.

## Observability

- structured logs;
- metrics;
- tracing;
- Sentry;
- dashboard tick duration;
- queue size;
- API latency;
- DB query time;
- economy anomaly alerts.

## Backups

- PostgreSQL daily backup;
- WAL archiving later;
- world snapshots;
- restore drill before production.

## Production readiness

- health checks;
- readiness checks;
- rate limits;
- secrets manager;
- backup/restore;
- rollback playbook;
- load tests;
- incident process.
