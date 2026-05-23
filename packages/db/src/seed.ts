import { createInitialWorldState, summarizeWorld } from "@economysim/domain";

const state = createInitialWorldState("local");
const summary = summarizeWorld(state);

console.log(JSON.stringify({ message: "EconomySim seed preview", summary }, null, 2));
