# P0-TASK-20260522-0003-local-infra

## Контекст

Проект требует PostgreSQL/PostGIS, Redis и локальный запуск всех сервисов.

## Цель

Подготовить Docker Compose для local environment.

## Scope

- PostGIS service.
- Redis service.
- API, web, worker, constructor services.
- Health checks and local ports.

## Out of scope

- Production Kubernetes/Terraform.
- Managed secrets.

## Acceptance Criteria

- `docker compose -f infra/docker-compose.yml up --build` описывает все базовые сервисы.
- API зависит от healthy PostGIS/Redis.
- Web и constructor зависят от API.

## Проверки

```bash
docker compose -f infra/docker-compose.yml config
```

## Риски

- Docker build требует актуальный `pnpm-lock.yaml`.

## Follow-up

- Добавить production Docker image hardening и non-root runtime.
