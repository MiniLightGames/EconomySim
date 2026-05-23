# P1-TASK-20260523-0018-government-politics-laws

## Context

EconomySim needs governments that can tax, spend, regulate, nationalize, and
shape economic outcomes without turning the player into a politician.

## Goal

Add a backend-validated government and politics vertical slice across domain,
Prisma, simulation-core, API, web UI, constructor, tests, and docs.

## Scope

- Domain entities for governments, parties, elections, laws, tax policies,
  budgets, debt, subsidies, licenses, sanctions, corruption, protests,
  lobbying, and media influence.
- Prisma models for durable government and politics data.
- `simulation-core` tax collection, public spending, budget updates, stability,
  protests, law adoption, propaganda/media influence, corruption, license
  enforcement, nationalization, and political write commands.
- API endpoints for government reads, country laws, country budgets, lobbying,
  media campaigns, and voting.
- Web government panel with laws, taxes, budget, parties, elections, protests,
  player influence actions, and political news.
- Constructor law-template editor with law type, parameters, restrictions, and
  economic impact fields.

## Out Of Scope

- Full campaign simulation and candidate-level politics.
- Player office holding.
- Detailed parliament/coalition mechanics.
- Direct route mutation from sanctions and export controls.
- Normalized persistence repositories beyond Prisma schema and snapshot store.
- Full audit-log repository integration for every political action.

## Acceptance Criteria

- Taxes are collected through balanced financial transactions.
- Government budgets update on tick.
- Laws can affect companies.
- Players without assets cannot vote.
- NPC population voting weight is stronger than player voting weight.
- Nationalization changes company ownership to state.
- License law can suspend an unlicensed business.
- Backend validates lobbying, media campaigns, and voting.
- Web and Constructor expose the new government systems.
- Required gates pass.

## Status

Done in the Government, Politics, and Laws iteration.

## Verification

```bash
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Follow-Up

- Add audit-log persistence for political actions and government money flows.
- Connect sanctions and export controls to logistics route availability.
- Add dedicated government bond issuance and central-bank purchases through
  exchange infrastructure.
- Add polling charts, party platforms, and political event timelines.
- Add normalized Prisma repositories for government entities.
