import { describe, expect, it } from "vitest";
import { ECONOMY_INVARIANTS, createInitialWorldState, summarizeWorld } from "../src";

describe("initial world state", () => {
  it("creates a small but non-empty economy seed", () => {
    const state = createInitialWorldState("test");
    const summary = summarizeWorld(state);

    expect(summary.countries).toBeGreaterThanOrEqual(2);
    expect(summary.cities).toBeGreaterThanOrEqual(3);
    expect(summary.products).toBeGreaterThanOrEqual(3);
    expect(summary.populationTotal).toBeGreaterThan(0);
  });

  it("documents the core economic invariants", () => {
    expect(ECONOMY_INVARIANTS).toContain("Money changes only through balanced ledger transactions.");
    expect(ECONOMY_INVARIANTS).toContain("Player intent enters the world as backend-validated commands.");
  });
});
