# Retail Price and Sales Vertical

## Summary

The first player company loop now reaches revenue:

1. Create a player company.
2. Buy wheat from a resource offer.
3. Produce bread into the player warehouse.
4. Set the player retail offer price through backend validation.
5. Advance the simulation tick and let population demand buy from the offer.
6. See inventory decrease, company cash increase, events, metrics, and news.

Ordinary goods still clear through retail offers. They do not use exchange order books.

## Domain

- `RetailPriceChange` records a player-applied price update.
- `RetailOffer` remains the market-facing sell surface for ordinary goods.
- `SetRetailPriceCommand` is now applied by simulation-core before population demand in the same tick.
- The invariant list now states that player retail prices change only through backend-validated retail offer commands.

## Database

Prisma now includes `RetailPriceChange` for normalized history:

- player id;
- company id;
- retail offer id;
- product id;
- old and new price;
- currency;
- status and tick.

The snapshot store remains the runtime source of truth, with normalized tables prepared for the persistence split.

## Backend

New endpoints:

- `GET /retail/offers`
- `GET /retail/price-changes`
- `POST /retail/offers/:id/price`

The write path validates player ownership, active registered company status, offer ownership, warehouse ownership, currency, product existence, and price bounds before simulation-core mutates state.

## Simulation

`setRetailOfferPrice` updates a player-owned retail offer and creates:

- `RetailPriceChange`;
- `RetailPriceChangedEvent`;
- `retail.price.changed_minor` metric;
- corporate news.

`runTick` applies accepted `SetRetailPriceCommand` values before population demand, so a price command can affect sales in the same tick. Population purchases still choose by price, availability, and quality; sales create balanced `RetailSaleTransaction` entries.

## Frontend

`Player Operations` now includes a `Retail Sale` block:

- current player offer;
- available stock;
- unit price input;
- `Set Price` action;
- revenue and sale tick counters;
- last price-change summary.

After a competitive price and a tick, produced goods can be sold to population demand.

## Tests

Coverage added:

- simulation-core direct retail price update;
- simulation-core competitive player sale after manual production;
- simulation-core tick command application before demand;
- API integration for create company -> buy wheat -> produce bread -> set retail price -> tick -> sale.

