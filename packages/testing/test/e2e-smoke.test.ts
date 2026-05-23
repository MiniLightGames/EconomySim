import { describe, expect, it } from "vitest";
import { findMetric, runGameDay } from "../src";

describe("e2e smoke placeholder", () => {
  it("can run a game day through shared test helpers", () => {
    const state = runGameDay("e2e");

    expect(state.currentTick).toBe(24);
    expect(findMetric(state, "simulation.tick.duration_ms")).toBeDefined();
  });
});
