# 37. Player Margin Accounting

## Purpose

The first player business loop now explains not only whether bread was sold, but whether the operation made economic sense. The accounting layer tracks cost basis from resource purchase to production output and finally to retail sales.

This supports the prototype DoD path:

```text
buy wheat → receive inventory cost basis → produce bread → allocate input cost → sell bread → calculate COGS and gross margin → show P&L in UI
```

## Domain changes

### Inventory lot cost basis

`InventoryLot` stores optional cost metadata:

- `unitCostMinor`
- `totalCostMinor`
- `costSourceType`
- `costSourceId`

Cost sources currently include:

- `seed`
- `resource_purchase`
- `shipment_delivery`
- `production`
- `retail_return`
- `system`
- `mixed`

The simulation core keeps weighted-average cost when compatible lots are merged.

### Production cost allocation

`ManualProductionRun` stores:

- `inputCostMinor`
- `outputUnitCostMinor`
- `outputTotalCostMinor`

Each consumed input also records:

- `unitCostMinor`
- `totalCostMinor`

Produced bread inventory receives a production cost basis equal to allocated consumed input cost.

### Retail sale margin

`ProductSoldEvent.metadata` includes:

- `revenueMinor`
- `costOfGoodsSoldMinor`
- `grossMarginMinor`
- `grossMarginRate`

This makes sale profitability explainable without recomputing historical inventory consumption later.

## Metrics

Added metrics:

- `production.manual.input_cost_minor`
- `production.manual.output_unit_cost_minor`
- `market.sales.cogs_minor`
- `market.sales.gross_margin_minor`
- `market.sales.gross_margin_rate`

## Explainability

Retail sale events now generate `profitability` explanations. These summarize whether revenue covered COGS and expose factors for revenue, COGS and margin rate.

## Persistence

Prisma normalized persistence now stores:

- inventory lot cost basis fields;
- manual production cost allocation fields.

Snapshot remains the fallback/recovery layer.

## UI

The Player Operations panel now includes a `P&L / Margin` card with:

- revenue;
- COGS;
- gross margin;
- cash delta;
- input cost;
- inventory cost;
- resource spend;
- margin rate;
- latest profitability explanation.

Inventory rows also display unit cost.

## Known limitations

- This is gross-margin accounting, not full accrual accounting.
- Taxes, rent, depreciation, payroll and financing costs are not included yet.
- Cost consumption follows current lot order and compatible weighted-average merge; no FIFO/LIFO selector yet.
- Multi-currency accounting is still out of scope for the first player loop.
