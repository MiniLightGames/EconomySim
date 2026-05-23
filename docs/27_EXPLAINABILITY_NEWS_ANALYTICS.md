# Explainability, News, and Analytics

Phase 13 makes simulation changes traceable from raw events to player-facing explanations.

## Domain

New explainability entities:

- `EventCause`
- `EventImpact`
- `MetricChange`
- `Explanation`
- `NewsTemplate`
- `Forecast`
- `PublicStatistic`
- `HiddenStatistic`
- `DataReliability`

Important tick changes now keep a causal trail:

- raw `DomainEvent`;
- normalized `EventCause`;
- normalized `EventImpact`;
- `MetricChange` against the previous comparable metric;
- player-facing `Explanation`;
- categorized `NewsItem`;
- public statistics and forecasts.

## Price Explanations

Every price explanation uses the same contribution buckets:

- Demand
- Supply
- Cost
- Logistics
- Taxes
- Shortage
- Sanctions
- War
- Marketing

Weights are normalized, finite, and non-negative. The first implementation is intentionally coarse: it explains pressure from demand records, inventory, retail prices, shipment/route risk, tax policy, sanctions, active wars, and seller reputation.

## News

News is categorized as:

- economic
- political
- military
- corporate
- exchange
- criminal
- ecological

The news feed is generated from tick metrics and transactions, then decorated with category, reliability, and optional template metadata.

## Analytics

Backend analytics exposes:

- public country statistics;
- price series;
- inflation proxy;
- unemployment proxy;
- industry profit aggregates;
- logistics risk;
- forecasts with confidence;
- data reliability and manipulation risk.

Endpoints:

- `GET /analytics/countries/:id`
- `GET /analytics/products/:id`
- `GET /explanations`
- `GET /forecasts`
- `GET /news`

## Privacy

Private company finance is represented as `HiddenStatistic` and is not returned by public analytics endpoints. `GET /world` also strips `hiddenStatistics` and masks private NPC company cash balances. Public companies and player-owned companies remain visible.

Countries with high manipulation risk or authoritarian regimes can publish distorted `PublicStatistic` values. The statistic carries `distorted: true` and links to `DataReliability`.

## UI

The web app now includes an Analytics panel:

- price-cause contribution bars;
- price chart;
- forecast list;
- inflation, unemployment, logistics risk;
- data reliability and manipulation-risk indicator;
- categorized news feed.

## Tests

Coverage includes:

- event-to-news generation;
- price explanations with all contribution buckets;
- hidden statistics not appearing as public statistics;
- authoritarian-statistic distortion;
- API analytics privacy.

## Follow-Ups

- Add historical trend storage for product-specific prices rather than need-category price approximations.
- Make explanations reference exact production recipe costs and exact tax ledger lines.
- Add data-source-specific reliability: exchange, media, audit, sensor, state.
- Add player-facing drilldown pages for every explanation and forecast.
- Add E2E assertions for chart rendering once the browser test harness is expanded.
