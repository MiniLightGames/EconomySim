# Stage 5 — Player Resource Logistics Delivery Loop

## Goal

Move player resource purchasing from instant inventory transfer to a logistics-aware loop:

1. Player buys a resource by command.
2. `pickup` mode keeps the old local/direct behaviour.
3. `delivery` mode reserves/removes seller inventory and creates a shipment.
4. Buyer inventory is created only when the shipment is delivered by a later logistics tick.
5. Manual production consumes only delivered inventory, so in-transit wheat cannot be used.

## Domain changes

- `BuyResourceCommand` now accepts `deliveryMode`, `routeId`, and `transportCompanyId`.
- `ResourcePurchase` now records:
  - `deliveryMode`;
  - `shipmentId`;
  - `goodsCostMinor`;
  - `logisticsCostMinor`;
  - lifecycle status: `completed`, `in_transit`, `delivered`, `failed`.

## Simulation behaviour

### Pickup/direct

`deliveryMode: "pickup"` keeps the first vertical-slice fast path:

- seller inventory is consumed;
- buyer inventory is created immediately;
- buyer pays seller;
- purchase status is `completed`.

### Delivery/shipment

`deliveryMode: "delivery"` uses a logistics route:

- seller inventory is consumed/reserved at purchase tick;
- buyer pays goods cost and shipment cost immediately;
- seller receives goods revenue;
- transport company receives logistics revenue;
- `Shipment` is created with `in_transit` status;
- buyer inventory is not created until `ShipmentDeliveredEvent`;
- linked purchase status changes from `in_transit` to `delivered` or `failed`.

## API behaviour

- `/resources/purchase` accepts `deliveryMode`, `routeId`, and `transportCompanyId`.
- Response includes the created `shipment` when delivery mode is used.
- `/simulation/tick` command results now include `shipmentId` for delivery purchases.

## UI behaviour

The Player Operations panel now exposes delivery mode:

- `pickup/direct — local instant stock`;
- `delivery — shipment first`.

When delivery is selected, the UI finds an active route from the seller warehouse to the player's warehouse and shows whether the route is ready. Production is disabled while required input shipments are still `in_transit`; core validation returns `INPUT_SHIPMENT_IN_TRANSIT` before any production mutation.

## Persistence

`PrismaWorldStore` now persists and hydrates shipments as part of the normalized player-loop read model. `ResourcePurchase` persistence includes delivery/shipment fields.

## Follow-ups

- Add true reservation lots instead of removing seller inventory immediately.
- Add escrow/split settlement instead of immediate full payment.
- Add selectable carriers and shipment quotes in the UI.
- Add route creation for player warehouses that currently lack a delivery path.
