import { createInitialWorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { castVote, runTick } from "../src";

describe("government, politics, and laws simulation", () => {
  it("collects taxes through auditable transactions", () => {
    const state = createInitialWorldState("gov-tax");
    const result = runTick({ state, commands: [], seed: "gov-tax" });
    const budget = result.state.governmentBudgets.find((item) => item.countryId === "gov-tax-country-north-coast" && item.tick === 1);

    expect(budget?.revenueMinor).toBeGreaterThan(0);
    expect(result.state.financialTransactions.some((transaction) => transaction.type === "TaxCollectionTransaction")).toBe(true);
  });

  it("updates government budget after public spending", () => {
    const state = createInitialWorldState("gov-budget");
    const initialBudget = state.governmentBudgets.at(-1);
    const result = runTick({ state, commands: [], seed: "gov-budget" });
    const nextBudget = result.state.governmentBudgets.find((item) => item.countryId === "gov-budget-country-north-coast" && item.tick === 1);

    expect(nextBudget?.spendingMinor).toBeGreaterThan(0);
    expect(nextBudget?.treasuryMinor).not.toBe(initialBudget?.treasuryMinor);
  });

  it("tax laws affect company cash balances", () => {
    const state = createInitialWorldState("gov-law-impact");
    const highTaxState = {
      ...state,
      laws: state.laws.map((law) =>
        law.id === "gov-law-impact-law-profit-tax" ? { ...law, parameters: { rate: 0.5 }, support: 0.9 } : law
      )
    };
    const result = runTick({ state: highTaxState, commands: [], seed: "gov-law-impact" });
    const taxPaid = result.state.financialTransactions
      .filter((transaction) => transaction.type === "TaxCollectionTransaction")
      .flatMap((transaction) => transaction.entries)
      .filter((entry) => entry.ownerType === "company" && entry.ownerId === "gov-law-impact-company-harbor-bakery")
      .reduce((total, entry) => total + Math.abs(entry.amountMinor), 0);

    expect(taxPaid).toBeGreaterThan(0);
  });

  it("does not let a player vote without assets or investments", () => {
    const state = createInitialWorldState("gov-no-assets");
    const noAssetsState = {
      ...state,
      bankAccounts: state.bankAccounts.filter((account) => !(account.ownerType === "player" && account.ownerId === "player-1")),
      portfolioPositions: state.portfolioPositions.filter((position) => !(position.ownerType === "player" && position.ownerId === "player-1")),
      companies: state.companies.filter((company) => !(company.ownerType === "player" && company.ownerId === "player-1"))
    };

    expect(() =>
      castVote(noAssetsState, {
        playerId: "player-1",
        countryId: "gov-no-assets-country-north-coast",
        partyId: "gov-no-assets-party-civic-growth",
        choice: "for"
      })
    ).toThrow("VOTER_HAS_NO_ASSETS");
  });

  it("keeps NPC population voting power stronger than a player vote", () => {
    const state = createInitialWorldState("gov-vote-weight");
    const result = castVote(
      state,
      {
        playerId: "player-1",
        countryId: "gov-vote-weight-country-north-coast",
        partyId: "gov-vote-weight-party-labor-commons",
        choice: "for"
      },
      "gov-vote-weight"
    );
    const laborResult = result.election.results.find((item) => item.partyId === "gov-vote-weight-party-labor-commons");

    expect(result.election.npcVoteWeight).toBeGreaterThan(result.election.playerVoteWeight);
    expect(laborResult?.npcVotes).toBeGreaterThan(laborResult?.playerVotes ?? 0);
  });

  it("nationalization changes company ownership to the state", () => {
    const state = createInitialWorldState("gov-nationalize");
    const nationalizationState = {
      ...state,
      laws: state.laws.map((law) =>
        law.id === "gov-nationalize-law-nationalization"
          ? {
              ...law,
              status: "active" as const,
              parameters: { targetCompanyId: "gov-nationalize-company-harbor-bakery" },
              support: 0.9,
              enactedTick: 0
            }
          : law
      )
    };
    const result = runTick({ state: nationalizationState, commands: [], seed: "gov-nationalize" });
    const company = result.state.companies.find((candidate) => candidate.id === "gov-nationalize-company-harbor-bakery");

    expect(company?.ownerType).toBe("state");
    expect(company?.ownerId).toBe("gov-nationalize-country-north-coast");
  });

  it("blocks licensed business activity when a company lacks permission", () => {
    const state = createInitialWorldState("gov-license");
    const unlicensedState = {
      ...state,
      licenses: state.licenses.filter((license) => license.companyId !== "gov-license-company-harbor-bakery")
    };
    const result = runTick({ state: unlicensedState, commands: [], seed: "gov-license" });
    const company = result.state.companies.find((candidate) => candidate.id === "gov-license-company-harbor-bakery");

    expect(company?.legalStatus).toBe("suspended");
    expect(result.events.some((event) => event.type === "CompanyLicenseBlockedEvent")).toBe(true);
  });
});
