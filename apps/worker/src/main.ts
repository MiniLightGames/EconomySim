import { createInitialWorldState, summarizeWorld } from "@economysim/domain";
import { runTick } from "@economysim/simulation-core";

const result = runTick({
  state: createInitialWorldState("worker"),
  commands: [],
  seed: "worker"
});

console.log(
  JSON.stringify(
    {
      service: "economysim-worker",
      mode: "single-tick-bootstrap",
      summary: summarizeWorld(result.state),
      events: result.events.map((event) => event.type)
    },
    null,
    2
  )
);
