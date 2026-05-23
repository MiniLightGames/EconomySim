# P1-TASK-20260523-0022 Explainability, News, and Analytics

## Status

Done.

## Goal

Make the simulation understandable to players by turning important changes into explanations, categorized news, public analytics, forecasts, and reliability metadata.

## Implemented

- Domain entities for causes, impacts, metric changes, explanations, news templates, forecasts, public/hidden statistics, and data reliability.
- Prisma models for the new explainability and analytics entities.
- Simulation-core generation of metric changes, event causes/impacts, price explanations, shortage explanations, war/migration/logistics/protest explanations, public statistics, hidden statistics, forecasts, and categorized news.
- Privacy boundary: hidden private finance stays out of public analytics, and public world responses strip `hiddenStatistics`.
- API endpoints for country analytics, product analytics, explanations, forecasts, and news.
- Web Analytics panel with price-cause bars, price chart, forecasts, data-reliability indicator, public statistics, and categorized news.
- Tests for event news, price explanations, hidden/public statistic separation, authoritarian distortion, and API analytics privacy.

## Acceptance Checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Follow-Ups

- Persist product-specific historical prices separately from need-category demand records.
- Add exact recipe-cost, shipment-cost, and tax-ledger drilldowns to price explanations.
- Add per-source reliability feeds for exchange, media, audit, sensor, and state sources.
- Add public-company reporting schedules and delayed disclosures.
- Add UI/E2E coverage for chart pixels and explanation panels.
