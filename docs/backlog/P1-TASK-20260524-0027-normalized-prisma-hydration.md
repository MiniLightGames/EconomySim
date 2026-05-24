# P1-TASK-20260524-0027-normalized-prisma-hydration

## Контекст

После `P1-TASK-20260524-0026` PrismaWorldStore пишет ключевые сущности в normalized delegates и сохраняет snapshot как safety layer. Load path всё ещё восстанавливает мир из snapshot.

## Цель

Сделать normalized Prisma tables полноценным read model для ключевых сущностей первого player loop, сохранив snapshot как fallback/recovery layer.

## User Story

Как разработчик, я хочу читать компании, склады, инвентарь, production plans, retail offers и operation records из нормализованных таблиц, чтобы API мог масштабироваться и не зависел только от JSON snapshot.

## Scope

- Repository methods for company, bank account, warehouse, inventory lot, production plan, retail offer, resource offer, resource purchase, manual production run, retail price change.
- Persistence and hydration for FinancialTransaction + nested FinancialEntry.
- Persistence and hydration for NewsItem, EventCause, EventImpact, and Explanation.
- Hydration merge strategy: snapshot base + normalized overrides for key entities.
- Consistency check between snapshot tick and normalized latest tick.
- Recovery fallback to snapshot when normalized read model is incomplete.
- Remove the old `addCompanyToWorld()` instant mutation helper from API store.

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

- [x] Key operation entities can be loaded from normalized tables.
- [x] Snapshot remains recovery fallback.
- [x] Store health exposes normalized/snapshot consistency status.
- [x] FinancialTransaction + FinancialEntry are persisted and hydrated.
- [x] NewsItem/EventCause/EventImpact/Explanation are persisted and hydrated.
- [x] `addCompanyToWorld()` is removed from API store.

## Implementation Notes

- `PrismaWorldStore.loadWorld()` now loads the latest snapshot, hydrates normalized player-loop rows, and merges them by `id` over the snapshot base.
- `GET /persistence/consistency`, `/health`, and `/world/summary` expose consistency status.
- Snapshot-only mode remains valid when normalized tables are empty or unavailable.
- See `docs/33_NORMALIZED_PRISMA_READ_MODEL.md`.

## Проверки

- TypeScript transpile/syntax scan for changed API/db files.
- Targeted source typecheck for changed API store/routes/db declarations with temporary external stubs.

## Risks

Partial hydration can create split-brain state if merge precedence is unclear.

## Follow-up

Add migrations when infra work resumes.
