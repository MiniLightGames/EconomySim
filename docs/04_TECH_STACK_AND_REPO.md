# 04. Tech Stack and Repo Structure

## Рекомендуемый стек

### Monorepo

- pnpm
- Turborepo или Nx
- TypeScript strict

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui или собственная UI-библиотека
- TanStack Query
- Zustand/Jotai
- MapLibre GL или PixiJS для 2D карты
- ECharts/Recharts для графиков

### Backend

- NestJS или Fastify
- REST + OpenAPI на первом этапе
- WebSocket/SSE для событий мира
- Zod/class-validator для DTO

### Simulation Core

- TypeScript package на первом этапе
- чистая доменная логика без HTTP/UI/DB зависимостей
- позже Rust/Go для performance hot spots при необходимости

### Database

- PostgreSQL
- PostGIS
- Prisma или Drizzle
- Redis для cache/queues/realtime state

### DevOps

- Docker Compose local
- GitHub Actions CI
- Prometheus/Grafana
- OpenTelemetry
- Sentry

## Структура

```text
economysim/
  apps/
    web/
    api/
    worker/
    constructor/
  packages/
    domain/
    simulation-core/
    db/
    ui/
    config/
    testing/
  docs/
    backlog/
  infra/
  scripts/
```

## Команды, которые должны существовать

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm db:migrate
pnpm db:seed
pnpm sim:test
```
