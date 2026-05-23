import { createInitialWorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { runTicks } from "../src";

describe("bootstrap scenario regression", () => {
  it("keeps deterministic tick, snapshot, and metric counts across a game day", () => {
    const state = createInitialWorldState("scenario");
    const result = runTicks(state, 24, "scenario");

    expect(result.currentTick).toBe(24);
    expect(result.snapshots).toHaveLength(25);
    expect(result.metrics.filter((metric) => metric.name === "simulation.tick.duration_ms")).toHaveLength(24);
  });
});
