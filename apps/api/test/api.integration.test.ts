import { createInitialWorldState } from "@economysim/domain";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApi } from "../src/server";
import { InMemoryWorldStore } from "../src/store";

function idem(key: string): Record<string, string> {
  return { "Idempotency-Key": key };
}

function devAuth(): Record<string, string> {
  return { Authorization: "Bearer dev-developer-session" };
}

describe("Fastify API integration", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await createApi({
      seed: "api-test",
      store: new InMemoryWorldStore(createInitialWorldState("api-test"))
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns health and persistence consistency status", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });
    const consistencyResponse = await app.inject({ method: "GET", url: "/persistence/consistency", headers: devAuth() });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "ok",
      service: "economysim-api",
      store: {
        kind: "memory",
        status: "ok"
      },
      persistence: {
        mode: "memory",
        status: "memory"
      }
    });
    expect(consistencyResponse.statusCode).toBe(200);
    expect(consistencyResponse.json()).toMatchObject({
      snapshotTick: 0,
      normalizedLatestTick: null
    });
  });

  it("returns world summary and countries", async () => {
    const summaryResponse = await app.inject({ method: "GET", url: "/world/summary" });
    const countriesResponse = await app.inject({ method: "GET", url: "/countries" });

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.json()).toMatchObject({
      currentTick: 0,
      countries: 2,
      companies: 5
    });
    expect(countriesResponse.statusCode).toBe(200);
    expect(countriesResponse.json()).toHaveLength(2);
  });

  it("returns 404 for missing country, city, company, and market", async () => {
    for (const url of ["/countries/missing", "/cities/missing", "/companies/missing", "/markets/missing"]) {
      const response = await app.inject({ method: "GET", url });

      expect(response.statusCode).toBe(404);
      expect(response.json().error.code).toMatch(/_NOT_FOUND$/);
    }
  });

  it("creates a player company through backend validation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/companies",
      headers: idem("test-create-company"),
      payload: {
        countryId: "api-test-country-north-coast",
        name: "Player Foods"
      }
    });
    const companiesResponse = await app.inject({ method: "GET", url: "/companies" });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      ownerType: "player",
      ownerId: "player-1",
      countryId: "api-test-country-north-coast",
      name: "Player Foods",
      legalStatus: "registered"
    });
    expect(companiesResponse.json()).toHaveLength(6);
  });

  it("records player commands, enforces idempotency, and writes audit logs", async () => {
    const payload = {
      countryId: "api-test-country-north-coast",
      name: "Idempotent Foods"
    };
    const firstResponse = await app.inject({
      method: "POST",
      url: "/companies",
      headers: idem("idempotent-company-create"),
      payload
    });
    const duplicateResponse = await app.inject({
      method: "POST",
      url: "/companies",
      headers: idem("idempotent-company-create"),
      payload
    });
    const commandsResponse = await app.inject({ method: "GET", url: "/commands", headers: devAuth() });
    const auditResponse = await app.inject({ method: "GET", url: "/audit-logs", headers: devAuth() });
    const companiesResponse = await app.inject({ method: "GET", url: "/companies" });
    const companies = companiesResponse.json().filter((company: { name: string }) => company.name === "Idempotent Foods");

    expect(firstResponse.statusCode).toBe(201);
    expect(duplicateResponse.statusCode).toBe(200);
    expect(companies).toHaveLength(1);
    expect(commandsResponse.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          idempotencyKey: "idempotent-company-create",
          status: "applied",
          commandType: "CreateCompanyCommand",
            resultEventIds: expect.arrayContaining([expect.stringContaining("company-registered")]),
          resultMetricIds: expect.arrayContaining([expect.stringContaining("company-created")])
        })
      ])
    );
    expect(auditResponse.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ result: "received", idempotencyKey: "idempotent-company-create" }),
        expect.objectContaining({ result: "validated", idempotencyKey: "idempotent-company-create" }),
        expect.objectContaining({ result: "accepted", idempotencyKey: "idempotent-company-create" }),
        expect.objectContaining({ result: "applied", idempotencyKey: "idempotent-company-create" }),
        expect.objectContaining({ result: "duplicate", idempotencyKey: "idempotent-company-create" })
      ])
    );
  });

  it("runs the player resource purchase and production vertical slice", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/companies",
      headers: idem("vertical-create-company"),
      payload: {
        countryId: "api-test-country-north-coast",
        name: "Player Operations"
      }
    });
    const company = createResponse.json();
    const landResponse = await app.inject({
      method: "POST",
      url: "/land/purchase",
      headers: idem("vertical-buy-land"),
      payload: {
        companyId: company.id,
        cityId: "api-test-city-harborview",
        lotId: "api-test-harborview-starter-premise",
        mode: "lease"
      }
    });
    const warehousesResponse = await app.inject({ method: "GET", url: "/warehouses" });
    const warehouse = landResponse.json().warehouse ?? warehousesResponse.json().find((candidate: { companyId: string }) => candidate.companyId === company.id);
    const offersResponse = await app.inject({ method: "GET", url: "/resources/offers" });
    const offer = offersResponse.json().find((candidate: { productId: string }) => candidate.productId === "api-test-product-wheat");

    expect(createResponse.statusCode).toBe(201);
    expect(landResponse.statusCode).toBe(201);
    expect(warehouse).toBeDefined();
    expect(offersResponse.statusCode).toBe(200);
    expect(offer).toMatchObject({
      id: "api-test-resource-offer-grainford-wheat",
      availableQuantity: expect.any(Number)
    });

    const purchaseResponse = await app.inject({
      method: "POST",
      url: "/resources/purchase",
      headers: idem("vertical-buy-wheat"),
      payload: {
        buyerCompanyId: company.id,
        buyerWarehouseId: warehouse.id,
        resourceOfferId: offer.id,
        quantity: 1_000,
        maxUnitPriceMinor: 100
      }
    });
    const plansResponse = await app.inject({ method: "GET", url: "/production/plans" });
    const plan = plansResponse.json().find((candidate: { companyId: string }) => candidate.companyId === company.id);
    const productionResponse = await app.inject({
      method: "POST",
      url: "/production/run",
      headers: idem("vertical-run-production"),
      payload: {
        companyId: company.id,
        productionPlanId: plan.id,
        requestedQuantity: 500
      }
    });
    const worldResponse = await app.inject({ method: "GET", url: "/world" });
    const world = worldResponse.json();
    const buyerWheat = world.inventoryLots
      .filter((lot: { warehouseId: string; productId: string }) => lot.warehouseId === warehouse.id && lot.productId === "api-test-product-wheat")
      .reduce((total: number, lot: { quantity: number }) => total + lot.quantity, 0);
    const buyerBread = world.inventoryLots
      .filter((lot: { warehouseId: string; productId: string }) => lot.warehouseId === warehouse.id && lot.productId === "api-test-product-bread")
      .reduce((total: number, lot: { quantity: number }) => total + lot.quantity, 0);

    expect(purchaseResponse.statusCode).toBe(201);
    expect(purchaseResponse.json()).toMatchObject({
      buyerCompanyId: company.id,
      productId: "api-test-product-wheat",
      quantity: 1_000
    });
    expect(plansResponse.statusCode).toBe(200);
    expect(plan).toBeDefined();
    expect(productionResponse.statusCode).toBe(201);
    expect(productionResponse.json()).toMatchObject({
      companyId: company.id,
      outputProductId: "api-test-product-bread",
      producedQuantity: 500
    });
    expect(productionResponse.json().inputConsumptions[0].quantity).toBeGreaterThan(0);
    expect(productionResponse.json().inputConsumptions[0].quantity).toBeLessThanOrEqual(200);
    expect(buyerWheat).toBe(1_000 - productionResponse.json().inputConsumptions[0].quantity);
    expect(buyerBread).toBe(500);

    const retailOffersResponse = await app.inject({ method: "GET", url: "/retail/offers" });
    const retailOffer = retailOffersResponse.json().find((candidate: { companyId: string }) => candidate.companyId === company.id);
    const priceResponse = await app.inject({
      method: "POST",
      url: `/retail/offers/${retailOffer.id}/price`,
      headers: idem("vertical-set-price"),
      payload: {
        companyId: company.id,
        priceMinor: 250,
        currencyCode: "NCR"
      }
    });
    const tickResponse = await app.inject({ method: "POST", url: "/simulation/tick", payload: {} });
    const worldAfterSaleResponse = await app.inject({ method: "GET", url: "/world" });
    const worldAfterSale = worldAfterSaleResponse.json();
    const buyerBreadAfterSale = worldAfterSale.inventoryLots
      .filter((lot: { warehouseId: string; productId: string }) => lot.warehouseId === warehouse.id && lot.productId === "api-test-product-bread")
      .reduce((total: number, lot: { quantity: number }) => total + lot.quantity, 0);
    const updatedCompany = worldAfterSale.companies.find((candidate: { id: string }) => candidate.id === company.id);

    expect(retailOffersResponse.statusCode).toBe(200);
    expect(retailOffer).toMatchObject({
      companyId: company.id,
      productId: "api-test-product-bread",
      priceMinor: 340
    });
    expect(priceResponse.statusCode).toBe(200);
    expect(priceResponse.json().priceChange).toMatchObject({
      retailOfferId: retailOffer.id,
      oldPriceMinor: 340,
      newPriceMinor: 250
    });
    expect(tickResponse.statusCode).toBe(200);
    expect(buyerBreadAfterSale).toBeLessThan(500);
    expect(updatedCompany.cashBalanceMinor).toBeGreaterThan(0);
  });

  it("rejects forged player identity in headers and bodies", async () => {
    const headerResponse = await app.inject({
      method: "POST",
      url: "/companies",
      headers: { ...idem("forged-header"), "x-economysim-player-id": "attacker-player" },
      payload: {
        countryId: "api-test-country-north-coast",
        name: "Header Forgery Foods"
      }
    });
    const bodyResponse = await app.inject({
      method: "POST",
      url: "/companies",
      headers: idem("forged-body"),
      payload: {
        playerId: "attacker-player",
        countryId: "api-test-country-north-coast",
        name: "Body Forgery Foods"
      }
    });
    const commandsResponse = await app.inject({
      method: "GET",
      url: "/commands"
    });

    expect(headerResponse.statusCode).toBe(400);
    expect(headerResponse.json().error.code).toBe("FORGED_IDENTITY_HEADER");
    expect(bodyResponse.statusCode).toBe(400);
    expect(bodyResponse.json().error.code).toBe("FORGED_PLAYER_ID_BODY");
    expect(commandsResponse.statusCode).toBe(403);
    expect(commandsResponse.json().error.code).toBe("RBAC_FORBIDDEN");
  });

  it("rejects invalid company creation payloads", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/companies",
      payload: {
        countryId: "api-test-country-north-coast",
        name: "A"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects company creation in unknown countries", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/companies",
      headers: idem("missing-country-create"),
      payload: {
        countryId: "missing-country",
        name: "Nowhere Foods"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("UNKNOWN_COUNTRY");
  });

  it("returns markets and a single food market", async () => {
    const marketsResponse = await app.inject({ method: "GET", url: "/markets" });
    const foodMarketResponse = await app.inject({ method: "GET", url: "/markets/food" });

    expect(marketsResponse.statusCode).toBe(200);
    expect(marketsResponse.json().some((market: { id: string }) => market.id === "food")).toBe(true);
    expect(foodMarketResponse.statusCode).toBe(200);
    expect(foodMarketResponse.json()).toMatchObject({
      id: "food",
      offerCount: 1
    });
  });

  it("returns logistics resources", async () => {
    const warehousesResponse = await app.inject({ method: "GET", url: "/warehouses" });
    const routesResponse = await app.inject({ method: "GET", url: "/logistics/routes" });
    const transportCompaniesResponse = await app.inject({ method: "GET", url: "/transport-companies" });
    const shipmentsResponse = await app.inject({ method: "GET", url: "/shipments" });

    expect(warehousesResponse.statusCode).toBe(200);
    expect(warehousesResponse.json().length).toBeGreaterThan(0);
    expect(routesResponse.statusCode).toBe(200);
    expect(routesResponse.json().some((route: { id: string }) => route.id === "api-test-route-grainford-harborview-road")).toBe(true);
    expect(transportCompaniesResponse.statusCode).toBe(200);
    expect(transportCompaniesResponse.json()).toHaveLength(1);
    expect(shipmentsResponse.statusCode).toBe(200);
    expect(shipmentsResponse.json()).toHaveLength(0);
  });

  it("returns war and geopolitics resources", async () => {
    const warsResponse = await app.inject({ method: "GET", url: "/wars" });
    const warResponse = await app.inject({ method: "GET", url: "/wars/api-test-war-border-crisis" });
    const cellsResponse = await app.inject({ method: "GET", url: "/strategic-cells" });
    const sanctionsResponse = await app.inject({ method: "GET", url: "/sanctions" });
    const ordersResponse = await app.inject({ method: "GET", url: "/military-orders" });

    expect(warsResponse.statusCode).toBe(200);
    expect(warsResponse.json().wars).toHaveLength(1);
    expect(warResponse.statusCode).toBe(200);
    expect(warResponse.json().war).toMatchObject({
      id: "api-test-war-border-crisis",
      status: "active"
    });
    expect(cellsResponse.statusCode).toBe(200);
    expect(cellsResponse.json().some((cell: { id: string }) => cell.id === "api-test-cell-border-gate")).toBe(true);
    expect(sanctionsResponse.statusCode).toBe(200);
    expect(sanctionsResponse.json().sanctions).toHaveLength(1);
    expect(ordersResponse.statusCode).toBe(200);
    expect(ordersResponse.json()).toHaveLength(0);
  });

  it("returns technology, research, environment, and resource resources", async () => {
    const technologiesResponse = await app.inject({ method: "GET", url: "/technologies" });
    const projectsResponse = await app.inject({ method: "GET", url: "/research-projects" });
    const environmentResponse = await app.inject({ method: "GET", url: "/environment" });
    const depositsResponse = await app.inject({ method: "GET", url: "/resources/deposits" });

    expect(technologiesResponse.statusCode).toBe(200);
    expect(technologiesResponse.json().technologies.length).toBeGreaterThan(0);
    expect(technologiesResponse.json().levels.length).toBeGreaterThan(0);
    expect(projectsResponse.statusCode).toBe(200);
    expect(projectsResponse.json().some((project: { status: string }) => project.status === "active")).toBe(true);
    expect(environmentResponse.statusCode).toBe(200);
    expect(environmentResponse.json().indexes.length).toBeGreaterThan(0);
    expect(depositsResponse.statusCode).toBe(200);
    expect(depositsResponse.json().deposits.length).toBeGreaterThan(0);
  });

  it("starts research projects through backend validation and advances them on tick", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/research-projects",
      payload: {
        companyId: "api-test-company-harbor-bakery",
        technologyId: "api-test-technology-telemedicine",
        fundingPerTickMinor: 100_000,
        name: "Telemedicine sprint"
      }
    });
    const tickResponse = await app.inject({
      method: "POST",
      url: "/simulation/tick",
      payload: { commands: [] }
    });
    const technologiesResponse = await app.inject({ method: "GET", url: "/technologies" });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json()).toMatchObject({
      companyId: "api-test-company-harbor-bakery",
      technologyId: "api-test-technology-telemedicine",
      status: "active"
    });
    expect(tickResponse.statusCode).toBe(200);
    expect(
      technologiesResponse
        .json()
        .levels.some(
          (level: { technologyId: string; scopeId: string; unlocked: boolean }) =>
            level.technologyId === "api-test-technology-telemedicine" &&
            level.scopeId === "api-test-company-harbor-bakery" &&
            level.unlocked
        )
    ).toBe(true);
  });

  it("rejects research projects without a valid company", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/research-projects",
      payload: {
        companyId: "missing-company",
        technologyId: "api-test-technology-telemedicine",
        fundingPerTickMinor: 100_000
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("UNKNOWN_COMPANY");
  });

  it("returns crime resources and creates illegal trades through backend validation", async () => {
    const tickResponse = await app.inject({
      method: "POST",
      url: "/simulation/tick",
      payload: { commands: [] }
    });
    const marketsResponse = await app.inject({ method: "GET", url: "/black-markets" });
    const investigationsResponse = await app.inject({ method: "GET", url: "/investigations" });
    const reputationResponse = await app.inject({ method: "GET", url: "/reputation" });
    const marketsBody = marketsResponse.json();
    const market = marketsBody.markets.find(
      (candidate: { productId: string; cityId: string; active: boolean }) =>
        candidate.productId === "api-test-product-bread" && candidate.cityId === "api-test-city-harborview" && candidate.active
    );
    const route = marketsBody.routes.find(
      (candidate: { id: string; productId: string | null; destinationCityId: string }) =>
        candidate.destinationCityId === "api-test-city-harborview" &&
        (candidate.productId === null || candidate.productId === "api-test-product-bread")
    );
    const createResponse = await app.inject({
      method: "POST",
      url: "/illegal-trades",
      payload: {
        blackMarketId: market.id,
        sellerCompanyId: "api-test-company-harbor-bakery",
        buyerOwnerType: "player",
        buyerOwnerId: "player-1",
        quantity: 100,
        smugglingRouteId: route.id,
        bribeMinor: 5_000
      }
    });

    expect(tickResponse.statusCode).toBe(200);
    expect(marketsResponse.statusCode).toBe(200);
    expect(marketsBody.markets.length).toBeGreaterThan(0);
    expect(investigationsResponse.statusCode).toBe(200);
    expect(reputationResponse.statusCode).toBe(200);
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json()).toMatchObject({
      blackMarketId: market.id,
      sellerCompanyId: "api-test-company-harbor-bakery",
      status: "pending"
    });
  });

  it("advances war state through the simulation tick endpoint", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/simulation/tick",
      payload: { commands: [] }
    });
    const cellsResponse = await app.inject({ method: "GET", url: "/strategic-cells" });
    const ordersResponse = await app.inject({ method: "GET", url: "/military-orders" });
    const cell = cellsResponse.json().find((candidate: { id: string }) => candidate.id === "api-test-cell-border-gate");

    expect(response.statusCode).toBe(200);
    expect(cell).toMatchObject({
      legalControllerCountryId: "api-test-country-north-coast",
      factualControllerCountryId: "api-test-country-south-union"
    });
    expect(ordersResponse.json().length).toBeGreaterThan(0);
    expect(response.json().news.some((item: { headline: string }) => item.headline.includes("Front line"))).toBe(true);
  });

  it("returns explainability and analytics without exposing hidden private statistics", async () => {
    const tickResponse = await app.inject({
      method: "POST",
      url: "/simulation/tick",
      payload: { commands: [] }
    });
    const explanationsResponse = await app.inject({ method: "GET", url: "/explanations" });
    const forecastsResponse = await app.inject({ method: "GET", url: "/forecasts" });
    const countryAnalyticsResponse = await app.inject({
      method: "GET",
      url: "/analytics/countries/api-test-country-north-coast"
    });
    const productAnalyticsResponse = await app.inject({
      method: "GET",
      url: "/analytics/products/api-test-product-bread"
    });
    const worldResponse = await app.inject({ method: "GET", url: "/world" });

    expect(tickResponse.statusCode).toBe(200);
    expect(explanationsResponse.statusCode).toBe(200);
    expect(explanationsResponse.json().some((item: { targetType: string }) => item.targetType === "price")).toBe(true);
    expect(forecastsResponse.statusCode).toBe(200);
    expect(forecastsResponse.json().length).toBeGreaterThan(0);
    expect(countryAnalyticsResponse.statusCode).toBe(200);
    expect(countryAnalyticsResponse.json()).toMatchObject({
      privacy: {
        privateCompanyFinanceHidden: true,
        hiddenStatisticsIncluded: false
      }
    });
    expect(JSON.stringify(countryAnalyticsResponse.json())).not.toContain("company.cash.private");
    expect(productAnalyticsResponse.statusCode).toBe(200);
    expect(productAnalyticsResponse.json().explanations.some((item: { targetType: string }) => item.targetType === "price")).toBe(true);
    expect(worldResponse.json().hiddenStatistics).toEqual([]);
  });

  it("creates shipments through backend validation and persists inventory reservation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/shipments",
      payload: {
        originWarehouseId: "api-test-warehouse-grainford-elevator",
        destinationWarehouseId: "api-test-warehouse-harbor-bakery",
        productId: "api-test-product-wheat",
        quantity: 1_000,
        routeId: "api-test-route-grainford-harborview-road"
      }
    });
    const shipmentsResponse = await app.inject({ method: "GET", url: "/shipments" });
    const worldResponse = await app.inject({ method: "GET", url: "/world" });
    const originWheat = worldResponse
      .json()
      .inventoryLots.filter(
        (lot: { warehouseId: string; productId: string }) =>
          lot.warehouseId === "api-test-warehouse-grainford-elevator" && lot.productId === "api-test-product-wheat"
      )
      .reduce((total: number, lot: { quantity: number }) => total + lot.quantity, 0);

    expect(response.statusCode).toBe(201);
    expect(response.json().shipment).toMatchObject({
      originWarehouseId: "api-test-warehouse-grainford-elevator",
      destinationWarehouseId: "api-test-warehouse-harbor-bakery",
      status: "in_transit",
      quantity: 1_000
    });
    expect(shipmentsResponse.json()).toHaveLength(1);
    expect(originWheat).toBe(59_000);
  });

  it("rejects blocked shipment routes", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/shipments",
      payload: {
        originWarehouseId: "api-test-warehouse-grainford-elevator",
        destinationWarehouseId: "api-test-warehouse-harbor-bakery",
        productId: "api-test-product-wheat",
        quantity: 1_000,
        routeId: "api-test-route-sunport-harborview-border"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("ROUTE_BLOCKED");
  });

  it("returns banking and exchange resources", async () => {
    const banksResponse = await app.inject({ method: "GET", url: "/banks" });
    const accountsResponse = await app.inject({ method: "GET", url: "/accounts" });
    const loansResponse = await app.inject({ method: "GET", url: "/loans" });
    const exchangesResponse = await app.inject({ method: "GET", url: "/exchanges" });
    const portfolioResponse = await app.inject({ method: "GET", url: "/portfolio?ownerType=player&ownerId=player-1" });
    const bankruptciesResponse = await app.inject({ method: "GET", url: "/bankruptcies" });

    expect(banksResponse.statusCode).toBe(200);
    expect(banksResponse.json().centralBanks).toHaveLength(1);
    expect(banksResponse.json().commercialBanks).toHaveLength(1);
    expect(accountsResponse.statusCode).toBe(200);
    expect(accountsResponse.json().length).toBeGreaterThan(0);
    expect(loansResponse.statusCode).toBe(200);
    expect(loansResponse.json().length).toBeGreaterThan(0);
    expect(exchangesResponse.statusCode).toBe(200);
    expect(exchangesResponse.json().orderBooks.length).toBeGreaterThan(0);
    expect(portfolioResponse.statusCode).toBe(200);
    expect(portfolioResponse.json().accounts).toHaveLength(1);
    expect(bankruptciesResponse.statusCode).toBe(200);
    expect(bankruptciesResponse.json()).toMatchObject({ cases: [], auctions: [] });
  });

  it("returns government, laws, and country budget resources", async () => {
    const governmentsResponse = await app.inject({ method: "GET", url: "/governments" });
    const governmentResponse = await app.inject({ method: "GET", url: "/countries/api-test-country-north-coast/government" });
    const lawsResponse = await app.inject({ method: "GET", url: "/countries/api-test-country-north-coast/laws" });
    const budgetResponse = await app.inject({ method: "GET", url: "/countries/api-test-country-north-coast/budget" });

    expect(governmentsResponse.statusCode).toBe(200);
    expect(governmentsResponse.json().governments).toHaveLength(2);
    expect(governmentResponse.statusCode).toBe(200);
    expect(governmentResponse.json().government).toMatchObject({
      countryId: "api-test-country-north-coast",
      regime: "federal_republic"
    });
    expect(lawsResponse.statusCode).toBe(200);
    expect(lawsResponse.json().some((law: { type: string }) => law.type === "profit_tax")).toBe(true);
    expect(budgetResponse.statusCode).toBe(200);
    expect(budgetResponse.json().budget.treasuryMinor).toBeGreaterThan(0);
  });

  it("accepts lobbying and media campaigns only through validated backend commands", async () => {
    const lobbyingResponse = await app.inject({
      method: "POST",
      url: "/lobbying",
      payload: {
        countryId: "api-test-country-north-coast",
        targetPartyId: "api-test-party-civic-growth",
        lawType: "deposit_insurance",
        amountMinor: 50_000
      }
    });
    const mediaResponse = await app.inject({
      method: "POST",
      url: "/media-campaigns",
      payload: {
        countryId: "api-test-country-north-coast",
        targetPartyId: "api-test-party-civic-growth",
        message: "Stable banks, stable households.",
        spendMinor: 40_000
      }
    });
    const worldResponse = await app.inject({ method: "GET", url: "/world" });

    expect(lobbyingResponse.statusCode).toBe(201);
    expect(lobbyingResponse.json()).toMatchObject({ playerId: "player-1", lawType: "deposit_insurance", status: "accepted" });
    expect(mediaResponse.statusCode).toBe(201);
    expect(mediaResponse.json()).toMatchObject({ playerId: "player-1", countryId: "api-test-country-north-coast" });
    expect(worldResponse.json().lobbyingActions).toHaveLength(1);
    expect(worldResponse.json().mediaInfluences).toHaveLength(1);
  });

  it("records votes and rejects voters without assets", async () => {
    const voteResponse = await app.inject({
      method: "POST",
      url: "/vote",
      payload: {
        countryId: "api-test-country-north-coast",
        partyId: "api-test-party-labor-commons",
        choice: "for"
      }
    });
    const rejectedResponse = await app.inject({
      method: "POST",
      url: "/vote",
      headers: { Authorization: "Bearer dev-no-assets-session" },
      payload: {
        countryId: "api-test-country-north-coast",
        partyId: "api-test-party-labor-commons",
        choice: "for"
      }
    });

    expect(voteResponse.statusCode).toBe(200);
    expect(voteResponse.json().npcVoteWeight).toBeGreaterThan(voteResponse.json().playerVoteWeight);
    expect(rejectedResponse.statusCode).toBe(400);
    expect(rejectedResponse.json().error.code).toBe("VOTER_HAS_NO_ASSETS");
  });

  it("applies for loans through backend validation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/loans/apply",
      payload: {
        borrowerType: "company",
        borrowerId: "api-test-company-harbor-bakery",
        lenderBankId: "api-test-bank-civic-reserve",
        principalMinor: 1_000_00,
        termTicks: 24
      }
    });
    const loansResponse = await app.inject({ method: "GET", url: "/loans" });

    expect(response.statusCode).toBe(201);
    expect(response.json().loan).toMatchObject({
      borrowerId: "api-test-company-harbor-bakery",
      lenderBankId: "api-test-bank-civic-reserve",
      status: "active"
    });
    expect(loansResponse.json().length).toBe(2);
  });

  it("rejects loans without a valid borrower", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/loans/apply",
      payload: {
        borrowerType: "company",
        borrowerId: "missing-company",
        lenderBankId: "api-test-bank-civic-reserve",
        principalMinor: 1_000_00,
        termTicks: 24
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("INVALID_BORROWER");
  });

  it("pays loans through backend validation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/loans/api-test-loan-harbor-bakery-working-capital/pay",
      payload: {
        amountMinor: 25_000
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().paidPrincipalMinor + response.json().paidInterestMinor).toBe(25_000);
  });

  it("matches exchange orders and rejects unaffordable purchases", async () => {
    const matchResponse = await app.inject({
      method: "POST",
      url: "/orders",
      payload: {
        exchangeId: "api-test-exchange-north",
        ownerType: "player",
        ownerId: "player-1",
        assetType: "stock",
        assetId: "api-test-stock-harbor-bakery",
        side: "buy",
        priceMinor: 1_250,
        quantity: 10
      }
    });
    const rejectedResponse = await app.inject({
      method: "POST",
      url: "/orders",
      payload: {
        exchangeId: "api-test-exchange-north",
        ownerType: "player",
        ownerId: "player-1",
        assetType: "stock",
        assetId: "api-test-stock-harbor-bakery",
        side: "buy",
        priceMinor: 9_999_999_99,
        quantity: 999
      }
    });

    expect(matchResponse.statusCode).toBe(201);
    expect(matchResponse.json().trades).toHaveLength(1);
    expect(rejectedResponse.statusCode).toBe(400);
    expect(rejectedResponse.json().error.code).toBe("INSUFFICIENT_CASH");
  });

  it("does not expose a direct money creation endpoint", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/accounts",
      payload: {
        ownerId: "player-1",
        balanceMinor: 999_999_999
      }
    });

    expect(response.statusCode).toBe(404);
  });

  it("runs simulation ticks through simulation-core and persists the new world", async () => {
    const tickResponse = await app.inject({
      method: "POST",
      url: "/simulation/tick",
      payload: {}
    });
    const summaryResponse = await app.inject({ method: "GET", url: "/world/summary" });
    const newsResponse = await app.inject({ method: "GET", url: "/news" });
    const metricsResponse = await app.inject({ method: "GET", url: "/metrics" });

    expect(tickResponse.statusCode).toBe(200);
    expect(tickResponse.json().summary.currentTick).toBe(1);
    expect(summaryResponse.json().currentTick).toBe(1);
    expect(newsResponse.json().length).toBeGreaterThan(0);
    expect(metricsResponse.json().some((metric: { name: string }) => metric.name === "market.sales.quantity")).toBe(true);
  });

  it("rejects tick commands that fail backend validation before mutating world state", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/simulation/tick",
      headers: idem("invalid-command-batch"),
      payload: {
        commands: [
          {
            type: "BuyLandCommand",
            commandId: "cmd-1",
                companyId: "api-test-company-harbor-bakery",
            cityId: "missing-city",
            lotId: "lot-1"
          }
        ]
      }
    });
    const summaryResponse = await app.inject({ method: "GET", url: "/world/summary" });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("UNKNOWN_CITY");
    expect(summaryResponse.json().currentTick).toBe(0);
  });
});
