# P1-TASK-20260522-0015-constructor-app

## Context

Phase 6 requires a separate constructor web app for editing world data without changing simulation formulas.

## Goal

Implement an interactive data studio for products, resources, production chains, buildings, company types, laws, and technologies.

## Scope

- `apps/constructor` Next.js client app with section navigation.
- Product editor with name, category, weight, volume, shelf life, quality, and brand/manufacturer fields.
- Production chain editor with inputs, output, labor, energy, time, equipment, waste, and target price.
- Resource, building, company type, law, and technology editors.
- JSON export and import with validation.
- Validation model for missing references, invalid numeric ranges, duplicate ids, product cycles, and potential infinite profit.
- Test mini-simulation for cost, revenue, profit, break-even price, margin, demand risk, and warnings.
- Unit tests for validation, JSON round-trip, infinite-profit warnings, and finite simulation numbers.

## Out of scope

- Server-side persistence.
- Publishing constructor changes into the live API database.
- Visual graph layout for production chains.
- Auth/RBAC for constructor users.

## Acceptance Criteria

- Constructor runs as a separate app on port `3001`.
- Every requested section is visible.
- JSON import/export works in the UI.
- Potential infinite-profit chains produce warnings.
- Mini-simulation runs from constructor data.
- Constructor lint, typecheck, test, and build pass.

## Verification

```bash
pnpm --filter @economysim/constructor lint
pnpm --filter @economysim/constructor typecheck
pnpm --filter @economysim/constructor test
pnpm --filter @economysim/constructor build
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Manual browser smoke:

- `http://localhost:3001` renders `World Data Studio`.
- All seven requested sections are present.
- Production Chains opens and shows chain editing plus mini-simulation.
- `Import JSON` accepts the current exported catalog.
- Browser console has no errors.

## Follow-up

- Add a proper production-chain graph canvas.
- Persist constructor projects through the backend.
- Add publish/review workflow and RBAC.
- Add e2e tests for JSON import/export and invalid-chain warnings.
