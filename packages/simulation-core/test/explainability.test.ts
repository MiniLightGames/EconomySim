import { createInitialWorldState, type WorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { assertNoInvalidEconomyValues, runTick } from "../src";

describe("explainability, news, and analytics simulation", () => {
  it("turns important events into categorized news", () => {
    const state = createInitialWorldState("explain-news");
    const result = runTick({ state, commands: [], seed: "explain-news" });

    expect(result.events.some((event) => event.type === "NewsCreatedEvent")).toBe(true);
    expect(result.state.news.some((item) => item.tick === 1 && item.category)).toBe(true);
  });

  it("creates price explanations with all required contribution buckets", () => {
    const state = createInitialWorldState("explain-price");
    const result = runTick({ state, commands: [], seed: "explain-price" });
    const explanation = result.state.explanations.find(
      (candidate) => candidate.targetType === "price" && candidate.targetId === "explain-price-product-bread"
    );

    expect(explanation).toBeDefined();
    expect(explanation?.causes.map((cause) => cause.label)).toEqual([
      "Demand",
      "Supply",
      "Cost",
      "Logistics",
      "Taxes",
      "Shortage",
      "Sanctions",
      "War",
      "Marketing"
    ]);
  });

  it("keeps private finance in hidden statistics instead of public statistics", () => {
    const state = createInitialWorldState("explain-privacy");
    const result = runTick({ state, commands: [], seed: "explain-privacy" });

    expect(result.state.hiddenStatistics.some((statistic) => statistic.metricName === "company.cash.private")).toBe(true);
    expect(result.state.publicStatistics.some((statistic) => statistic.metricName === "company.cash.private")).toBe(false);
  });

  it("can distort public statistics for authoritarian countries", () => {
    const state = makeAuthoritarianSouth(createInitialWorldState("explain-authoritarian"));
    const result = runTick({ state, commands: [], seed: "explain-authoritarian" });
    const reliability = result.state.dataReliability.find(
      (candidate) => candidate.countryId === "explain-authoritarian-country-south-union"
    );
    const distortedStatistic = result.state.publicStatistics.find(
      (statistic) => statistic.countryId === "explain-authoritarian-country-south-union" && statistic.distorted
    );

    expect(reliability?.grade).toBe("manipulated");
    expect(distortedStatistic).toBeDefined();
    expect(() => assertNoInvalidEconomyValues(result.state)).not.toThrow();
  });
});

function makeAuthoritarianSouth(state: WorldState): WorldState {
  return {
    ...state,
    countries: state.countries.map((country) =>
      country.id.endsWith("country-south-union")
        ? {
            ...country,
            politicalSystem: "authoritarian_republic"
          }
        : country
    ),
    governments: state.governments.map((government) =>
      government.countryId.endsWith("country-south-union")
        ? {
            ...government,
            regime: "authoritarian_republic",
            corruptionLevel: 0.64,
            legitimacy: 0.38
          }
        : government
    )
  };
}
