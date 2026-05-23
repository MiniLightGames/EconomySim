# Logistics Phase

This document captures the first production slice of logistics in EconomySim.
The goal is a playable abstraction: goods move between warehouses through
routes over several ticks without simulating individual vehicles.

## Scope

The logistics slice adds:

- warehouses with type, capacity, handling cost, city and owner;
- transport companies with mode, coverage, reliability, speed and cost;
- logistics routes between warehouses;
- route nodes and infrastructure links for road, rail and port segments;
- border crossings that can add delay or block traffic;
- shipments with cost, duration, risk, status and remaining ticks;
- route drawing and shipment status in the game UI;
- infrastructure defaults in the constructor.

## Domain Model

The domain package defines these core logistics entities:

- `Warehouse`
- `Shipment`
- `LogisticsRoute`
- `TransportCompany`
- `RouteNode`
- `InfrastructureLink`
- `BorderCrossing`
- `Port`
- `Road`
- `RailLine`

`WorldState` owns all logistics collections. Warehouses are still the source of
truth for goods. A shipment reserves inventory at its origin warehouse when it is
created and deposits the same quantity into the destination warehouse when it is
delivered.

## Simulation Rules

`createShipment` validates the request, quotes the route, reserves origin stock
and creates an `in_transit` shipment.

`runTick` processes active shipments:

- remaining delivery ticks decrease by one each simulation tick;
- delivered shipments increase destination warehouse stock;
- blocked routes move affected shipments to `blocked`;
- bad infrastructure increases route cost, duration and risk;
- overloaded routes increase delay and risk;
- inactive routes, blocked infrastructure, sanctions and closed border
  crossings prevent delivery.

The simulation validates economy values after every tick and shipment creation.
Warehouses, shipments, carriers and infrastructure cannot produce negative
values, `NaN` or `Infinity`.

## API

The backend exposes:

- `GET /warehouses`
- `GET /shipments`
- `POST /shipments`
- `GET /logistics/routes`
- `GET /transport-companies`

`POST /shipments` is the only player-facing write path for logistics. It accepts
origin, destination, product, quantity and optional route or carrier selection.
The backend validates the command through `packages/simulation-core`, so the
client cannot directly mutate warehouses or shipment status.

## UI

The web app adds a logistics panel to the main game screen:

- warehouse list with current stock;
- shipment list with status, cost, ETA and risk;
- route count;
- route lines on the 2D world map.

Active routes are drawn differently from blocked or inactive routes so the
player can read transport availability at a glance.

## Constructor

The constructor app adds logistics knobs for world authors:

- warehouse type on buildings;
- transport mode on company types;
- infrastructure defaults for road quality, rail quality, port quality,
  capacity, border delay and base delivery cost.

These settings are included in JSON import/export and validation.

## Tests

The logistics slice is covered by simulation and API tests:

- shipment creation reserves origin inventory;
- delivery increases destination inventory after the configured duration;
- blocked routes do not create or complete deliveries;
- poor infrastructure increases cost and duration;
- no logistics operation creates negative warehouse values.

## Follow-Up

Future iterations should add:

- player shipment creation controls in the web UI;
- contracts that automatically create shipments;
- route capacity dashboards;
- war and disaster disruption events;
- richer border policy and sanctions data;
- logistics profitability and carrier balance sheets;
- historical delivery performance metrics.
