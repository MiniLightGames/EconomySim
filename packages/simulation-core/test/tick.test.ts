import { createInitialWorldState } from "@economysim/domain";
import type { WorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { assertNoInvalidEconomyValues, buyResource, createShipment, quoteShipment, runManualProduction, runTick, runTicks, setRetailOfferPrice } from "../src";

describe("runTick", () => {
  it("advances the world by one game hour and records events", () => {
    const state = createInitialWorldState("tick");
    const result = runTick({ state, commands: [], seed: "tick" });

    expect(result.state.currentTick).toBe(1);
    expect(result.state.currentDate).toBe("2026-01-01T01:00:00.000Z");
    expect(result.events.some((event) => event.type === "WorldTickedEvent")).toBe(true);
    expect(result.metrics.some((metric) => metric.name === "simulation.tick.duration_ms")).toBe(true);
  });

  it("rejects commands that reference unknown world entities", () => {
    const state = createInitialWorldState("command");
    const result = runTick({
      state,
      seed: "command",
      commands: [
        {
          type: "CreateCompanyCommand",
          commandId: "cmd-1",
          playerId: "player-1",
          countryId: "missing-country",
          name: "Missing LLC"
        }
      ]
    });

    expect(result.acceptedCommands).toHaveLength(0);
    expect(result.rejectedCommands).toEqual([
      {
        commandId: "cmd-1",
        code: "UNKNOWN_COUNTRY",
        message: "Company cannot be registered in an unknown country."
      }
    ]);
  });

  it("lets population buy food from ordinary retail offers", () => {
    const state = createInitialWorldState("food");
    const result = runTick({ state, commands: [], seed: "food" });
    const foodDemand = result.state.demandRecords.filter((record) => record.tick === 1 && record.needCategory === "food");

    expect(foodDemand.some((record) => record.purchasedQuantity > 0)).toBe(true);
    expect(result.events.some((event) => event.type === "ProductSoldEvent")).toBe(true);
  });

  it("lets a company produce goods before retail trade", () => {
    const state = createInitialWorldState("production");
    const result = runTick({ state, commands: [], seed: "production" });

    expect(result.events).toContainEqual(
      expect.objectContaining({
        type: "ProductProducedEvent",
        metadata: expect.objectContaining({
          productId: "production-product-bread",
          quantity: 12_000
        })
      })
    );
  });

  it("decreases warehouse inventory when households buy from it", () => {
    const state = createInitialWorldState("inventory");
    const breadBefore = getProductQuantity(state, "inventory-warehouse-harbor-bakery", "inventory-product-bread");
    const result = runTick({ state, commands: [], seed: "inventory" });
    const breadAfter = getProductQuantity(result.state, "inventory-warehouse-harbor-bakery", "inventory-product-bread");

    expect(breadBefore).toBeGreaterThan(0);
    expect(breadAfter).toBeLessThan(breadBefore);
  });

  it("adds retail revenue to the selling company through a balanced transaction", () => {
    const state = createInitialWorldState("revenue");
    const companyBefore = state.companies.find((company) => company.id === "revenue-company-harbor-bakery");
    const result = runTick({ state, commands: [], seed: "revenue" });
    const companyAfter = result.state.companies.find((company) => company.id === "revenue-company-harbor-bakery");
    const retailTransactions = result.state.financialTransactions.filter((transaction) => transaction.tick === 1);

    expect(companyAfter?.cashBalanceMinor).toBeGreaterThan(companyBefore?.cashBalanceMinor ?? 0);
    expect(retailTransactions.length).toBeGreaterThan(0);
    expect(retailTransactions.every((transaction) => transaction.entries.reduce((total, entry) => total + entry.amountMinor, 0) === 0)).toBe(true);
  });

  it("records unmet demand when there is a food shortage", () => {
    const state = createInitialWorldState("shortage");
    const shortageState = {
      ...state,
      productionPlans: [],
      inventoryLots: state.inventoryLots.map((lot) =>
        lot.productId === "shortage-product-bread" ? { ...lot, quantity: 0 } : lot
      )
    };
    const result = runTick({ state: shortageState, commands: [], seed: "shortage" });
    const foodDemand = result.state.demandRecords.filter((record) => record.tick === 1 && record.needCategory === "food");

    expect(foodDemand.reduce((total, record) => total + record.unmetQuantity, 0)).toBeGreaterThan(0);
    expect(result.events.some((event) => event.type === "ShortageDetectedEvent")).toBe(true);
    expect(result.state.news.some((news) => news.headline === "Food shortage detected")).toBe(true);
  });

  it("does not create negative, NaN, or infinite economy values", () => {
    const state = createInitialWorldState("validity");
    const result = runTick({ state, commands: [], seed: "validity" });

    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });

  it("creates a shipment and reserves inventory at the origin warehouse", () => {
    const state = createInitialWorldState("shipment");
    const originBefore = getProductQuantity(state, "shipment-warehouse-grainford-elevator", "shipment-product-wheat");
    const result = createShipment(
      state,
      {
        originWarehouseId: "shipment-warehouse-grainford-elevator",
        destinationWarehouseId: "shipment-warehouse-harbor-bakery",
        productId: "shipment-product-wheat",
        quantity: 1_000,
        routeId: "shipment-route-grainford-harborview-road"
      },
      "shipment"
    );
    const originAfter = getProductQuantity(result.state, "shipment-warehouse-grainford-elevator", "shipment-product-wheat");

    expect(result.shipment.status).toBe("in_transit");
    expect(result.state.shipments).toHaveLength(1);
    expect(originAfter).toBe(originBefore - 1_000);
  });

  it("delivers shipments after N ticks and increases destination inventory", () => {
    const state = {
      ...createInitialWorldState("delivery"),
      productionPlans: [],
      retailOffers: []
    };
    const created = createShipment(
      state,
      {
        originWarehouseId: "delivery-warehouse-grainford-elevator",
        destinationWarehouseId: "delivery-warehouse-harbor-bakery",
        productId: "delivery-product-wheat",
        quantity: 1_500,
        routeId: "delivery-route-grainford-harborview-road"
      },
      "delivery"
    );
    const destinationBefore = getProductQuantity(created.state, "delivery-warehouse-harbor-bakery", "delivery-product-wheat");
    const delivered = runTicks(created.state, created.shipment.durationTicks, "delivery");
    const destinationAfter = getProductQuantity(delivered, "delivery-warehouse-harbor-bakery", "delivery-product-wheat");

    expect(delivered.shipments[0]?.status).toBe("delivered");
    expect(destinationAfter).toBe(destinationBefore + 1_500);
  });

  it("does not deliver blocked routes", () => {
    const state = createInitialWorldState("blocked");

    expect(() =>
      createShipment(
        state,
        {
          originWarehouseId: "blocked-warehouse-grainford-elevator",
          destinationWarehouseId: "blocked-warehouse-harbor-bakery",
          productId: "blocked-product-wheat",
          quantity: 1_000,
          routeId: "blocked-route-sunport-harborview-border"
        },
        "blocked"
      )
    ).toThrow(/ROUTE_BLOCKED/);
  });

  it("makes poor infrastructure more expensive and slower", () => {
    const state = createInitialWorldState("cost");
    const route = state.logisticsRoutes.find((candidate) => candidate.id === "cost-route-grainford-harborview-road");

    expect(route).toBeDefined();

    const normalQuote = quoteShipment(state, route!, 2_000);
    const poorState = {
      ...state,
      infrastructureLinks: state.infrastructureLinks.map((link) =>
        link.id === "cost-link-grainford-harborview-road"
          ? { ...link, quality: 0.15, capacityPerTick: 1_000 }
          : link
      )
    };
    const poorRoute = poorState.logisticsRoutes.find((candidate) => candidate.id === "cost-route-grainford-harborview-road");
    const poorQuote = quoteShipment(poorState, poorRoute!, 2_000);

    expect(poorQuote.costMinor).toBeGreaterThan(normalQuote.costMinor);
    expect(poorQuote.durationTicks).toBeGreaterThan(normalQuote.durationTicks);
  });

  it("does not allow shipments to create negative origin inventory", () => {
    const state = createInitialWorldState("negative-logistics");

    expect(() =>
      createShipment(
        state,
        {
          originWarehouseId: "negative-logistics-warehouse-grainford-elevator",
          destinationWarehouseId: "negative-logistics-warehouse-harbor-bakery",
          productId: "negative-logistics-product-wheat",
          quantity: 999_000_000,
          routeId: "negative-logistics-route-grainford-harborview-road"
        },
        "negative-logistics"
      )
    ).toThrow("INSUFFICIENT_INVENTORY");

    expect(getProductQuantity(state, "negative-logistics-warehouse-grainford-elevator", "negative-logistics-product-wheat")).toBe(60_000);
  });

  it("lets the player buy a resource through a balanced ledger transaction", () => {
    const state = withPlayerBakery(createInitialWorldState("ops-buy"), "ops-buy");
    const sellerBefore = getProductQuantity(state, "ops-buy-warehouse-grainford-elevator", "ops-buy-product-wheat");
    const buyerBefore = getProductQuantity(state, "ops-buy-warehouse-player-bakery", "ops-buy-product-wheat");
    const accountBefore = state.bankAccounts.find((account) => account.ownerType === "player" && account.ownerId === "player-1")?.balanceMinor ?? 0;
    const result = buyResource(
      state,
      {
        playerId: "player-1",
        buyerCompanyId: "ops-buy-company-player-bakery",
        buyerWarehouseId: "ops-buy-warehouse-player-bakery",
        resourceOfferId: "ops-buy-resource-offer-grainford-wheat",
        quantity: 1_000,
        maxUnitPriceMinor: 100
      },
      "ops-buy"
    );
    const accountAfter = result.state.bankAccounts.find((account) => account.ownerType === "player" && account.ownerId === "player-1")?.balanceMinor ?? 0;
    const transaction = result.state.financialTransactions.find((candidate) => candidate.type === "ResourcePurchaseTransaction");

    expect(result.purchase).toMatchObject({
      buyerCompanyId: "ops-buy-company-player-bakery",
      productId: "ops-buy-product-wheat",
      quantity: 1_000,
      totalPriceMinor: 85_000
    });
    expect(getProductQuantity(result.state, "ops-buy-warehouse-grainford-elevator", "ops-buy-product-wheat")).toBe(sellerBefore - 1_000);
    expect(getProductQuantity(result.state, "ops-buy-warehouse-player-bakery", "ops-buy-product-wheat")).toBe(buyerBefore + 1_000);
    expect(accountAfter).toBe(accountBefore - 85_000);
    expect(transaction?.entries.reduce((total, entry) => total + entry.amountMinor, 0)).toBe(0);
    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });

  it("lets the player run a manual production order from owned inventory", () => {
    const purchased = buyResource(
      withPlayerBakery(createInitialWorldState("ops-produce"), "ops-produce"),
      {
        playerId: "player-1",
        buyerCompanyId: "ops-produce-company-player-bakery",
        buyerWarehouseId: "ops-produce-warehouse-player-bakery",
        resourceOfferId: "ops-produce-resource-offer-grainford-wheat",
        quantity: 1_000,
        maxUnitPriceMinor: 100
      },
      "ops-produce"
    );
    const wheatBefore = getProductQuantity(purchased.state, "ops-produce-warehouse-player-bakery", "ops-produce-product-wheat");
    const breadBefore = getProductQuantity(purchased.state, "ops-produce-warehouse-player-bakery", "ops-produce-product-bread");
    const result = runManualProduction(
      purchased.state,
      {
        playerId: "player-1",
        companyId: "ops-produce-company-player-bakery",
        productionPlanId: "ops-produce-production-player-bread",
        requestedQuantity: 500
      },
      "ops-produce"
    );

    expect(result.productionRun).toMatchObject({
      companyId: "ops-produce-company-player-bakery",
      outputProductId: "ops-produce-product-bread",
      requestedQuantity: 500,
      producedQuantity: 500
    });
    expect(result.productionRun.inputConsumptions[0]?.quantity).toBeGreaterThan(0);
    expect(result.productionRun.inputConsumptions[0]?.quantity).toBeLessThanOrEqual(200);
    expect(getProductQuantity(result.state, "ops-produce-warehouse-player-bakery", "ops-produce-product-wheat")).toBe(
      wheatBefore - (result.productionRun.inputConsumptions[0]?.quantity ?? 0)
    );
    expect(getProductQuantity(result.state, "ops-produce-warehouse-player-bakery", "ops-produce-product-bread")).toBe(breadBefore + 500);
    expect(result.state.events.some((event) => event.type === "ManualProductionRunEvent")).toBe(true);
    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });

  it("lets the player set a retail price through simulation-core validation", () => {
    const state = withPlayerBakery(createInitialWorldState("ops-price"), "ops-price");
    const result = setRetailOfferPrice(
      state,
      {
        playerId: "player-1",
        companyId: "ops-price-company-player-bakery",
        retailOfferId: "ops-price-offer-player-bread",
        priceMinor: 250,
        currencyCode: "NCR"
      },
      "ops-price"
    );
    const offer = result.state.retailOffers.find((candidate) => candidate.id === "ops-price-offer-player-bread");

    expect(result.priceChange).toMatchObject({
      companyId: "ops-price-company-player-bakery",
      productId: "ops-price-product-bread",
      oldPriceMinor: 340,
      newPriceMinor: 250,
      status: "applied"
    });
    expect(offer?.priceMinor).toBe(250);
    expect(result.state.events.some((event) => event.type === "RetailPriceChangedEvent")).toBe(true);
    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });

  it("sells player-produced retail goods after a competitive price change", () => {
    const purchased = buyResource(
      withPlayerBakery(createInitialWorldState("ops-sale"), "ops-sale"),
      {
        playerId: "player-1",
        buyerCompanyId: "ops-sale-company-player-bakery",
        buyerWarehouseId: "ops-sale-warehouse-player-bakery",
        resourceOfferId: "ops-sale-resource-offer-grainford-wheat",
        quantity: 1_000,
        maxUnitPriceMinor: 100
      },
      "ops-sale"
    );
    const produced = runManualProduction(
      purchased.state,
      {
        playerId: "player-1",
        companyId: "ops-sale-company-player-bakery",
        productionPlanId: "ops-sale-production-player-bread",
        requestedQuantity: 500
      },
      "ops-sale"
    );
    const priced = setRetailOfferPrice(
      produced.state,
      {
        playerId: "player-1",
        companyId: "ops-sale-company-player-bakery",
        retailOfferId: "ops-sale-offer-player-bread",
        priceMinor: 250,
        currencyCode: "NCR"
      },
      "ops-sale"
    );
    const breadBefore = getProductQuantity(priced.state, "ops-sale-warehouse-player-bakery", "ops-sale-product-bread");
    const companyCashBefore = priced.state.companies.find((company) => company.id === "ops-sale-company-player-bakery")?.cashBalanceMinor ?? 0;
    const ticked = runTick({ state: priced.state, commands: [], seed: "ops-sale" }).state;
    const breadAfter = getProductQuantity(ticked, "ops-sale-warehouse-player-bakery", "ops-sale-product-bread");
    const companyCashAfter = ticked.companies.find((company) => company.id === "ops-sale-company-player-bakery")?.cashBalanceMinor ?? 0;

    expect(breadBefore).toBe(500);
    expect(breadAfter).toBeLessThan(breadBefore);
    expect(companyCashAfter).toBeGreaterThan(companyCashBefore);
    expect(ticked.financialTransactions.some((transaction) => transaction.type === "RetailSaleTransaction")).toBe(true);
    expect(() => assertNoInvalidEconomyValues(ticked)).not.toThrow();
  });

  it("applies SetRetailPriceCommand before population demand in the same tick", () => {
    const produced = runManualProduction(
      buyResource(
        withPlayerBakery(createInitialWorldState("ops-command-price"), "ops-command-price"),
        {
          playerId: "player-1",
          buyerCompanyId: "ops-command-price-company-player-bakery",
          buyerWarehouseId: "ops-command-price-warehouse-player-bakery",
          resourceOfferId: "ops-command-price-resource-offer-grainford-wheat",
          quantity: 1_000,
          maxUnitPriceMinor: 100
        },
        "ops-command-price"
      ).state,
      {
        playerId: "player-1",
        companyId: "ops-command-price-company-player-bakery",
        productionPlanId: "ops-command-price-production-player-bread",
        requestedQuantity: 500
      },
      "ops-command-price"
    );
    const result = runTick({
      state: produced.state,
      seed: "ops-command-price",
      commands: [
        {
          type: "SetRetailPriceCommand",
          commandId: "cmd-price-bread",
          playerId: "player-1",
          companyId: "ops-command-price-company-player-bakery",
          productId: "ops-command-price-product-bread",
          priceMinor: 250,
          currencyCode: "NCR"
        }
      ]
    });
    const offer = result.state.retailOffers.find((candidate) => candidate.id === "ops-command-price-offer-player-bread");

    expect(result.acceptedCommands).toContain("cmd-price-bread");
    expect(result.rejectedCommands).toHaveLength(0);
    expect(offer?.priceMinor).toBe(250);
    expect(result.state.retailPriceChanges).toHaveLength(1);
    expect(getProductQuantity(result.state, "ops-command-price-warehouse-player-bakery", "ops-command-price-product-bread")).toBeLessThan(500);
  });
});

function getProductQuantity(state: ReturnType<typeof createInitialWorldState>, warehouseId: string, productId: string): number {
  return state.inventoryLots
    .filter((lot) => lot.warehouseId === warehouseId && lot.productId === productId)
    .reduce((total, lot) => total + lot.quantity, 0);
}

function withPlayerBakery(state: WorldState, seed: string): WorldState {
  const country = state.countries.find((candidate) => candidate.id === `${seed}-country-north-coast`);
  const city = state.cities.find((candidate) => candidate.id === `${seed}-city-harborview`);
  const wheat = state.products.find((candidate) => candidate.id === `${seed}-product-wheat`);
  const bread = state.products.find((candidate) => candidate.id === `${seed}-product-bread`);
  const licenseLaw = state.laws.find((law) => law.id === `${seed}-law-industry-license`);

  if (!country || !city || !wheat || !bread || !licenseLaw) {
    throw new Error("Test seed is missing starter entities.");
  }

  return {
    ...state,
    companies: [
      ...state.companies,
      {
        id: `${seed}-company-player-bakery`,
        ownerType: "player",
        ownerId: "player-1",
        countryId: country.id,
        name: "Player Bakery",
        legalStatus: "registered",
        cashBalanceMinor: 0,
        currencyCode: country.currencyCode,
        reputation: 0.5,
        bankruptcyStatus: "none"
      }
    ],
    warehouses: [
      ...state.warehouses,
      {
        id: `${seed}-warehouse-player-bakery`,
        companyId: `${seed}-company-player-bakery`,
        cityId: city.id,
        name: "Player Bakery Warehouse",
        warehouseType: "general",
        capacity: 50_000,
        handlingCostMinorPerUnit: 6
      }
    ],
    productionPlans: [
      ...state.productionPlans,
      {
        id: `${seed}-production-player-bread`,
        companyId: `${seed}-company-player-bakery`,
        warehouseId: `${seed}-warehouse-player-bakery`,
        outputProductId: bread.id,
        outputQuantityPerTick: 2_000,
        inputs: [{ productId: wheat.id, quantityPerOutput: 0.4 }],
        active: false
      }
    ],
    retailOffers: [
      ...state.retailOffers,
      {
        id: `${seed}-offer-player-bread`,
        companyId: `${seed}-company-player-bakery`,
        warehouseId: `${seed}-warehouse-player-bakery`,
        productId: bread.id,
        priceMinor: 340,
        quality: bread.baseQuality,
        active: true
      }
    ],
    licenses: [
      ...state.licenses,
      {
        id: `${seed}-license-player-food`,
        countryId: country.id,
        companyId: `${seed}-company-player-bakery`,
        industry: "food",
        lawId: licenseLaw.id,
        status: "active",
        issuedTick: 0,
        expiresTick: null
      }
    ]
  };
}
