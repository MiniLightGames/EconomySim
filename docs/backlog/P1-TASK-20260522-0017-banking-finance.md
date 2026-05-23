# P1-TASK-20260522-0017-banking-finance

## Context

EconomySim needs a first banking and capital-markets layer so companies can
borrow, banks can fail, and financial assets can trade separately from ordinary
retail goods.

## Goal

Add a backend-validated finance vertical slice across domain, Prisma,
simulation-core, API, web UI, tests, and docs.

## Scope

- Domain entities for central banks, commercial banks, accounts, loans, credit
  scores, rates, bonds, stocks, exchanges, order books, trades, bankruptcies,
  and asset auctions.
- Prisma models for banks, accounts, loans, payments, rates, orders, trades,
  bankruptcies, and auctions.
- `simulation-core` loan origination, interest accrual, payments, default,
  company bankruptcy, bank bankruptcy, deposit loss, asset auctions, and order
  matching.
- API endpoints for banks, accounts, loans, exchanges, orders, portfolios, and
  bankruptcies.
- Web finance panel with banking data, loan application, portfolio, order book,
  buy order form, bankruptcies, and finance news.
- Security checks for invalid borrowers, direct money creation, and asset
  purchases without cash.

## Out Of Scope

- Full accounting-grade double-entry ledger integration for all finance flows.
- Deposit insurance law editor.
- Player UI for loan repayment.
- Short selling, margin, derivatives, and market makers with strategy.
- Multi-currency FX settlement beyond the first asset model.
- Normalized database repositories; snapshot persistence remains active.

## Acceptance Criteria

- Loans create credit money only through backend-validated simulation-core.
- Loan interest accrues during ticks.
- Missed payments can default a borrower.
- Company default opens bankruptcy and settles an asset auction.
- Bank failure can burn uninsured deposits.
- Exchange order books match buy and sell orders.
- Ordinary retail goods are rejected from order books.
- Buying assets without balance is rejected.
- Required gates pass.

## Status

Done in the Banking and Finance iteration.

## Verification

```bash
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Follow-Up

- Add repayment controls to the web finance panel.
- Move finance writes into explicit ledger/audit-log repositories.
- Add deposit-insurance laws and central-bank policy tools to Constructor.
- Add richer portfolio P&L and sell-order UX.
- Add persistent normalized finance repositories in `packages/db`.
