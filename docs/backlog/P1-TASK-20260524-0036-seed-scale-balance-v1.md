# P1-TASK-20260524-0036-seed-scale-balance-v1

Status: Todo
Priority: P1
Area: Domain / Simulation Core / Balance / QA

## Goal

Expand the starter world toward the first prototype scale while preserving a near-equilibrium tick-1 state.

## Scope

- Move from the tiny demo world toward 5 countries and roughly 20 cities.
- Add enough resources/products to support food, energy, construction, logistics, retail, and basic industry.
- Seed NPC companies, banks, warehouses, resource offers, routes, and retail offers consistently.
- Add balance regression checks for shortages, black markets, bankruptcies, war damage, inflation, and inventory drift.
- Keep the player bread business loop deterministic and easy to debug.

## Acceptance Criteria

- Tick 1 through tick 24 do not create crisis cascades in the baseline seed.
- There are no negative money or inventory invariant violations.
- Public metrics and news remain readable and not spammy.
- The player can still complete the first business loop in one selected country/city.
