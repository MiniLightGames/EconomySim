# P1-TASK-20260522-0016-logistics-baseline

## Context

EconomySim needs a first logistics layer so products move between warehouses through routes without simulating individual vehicles.

## Goal

Add a backend-validated logistics vertical slice across domain, Prisma, simulation-core, API, web UI, constructor, tests, and docs.

## Scope

- Domain entities for warehouses, shipments, logistics routes, transport companies, route nodes, infrastructure links, borders, ports, roads, and rail lines.
- Prisma models/fields for warehouses, cargo shipments, routes, delivery status, transport companies, cost, duration, and infrastructure.
- `simulation-core` shipment creation, route quoting, inventory reservation at origin, N-tick delivery, route blocking, route overload, bad-infrastructure penalties, and destination inventory receipt.
- API endpoints: `GET /warehouses`, `GET /shipments`, `POST /shipments`, `GET /logistics/routes`, `GET /transport-companies`.
- Web logistics panel with warehouses, shipments, cost, duration, risk, status, and route lines on the 2D map.
- Constructor controls for warehouse type, transport type, and base infrastructure parameters.
- Tests for shipment creation, origin stock decrease, destination stock increase, blocked routes, bad-logistics costs, and non-negative inventory.

## Out of scope

- Individual vehicle simulation.
- Player-facing shipment creation form.
- Payments through ledger for freight fees.
- War cells and dynamic sanctions system.
- Persistent normalized logistics repository; snapshot store remains the active API persistence path.

## Acceptance Criteria

- Shipments reserve origin stock immediately and never make stock negative.
- Delivered shipments increase destination stock after their duration.
- Blocked routes reject shipment creation.
- Poor infrastructure increases cost and duration.
- API exposes logistics resources and validates shipment creation.
- Web and constructor expose the new logistics data.

## Status

Done in the Logistics iteration. Core gates and browser smoke checks passed.

## Verification

```bash
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Follow-up

- Add player UI for creating shipments.
- Charge freight costs through ledger transactions.
- Add dynamic route disruption from war, sanctions, weather, and congestion events.
- Add normalized DB persistence for logistics entities instead of snapshot-only persistence.
- Add route-planning optimization and modal comparison of available carriers.
