# Banking And Finance Phase

This document captures the first finance vertical slice for EconomySim.
The design keeps retail goods and financial markets separate: food, housing,
transport, medicine, and entertainment still clear through ordinary retail
offers, while stocks, bonds, currencies, and exchange-tradeable commodities use
order books.

## Scope

The finance slice adds:

- central banks and base money;
- commercial banks, reserves, capital, deposits, loan books, and bank failure;
- bank accounts for players, companies, banks, and exchange settlement;
- loans, credit scores, interest rates, interest accrual, payments, defaults;
- government bonds and central-bank bond purchases;
- stocks, exchanges, order books, orders, trades, and portfolio positions;
- bankruptcy cases and asset auctions;
- API and web UI for banking, loans, portfolios, exchanges, and bankruptcies.

## Economic Rules

Central banks create base money by buying eligible government bonds. Commercial
banks create credit money only through validated loan origination. Loan capacity
is constrained by reserves, capital, borrower credit risk, bank risk, and the
active reserve requirement.

Loan payments reduce borrower cash and bank deposits. Interest increases bank
capital, while principal repayment reduces the loan book. Missed payments raise
credit risk; repeated missed payments trigger default. Company defaults open
bankruptcy and asset auctions.

If a commercial bank fails and the country has no deposit insurance, customer
deposit balances are partially burned. This is explicit in simulation events and
financial transactions.

## Exchange Rules

Order books are used only for financial and exchange-tradeable assets:

- stocks;
- bonds;
- currencies;
- commodities whose product definition has `exchangeTradeable = true`.

Ordinary retail products are rejected by simulation-core when submitted to an
order book. Buyers must have enough settlement cash before an order is accepted.
Sellers must hold enough portfolio position before a sell order is accepted.

## API

The backend exposes:

- `GET /banks`
- `GET /accounts`
- `POST /loans/apply`
- `GET /loans`
- `POST /loans/:id/pay`
- `GET /exchanges`
- `POST /orders`
- `GET /portfolio`
- `GET /bankruptcies`

There is intentionally no endpoint for direct money creation. New deposits are
created through `POST /loans/apply`, and market cash movement happens through
`POST /orders`.

## UI

The web game screen adds a `Banking & Finance` panel with:

- central-bank base money;
- commercial-bank capital, reserves, loan book, and solvency;
- loan application form;
- exchange order book summary;
- buy order form for the player portfolio;
- portfolio cash and positions;
- bankruptcy cases;
- finance-related news.

## Tests

The finance slice covers:

- loan issuance;
- interest accrual;
- loan default;
- company bankruptcy;
- asset auction settlement;
- exchange order matching;
- bank bankruptcy;
- uninsured deposit loss;
- rejection of ordinary retail goods in order books;
- backend rejection of invalid borrowers and unaffordable asset purchases.

## Follow-Up

Future iterations should add:

- deposit insurance law configuration;
- player-facing loan repayment UI;
- sell orders and portfolio P&L;
- bond coupons and maturities;
- bank balance-sheet dashboards;
- currency pairs and FX settlement;
- normalized persistence repositories for finance entities;
- audit-log assertions for every finance write path.
