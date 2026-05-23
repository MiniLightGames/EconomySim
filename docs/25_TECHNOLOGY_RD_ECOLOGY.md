# 25. Technology, R&D, and Ecology

This phase adds the first production-ready slice of technology progress, research investment, patents/licenses, resource deposits, pollution, and environmental pressure.

## Domain

New world-state entities:

- `Technology`, with domain, industry, access model, research cost, prerequisites, and effect bundle.
- `TechnologyLevel`, scoped to country, company, or industry.
- `ResearchProject`, funded by a company and completed by simulation ticks.
- `Patent` and `LicenseAgreement`, used by access-controlled technology diffusion.
- `ResourceDeposit` and `ResourceDiscovery`, used for finite local resources and exploration.
- `Pollution`, `EnvironmentalIndex`, and `CleanEnergyPolicy`, used for local environmental state.

Technology access models are `open`, `patent`, `license`, and `trade_secret`.

## Simulation Rules

Each tick now includes a technology/ecology step:

1. Active research projects spend validated company funds.
2. Research progress is increased by funding and education technology bonuses.
3. Completed research unlocks a company technology level and can create a patent.
4. Active license agreements can diffuse technology to a company or state scope.
5. Production recipes consume fractional inputs correctly.
6. Production input efficiency reduces required inputs without creating free output.
7. Consumed production inputs deplete matching active resource deposits.
8. Undiscovered deposits can be discovered through deterministic survey rolls.
9. Production creates pollution according to product category, reduced by technology and clean-energy policy.
10. Pollution updates local environmental quality, health impact, and migration pressure.
11. Environmental pressure can reduce cohort health and move population to cleaner cities.

The same no-negative, no-NaN, no-Infinity invariant applies to all technology and ecology values.

## Backend API

New Fastify endpoints:

- `GET /technologies`
- `POST /research-projects`
- `GET /research-projects`
- `GET /environment`
- `GET /resources/deposits`

`POST /research-projects` validates company, technology, funding, duplicate active projects, and available company funds before it mutates world state. The frontend cannot create money or directly unlock technology.

## Frontend

The web app now includes:

- R&D / Ecology panel.
- Company-funded research form.
- Company and country technology levels.
- Patents and license counts.
- Environmental index cards.
- Pollution totals.
- Resource deposit cards.
- Ecology and resource markers on the 2D world map.

## Constructor

The constructor can now edit:

- Technology domains, access models, research cost, and effects.
- Resource deposit templates.
- Pollution factors by source category.

JSON import/export and validation include the new catalog sections.

## Tests

New and updated tests cover:

- R&D unlocks a technology.
- Technology lowers production input cost.
- Resource deposits deplete.
- Production increases pollution.
- Ecology affects population health and migration.
- Backend research endpoints validate inputs and advance through ticks.
- Constructor validates technology, deposit, and pollution-factor definitions.
