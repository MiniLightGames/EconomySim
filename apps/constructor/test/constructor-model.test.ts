import { describe, expect, it } from "vitest";
import {
  createInitialConstructorCatalog,
  parseConstructorCatalogJson,
  runMiniSimulation,
  serializeConstructorCatalog,
  validateConstructorCatalog,
  type ConstructorCatalog
} from "../lib/constructor-model";

describe("constructor model", () => {
  it("validates the default catalog without errors", () => {
    const catalog = createInitialConstructorCatalog();
    const issues = validateConstructorCatalog(catalog);

    expect(issues.filter((issue) => issue.severity === "error")).toHaveLength(0);
  });

  it("round-trips catalog JSON import and export", () => {
    const catalog = createInitialConstructorCatalog();
    const result = parseConstructorCatalogJson(serializeConstructorCatalog(catalog));

    expect(result.ok).toBe(true);
    expect(result.catalog?.products).toHaveLength(catalog.products.length);
    expect(result.catalog?.productionChains).toHaveLength(catalog.productionChains.length);
    expect(result.catalog?.resourceDepositTemplates).toHaveLength(catalog.resourceDepositTemplates.length);
    expect(result.catalog?.pollutionFactors).toHaveLength(catalog.pollutionFactors.length);
    expect(result.catalog?.laws[0]).toMatchObject({
      type: expect.any(String),
      parameters: expect.any(Object),
      restrictions: expect.any(String)
    });
  });

  it("validates law template parameters", () => {
    const catalog = createInitialConstructorCatalog();
    const unsafeCatalog: ConstructorCatalog = {
      ...catalog,
      laws: [
        {
          ...catalog.laws[0]!,
          id: "law-broken-tax",
          type: "profit_tax",
          parameters: {}
        }
      ]
    };
    const issues = validateConstructorCatalog(unsafeCatalog);

    expect(issues.some((issue) => issue.entityType === "law" && issue.field === "parameters.rate")).toBe(true);
  });

  it("warns about potential infinite profit", () => {
    const catalog = createInitialConstructorCatalog();
    const unsafeCatalog: ConstructorCatalog = {
      ...catalog,
      productionChains: [
        {
          id: "chain-free-money",
          name: "Free Money",
          inputs: [],
          outputProductId: catalog.products[0]?.id ?? "product-bread",
          outputQuantity: 1,
          targetPriceMinor: 1_000,
          laborHours: 0,
          energyKwh: 0,
          durationHours: 0,
          equipmentBuildingIds: [],
          waste: []
        }
      ]
    };
    const issues = validateConstructorCatalog(unsafeCatalog);

    expect(issues.some((issue) => issue.severity === "warning" && issue.message.includes("Potential infinite profit"))).toBe(true);
  });

  it("keeps mini-simulation numbers finite", () => {
    const catalog = createInitialConstructorCatalog();
    const simulations = runMiniSimulation(catalog);

    expect(simulations.length).toBeGreaterThan(0);

    for (const simulation of simulations) {
      expect(Number.isFinite(simulation.totalCostMinor)).toBe(true);
      expect(Number.isFinite(simulation.revenueMinor)).toBe(true);
      expect(Number.isFinite(simulation.profitMinor)).toBe(true);
      expect(Number.isFinite(simulation.margin)).toBe(true);
      expect(simulation.outputQuantity).toBeGreaterThanOrEqual(0);
    }
  });

  it("validates technology, resource deposit, and pollution ecology editors", () => {
    const catalog = createInitialConstructorCatalog();
    const unsafeCatalog: ConstructorCatalog = {
      ...catalog,
      technologies: [
        {
          ...catalog.technologies[0]!,
          id: "technology-broken",
          researchCostMinor: -1,
          pollutionReduction: 2
        }
      ],
      resourceDepositTemplates: [
        {
          ...catalog.resourceDepositTemplates[0]!,
          id: "deposit-broken",
          resourceId: "missing-resource",
          discoveryChance: 1.5
        }
      ],
      pollutionFactors: [
        {
          ...catalog.pollutionFactors[0]!,
          id: "pollution-broken",
          air: -1
        }
      ]
    };
    const issues = validateConstructorCatalog(unsafeCatalog);

    expect(issues.some((issue) => issue.entityType === "technology" && issue.field === "pollutionReduction")).toBe(true);
    expect(issues.some((issue) => issue.entityType === "resourceDepositTemplate" && issue.field === "resourceId")).toBe(true);
    expect(issues.some((issue) => issue.entityType === "pollutionFactor" && issue.field === "air")).toBe(true);
  });
});
