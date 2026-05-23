import { createInitialWorldState, type BlackMarket, type SmugglingRoute, type WorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { assertNoInvalidEconomyValues, createIllegalTrade, runTick } from "../src";

describe("crime, corruption, and black market simulation", () => {
  it("creates a black market when a product is banned", () => {
    const state = {
      ...baseCrimeState("crime-ban"),
      laws: [
        ...baseCrimeState("crime-ban").laws,
        {
          id: "crime-ban-law-bread-ban",
          countryId: "crime-ban-country-north-coast",
          name: "Emergency bread export ban",
          type: "export_restriction" as const,
          status: "active" as const,
          parameters: { productId: "crime-ban-product-bread" },
          proposedBy: "developer_template" as const,
          support: 0.7,
          economicImpact: -0.12,
          stabilityImpact: -0.04,
          enactedTick: 0
        }
      ]
    };
    const result = runTick({ state, commands: [], seed: "crime-ban" });
    const market = result.state.blackMarkets.find(
      (candidate) => candidate.productId === "crime-ban-product-bread" && candidate.cityId === "crime-ban-city-harborview"
    );

    expect(market).toBeDefined();
    expect(market).toMatchObject({
      trigger: "ban",
      active: true
    });
    expect(market?.demandQuantity).toBeGreaterThan(0);
  });

  it("lets smuggling pass when enforcement risk is low", () => {
    const state = withManualBlackMarket("crime-pass", { detection: "low" });
    const beforeInventory = companyInventory(state, "crime-pass-company-harbor-bakery", "crime-pass-product-bread");
    const beforeCash = companyCash(state, "crime-pass-company-harbor-bakery");
    const created = createIllegalTrade(
      state,
      {
        blackMarketId: "crime-pass-black-market-bread",
        sellerCompanyId: "crime-pass-company-harbor-bakery",
        buyerOwnerType: "player",
        buyerOwnerId: "player-1",
        quantity: 500,
        smugglingRouteId: "crime-pass-smuggling-route-grainford-harborview",
        bribeMinor: 20_000
      },
      "crime-pass"
    );
    const result = runTick({ state: created.state, commands: [], seed: "crime-pass" });
    const trade = result.state.illegalTrades.find((candidate) => candidate.id === created.illegalTrade.id);

    expect(trade?.status).toBe("completed");
    expect(companyInventory(result.state, "crime-pass-company-harbor-bakery", "crime-pass-product-bread")).toBeLessThan(beforeInventory);
    expect(companyCash(result.state, "crime-pass-company-harbor-bakery")).toBeGreaterThan(beforeCash);
  });

  it("detects smuggling when enforcement risk is high", () => {
    const state = withManualBlackMarket("crime-detect", { detection: "high" });
    const created = createIllegalTrade(
      state,
      {
        blackMarketId: "crime-detect-black-market-bread",
        sellerCompanyId: "crime-detect-company-harbor-bakery",
        buyerOwnerType: "player",
        buyerOwnerId: "player-1",
        quantity: 900,
        smugglingRouteId: "crime-detect-smuggling-route-grainford-harborview",
        bribeMinor: 0
      },
      "crime-detect"
    );
    const result = runTick({ state: created.state, commands: [], seed: "crime-detect" });
    const trade = result.state.illegalTrades.find((candidate) => candidate.id === created.illegalTrade.id);

    expect(trade?.status).toMatch(/detected|confiscated/);
    expect(result.state.investigations.some((investigation) => investigation.targetId === created.illegalTrade.id)).toBe(true);
  });

  it("debits fines and lowers reputation after detected illegal trade", () => {
    const state = withManualBlackMarket("crime-fine", { detection: "high" });
    const beforeCash = companyCash(state, "crime-fine-company-harbor-bakery");
    const beforeReputation = state.companies.find((company) => company.id === "crime-fine-company-harbor-bakery")?.reputation ?? 1;
    const created = createIllegalTrade(
      state,
      {
        blackMarketId: "crime-fine-black-market-bread",
        sellerCompanyId: "crime-fine-company-harbor-bakery",
        buyerOwnerType: "player",
        buyerOwnerId: "player-1",
        quantity: 800,
        smugglingRouteId: "crime-fine-smuggling-route-grainford-harborview"
      },
      "crime-fine"
    );
    const result = runTick({ state: created.state, commands: [], seed: "crime-fine" });
    const afterCompany = result.state.companies.find((company) => company.id === "crime-fine-company-harbor-bakery");

    expect(result.state.fines.some((fine) => fine.targetId === "crime-fine-company-harbor-bakery" && fine.paidTick === 1)).toBe(true);
    expect(companyCash(result.state, "crime-fine-company-harbor-bakery")).toBeLessThan(beforeCash);
    expect(afterCompany?.reputation).toBeLessThan(beforeReputation);
    expect(result.state.reputationPenalties.some((penalty) => penalty.targetId === "crime-fine-company-harbor-bakery")).toBe(true);
  });

  it("confiscates assets from detected illegal trade", () => {
    const state = withManualBlackMarket("crime-confiscation", { detection: "high" });
    const beforeInventory = companyInventory(state, "crime-confiscation-company-harbor-bakery", "crime-confiscation-product-bread");
    const created = createIllegalTrade(
      state,
      {
        blackMarketId: "crime-confiscation-black-market-bread",
        sellerCompanyId: "crime-confiscation-company-harbor-bakery",
        buyerOwnerType: "player",
        buyerOwnerId: "player-1",
        quantity: 700,
        smugglingRouteId: "crime-confiscation-smuggling-route-grainford-harborview"
      },
      "crime-confiscation"
    );
    const result = runTick({ state: created.state, commands: [], seed: "crime-confiscation" });

    expect(result.state.confiscations.some((confiscation) => confiscation.illegalTradeId === created.illegalTrade.id)).toBe(true);
    expect(companyInventory(result.state, "crime-confiscation-company-harbor-bakery", "crime-confiscation-product-bread")).toBeLessThan(beforeInventory);
  });

  it("keeps crime economy values finite and non-negative", () => {
    const state = withManualBlackMarket("crime-validity", { detection: "high" });
    const created = createIllegalTrade(
      state,
      {
        blackMarketId: "crime-validity-black-market-bread",
        sellerCompanyId: "crime-validity-company-harbor-bakery",
        buyerOwnerType: "player",
        buyerOwnerId: "player-1",
        quantity: 400,
        smugglingRouteId: "crime-validity-smuggling-route-grainford-harborview"
      },
      "crime-validity"
    );
    const result = runTick({ state: created.state, commands: [], seed: "crime-validity" });

    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });
});

function baseCrimeState(seed: string): WorldState {
  return {
    ...createInitialWorldState(seed),
    productionPlans: [],
    retailOffers: [],
    wars: [],
    fronts: [],
    strategicCells: [],
    armies: [],
    militaryUnits: [],
    militarySupplies: [],
    occupations: [],
    sanctions: [],
    blockades: [],
    refugeeFlows: [],
    warDamage: [],
    militaryOrders: [],
    blackMarkets: [],
    illegalTrades: [],
    investigations: [],
    fines: [],
    confiscations: [],
    reputationPenalties: [],
    corruptionCases: []
  };
}

function withManualBlackMarket(seed: string, options: { readonly detection: "low" | "high" }): WorldState {
  const base = baseCrimeState(seed);
  const lowRisk = options.detection === "low";
  const market: BlackMarket = {
    id: `${seed}-black-market-bread`,
    countryId: `${seed}-country-north-coast`,
    cityId: `${seed}-city-harborview`,
    productId: `${seed}-product-bread`,
    trigger: "ban",
    demandQuantity: 20_000,
    supplyQuantity: 80_000,
    priceMultiplier: 1.7,
    riskLevel: lowRisk ? 0.02 : 0.95,
    corruptionInfluence: lowRisk ? 0.95 : 0.02,
    active: true,
    createdTick: 0,
    lastUpdatedTick: 0
  };
  const route: SmugglingRoute = {
    id: `${seed}-smuggling-route-grainford-harborview`,
    name: "Controlled test route",
    originCityId: `${seed}-city-grainford`,
    destinationCityId: `${seed}-city-harborview`,
    productId: `${seed}-product-bread`,
    mode: "road",
    capacityPerTick: 5_000,
    costMinorPerUnit: 10,
    baseDetectionRisk: lowRisk ? 0.01 : 0.95,
    corruptionShield: lowRisk ? 0.8 : 0,
    active: true,
    blocked: false
  };

  return {
    ...base,
    blackMarkets: [market],
    smugglingRoutes: [route],
    corruptionIndexes: base.corruptionIndexes.map((index) =>
      index.countryId === `${seed}-country-north-coast`
        ? {
            ...index,
            value: lowRisk ? 0.95 : 0.01,
            trend: 0
          }
        : index
    ),
    enforcementAgencies: base.enforcementAgencies.map((agency) =>
      agency.countryId === `${seed}-country-north-coast`
        ? {
            ...agency,
            controlScore: lowRisk ? 0 : 1,
            corruptionResistance: lowRisk ? 0 : 1,
            mediaSensitivity: lowRisk ? 0 : 1
          }
        : agency
    )
  };
}

function companyInventory(state: WorldState, companyId: string, productId: string): number {
  const warehouseIds = new Set(state.warehouses.filter((warehouse) => warehouse.companyId === companyId).map((warehouse) => warehouse.id));

  return state.inventoryLots
    .filter((lot) => warehouseIds.has(lot.warehouseId) && lot.productId === productId)
    .reduce((total, lot) => total + lot.quantity, 0);
}

function companyCash(state: WorldState, companyId: string): number {
  return state.companies.find((company) => company.id === companyId)?.cashBalanceMinor ?? 0;
}
