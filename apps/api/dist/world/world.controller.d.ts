import { WorldService } from "./world.service";
export declare class WorldController {
    private readonly worldService;
    constructor(worldService: WorldService);
    getStatus(): {
        invariants: readonly ["Money changes only through balanced ledger transactions.", "Player intent enters the world as backend-validated commands.", "Inventory moves only by warehouse to cargo batch to warehouse.", "Important actions create audit log records, events, and metrics."];
        lastEvent: import("@economysim/domain").DomainEvent | null;
        currentTick: number;
        currentDate: string;
        countries: number;
        cities: number;
        products: number;
        companies: number;
        inventoryLots: number;
        retailOffers: number;
        demandRecords: number;
        news: number;
        populationTotal: number;
    };
    getMap(): {
        countries: {
            id: string;
            name: string;
            currencyCode: import("@economysim/domain").CurrencyCode;
            stability: number;
            geometry: import("@economysim/domain").GeoPolygon;
        }[];
        cities: {
            id: string;
            countryId: string;
            name: string;
            location: import("@economysim/domain").GeoPoint;
            populationTotal: number;
            infrastructureScore: number;
        }[];
    };
    getCurrentTick(): {
        tick: number;
        date: string;
        snapshotId: string | null;
    };
}
//# sourceMappingURL=world.controller.d.ts.map