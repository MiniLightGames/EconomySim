# P1-TASK-20260522-0013-fastify-backend-api

## Контекст

Phase 4 требует backend API поверх domain, Prisma и simulation-core.

## Цель

Заменить bootstrap Nest API на Fastify API с валидируемыми endpoints.

## Scope

- `GET /health`, `/world`, `/world/summary`, `/countries`, `/countries/:id`, `/cities/:id`.
- `GET /companies`, `/companies/:id`, `POST /companies`.
- `GET /markets`, `/markets/:id`.
- `POST /simulation/tick`.
- `GET /news`, `/metrics`.
- Prisma-backed snapshot store adapter and memory store for tests/local bootstrap.
- Integration tests via Fastify inject.

## Out of scope

- Auth/RBAC.
- Real player accounts and ledger-backed company registration fee.
- Full Prisma migrations.

## Acceptance Criteria

- API validates request bodies and params.
- Unknown resources return 404.
- Invalid payloads and invalid tick commands return 400.
- World mutations happen only through backend validation or `simulation-core`.
- Health endpoint responds in local bootstrap mode.

## Проверки

```bash
pnpm --filter @economysim/api test
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Risks

- Prisma mode requires generated Prisma Client and database schema setup.

## Follow-up

- Add auth/RBAC middleware.
- Persist full normalized world tables instead of snapshot-only storage.
- Add audit log records for company creation and tick commands.
