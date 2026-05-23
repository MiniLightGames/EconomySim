"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("@economysim/domain");
const state = (0, domain_1.createInitialWorldState)("local");
const summary = (0, domain_1.summarizeWorld)(state);
console.log(JSON.stringify({ message: "EconomySim seed preview", summary }, null, 2));
//# sourceMappingURL=seed.js.map