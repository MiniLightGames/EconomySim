# P1-TASK-20260522-0014-web-game-ui

## Context

Phase 5 requires the first playable EconomySim web UI on top of the Fastify API and simulation tick endpoint.

## Goal

Replace the static bootstrap page with a real backend-connected game cockpit.

## Scope

- Next.js client UI that fetches `/world`, `/world/summary`, `/markets`, `/news`, and `/metrics`.
- Backend proxy through `/api/backend/:path*`.
- Top HUD with player money, tick, date, and `Следующий тик`.
- 2D SVG world map rendered from country polygons and city coordinates.
- Country, city, player companies, company creation, market, metrics, news, notice, and API error panels.
- `POST /companies` from the company form.
- `POST /simulation/tick` from the HUD and full UI refresh after completion.
- Minimal Vitest coverage for view-model helpers.

## Out of scope

- Authenticated player accounts.
- Real frontend ledger/player wallet persistence.
- MapLibre tile layer and advanced pan/zoom.
- Full e2e test suite with a dedicated browser test runner.

## Acceptance Criteria

- UI loads real state from the Fastify API.
- Tick button advances simulation and updates visible tick/news/metrics.
- Company form creates a player company through backend validation.
- API failures are visible in the UI and can be retried.
- `pnpm --filter @economysim/web lint`, `typecheck`, `test`, and `build` pass.

## Verification

```bash
pnpm --filter @economysim/web lint
pnpm --filter @economysim/web typecheck
pnpm --filter @economysim/web test
pnpm --filter @economysim/web build
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Manual browser smoke:

- `http://localhost:3000` renders the game shell, 2D map, market, company form, and news feed.
- Clicking `Следующий тик` advances the HUD from tick 1 to tick 2.
- Submitting the company form creates a visible player company.

## Follow-up

- Add Playwright e2e tests that boot API + web and cover tick/company creation.
- Add player account and wallet state from backend instead of UI treasury placeholder.
- Add map zoom/pan and richer city/country overlays.
- Add frontend loading skeletons per panel.
