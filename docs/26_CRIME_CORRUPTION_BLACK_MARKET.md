# 26. Crime, Corruption, and Black Market

This phase adds the first working grey-economy slice: black-market demand, illegal trade commands, smuggling routes, enforcement investigations, fines, confiscations, and legality reputation.

## Domain

New world-state entities:

- `BlackMarket`, created by bans, shortages, high taxes, war, sanctions, or corruption.
- `IllegalTrade`, a backend-validated risky trade command that resolves on a tick.
- `SmugglingRoute`, an abstract route with capacity, mode, cost, detection risk, and corruption shielding.
- `CorruptionCase`, created when bribes are paid or suspected.
- `Investigation`, created by enforcement when illegal trade is detected.
- `EnforcementAgency`, with state control, capacity, corruption resistance, media sensitivity, and budget.
- `Fine`, `Confiscation`, and `ReputationPenalty`, used for consequences.
- `IllegalContract`, reserved for future recurring grey-market agreements.

## Simulation Rules

Each tick now includes a crime and black-market step after legal economy, government, and war updates:

1. Scan active laws, unmet demand, tax pressure, war, sanctions, and corruption.
2. Create or update black markets by city and product.
3. Keep ordinary retail goods outside exchange order books.
4. Accept illegal trades only through backend-validated commands.
5. Resolve pending illegal trades deterministically on tick.
6. If the trade passes, inventory leaves the seller and illegal revenue enters the company through auditable transactions.
7. If the trade is detected, enforcement creates an investigation, fine, confiscation, and reputation penalty.
8. Detection chance depends on enforcement control, corruption, operation size, route risk, bribes, media influence, sanctions, war, regime, and seller reputation.
9. No crime step may produce negative values, NaN, or Infinity.

## Backend API

New Fastify endpoints:

- `GET /black-markets`
- `POST /illegal-trades`
- `GET /investigations`
- `GET /reputation`

`POST /illegal-trades` validates the active black market, seller status, inventory, buyer balance, route status, route product compatibility, route capacity, and non-negative bribe before mutating state.

## Frontend

The web app now includes a Grey Markets panel with:

- active black-market list;
- risky deal form;
- seller and route validation preview;
- detection risk, demand, supply, and price multiplier;
- warnings about fines, confiscation, and reputation loss;
- investigations, fines, confiscations, legality rating, and crime news.

The UI refreshes from the real backend after creating a risky deal and after simulation ticks.

## Tests

New and updated tests cover:

- black market appears when a product is banned;
- smuggling can pass when risk is low;
- smuggling can be detected when risk is high;
- fines debit company money;
- reputation falls after detection;
- confiscation removes inventory;
- crime values remain finite and non-negative;
- API exposes crime resources and creates illegal trades through backend validation.

## Current Limitations

- Prisma relational models are present, but runtime persistence still uses the snapshot store.
- Illegal contracts are modeled but not yet expanded into recurring syndicate-style deals.
- Activity bans are represented in the enforcement outcome enum and UI warning, but not yet applied to company legal status.
- Enforcement capacity is modeled and exposed but not yet consumed across competing cases.
