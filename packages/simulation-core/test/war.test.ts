import { createInitialWorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { assertNoInvalidEconomyValues, runTick } from "../src";

describe("war and geopolitics simulation", () => {
  it("captures a strategic cell when attacker pressure is higher", () => {
    const state = createInitialWorldState("war-capture");
    const result = runActiveWarTick(state, "war-capture");

    expect(result.events.some((event) => event.type === "StrategicCellCapturedEvent")).toBe(true);
    expect(result.state.occupations.some((occupation) => occupation.cellId === "war-capture-cell-border-gate")).toBe(true);
  });

  it("changes factual control without changing legal control", () => {
    const state = createInitialWorldState("war-control");
    const before = state.strategicCells.find((cell) => cell.id === "war-control-cell-border-gate");
    const result = runActiveWarTick(state, "war-control");
    const after = result.state.strategicCells.find((cell) => cell.id === "war-control-cell-border-gate");

    expect(before?.factualControllerCountryId).toBe("war-control-country-north-coast");
    expect(after).toMatchObject({
      legalControllerCountryId: "war-control-country-north-coast",
      factualControllerCountryId: "war-control-country-south-union",
      recognitionStatus: "occupied"
    });
  });

  it("damages infrastructure around the front", () => {
    const state = createInitialWorldState("war-damage");
    const result = runActiveWarTick(state, "war-damage");
    const damagedLink = result.state.infrastructureLinks.find((link) => link.id === "war-damage-link-sunport-border-road");

    expect(result.state.warDamage.some((damage) => damage.targetType === "infrastructure_link")).toBe(true);
    expect(damagedLink?.quality).toBeLessThan(0.46);
    expect(damagedLink?.warDisruptionRisk).toBeGreaterThan(0.18);
  });

  it("blocks logistics routes under wartime blockade", () => {
    const state = createInitialWorldState("war-route");
    const routeId = "war-route-route-sunport-harborview-border";
    const result = runActiveWarTick(
      {
        ...state,
        logisticsRoutes: state.logisticsRoutes.map((route) => (route.id === routeId ? { ...route, active: true, blockedReason: null } : route)),
        infrastructureLinks: state.infrastructureLinks.map((link) =>
          link.id.includes("sunport-border") || link.id.includes("border-harborview")
            ? { ...link, blocked: false, sanctionsBlocked: false }
            : link
        )
      },
      "war-route"
    );
    const route = result.state.logisticsRoutes.find((candidate) => candidate.id === routeId);

    expect(route?.active).toBe(false);
    expect(route?.blockedReason).toContain("War blockade");
  });

  it("raises demand for military goods", () => {
    const state = createInitialWorldState("war-demand");
    const result = runActiveWarTick(state, "war-demand");

    expect(result.state.militaryOrders.length).toBeGreaterThan(state.militaryOrders.length);
    expect(result.state.militaryOrders.some((order) => order.supplyType === "ammunition")).toBe(true);
    expect(result.metrics.some((metric) => metric.name === "war.military_demand.quantity")).toBe(true);
  });

  it("moves refugees from the front city to a safer city", () => {
    const state = createInitialWorldState("war-refugees");
    const grainfordBefore = state.cities.find((city) => city.id === "war-refugees-city-grainford");
    const harborviewBefore = state.cities.find((city) => city.id === "war-refugees-city-harborview");
    const result = runActiveWarTick(state, "war-refugees");
    const grainfordAfter = result.state.cities.find((city) => city.id === "war-refugees-city-grainford");
    const harborviewAfter = result.state.cities.find((city) => city.id === "war-refugees-city-harborview");

    expect(result.state.refugeeFlows.length).toBeGreaterThan(0);
    expect(grainfordAfter?.populationTotal).toBeLessThan(grainfordBefore?.populationTotal ?? 0);
    expect(harborviewAfter?.populationTotal).toBeGreaterThan(harborviewBefore?.populationTotal ?? 0);
  });

  it("does not produce negative, NaN, or infinite war values", () => {
    const state = createInitialWorldState("war-validity");
    const result = runActiveWarTick(state, "war-validity");

    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });
});


function runActiveWarTick(state: ReturnType<typeof createInitialWorldState>, seed: string) {
  const stabilised = runTick({ state, commands: [], seed }).state;
  return runTick({ state: stabilised, commands: [], seed });
}
