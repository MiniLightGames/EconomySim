# First Business Onboarding UI

Stage 7 turns the player operations vertical slice into a guided first-30-minutes flow.

## Implemented

- Added a **First Business stepper** inside Player Operations:
  1. Choose country.
  2. Register company.
  3. Buy/lease premise.
  4. Buy wheat.
  5. Produce bread.
  6. Set price.
  7. Run tick.
  8. Review sales/news/margin.
- Added disabled-state reasons near blocked actions:
  - `нет склада`;
  - `нет wheat`;
  - `нет active retail offer`;
  - `товар в пути`.
- Added an action result drawer with:
  - created entities;
  - money delta;
  - inventory delta;
  - event/metric/news delta.
- Added a `What changed this tick?` panel after every player-loop action.
- Added first-business map highlights:
  - selected country remains highlighted;
  - selected/operational city is highlighted;
  - player/seller warehouses are highlighted;
  - active resource route and in-transit shipment route are highlighted.

## Notes

The flow is still a lightweight UI layer, not a full tutorial engine. It is intentionally data-driven from the current world state so that command/tick, logistics delivery, accounting and margin changes remain the source of truth.

## Follow-up

- Add browser E2E coverage for the guided loop.
- Add route/premise selection UI after the land-premise model is split.
- Add richer post-tick charts after operation analytics is implemented.
