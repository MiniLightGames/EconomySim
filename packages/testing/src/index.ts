import type { Metric, WorldState } from "@economysim/domain";
import { createInitialWorldState } from "@economysim/domain";
import { runTicks } from "@economysim/simulation-core";

export function createScenarioWorld(seed = "test"): WorldState {
  return createInitialWorldState(seed);
}

export function runGameDay(seed = "test"): WorldState {
  return runTicks(createScenarioWorld(seed), 24, seed);
}

export function findMetric(state: WorldState, name: string): Metric | undefined {
  return state.metrics.find((metric) => metric.name === name);
}
