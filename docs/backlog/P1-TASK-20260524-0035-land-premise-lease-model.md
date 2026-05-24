# P1-TASK-20260524-0035-land-premise-lease-model

Status: Done
Priority: P1
Area: Domain / Simulation Core / API / UI

## Goal

Split the starter premise shortcut into explicit land parcel, premise/building, lease, and purchase concepts while keeping the first business loop playable.

## Scope

- Add domain entities for `LandParcel` and starter `Premise` or `Building` ownership/use rights.
- Represent `purchase` and `lease` as different economic contracts.
- Apply recurring rent and maintenance on scheduled ticks.
- Validate zoning and country/city ownership constraints before a player company can operate.
- Keep the bread starter flow working after the model split.

## Acceptance Criteria

- A player company can lease a premise without owning the land.
- A player company can purchase land/premise where rules allow it.
- Warehouses and production plans reference the premise/building they operate from.
- Monthly rent/maintenance entries are auditable financial transactions.
- UI explains why a premise option is available or blocked.


## Implementation Notes

- Added domain entities `LandParcel` and `Premise` so `BuyLandCommand` no longer only points at an opaque `lotId`.
- Preserved `lotId` as a backward-compatible alias for existing UI/API callers and dependent batches.
- Added `purchase` vs `lease` economics: purchase pays higher upfront price plus maintenance; lease pays first rent plus maintenance and creates monthly rent obligations.
- Added monthly recurring rent/maintenance processing on the simulation tick schedule.
- Added zoning validation for the starter food/retail loop: commercial, industrial, and mixed premises are allowed; incompatible zoning is rejected.
- Extended normalized persistence and Prisma schema with `LandParcel` and `Premise`.
- UI now lets the player choose an available premise and acquisition mode before creating the operational warehouse/production/retail starter assets.
