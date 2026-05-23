"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldService = void 0;
const domain_1 = require("@economysim/domain");
const simulation_core_1 = require("@economysim/simulation-core");
const common_1 = require("@nestjs/common");
let WorldService = class WorldService {
    state = (0, simulation_core_1.runTick)({
        state: (0, domain_1.createInitialWorldState)("api"),
        commands: [],
        seed: "api"
    }).state;
    getStatus() {
        return {
            ...(0, domain_1.summarizeWorld)(this.state),
            invariants: domain_1.ECONOMY_INVARIANTS,
            lastEvent: this.state.events.at(-1) ?? null
        };
    }
    getMap() {
        return {
            countries: this.state.countries.map((country) => ({
                id: country.id,
                name: country.name,
                currencyCode: country.currencyCode,
                stability: country.stability,
                geometry: country.geometry
            })),
            cities: this.state.cities.map((city) => ({
                id: city.id,
                countryId: city.countryId,
                name: city.name,
                location: city.location,
                populationTotal: city.populationTotal,
                infrastructureScore: city.infrastructureScore
            }))
        };
    }
    getCurrentTick() {
        return {
            tick: this.state.currentTick,
            date: this.state.currentDate,
            snapshotId: this.state.snapshots.at(-1)?.id ?? null
        };
    }
};
exports.WorldService = WorldService;
exports.WorldService = WorldService = __decorate([
    (0, common_1.Injectable)()
], WorldService);
//# sourceMappingURL=world.service.js.map