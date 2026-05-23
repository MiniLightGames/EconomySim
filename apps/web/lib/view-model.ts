import type { BankAccount, City, Company, Country, GeoPoint } from "@economysim/domain";
import type { MarketDto } from "./api";

export const PLAYER_ID = "player-1";
export const PLAYER_TREASURY_MINOR = 1_000_000_00;
export const MAP_LAYER_IDS = ["economy", "logistics", "resources", "war", "pollution", "infrastructure"] as const;

export type MapLayerId = (typeof MAP_LAYER_IDS)[number];

export const MAP_LAYER_LABELS: Record<MapLayerId, string> = {
  economy: "Экономика",
  infrastructure: "Инфраструктура",
  logistics: "Логистика",
  pollution: "Загрязнение",
  resources: "Ресурсы",
  war: "Война"
};

export type MapLayerState = Record<MapLayerId, boolean>;

export interface MapBounds {
  readonly minLat: number;
  readonly maxLat: number;
  readonly minLon: number;
  readonly maxLon: number;
}

export interface ProjectedPoint {
  readonly x: number;
  readonly y: number;
}

export interface OnboardingProgressInput {
  readonly hasWorld: boolean;
  readonly selectedCountryId: string | null;
  readonly playerCompanyCount: number;
  readonly resourceSignalCount: number;
  readonly producedGoodsCount: number;
  readonly currentTick: number;
  readonly newsCount: number;
}

export interface OnboardingStep {
  readonly id: "open-map" | "select-country" | "create-company" | "buy-resource" | "produce-good" | "run-tick" | "read-news";
  readonly label: string;
  readonly complete: boolean;
}

export function createDefaultMapLayers(): MapLayerState {
  return {
    economy: true,
    infrastructure: true,
    logistics: true,
    pollution: true,
    resources: true,
    war: true
  };
}

export function countEnabledMapLayers(layers: MapLayerState): number {
  return MAP_LAYER_IDS.filter((layerId) => layers[layerId]).length;
}

export function buildOnboardingSteps(input: OnboardingProgressInput): readonly OnboardingStep[] {
  return [
    {
      id: "open-map",
      label: "Открыть карту",
      complete: input.hasWorld
    },
    {
      id: "select-country",
      label: "Выбрать страну",
      complete: Boolean(input.selectedCountryId)
    },
    {
      id: "create-company",
      label: "Создать компанию",
      complete: input.playerCompanyCount > 0
    },
    {
      id: "buy-resource",
      label: "Купить ресурс",
      complete: input.resourceSignalCount > 0
    },
    {
      id: "produce-good",
      label: "Произвести товар",
      complete: input.producedGoodsCount > 0
    },
    {
      id: "run-tick",
      label: "Запустить тик",
      complete: input.currentTick > 0
    },
    {
      id: "read-news",
      label: "Прочитать новости",
      complete: input.newsCount > 0
    }
  ];
}

export function formatMoneyMinor(value: number, currencyCode = "ECO"): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(safeValue / 100);
}

export function formatCompactNumber(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;

  return new Intl.NumberFormat("ru-RU", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(safeValue);
}

export function formatPercent(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
  return `${Math.round(safeValue * 100)}%`;
}

export function getPlayerCompanies(companies: readonly Company[], playerId = PLAYER_ID): readonly Company[] {
  return companies.filter((company) => company.ownerType === "player" && company.ownerId === playerId);
}

export function getPlayerMoneyMinor(companies: readonly Company[], playerId = PLAYER_ID, accounts?: readonly BankAccount[]): number {
  const companyCash = getPlayerCompanies(companies, playerId).reduce((total, company) => total + company.cashBalanceMinor, 0);
  const playerCash =
    accounts
      ?.filter((account) => account.ownerType === "player" && account.ownerId === playerId && account.status === "active")
      .reduce((total, account) => total + Math.max(0, account.balanceMinor - account.reservedMinor), 0) ?? PLAYER_TREASURY_MINOR;

  return Math.max(0, playerCash + companyCash);
}

export function getMapBounds(countries: readonly Country[], cities: readonly City[]): MapBounds {
  const points: GeoPoint[] = [];

  for (const country of countries) {
    for (const ring of country.geometry.coordinates) {
      for (const point of ring) {
        points.push(point);
      }
    }
  }

  for (const city of cities) {
    points.push(city.location);
  }

  if (points.length === 0) {
    return {
      minLat: 0,
      maxLat: 1,
      minLon: 0,
      maxLon: 1
    };
  }

  const minLat = Math.min(...points.map((point) => point.lat));
  const maxLat = Math.max(...points.map((point) => point.lat));
  const minLon = Math.min(...points.map((point) => point.lon));
  const maxLon = Math.max(...points.map((point) => point.lon));
  const latPadding = Math.max(0.4, (maxLat - minLat) * 0.16);
  const lonPadding = Math.max(0.4, (maxLon - minLon) * 0.16);

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLon: minLon - lonPadding,
    maxLon: maxLon + lonPadding
  };
}

export function projectGeoPoint(point: GeoPoint, bounds: MapBounds): ProjectedPoint {
  const lonRange = bounds.maxLon - bounds.minLon || 1;
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const x = ((point.lon - bounds.minLon) / lonRange) * 100;
  const y = ((bounds.maxLat - point.lat) / latRange) * 100;

  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100)
  };
}

export function getCountryCentroid(country: Country, bounds: MapBounds): ProjectedPoint {
  const ring = country.geometry.coordinates[0] ?? [];

  if (ring.length === 0) {
    return { x: 50, y: 50 };
  }

  const center = ring.reduce(
    (total, point) => ({
      lat: total.lat + point.lat,
      lon: total.lon + point.lon
    }),
    { lat: 0, lon: 0 }
  );

  return projectGeoPoint(
    {
      lat: center.lat / ring.length,
      lon: center.lon / ring.length
    },
    bounds
  );
}

export function countryToSvgPoints(country: Country, bounds: MapBounds): string {
  const ring = country.geometry.coordinates[0] ?? [];

  return ring
    .map((point) => {
      const projected = projectGeoPoint(point, bounds);
      return `${projected.x.toFixed(2)},${projected.y.toFixed(2)}`;
    })
    .join(" ");
}

export function getCountryCities(country: Country | null, cities: readonly City[]): readonly City[] {
  if (!country) {
    return [];
  }

  return cities.filter((city) => city.countryId === country.id);
}

export function getMarketTone(market: MarketDto): "success" | "warning" | "danger" {
  if (market.availableQuantity <= 0) {
    return "danger";
  }

  if (market.availableQuantity < 10_000) {
    return "warning";
  }

  return "success";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
