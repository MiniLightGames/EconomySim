# P2-TASK-20260522-0012-observability-baseline

## Контекст

Production-ready симуляция требует наблюдаемости API, worker и экономики.

## Цель

Добавить baseline observability.

## Scope

- Structured logs.
- Health and readiness checks.
- Metrics for API latency, DB query time, queue size, tick duration.
- Economy anomaly alerts.
- Sentry/OpenTelemetry placeholders.

## Out of scope

- Финальный Grafana dashboard.
- Incident automation.

## Acceptance Criteria

- API and worker expose operational health.
- Tick duration and command counts become metrics.
- Alert candidates documented.

## Проверки

```bash
pnpm test
pnpm build
```

## Риски

- Метрики не должны раскрывать приватные данные игроков/компаний.

## Follow-up

- Добавить Prometheus endpoint and Grafana dashboard.
