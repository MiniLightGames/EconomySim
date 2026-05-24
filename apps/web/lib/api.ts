import type {
  Bank,
  BankAccount,
  BankruptcyCase,
  BlackMarket,
  CentralBank,
  Confiscation,
  CorruptionCase,
  DataReliability,
  Election,
  EnforcementAgency,
  Exchange,
  Explanation,
  Army,
  Fine,
  Forecast,
  Front,
  Government,
  GovernmentBudget,
  EnvironmentalIndex,
  Law,
  LawType,
  LicenseAgreement,
  Loan,
  LobbyingAction,
  LogisticsRoute,
  MediaInfluence,
  Metric,
  MilitaryOrder,
  MilitaryUnit,
  NewsItem,
  Occupation,
  Order,
  OrderBook,
  IllegalTrade,
  Patent,
  Pollution,
  PortfolioPosition,
  PoliticalParty,
  Protest,
  PublicStatistic,
  RefugeeFlow,
  ResearchProject,
  RetailOffer,
  RetailPriceChange,
  ResourceOffer,
  ResourcePurchase,
  ResourceDeposit,
  ResourceDiscovery,
  ReputationPenalty,
  Sanction,
  SmugglingRoute,
  StrategicCell,
  Shipment,
  Technology,
  TechnologyLevel,
  Trade,
  TransportCompany,
  War,
  WarDamage,
  Warehouse,
  ManualProductionRun,
  WorldState
} from "@economysim/domain";

export interface WorldSummaryDto {
  readonly currentTick: number;
  readonly currentDate: string;
  readonly countries: number;
  readonly cities: number;
  readonly products: number;
  readonly companies: number;
  readonly inventoryLots: number;
  readonly retailOffers: number;
  readonly retailPriceChanges?: number;
  readonly demandRecords: number;
  readonly activeWars?: number;
  readonly strategicCells?: number;
  readonly occupiedCells?: number;
  readonly militaryOrders?: number;
  readonly technologies?: number;
  readonly unlockedTechnologies?: number;
  readonly activeResearchProjects?: number;
  readonly pollutionRecords?: number;
  readonly activeResourceDeposits?: number;
  readonly news: number;
  readonly populationTotal: number;
  readonly invariants: readonly string[];
  readonly lastEvent: unknown | null;
  readonly lastNews: NewsItem | null;
}

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

export interface ResourceOfferDto extends ResourceOffer {
  readonly companyName: string;
  readonly productName: string;
  readonly warehouseName: string;
  readonly cityId: string | null;
  readonly availableQuantity: number;
}

export interface RetailOfferDto extends RetailOffer {
  readonly companyName: string;
  readonly productName: string;
  readonly warehouseName: string;
  readonly cityId: string | null;
  readonly currencyCode: string;
  readonly availableQuantity: number;
}

export interface GameData {
  readonly world: WorldState;
  readonly summary: WorldSummaryDto;
  readonly markets: readonly MarketDto[];
  readonly retailOffers: readonly RetailOfferDto[];
  readonly retailPriceChanges: readonly RetailPriceChange[];
  readonly resourceOffers: readonly ResourceOfferDto[];
  readonly resourcePurchases: readonly ResourcePurchase[];
  readonly productionRuns: readonly ManualProductionRun[];
  readonly warehouses: readonly Warehouse[];
  readonly shipments: readonly Shipment[];
  readonly logisticsRoutes: readonly LogisticsRoute[];
  readonly transportCompanies: readonly TransportCompany[];
  readonly governments: GovernmentsDto;
  readonly banks: BanksDto;
  readonly accounts: readonly BankAccount[];
  readonly loans: readonly Loan[];
  readonly exchanges: ExchangesDto;
  readonly portfolio: PortfolioDto;
  readonly bankruptcies: BankruptciesDto;
  readonly wars: WarsDto;
  readonly strategicCells: readonly StrategicCell[];
  readonly sanctions: SanctionsDto;
  readonly militaryOrders: readonly MilitaryOrder[];
  readonly technologies: TechnologiesDto;
  readonly researchProjects: readonly ResearchProject[];
  readonly environment: EnvironmentDto;
  readonly resourceDeposits: ResourceDepositsDto;
  readonly crime: CrimeDto;
  readonly investigations: InvestigationsDto;
  readonly reputation: ReputationDto;
  readonly explanations: readonly Explanation[];
  readonly forecasts: readonly Forecast[];
  readonly news: readonly NewsItem[];
  readonly metrics: readonly Metric[];
}

export interface AnalyticsCountryDto {
  readonly country: WorldState["countries"][number];
  readonly reliability: readonly DataReliability[];
  readonly publicStatistics: readonly PublicStatistic[];
  readonly inflation: PublicStatistic | null;
  readonly unemployment: PublicStatistic | null;
  readonly industryProfits: readonly PublicStatistic[];
  readonly logisticsRisks: readonly PublicStatistic[];
  readonly priceSeries: readonly PriceSeriesPoint[];
  readonly forecasts: readonly Forecast[];
  readonly explanations: readonly Explanation[];
  readonly privacy: {
    readonly privateCompanyFinanceHidden: boolean;
    readonly publicCompaniesDisclose: boolean;
    readonly hiddenStatisticsIncluded: boolean;
  };
}

export interface AnalyticsProductDto {
  readonly product: WorldState["products"][number];
  readonly priceSeries: readonly PriceSeriesPoint[];
  readonly explanations: readonly Explanation[];
  readonly forecasts: readonly Forecast[];
  readonly reliability: readonly DataReliability[];
}

export interface PriceSeriesPoint {
  readonly tick: number;
  readonly averagePriceMinor: number;
  readonly purchasedQuantity: number;
}

export interface GovernmentsDto {
  readonly governments: readonly Government[];
  readonly parties: readonly PoliticalParty[];
  readonly elections: readonly Election[];
  readonly laws: readonly Law[];
  readonly protests: readonly Protest[];
}

export interface BanksDto {
  readonly centralBanks: readonly CentralBank[];
  readonly commercialBanks: readonly Bank[];
}

export interface ExchangesDto {
  readonly exchanges: readonly Exchange[];
  readonly orderBooks: readonly OrderBook[];
  readonly trades: readonly Trade[];
}

export interface PortfolioDto {
  readonly ownerType: Order["ownerType"];
  readonly ownerId: string;
  readonly accounts: readonly BankAccount[];
  readonly positions: readonly PortfolioPosition[];
  readonly openOrders: readonly Order[];
  readonly trades: readonly Trade[];
}

export interface BankruptciesDto {
  readonly cases: readonly BankruptcyCase[];
  readonly auctions: WorldState["assetAuctions"];
}

export interface WarsDto {
  readonly wars: readonly War[];
  readonly fronts: readonly Front[];
  readonly armies: readonly Army[];
  readonly militaryUnits: readonly MilitaryUnit[];
  readonly occupations: readonly Occupation[];
  readonly refugeeFlows: readonly RefugeeFlow[];
  readonly warDamage: readonly WarDamage[];
}

export interface SanctionsDto {
  readonly sanctions: readonly Sanction[];
  readonly policies: WorldState["sanctionPolicies"];
}

export interface TechnologiesDto {
  readonly technologies: readonly Technology[];
  readonly levels: readonly TechnologyLevel[];
  readonly patents: readonly Patent[];
  readonly licenses: readonly LicenseAgreement[];
  readonly cleanEnergyPolicies: WorldState["cleanEnergyPolicies"];
}

export interface EnvironmentDto {
  readonly pollution: readonly Pollution[];
  readonly indexes: readonly EnvironmentalIndex[];
  readonly cleanEnergyPolicies: WorldState["cleanEnergyPolicies"];
}

export interface ResourceDepositsDto {
  readonly deposits: readonly ResourceDeposit[];
  readonly discoveries: readonly ResourceDiscovery[];
}

export interface CrimeDto {
  readonly markets: readonly BlackMarket[];
  readonly routes: readonly SmugglingRoute[];
  readonly illegalTrades: readonly IllegalTrade[];
}

export interface InvestigationsDto {
  readonly investigations: readonly InvestigationRecord[];
  readonly corruptionCases: readonly CorruptionCase[];
  readonly enforcementAgencies: readonly EnforcementAgency[];
  readonly fines: readonly Fine[];
  readonly confiscations: readonly Confiscation[];
}

export type InvestigationRecord = WorldState["investigations"][number];

export interface ReputationDto {
  readonly companies: readonly {
    readonly id: string;
    readonly name: string;
    readonly reputation: number;
    readonly legalStatus: string;
    readonly penaltyCount: number;
    readonly finesMinor: number;
  }[];
  readonly penalties: readonly ReputationPenalty[];
}

export interface CreateCompanyInput {
  readonly countryId: string;
  readonly name: string;
}

export interface LandPurchaseInput {
  readonly companyId: string;
  readonly cityId: string;
  readonly lotId?: string;
  readonly mode?: "purchase" | "lease";
}

export interface LandPurchaseResponse {
  readonly warehouse: Warehouse | null;
  readonly productionPlan: WorldState["productionPlans"][number] | null;
  readonly retailOffer: RetailOffer | null;
  readonly event: unknown;
}

export interface ResourcePurchaseInput {
  readonly buyerCompanyId: string;
  readonly resourceOfferId: string;
  readonly quantity: number;
  readonly maxUnitPriceMinor: number;
  readonly buyerWarehouseId?: string;
}

export interface ManualProductionInput {
  readonly companyId: string;
  readonly productionPlanId: string;
  readonly requestedQuantity: number;
}

export interface RetailPriceInput {
  readonly companyId: string;
  readonly retailOfferId: string;
  readonly priceMinor: number;
  readonly currencyCode?: string;
}

export interface RetailPriceResponse {
  readonly offer: RetailOfferDto;
  readonly priceChange: RetailPriceChange;
}

export interface LoanApplicationInput {
  readonly borrowerType: "company" | "bank";
  readonly borrowerId: string;
  readonly lenderBankId: string;
  readonly principalMinor: number;
  readonly termTicks: number;
}

export interface CreateOrderInput {
  readonly exchangeId: string;
  readonly ownerType: Order["ownerType"];
  readonly ownerId: string;
  readonly assetType: Order["assetType"];
  readonly assetId: string;
  readonly side: Order["side"];
  readonly priceMinor: number;
  readonly quantity: number;
}

export interface LobbyingInput {
  readonly countryId: string;
  readonly targetPartyId?: string;
  readonly lawType: LawType;
  readonly amountMinor: number;
}

export interface MediaCampaignInput {
  readonly countryId: string;
  readonly targetPartyId?: string;
  readonly message: string;
  readonly spendMinor: number;
}

export interface VoteInput {
  readonly countryId: string;
  readonly partyId: string;
  readonly choice: "for" | "against" | "abstain";
}

export interface ResearchProjectInput {
  readonly companyId: string;
  readonly technologyId: string;
  readonly fundingPerTickMinor: number;
  readonly name?: string;
}

export interface IllegalTradeInput {
  readonly blackMarketId: string;
  readonly sellerCompanyId: string;
  readonly buyerOwnerType: "player" | "company";
  readonly buyerOwnerId: string;
  readonly quantity: number;
  readonly smugglingRouteId?: string;
  readonly bribeMinor?: number;
}

export interface CountryBudgetDto {
  readonly budget: GovernmentBudget | null;
  readonly history: readonly GovernmentBudget[];
  readonly debt: WorldState["publicDebt"][number] | null;
  readonly taxPolicy: WorldState["taxPolicies"][number] | null;
  readonly subsidies: WorldState["subsidies"];
}

export interface TickResponseDto {
  readonly summary: WorldSummaryDto;
  readonly acceptedCommands: readonly string[];
  readonly events: readonly unknown[];
  readonly metrics: readonly Metric[];
  readonly news: readonly NewsItem[];
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/backend";

export async function fetchGameData(): Promise<GameData> {
  const [
    world,
    summary,
    markets,
    retailOffers,
    retailPriceChanges,
    resourceOffers,
    resourcePurchases,
    productionRuns,
    warehouses,
    shipments,
    logisticsRoutes,
    transportCompanies,
    governments,
    banks,
    accounts,
    loans,
    exchanges,
    portfolio,
    bankruptcies,
    wars,
    strategicCells,
    sanctions,
    militaryOrders,
    technologies,
    researchProjects,
    environment,
    resourceDeposits,
    crime,
    investigations,
    reputation,
    explanations,
    forecasts,
    news,
    metrics
  ] = await Promise.all([
    apiRequest<WorldState>("/world"),
    apiRequest<WorldSummaryDto>("/world/summary"),
    apiRequest<MarketDto[]>("/markets"),
    apiRequest<RetailOfferDto[]>("/retail/offers"),
    apiRequest<RetailPriceChange[]>("/retail/price-changes"),
    apiRequest<ResourceOfferDto[]>("/resources/offers"),
    apiRequest<ResourcePurchase[]>("/resources/purchases"),
    apiRequest<ManualProductionRun[]>("/production/runs"),
    apiRequest<Warehouse[]>("/warehouses"),
    apiRequest<Shipment[]>("/shipments"),
    apiRequest<LogisticsRoute[]>("/logistics/routes"),
    apiRequest<TransportCompany[]>("/transport-companies"),
    apiRequest<GovernmentsDto>("/governments"),
    apiRequest<BanksDto>("/banks"),
    apiRequest<BankAccount[]>("/accounts"),
    apiRequest<Loan[]>("/loans"),
    apiRequest<ExchangesDto>("/exchanges"),
    apiRequest<PortfolioDto>("/portfolio?ownerType=player&ownerId=player-1"),
    apiRequest<BankruptciesDto>("/bankruptcies"),
    apiRequest<WarsDto>("/wars"),
    apiRequest<StrategicCell[]>("/strategic-cells"),
    apiRequest<SanctionsDto>("/sanctions"),
    apiRequest<MilitaryOrder[]>("/military-orders"),
    apiRequest<TechnologiesDto>("/technologies"),
    apiRequest<ResearchProject[]>("/research-projects"),
    apiRequest<EnvironmentDto>("/environment"),
    apiRequest<ResourceDepositsDto>("/resources/deposits"),
    apiRequest<CrimeDto>("/black-markets"),
    apiRequest<InvestigationsDto>("/investigations"),
    apiRequest<ReputationDto>("/reputation"),
    apiRequest<Explanation[]>("/explanations"),
    apiRequest<Forecast[]>("/forecasts"),
    apiRequest<NewsItem[]>("/news"),
    apiRequest<Metric[]>("/metrics")
  ]);

  return {
    world,
    summary,
    markets,
    retailOffers,
    retailPriceChanges,
    resourceOffers,
    resourcePurchases,
    productionRuns,
    warehouses,
    shipments,
    logisticsRoutes,
    transportCompanies,
    governments,
    banks,
    accounts,
    loans,
    exchanges,
    portfolio,
    bankruptcies,
    wars,
    strategicCells,
    sanctions,
    militaryOrders,
    technologies,
    researchProjects,
    environment,
    resourceDeposits,
    crime,
    investigations,
    reputation,
    explanations,
    forecasts,
    news,
    metrics
  };
}

export async function runNextTick(): Promise<TickResponseDto> {
  return apiRequest<TickResponseDto>("/simulation/tick", {
    method: "POST",
    body: JSON.stringify({ commands: [] })
  });
}

export async function createCompany(input: CreateCompanyInput): Promise<WorldState["companies"][number]> {
  return apiRequest<WorldState["companies"][number]>("/companies", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function purchaseLand(input: LandPurchaseInput): Promise<LandPurchaseResponse> {
  return apiRequest<LandPurchaseResponse>("/land/purchase", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function purchaseResource(input: ResourcePurchaseInput): Promise<ResourcePurchase> {
  return apiRequest<ResourcePurchase>("/resources/purchase", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function runProduction(input: ManualProductionInput): Promise<ManualProductionRun> {
  return apiRequest<ManualProductionRun>("/production/run", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function setRetailPrice(input: RetailPriceInput): Promise<RetailPriceResponse> {
  return apiRequest<RetailPriceResponse>(`/retail/offers/${encodeURIComponent(input.retailOfferId)}/price`, {
    method: "POST",
    body: JSON.stringify({
      companyId: input.companyId,
      priceMinor: input.priceMinor,
      currencyCode: input.currencyCode
    })
  });
}

export async function applyForLoan(input: LoanApplicationInput): Promise<unknown> {
  return apiRequest("/loans/apply", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function createOrder(input: CreateOrderInput): Promise<unknown> {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function fundLobbying(input: LobbyingInput): Promise<LobbyingAction> {
  return apiRequest<LobbyingAction>("/lobbying", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function runMediaCampaign(input: MediaCampaignInput): Promise<MediaInfluence> {
  return apiRequest<MediaInfluence>("/media-campaigns", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function castVote(input: VoteInput): Promise<unknown> {
  return apiRequest("/vote", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function startResearchProject(input: ResearchProjectInput): Promise<ResearchProject> {
  return apiRequest<ResearchProject>("/research-projects", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function createIllegalTrade(input: IllegalTradeInput): Promise<IllegalTrade> {
  return apiRequest<IllegalTrade>("/illegal-trades", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function fetchCountryAnalytics(countryId: string): Promise<AnalyticsCountryDto> {
  return apiRequest<AnalyticsCountryDto>(`/analytics/countries/${encodeURIComponent(countryId)}`);
}

export async function fetchProductAnalytics(productId: string): Promise<AnalyticsProductDto> {
  return apiRequest<AnalyticsProductDto>(`/analytics/products/${encodeURIComponent(productId)}`);
}

export async function fetchCountryBudget(countryId: string): Promise<CountryBudgetDto> {
  return apiRequest<CountryBudgetDto>(`/countries/${encodeURIComponent(countryId)}/budget`);
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiClientError) {
    return `${error.status} ${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown API error.";
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBasePath}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    const problem = normalizeProblem(payload);
    throw new ApiClientError(problem.message, response.status, problem.code, problem.details);
  }

  return payload as T;
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function normalizeProblem(payload: unknown): { readonly code: string; readonly message: string; readonly details: unknown } {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const code = typeof record.code === "string" ? record.code : "API_ERROR";
    const message = typeof record.message === "string" ? record.message : "API request failed.";

    return {
      code,
      message,
      details: record.details ?? payload
    };
  }

  return {
    code: "API_ERROR",
    message: typeof payload === "string" ? payload : "API request failed.",
    details: payload
  };
}
