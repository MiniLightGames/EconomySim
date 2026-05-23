# War And Geopolitics Phase

This document captures the first strategic war and international-relations
vertical slice for EconomySim. The slice makes war an automated state conflict
that affects territory, logistics, population, military demand, sanctions, and
news while keeping the player in an economic role.

## Scope

The war slice adds:

- domain entities for wars, fronts, strategic cells, armies, military units,
  supplies, occupations, treaties, sanctions, alliances, blockades, refugee
  flows, war damage, and military orders;
- Prisma models for production persistence of strategic war data;
- a `simulation-core` war step that consumes army supplies, creates military
  orders, moves fronts, captures strategic cells, separates legal and factual
  control, damages infrastructure and warehouses, blocks routes, creates
  refugee flows, and raises military logistics pressure;
- backend endpoints for wars, individual war details, strategic cells,
  sanctions, and military orders;
- web UI for a war layer on the 2D map plus a War Room panel with active wars,
  fronts, occupied cells, military orders, sanctions, damage, refugees, and war
  news;
- regression tests for capture, factual control, damage, blockade, military
  demand, refugee movement, and invalid-value prevention.

## Rules

Wars are automatic conflicts between governments. Players do not control armies
directly. Player participation is economic: food, fuel, ammunition, transport,
credit, logistics, and production capacity.

The visible map remains vector-based, but simulation uses strategic cells. Each
cell has legal control and factual control. Occupiers can take factual tax and
infrastructure control before international recognition catches up.

Bad infrastructure, blockades, sanctions, and wartime route risk increase
logistics pressure. Military demand competes with civilian logistics without
turning retail goods into exchange order books.

## API

The backend exposes:

- `GET /wars`
- `GET /wars/:id`
- `GET /strategic-cells`
- `GET /sanctions`
- `GET /military-orders`

All endpoints are read-only. There is no API route for a player to directly
move armies, capture cells, create money, or mutate war state outside the
validated simulation tick.

## Tests

The war slice covers:

- strategic cell capture;
- factual control changing while legal control remains separate;
- infrastructure damage from war;
- route blocking by wartime blockade;
- increased military goods demand;
- refugee movement from front regions to safer cities;
- no negative, NaN, or infinite values after war ticks;
- API coverage for war resources and tick-driven war state updates.

## Follow-Up

Future iterations should add:

- constructor editors for strategic cells, army templates, war goals, and
  sanctions templates;
- actual procurement fulfilment from player and NPC companies into military
  orders;
- repair contracts and infrastructure recovery after war damage;
- international recognition mechanics that feed sanctions, treaties, and trade
  access;
- richer route disruption from ports, rail lines, border crossings, and future
  naval blockades;
- persistence repositories for normalized war entities instead of snapshot-only
  runtime storage.
