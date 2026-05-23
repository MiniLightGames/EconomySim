"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScenarioWorld = createScenarioWorld;
exports.runGameDay = runGameDay;
exports.findMetric = findMetric;
const domain_1 = require("@economysim/domain");
const simulation_core_1 = require("@economysim/simulation-core");
function createScenarioWorld(seed = "test") {
    return (0, domain_1.createInitialWorldState)(seed);
}
function runGameDay(seed = "test") {
    return (0, simulation_core_1.runTicks)(createScenarioWorld(seed), 24, seed);
}
function findMetric(state, name) {
    return state.metrics.find((metric) => metric.name === name);
}
//# sourceMappingURL=index.js.map