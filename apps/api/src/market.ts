import type { RetailOffer, WorldState } from "@economysim/domain";

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

export function buildMarkets(state: WorldState): MarketDto[] {
  const offers = state.retailOffers
    .filter((offer) => offer.active)
    .map((offer) => toMarketOffer(state, offer))
    .filter((offer): offer is MarketOfferDto => offer !== null);
  const marketsByNeed = new Map<string, MarketOfferDto[]>();

  for (const offer of offers) {
    const product = state.products.find((candidate) => candidate.id === offer.productId);
    const needCategory = product?.needCategory ?? "unknown";
    const marketOffers = marketsByNeed.get(needCategory) ?? [];
    marketOffers.push(offer);
    marketsByNeed.set(needCategory, marketOffers);
  }

  return [...marketsByNeed.entries()]
    .map(([needCategory, marketOffers]) => {
      const availableQuantity = marketOffers.reduce((total, offer) => total + offer.availableQuantity, 0);
      const totalPrice = marketOffers.reduce((total, offer) => total + offer.priceMinor, 0);
      const productIds = [...new Set(marketOffers.map((offer) => offer.productId))];

      return {
        id: needCategory,
        needCategory,
        productIds,
        offerCount: marketOffers.length,
        availableQuantity,
        averagePriceMinor: marketOffers.length > 0 ? Math.round(totalPrice / marketOffers.length) : 0,
        offers: marketOffers
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function toMarketOffer(state: WorldState, offer: RetailOffer): MarketOfferDto | null {
  const company = state.companies.find((candidate) => candidate.id === offer.companyId);
  const product = state.products.find((candidate) => candidate.id === offer.productId);
  const warehouse = state.warehouses.find((candidate) => candidate.id === offer.warehouseId);

  if (!company || !product || !warehouse) {
    return null;
  }

  return {
    id: offer.id,
    companyId: company.id,
    companyName: company.name,
    productId: product.id,
    productName: product.name,
    cityId: warehouse.cityId,
    warehouseId: warehouse.id,
    priceMinor: offer.priceMinor,
    quality: offer.quality,
    availableQuantity: state.inventoryLots
      .filter((lot) => lot.warehouseId === offer.warehouseId && lot.productId === offer.productId)
      .reduce((total, lot) => total + lot.quantity, 0)
  };
}
