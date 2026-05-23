import type { WorldState } from "@economysim/domain";
export interface MarketOfferDto {
    readonly id: string;
    readonly companyId: string;
    readonly companyName: string;
    readonly productId: string;
    readonly productName: string;
    readonly cityId: string;
    readonly warehouseId: string;
    readonly priceMinor: number;
    readonly quality: number;
    readonly availableQuantity: number;
}
export interface MarketDto {
    readonly id: string;
    readonly needCategory: string;
    readonly productIds: readonly string[];
    readonly offerCount: number;
    readonly availableQuantity: number;
    readonly averagePriceMinor: number;
    readonly offers: readonly MarketOfferDto[];
}
export declare function buildMarkets(state: WorldState): MarketDto[];
//# sourceMappingURL=market.d.ts.map