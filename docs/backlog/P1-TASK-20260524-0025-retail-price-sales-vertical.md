# P1-TASK-20260524-0025 - Retail Price and Sales Vertical

## Status

Done.

## Goal

Close the first revenue loop for a player company: produced goods can be repriced through backend validation and sold by the retail market on a simulation tick.

## Scope

- Add `RetailPriceChange` to domain and Prisma.
- Apply `SetRetailPriceCommand` in simulation-core before population demand.
- Add `setRetailOfferPrice` simulation command with validation and events.
- Add API endpoints for retail offers and retail price updates.
- Add `Retail Sale` controls to the web `Player Operations` panel.
- Add tests for price validation, same-tick command application, and post-production sales.
- Update docs and operational backlog.

## Acceptance

- Player cannot change a non-owned or inactive retail offer.
- Price updates are recorded with old and new prices.
- Population can buy player-produced goods after the price is competitive.
- Player company inventory decreases and company cash increases through retail sale transactions.
- No negative, `NaN`, or `Infinity` values are created.
- Required checks pass.

## Follow-up

- Persist resource purchases, production runs, retail price changes, and retail sales to normalized tables instead of relying only on snapshots.
- Add browser E2E for the full player loop.
- Add margin analytics using resource cost, production output, and retail revenue.

