# P1-TASK-20260524-0035-land-premise-lease-model

Status: Todo
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
