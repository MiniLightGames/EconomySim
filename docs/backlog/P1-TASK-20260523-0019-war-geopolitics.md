# P1-TASK-20260523-0019-war-geopolitics

## Context

EconomySim needs strategic war and international relations as an economic
pressure system, not as direct army control by the player.

## Goal

Add an automated war and geopolitics vertical slice across domain, Prisma,
simulation-core, API, web UI, tests, and docs.

## Scope

- Domain entities for wars, fronts, strategic cells, armies, military units,
  military supplies, occupations, treaties, sanctions, alliances, blockades,
  refugee flows, war damage, and military orders.
- Prisma models for durable war and geopolitics data.
- `simulation-core` war step for army supply consumption, front movement,
  strategic cell capture, legal/factual control, infrastructure and warehouse
  damage, route blocking, refugee movement, military goods demand, and military
  logistics competition.
- API endpoints for wars, war detail, strategic cells, sanctions, and military
  orders.
- Web map layer and War Room UI for fronts, occupied zones, damage, orders,
  sanctions, refugees, and war news.
- Tests for the required war outcomes and invalid-value prevention.

## Out Of Scope

- Direct player army control.
- Tactical vehicle or unit-by-unit path simulation.
- Full diplomacy AI, peace negotiation, and recognition voting.
- Fulfilment of military orders from company production.
- Constructor war-template editors.
- Normalized war repositories beyond Prisma schema and snapshot store.

## Acceptance Criteria

- A strategic cell can be captured by simulation pressure.
- Factual control can change independently from legal control.
- War damages infrastructure.
- A blocked wartime route cannot be used as active logistics.
- Military goods demand increases during war.
- Refugees decrease one region population and increase another.
- War tick does not create negative values, NaN, or Infinity.
- Backend exposes read endpoints for wars, cells, sanctions, and orders.
- Web shows a war map layer and war panels.
- Required gates pass.

## Status

Done in the War and Geopolitics iteration.

## Verification

```bash
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Follow-Up

- Add Constructor editors for strategic cells, army templates, war goals, and
  sanctions templates.
- Connect military orders to procurement contracts and company fulfilment.
- Add repair workflows for damaged roads, warehouses, ports, and rail lines.
- Model international recognition as a diplomatic variable that changes
  sanctions, finance, and trade.
- Add deeper route disruption for border crossings, ports, rail lines, and
  future blockades.
- Add normalized Prisma repositories for war entities.
