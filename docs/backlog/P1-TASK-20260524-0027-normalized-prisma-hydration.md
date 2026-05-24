# P1-TASK-20260524-0027-normalized-prisma-hydration

## Контекст

После `P1-TASK-20260524-0026` PrismaWorldStore пишет ключевые сущности в normalized delegates и сохраняет snapshot как safety layer. Load path всё ещё восстанавливает мир из snapshot.

## Цель

Сделать normalized Prisma tables полноценным read model для ключевых сущностей первого player loop, сохранив snapshot как fallback/recovery layer.

## User Story

Как разработчик, я хочу читать компании, склады, инвентарь, production plans, retail offers и operation records из нормализованных таблиц, чтобы API мог масштабироваться и не зависел только от JSON snapshot.

## Scope

- Repository methods for company, bank account, warehouse, inventory lot, production plan, retail offer, resource purchase, manual production run, retail price change.
- Hydration merge strategy: snapshot base + normalized overrides for key entities.
- Consistency check between snapshot tick and normalized latest tick.
- Recovery fallback to snapshot when normalized read model is incomplete.

## Out of scope

- Full-world normalized hydration for all war/government/crime/ecology entities.
- Infrastructure migrations pipeline.

## Technical Plan

1. Add typed Prisma repository interfaces under `apps/api/src/repositories` or `packages/db`.
2. Implement `loadNormalizedOperationsState` and merge with snapshot.
3. Add store health warning when normalized read model lags snapshot.
4. Add tests with fake Prisma delegates.

## UI Requirements

None.

## API Requirements

No endpoint changes expected.

## Data Changes

Use existing Prisma models/delegates; add missing models only if current schema does not cover operation records.

## Tests

- Fake Prisma store loads snapshot + normalized company override.
- Missing normalized records fall back to snapshot.
- Tick mismatch emits degraded health warning.

## Acceptance Criteria

- Key operation entities can be loaded from normalized tables.
- Snapshot remains recovery fallback.
- Store health exposes normalized/snapshot consistency status.

## Проверки

Run API store unit tests and source typecheck.

## Risks

Partial hydration can create split-brain state if merge precedence is unclear.

## Follow-up

Add migrations when infra work resumes.
