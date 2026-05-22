# 18. Initial Backlog

## P0 — Bootstrap

- создать pnpm monorepo;
- создать apps/web, apps/api, apps/worker, apps/constructor;
- создать packages/domain, simulation-core, db, ui, config, testing;
- настроить lint/typecheck/test/build;
- настроить Docker Compose;
- настроить CI.

## P1 — First vertical slices

1. World seed: страны, города, товары, население.
2. Tick engine: тики, события, метрики.
3. Company creation: DB → command → API → UI → audit.
4. Retail product sale: inventory → demand → price → sale UI.
5. Logistics: cargo batch → route → delay → map line.
6. Loan: bank → account → loan → payment → default.
7. Contract: create → accept → obligation → penalty.
8. Constructor product editor: form → validation → test simulation.

## P2 — Quality

- scenario regression suite;
- dashboards;
- explanation panels;
- API docs;
- seed balancing;
- load baseline.

## P3 — Later features

- full politics;
- war cells;
- stock market;
- R&D;
- ecology;
- black market;
- multiplayer preparation.
