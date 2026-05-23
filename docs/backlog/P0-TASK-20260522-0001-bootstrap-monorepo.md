# P0-TASK-20260522-0001-bootstrap-monorepo

## Контекст

Репозиторий стартует как documentation-only пакет. Для дальнейшей автономной разработки нужен рабочий monorepo.

## Цель

Создать pnpm/Turborepo workspace с базовыми apps и packages EconomySim.

## Scope

- Root `package.json`, `pnpm-workspace.yaml`, `turbo.json`.
- `apps/web`, `apps/api`, `apps/worker`, `apps/constructor`.
- `packages/domain`, `simulation-core`, `db`, `ui`, `config`, `testing`.
- Shared TypeScript and ESLint config.

## Out of scope

- Полная игровая экономика.
- Auth, RBAC, realtime, production deployment.

## Acceptance Criteria

- Workspace устанавливается через `pnpm install`.
- Все apps/packages имеют scripts для lint/typecheck/test/build.
- Root scripts запускают проверки через Turbo.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Риски

- Неверные workspace dependencies могут ломать typecheck в чистом checkout.

## Follow-up

- Добавить ADR по выбору Turborepo/NestJS/Prisma.
