"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("@economysim/domain");
const simulation_core_1 = require("@economysim/simulation-core");
const result = (0, simulation_core_1.runTick)({
    state: (0, domain_1.createInitialWorldState)("worker"),
    commands: [],
    seed: "worker"
});
console.log(JSON.stringify({
    service: "economysim-worker",
    mode: "single-tick-bootstrap",
    summary: (0, domain_1.summarizeWorld)(result.state),
    events: result.events.map((event) => event.type)
}, null, 2));
//# sourceMappingURL=main.js.map