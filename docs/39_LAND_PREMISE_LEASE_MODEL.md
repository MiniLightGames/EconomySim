# 39. Land / Premise / Lease Model

Stage 8 splits the old starter `BuyLandCommand` shortcut into explicit land and premise concepts while keeping the first business loop playable.

## Domain model

- `LandParcel` represents the city/country land asset, zoning, owner, status, market price, monthly rent, maintenance, infrastructure score, and allowed business types.
- `Premise` represents the usable building/unit on a parcel, with premise type, acquisition mode, status, company assignment, linked warehouse, and recurring costs.
- `Warehouse` remains the operational logistics/storage surface and is created only after a premise is acquired.

## Command behavior

`BuyLandCommand` now accepts `landParcelId` and `premiseId` while keeping `lotId` for backward compatibility. The command:

1. validates company ownership and city/country match;
2. validates land/premise availability;
3. validates zoning for the starter business loop;
4. applies purchase or lease economics;
5. updates parcel/premise ownership/use rights;
6. creates the starter warehouse, bread production plan, retail offer, and food license;
7. emits `LandPremiseAcquiredEvent`, metrics, news, and a `LandPremiseTransaction`.

## Economics

- `purchase`: higher upfront purchase price plus monthly maintenance.
- `lease`: first rent plus maintenance upfront, then recurring monthly rent plus maintenance.
- Monthly recurring costs run every `24 * 30` hourly ticks and create auditable financial transactions and events.

## UI

The Player Operations panel now shows an available-premise selector with zoning, rent, purchase price, land parcel, infrastructure score, and allowed business types. The player can choose `lease` or `purchase` before acquiring the premise.

## Persistence

Prisma and the normalized read model now persist/hydrate `LandParcel` and `Premise`, including status, zoning, owner fields, acquisition mode, warehouse link, and recurring cost fields.
