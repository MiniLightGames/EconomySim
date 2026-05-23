"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldController = void 0;
const common_1 = require("@nestjs/common");
const world_service_1 = require("./world.service");
let WorldController = class WorldController {
    worldService;
    constructor(worldService) {
        this.worldService = worldService;
    }
    getStatus() {
        return this.worldService.getStatus();
    }
    getMap() {
        return this.worldService.getMap();
    }
    getCurrentTick() {
        return this.worldService.getCurrentTick();
    }
};
exports.WorldController = WorldController;
__decorate([
    (0, common_1.Get)("status"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorldController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)("map"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorldController.prototype, "getMap", null);
__decorate([
    (0, common_1.Get)("ticks/current"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WorldController.prototype, "getCurrentTick", null);
exports.WorldController = WorldController = __decorate([
    (0, common_1.Controller)("api/world"),
    __metadata("design:paramtypes", [world_service_1.WorldService])
], WorldController);
//# sourceMappingURL=world.controller.js.map