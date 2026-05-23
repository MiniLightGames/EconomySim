import { createInitialWorldState } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import { runTick } from "@economysim/simulation-core";

describe("worker tick integration", () => {
  it("can execute the bootstrap tick pipeline", () => {
    const result = runTick({
      state: createInitialWorldState("worker-test"),
      commands: [],
      seed: "worker-test"
    });

    expect(result.state.currentTick).toBe(1);
    expect(result.events.map((event) => event.type)).toContain("WorldTickedEvent");
  });
});
