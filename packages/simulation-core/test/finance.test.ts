import { createInitialWorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { applyForLoan, assertNoInvalidEconomyValues, placeOrder, runTick } from "../src";

describe("banking and finance simulation", () => {
  it("issues credit money through a validated bank loan", () => {
    const state = createInitialWorldState("credit");
    const accountBefore = state.bankAccounts.find((account) => account.ownerId === "credit-company-harbor-bakery");
    const result = applyForLoan(
      state,
      {
        borrowerType: "company",
        borrowerId: "credit-company-harbor-bakery",
        lenderBankId: "credit-bank-civic-reserve",
        principalMinor: 1_000_00,
        termTicks: 24
      },
      "credit"
    );
    const accountAfter = result.state.bankAccounts.find((account) => account.id === result.account.id);
    const bankAfter = result.state.banks.find((bank) => bank.id === "credit-bank-civic-reserve");

    expect(result.loan.status).toBe("active");
    expect(accountAfter?.balanceMinor).toBe((accountBefore?.balanceMinor ?? 0) + 1_000_00);
    expect(bankAfter?.loanBookMinor).toBeGreaterThan(state.banks[0]?.loanBookMinor ?? 0);
  });

  it("accrues interest on active loans", () => {
    const state = createInitialWorldState("interest");
    const deferredPaymentState = {
      ...state,
      loans: state.loans.map((loan) => ({ ...loan, nextPaymentTick: 10 }))
    };
    const result = runTick({ state: deferredPaymentState, commands: [], seed: "interest" });
    const loan = result.state.loans.find((candidate) => candidate.id === "interest-loan-harbor-bakery-working-capital");

    expect(loan?.accruedInterestMinor).toBeGreaterThan(0);
    expect(result.metrics.some((metric) => metric.name === "finance.loan.interest_accrued_minor")).toBe(true);
  });

  it("defaults loans when borrowers miss payments", () => {
    const state = makeDistressedCompanyState("default");
    const result = runTick({ state, commands: [], seed: "default" });
    const loan = result.state.loans.find((candidate) => candidate.id === "default-loan-harbor-bakery-working-capital");

    expect(loan?.status).toBe("defaulted");
    expect(result.events.some((event) => event.type === "LoanDefaultedEvent")).toBe(true);
  });

  it("opens company bankruptcy after credit default", () => {
    const state = makeDistressedCompanyState("bankruptcy");
    const result = runTick({ state, commands: [], seed: "bankruptcy" });
    const company = result.state.companies.find((candidate) => candidate.id === "bankruptcy-company-harbor-bakery");

    expect(company?.legalStatus).toBe("bankrupt");
    expect(result.state.bankruptcies.some((item) => item.debtorType === "company" && item.debtorId === company?.id)).toBe(true);
  });

  it("settles asset auctions for bankrupt companies", () => {
    const state = makeDistressedCompanyState("auction");
    const result = runTick({ state, commands: [], seed: "auction" });

    expect(result.state.assetAuctions.some((auction) => auction.status === "settled")).toBe(true);
    expect(result.events.some((event) => event.type === "AssetAuctionSettledEvent")).toBe(true);
  });

  it("matches exchange buy and sell orders", () => {
    const state = createInitialWorldState("trade");
    const result = placeOrder(
      state,
      {
        exchangeId: "trade-exchange-north",
        ownerType: "player",
        ownerId: "player-1",
        assetType: "stock",
        assetId: "trade-stock-harbor-bakery",
        side: "buy",
        priceMinor: 1_250,
        quantity: 10
      },
      "trade"
    );
    const playerPosition = result.state.portfolioPositions.find(
      (position) => position.ownerType === "player" && position.ownerId === "player-1" && position.assetId === "trade-stock-harbor-bakery"
    );

    expect(result.trades).toHaveLength(1);
    expect(playerPosition?.quantity).toBe(10);
  });

  it("opens bank bankruptcy when bank capital cannot absorb losses", () => {
    const state = makeInsolventBankState("bank-failure");
    const result = runTick({ state, commands: [], seed: "bank-failure" });

    expect(result.state.bankruptcies.some((item) => item.debtorType === "bank" && item.debtorId === "bank-failure-bank-civic-reserve")).toBe(true);
  });

  it("burns uninsured deposits when a bank fails without deposit insurance", () => {
    const state = makeInsolventBankState("deposit-loss");
    const playerAccountBefore = state.bankAccounts.find((account) => account.id === "deposit-loss-account-player-1");
    const result = runTick({ state, commands: [], seed: "deposit-loss" });
    const playerAccountAfter = result.state.bankAccounts.find((account) => account.id === "deposit-loss-account-player-1");

    expect(playerAccountAfter?.balanceMinor).toBeLessThan(playerAccountBefore?.balanceMinor ?? 0);
    expect(result.state.financialTransactions.some((transaction) => transaction.type === "DepositLossTransaction")).toBe(true);
  });

  it("does not allow ordinary retail goods to trade through order books", () => {
    const state = createInitialWorldState("ordinary-goods");

    expect(() =>
      placeOrder(
        state,
        {
          exchangeId: "ordinary-goods-exchange-north",
          ownerType: "player",
          ownerId: "player-1",
          assetType: "commodity",
          assetId: "ordinary-goods-product-bread",
          side: "buy",
          priceMinor: 500,
          quantity: 1
        },
        "ordinary-goods"
      )
    ).toThrow("ASSET_NOT_EXCHANGE_TRADEABLE");
  });

  it("does not create negative, NaN, or infinite finance values", () => {
    const state = createInitialWorldState("finance-valid");
    const result = runTick({ state, commands: [], seed: "finance-valid" });

    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });
});

function makeDistressedCompanyState(seed: string) {
  const state = createInitialWorldState(seed);

  return {
    ...state,
    productionPlans: [],
    retailOffers: [],
    companies: state.companies.map((company) =>
      company.id === `${seed}-company-harbor-bakery` ? { ...company, cashBalanceMinor: 0 } : company
    ),
    bankAccounts: state.bankAccounts.map((account) =>
      account.ownerId === `${seed}-company-harbor-bakery` ? { ...account, balanceMinor: 0, reservedMinor: 0 } : account
    ),
    loans: state.loans.map((loan) =>
      loan.id === `${seed}-loan-harbor-bakery-working-capital`
        ? { ...loan, missedPayments: 1, nextPaymentTick: 1, paymentPerTickMinor: 9_999_999_00 }
        : loan
    )
  };
}

function makeInsolventBankState(seed: string) {
  const state = createInitialWorldState(seed);

  return {
    ...state,
    productionPlans: [],
    retailOffers: [],
    loans: [],
    banks: state.banks.map((bank) =>
      bank.id === `${seed}-bank-civic-reserve`
        ? {
            ...bank,
            nonPerformingLoanMinor: bank.capitalMinor + bank.reservesMinor + 20_000_00
          }
        : bank
    )
  };
}
