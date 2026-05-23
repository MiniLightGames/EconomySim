import { createInitialWorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { assertNoInvalidEconomyValues, runTick, startResearchProject } from "../src";

describe("technology, R&D, and ecology simulation", () => {
  it("unlocks technology when R&D funding reaches the target", () => {
    const state = createInitialWorldState("tech-rd");
    const started = startResearchProject(
      state,
      {
        companyId: "tech-rd-company-harbor-bakery",
        technologyId: "tech-rd-technology-telemedicine",
        fundingPerTickMinor: 100_000,
        name: "Telemedicine sprint"
      },
      "tech-rd"
    );
    const result = runTick({ state: started.state, commands: [], seed: "tech-rd" });

    expect(result.state.researchProjects.find((project) => project.id === started.project.id)).toMatchObject({
      status: "completed",
      completedTick: 1
    });
    expect(
      result.state.technologyLevels.some(
        (level) =>
          level.technologyId === "tech-rd-technology-telemedicine" &&
          level.scopeType === "company" &&
          level.scopeId === "tech-rd-company-harbor-bakery" &&
          level.unlocked
      )
    ).toBe(true);
    expect(result.events.some((event) => event.type === "TechnologyUnlockedEvent")).toBe(true);
  });

  it("uses technology to lower production input cost", () => {
    const state = {
      ...createInitialWorldState("tech-cost"),
      retailOffers: []
    };
    const noTechState = {
      ...state,
      technologyLevels: []
    };
    const noTech = runTick({ state: noTechState, commands: [], seed: "tech-cost-none" });
    const withTech = runTick({ state, commands: [], seed: "tech-cost" });
    const noTechConsumed = sumMetric(noTech.metrics, "production.input.consumed.quantity", "tech-cost-product-wheat");
    const withTechConsumed = sumMetric(withTech.metrics, "production.input.consumed.quantity", "tech-cost-product-wheat");

    expect(noTechConsumed).toBeGreaterThan(0);
    expect(withTechConsumed).toBeGreaterThan(0);
    expect(withTechConsumed).toBeLessThan(noTechConsumed);
  });

  it("depletes resource deposits when production consumes local resources", () => {
    const state = {
      ...createInitialWorldState("tech-resource"),
      retailOffers: []
    };
    const before = state.resourceDeposits.find((deposit) => deposit.id === "tech-resource-deposit-grainford-wheat-basin");
    const result = runTick({ state, commands: [], seed: "tech-resource" });
    const after = result.state.resourceDeposits.find((deposit) => deposit.id === "tech-resource-deposit-grainford-wheat-basin");

    expect(before).toBeDefined();
    expect(after).toBeDefined();
    expect(after?.quantity).toBeLessThan(before?.quantity ?? 0);
    expect(result.metrics.some((metric) => metric.name === "ecology.resource.depleted.quantity")).toBe(true);
  });

  it("raises pollution and environmental pressure from production", () => {
    const state = {
      ...createInitialWorldState("tech-pollution"),
      retailOffers: []
    };
    const before = state.environmentalIndexes.find((index) => index.cityId === "tech-pollution-city-harborview");
    const result = runTick({ state, commands: [], seed: "tech-pollution" });
    const after = result.state.environmentalIndexes.find((index) => index.cityId === "tech-pollution-city-harborview");

    expect(result.state.pollution.length).toBeGreaterThan(state.pollution.length);
    expect(after?.airQuality).toBeLessThan(before?.airQuality ?? 1);
    expect(result.state.news.some((item) => item.headline.includes("pollution"))).toBe(true);
  });

  it("lets poor ecology affect population health and migration", () => {
    const base = createInitialWorldState("tech-ecology");
    const state = {
      ...base,
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
      environmentalIndexes: base.environmentalIndexes.map((index) =>
        index.cityId === "tech-ecology-city-harborview"
          ? {
              ...index,
              healthImpact: 0.9,
              migrationPressure: 0.6
            }
          : index
      )
    };
    const before = state.cities.find((city) => city.id === "tech-ecology-city-harborview");
    const result = runTick({ state, commands: [], seed: "tech-ecology" });
    const after = result.state.cities.find((city) => city.id === "tech-ecology-city-harborview");

    expect(after?.populationTotal).toBeLessThan(before?.populationTotal ?? 0);
    expect(result.metrics.some((metric) => metric.name === "ecology.population.health_loss")).toBe(true);
    expect(result.metrics.some((metric) => metric.name === "ecology.migration.people")).toBe(true);
  });

  it("keeps technology and ecology values finite and non-negative", () => {
    const state = createInitialWorldState("tech-validity");
    const result = runTick({ state, commands: [], seed: "tech-validity" });

    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });
});

function sumMetric(metrics: readonly { readonly name: string; readonly value: number; readonly tags: Readonly<Record<string, string>> }[], name: string, productId: string): number {
  return metrics.filter((metric) => metric.name === name && metric.tags.productId === productId).reduce((total, metric) => total + metric.value, 0);
}
