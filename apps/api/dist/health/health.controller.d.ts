export declare class HealthController {
    getHealth(): {
        status: string;
        service: string;
        checks: {
            api: string;
            database: string;
            redis: string;
        };
    };
}
//# sourceMappingURL=health.controller.d.ts.map