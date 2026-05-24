# P1-TASK-20260524-0030-browser-e2e-command-player-loop

## Контекст

The first player loop now works in simulation-core manual scenario and API source routes, but there is no browser E2E covering the UI sequence.

## Цель

Add browser E2E for create company -> buy/lease premise -> buy wheat -> produce bread -> set retail price -> next tick -> sale/news.

## User Story

Как разработчик, я хочу, чтобы UI regression test доказывал, что player operations flow работает end-to-end после изменений API/core.

## Scope

- E2E fixture with deterministic seed.
- Operations panel interactions.
- Assert messages after each step.
- Assert sales/news/financial transaction after final tick.

## Out of scope

Full auth UI and real DB environment.

## Technical Plan

1. Add Playwright test once browser tooling/infra is available.
2. Use in-memory API store or deterministic test server.
3. Add stable selectors for operations CTA/buttons if missing.
4. Assert playerId is not sent in request payloads for operation endpoints.

## UI Requirements

Stable `data-testid` for premise CTA and operation cards.

## API Requirements

Expose deterministic reset/seed route only in test/dev mode if necessary.

## Data Changes

None.

## Tests

Browser E2E is the deliverable.

## Acceptance Criteria

E2E passes and fails if any step of the first player loop is broken.

## Проверки

Playwright test in local/dev CI when infrastructure work resumes.

## Risks

Without restored root workspace and test infra, this remains queued.

## Follow-up

Add screenshots/video on failure.
