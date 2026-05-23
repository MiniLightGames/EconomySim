# P1-TASK-20260523-0020 Technology, R&D, and Ecology

## Status

Done.

## Goal

Add the first working technology, research, patent/license, ecology, and resource-deposit slice to EconomySim.

## Implemented

- Domain entities for technology, R&D, patents, licenses, deposits, discoveries, pollution, environmental indexes, and clean-energy policy.
- Prisma models for the new technology/ecology persistence surface.
- Simulation step for research progress, technology unlocks, production input efficiency, resource depletion, resource discovery, pollution, and environmental population pressure.
- Backend endpoints for technologies, research projects, environment, and resource deposits.
- Web UI panel for R&D and ecology plus ecology/resource map markers.
- Constructor editors for technology effects, resource deposit templates, and pollution factors.
- Unit and integration tests for simulation, API, web view model, and constructor validation.

## Acceptance Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Follow-Ups

- Add production-cost accounting so technology affects explicit unit cost and margin reports, not only input consumption.
- Add patent royalties and license fee settlement through bank accounts.
- Add government ecological fines/subsidies as country budget transactions.
- Add map filters for ecology/resources/war/logistics layers.
- Persist normalized technology/ecology entities to relational tables when the store graduates beyond snapshot storage.
