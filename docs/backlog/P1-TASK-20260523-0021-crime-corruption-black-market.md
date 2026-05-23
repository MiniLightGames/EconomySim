# P1-TASK-20260523-0021 Crime, Corruption, and Black Market

## Status

Done.

## Goal

Add a working grey-economy slice with black markets, illegal trades, smuggling routes, corruption cases, investigations, fines, confiscations, and reputation impact.

## Implemented

- Domain entities and seeded enforcement/smuggling data for crime and black-market systems.
- Prisma models for black markets, illegal trades, smuggling routes, corruption cases, investigations, enforcement agencies, fines, confiscations, reputation penalties, and illegal contracts.
- Simulation step that creates black-market demand, resolves pending illegal trades, handles detection risk, records investigations, applies fines, confiscates inventory, and lowers company reputation.
- Backend endpoints for black markets, illegal trades, investigations, and reputation.
- Web Grey Markets panel with risky trade form, route/seller preview, enforcement status, fines, confiscations, legality rating, and crime news.
- Simulation and API tests for black-market creation, smuggling success, detection, fines, reputation penalties, confiscation, and no-invalid-values invariant.

## Acceptance Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Follow-Ups

- Consume enforcement agency capacity across simultaneous investigations.
- Add explicit activity bans that can suspend company legal status after severe repeated violations.
- Turn `IllegalContract` into recurring black-market supply agreements with breach and exposure mechanics.
- Add bank AML alerts and suspicious transaction reporting.
- Persist normalized crime entities to relational tables when the store moves beyond snapshot storage.
