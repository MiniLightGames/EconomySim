export type EntityId = string;
export type CurrencyCode = "ECO" | "NCR" | "SOV";
export type NeedCategory = "food" | "housing" | "transport" | "medicine" | "entertainment";
export type TransportMode = "road" | "rail" | "sea" | "multimodal";
export type ShipmentStatus = "pending" | "in_transit" | "delivered" | "blocked" | "cancelled";
export type FinancialAssetType = "stock" | "bond" | "currency" | "commodity";
export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "partially_filled" | "filled" | "cancelled" | "rejected";
export type LoanStatus = "active" | "defaulted" | "paid" | "restructured";
export type BankruptcyCaseStatus = "open" | "auction" | "resolved";
export type PoliticalRegime = "federal_republic" | "constitutional_monarchy" | "city_league" | "authoritarian_republic";
export type LawType =
  | "profit_tax"
  | "sales_tax"
  | "import_tariff"
  | "export_restriction"
  | "industry_license"
  | "environmental_fine"
  | "martial_law"
  | "nationalization"
  | "deposit_insurance"
  | "bank_bailout";
export type LawStatus = "draft" | "active" | "rejected" | "expired";
export type VoteChoice = "for" | "against" | "abstain";
export type WarStatus = "active" | "ceasefire" | "ended";
export type WarLegalStatus = "declared" | "undeclared" | "civil";
export type FrontMovementDirection = "attacker" | "defender" | "static";
export type StrategicCellTerrain = "urban" | "plains" | "coast" | "mountain" | "river";
export type TerritorialRecognitionStatus = "recognized" | "occupied" | "contested";
export type ArmyDoctrine = "defensive" | "balanced" | "offensive";
export type MilitaryUnitType = "infantry" | "armor" | "artillery" | "air_defense" | "logistics";
export type MilitarySupplyType = "food" | "fuel" | "ammunition" | "medical" | "transport";
export type MilitaryOrderStatus = "open" | "partially_filled" | "filled" | "blocked";
export type TreatyType = "peace" | "ceasefire" | "trade" | "defense";
export type TreatyStatus = "draft" | "active" | "broken" | "expired";
export type SanctionType = "trade" | "financial" | "transport" | "arms_embargo";
export type AllianceStance = "defensive" | "offensive" | "neutrality";
export type RefugeeFlowStatus = "moving" | "settled";
export type WarDamageTargetType = "infrastructure_link" | "warehouse" | "city" | "route" | "building";
export type TechnologyDomain = "production" | "logistics" | "medicine" | "weapons" | "education" | "energy" | "agriculture";
export type TechnologyAccessModel = "open" | "patent" | "license" | "trade_secret";
export type TechnologyLevelScope = "country" | "company" | "industry";
export type ResearchProjectStatus = "active" | "completed" | "cancelled";
export type TechnologyOwnerType = "company" | "state" | "university" | "player";
export type LicenseAgreementStatus = "active" | "expired" | "revoked";
export type PollutionType = "air" | "water" | "soil" | "carbon";
export type PollutionSourceType = "production" | "logistics" | "war" | "energy";
export type ResourceDepositStatus = "active" | "depleted" | "undiscovered";
export type CleanEnergyPolicyStatus = "draft" | "active" | "expired";
export type BlackMarketTrigger = "ban" | "shortage" | "high_tax" | "war" | "sanction" | "corruption";
export type IllegalTradeStatus = "pending" | "completed" | "detected" | "confiscated" | "cancelled";
export type InvestigationStatus = "open" | "closed" | "referred";
export type CorruptionCaseStatus = "suspected" | "proven" | "dismissed";
export type FineStatus = "issued" | "paid" | "defaulted";
export type ConfiscationTargetType = "inventory" | "shipment" | "cash";
export type ReputationPenaltyTargetType = "company" | "player";
export type IllegalContractStatus = "draft" | "active" | "fulfilled" | "exposed" | "cancelled";
export type EnforcementOutcome = "none" | "cleared" | "fine" | "confiscation" | "activity_ban";
export type NewsCategory = "economic" | "political" | "military" | "corporate" | "exchange" | "criminal" | "ecological";
export type ExplanationTargetType = "price" | "shortage" | "bankruptcy" | "migration" | "war" | "protest" | "demand" | "logistics" | "country" | "company" | "product";
export type EventCauseType =
  | "demand"
  | "supply"
  | "cost"
  | "logistics"
  | "tax"
  | "shortage"
  | "sanction"
  | "war"
  | "marketing"
  | "credit"
  | "policy"
  | "corruption"
  | "ecology";
export type DataReliabilityGrade = "high" | "medium" | "low" | "manipulated";

export interface GeoPoint {
  readonly lat: number;
  readonly lon: number;
}

export interface GeoPolygon {
  readonly type: "Polygon";
  readonly coordinates: readonly (readonly GeoPoint[])[];
}

export interface Country {
  readonly id: EntityId;
  readonly name: string;
  readonly currencyCode: CurrencyCode;
  readonly politicalSystem: PoliticalRegime;
  readonly geometry: GeoPolygon;
  readonly stability: number;
}

export interface City {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly location: GeoPoint;
  readonly populationTotal: number;
  readonly infrastructureScore: number;
}

export interface Product {
  readonly id: EntityId;
  readonly name: string;
  readonly category: "food" | "energy" | "industrial" | "consumer";
  readonly weightKg: number;
  readonly volumeM3: number;
  readonly shelfLifeDays: number | null;
  readonly baseQuality: number;
  readonly exchangeTradeable: boolean;
  readonly needCategory: NeedCategory | "energy" | "education" | "clothing" | "communications" | "status" | "savings";
}

export interface Company {
  readonly id: EntityId;
  readonly ownerType: "player" | "npc" | "state";
  readonly ownerId: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly legalStatus: "draft" | "registered" | "suspended" | "bankrupt";
  readonly cashBalanceMinor: number;
  readonly currencyCode: CurrencyCode;
  readonly reputation: number;
  readonly bankruptcyStatus: "none" | "warning" | "restructuring" | "auction";
}

export interface CentralBank {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly currencyCode: CurrencyCode;
  readonly policyRate: number;
  readonly reserveRequirement: number;
  readonly baseMoneyMinor: number;
  readonly bondHoldingsMinor: number;
  readonly depositInsuranceEnabled: boolean;
  readonly depositInsuranceLimitMinor: number;
}

export interface CommercialBank {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly currencyCode: CurrencyCode;
  readonly reserveRatio: number;
  readonly riskRating: number;
  readonly capitalMinor: number;
  readonly reservesMinor: number;
  readonly depositsMinor: number;
  readonly loanBookMinor: number;
  readonly nonPerformingLoanMinor: number;
  readonly solvent: boolean;
}

export type Bank = CommercialBank;

export interface PopulationCohort {
  readonly id: EntityId;
  readonly cityId: EntityId;
  readonly size: number;
  readonly incomeLevel: "low" | "middle" | "high";
  readonly ageGroup: "youth" | "adult" | "senior";
  readonly professionGroup: "agriculture" | "industry" | "services" | "public";
  readonly educationLevel: "basic" | "skilled" | "advanced";
  readonly cashBalanceMinor: number;
  readonly satisfaction: number;
}

export interface Warehouse {
  readonly id: EntityId;
  readonly companyId: EntityId;
  readonly cityId: EntityId;
  readonly name: string;
  readonly warehouseType: "general" | "cold_storage" | "bulk" | "port_terminal";
  readonly capacity: number;
  readonly handlingCostMinorPerUnit: number;
}

export interface InventoryLot {
  readonly id: EntityId;
  readonly warehouseId: EntityId;
  readonly productId: EntityId;
  readonly quantity: number;
  readonly quality: number;
}

export interface ProductionInput {
  readonly productId: EntityId;
  readonly quantityPerOutput: number;
}

export interface ProductionPlan {
  readonly id: EntityId;
  readonly companyId: EntityId;
  readonly warehouseId: EntityId;
  readonly outputProductId: EntityId;
  readonly outputQuantityPerTick: number;
  readonly inputs: readonly ProductionInput[];
  readonly active: boolean;
}

export interface RetailOffer {
  readonly id: EntityId;
  readonly companyId: EntityId;
  readonly warehouseId: EntityId;
  readonly productId: EntityId;
  readonly priceMinor: number;
  readonly quality: number;
  readonly active: boolean;
}

export interface RetailPriceChange {
  readonly id: EntityId;
  readonly tick: number;
  readonly playerId: EntityId;
  readonly companyId: EntityId;
  readonly retailOfferId: EntityId;
  readonly productId: EntityId;
  readonly oldPriceMinor: number;
  readonly newPriceMinor: number;
  readonly currencyCode: CurrencyCode;
  readonly status: "applied";
}

export interface ResourceOffer {
  readonly id: EntityId;
  readonly companyId: EntityId;
  readonly warehouseId: EntityId;
  readonly productId: EntityId;
  readonly unitPriceMinor: number;
  readonly quality: number;
  readonly maxQuantityPerTick: number;
  readonly active: boolean;
}

export interface ResourcePurchase {
  readonly id: EntityId;
  readonly tick: number;
  readonly playerId: EntityId;
  readonly buyerCompanyId: EntityId;
  readonly sellerCompanyId: EntityId;
  readonly sellerWarehouseId: EntityId;
  readonly buyerWarehouseId: EntityId;
  readonly productId: EntityId;
  readonly quantity: number;
  readonly unitPriceMinor: number;
  readonly totalPriceMinor: number;
  readonly quality: number;
  readonly status: "completed";
}

export interface ProductionRunInputConsumption {
  readonly productId: EntityId;
  readonly quantity: number;
}

export interface ManualProductionRun {
  readonly id: EntityId;
  readonly tick: number;
  readonly playerId: EntityId;
  readonly companyId: EntityId;
  readonly productionPlanId: EntityId;
  readonly warehouseId: EntityId;
  readonly outputProductId: EntityId;
  readonly requestedQuantity: number;
  readonly producedQuantity: number;
  readonly inputConsumptions: readonly ProductionRunInputConsumption[];
  readonly status: "completed";
}

export interface RouteNode {
  readonly id: EntityId;
  readonly type: "city" | "warehouse" | "port" | "border";
  readonly name: string;
  readonly cityId: EntityId | null;
  readonly location: GeoPoint;
}

export interface InfrastructureLink {
  readonly id: EntityId;
  readonly fromNodeId: EntityId;
  readonly toNodeId: EntityId;
  readonly mode: TransportMode;
  readonly distanceKm: number;
  readonly quality: number;
  readonly capacityPerTick: number;
  readonly baseCostMinorPerUnit: number;
  readonly baseDurationTicks: number;
  readonly blocked: boolean;
  readonly sanctionsBlocked: boolean;
  readonly warDisruptionRisk: number;
}

export interface BorderCrossing {
  readonly id: EntityId;
  readonly name: string;
  readonly fromCountryId: EntityId;
  readonly toCountryId: EntityId;
  readonly nodeId: EntityId;
  readonly open: boolean;
  readonly sanctionLevel: number;
  readonly delayTicks: number;
}

export interface Port {
  readonly id: EntityId;
  readonly cityId: EntityId;
  readonly nodeId: EntityId;
  readonly name: string;
  readonly capacityPerTick: number;
  readonly quality: number;
}

export interface Road {
  readonly id: EntityId;
  readonly infrastructureLinkId: EntityId;
  readonly lanes: number;
  readonly speedLimitKph: number;
}

export interface RailLine {
  readonly id: EntityId;
  readonly infrastructureLinkId: EntityId;
  readonly trackCount: number;
  readonly electrified: boolean;
}

export interface TransportCompany {
  readonly id: EntityId;
  readonly name: string;
  readonly countryId: EntityId;
  readonly mode: TransportMode;
  readonly reliability: number;
  readonly capacityPerTick: number;
  readonly costMultiplier: number;
  readonly cashBalanceMinor: number;
  readonly active: boolean;
}

export interface LogisticsRoute {
  readonly id: EntityId;
  readonly name: string;
  readonly originWarehouseId: EntityId;
  readonly destinationWarehouseId: EntityId;
  readonly nodeIds: readonly EntityId[];
  readonly infrastructureLinkIds: readonly EntityId[];
  readonly transportCompanyId: EntityId;
  readonly mode: TransportMode;
  readonly active: boolean;
  readonly blockedReason: string | null;
}

export interface Shipment {
  readonly id: EntityId;
  readonly originWarehouseId: EntityId;
  readonly destinationWarehouseId: EntityId;
  readonly productId: EntityId;
  readonly quantity: number;
  readonly routeId: EntityId;
  readonly transportCompanyId: EntityId;
  readonly costMinor: number;
  readonly durationTicks: number;
  readonly remainingTicks: number;
  readonly risk: number;
  readonly status: ShipmentStatus;
  readonly createdTick: number;
  readonly departedTick: number | null;
  readonly deliveredTick: number | null;
  readonly blockedReason: string | null;
}

export interface BankAccount {
  readonly id: EntityId;
  readonly bankId: EntityId;
  readonly ownerType: "player" | "company" | "population_cohort" | "bank" | "central_bank" | "state" | "exchange";
  readonly ownerId: EntityId;
  readonly accountType: "checking" | "reserve" | "settlement" | "deposit";
  readonly currencyCode: CurrencyCode;
  readonly balanceMinor: number;
  readonly reservedMinor: number;
  readonly insured: boolean;
  readonly status: "active" | "frozen" | "closed";
}

export interface Loan {
  readonly id: EntityId;
  readonly borrowerType: "company" | "bank";
  readonly borrowerId: EntityId;
  readonly lenderBankId: EntityId;
  readonly principalMinor: number;
  readonly outstandingPrincipalMinor: number;
  readonly accruedInterestMinor: number;
  readonly annualInterestRate: number;
  readonly termTicks: number;
  readonly remainingTicks: number;
  readonly paymentPerTickMinor: number;
  readonly status: LoanStatus;
  readonly issuedTick: number;
  readonly nextPaymentTick: number;
  readonly missedPayments: number;
  readonly collateralCompanyId: EntityId | null;
}

export interface CreditScore {
  readonly id: EntityId;
  readonly borrowerType: "company" | "bank";
  readonly borrowerId: EntityId;
  readonly score: number;
  readonly probabilityOfDefault: number;
  readonly lastUpdatedTick: number;
}

export interface InterestRate {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly centralBankId: EntityId;
  readonly policyRate: number;
  readonly reserveRequirement: number;
  readonly primeRate: number;
  readonly updatedTick: number;
}

export interface Bond {
  readonly id: EntityId;
  readonly issuerType: "state" | "company";
  readonly issuerId: EntityId;
  readonly name: string;
  readonly currencyCode: CurrencyCode;
  readonly faceValueMinor: number;
  readonly couponRate: number;
  readonly maturityTick: number;
  readonly outstandingQuantity: number;
  readonly centralBankEligible: boolean;
  readonly defaulted: boolean;
}

export interface Stock {
  readonly id: EntityId;
  readonly companyId: EntityId;
  readonly ticker: string;
  readonly name: string;
  readonly currencyCode: CurrencyCode;
  readonly sharesOutstanding: number;
  readonly lastPriceMinor: number;
}

export interface Exchange {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly currencyCode: CurrencyCode;
  readonly listedAssetIds: readonly EntityId[];
  readonly open: boolean;
}

export interface Order {
  readonly id: EntityId;
  readonly exchangeId: EntityId;
  readonly ownerType: "player" | "company" | "bank" | "state" | "exchange";
  readonly ownerId: EntityId;
  readonly assetType: FinancialAssetType;
  readonly assetId: EntityId;
  readonly side: OrderSide;
  readonly priceMinor: number;
  readonly quantity: number;
  readonly remainingQuantity: number;
  readonly status: OrderStatus;
  readonly createdTick: number;
}

export interface OrderBook {
  readonly id: EntityId;
  readonly exchangeId: EntityId;
  readonly assetType: FinancialAssetType;
  readonly assetId: EntityId;
  readonly bids: readonly Order[];
  readonly asks: readonly Order[];
  readonly lastPriceMinor: number;
}

export interface Trade {
  readonly id: EntityId;
  readonly exchangeId: EntityId;
  readonly buyOrderId: EntityId;
  readonly sellOrderId: EntityId;
  readonly assetType: FinancialAssetType;
  readonly assetId: EntityId;
  readonly priceMinor: number;
  readonly quantity: number;
  readonly buyerOwnerType: Order["ownerType"];
  readonly buyerOwnerId: EntityId;
  readonly sellerOwnerType: Order["ownerType"];
  readonly sellerOwnerId: EntityId;
  readonly tick: number;
}

export interface PortfolioPosition {
  readonly id: EntityId;
  readonly ownerType: Order["ownerType"];
  readonly ownerId: EntityId;
  readonly assetType: FinancialAssetType;
  readonly assetId: EntityId;
  readonly quantity: number;
  readonly averageCostMinor: number;
}

export interface BankruptcyCase {
  readonly id: EntityId;
  readonly debtorType: "company" | "bank";
  readonly debtorId: EntityId;
  readonly status: BankruptcyCaseStatus;
  readonly openedTick: number;
  readonly resolvedTick: number | null;
  readonly reason: string;
  readonly estimatedAssetsMinor: number;
  readonly claimsMinor: number;
  readonly recoveryRate: number;
}

export interface AssetAuction {
  readonly id: EntityId;
  readonly bankruptcyCaseId: EntityId;
  readonly assetType: "inventory" | "shares" | "loan_book" | "warehouse" | "license";
  readonly assetId: EntityId;
  readonly reservePriceMinor: number;
  readonly highestBidMinor: number;
  readonly highestBidderId: EntityId | null;
  readonly status: "open" | "settled" | "cancelled";
  readonly createdTick: number;
  readonly settledTick: number | null;
}

export interface Government {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly regime: PoliticalRegime;
  readonly rulingPartyId: EntityId;
  readonly stabilityRating: number;
  readonly bureaucracyScore: number;
  readonly legitimacy: number;
  readonly corruptionLevel: number;
  readonly taxEfficiency: number;
  readonly canNationalize: boolean;
  readonly canIssueBonds: boolean;
  readonly importExportControlsActive: boolean;
  readonly depositInsuranceEnabled: boolean;
}

export interface PoliticalParty {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly ideology: "market_liberal" | "social_democrat" | "industrialist" | "national_conservative" | "green";
  readonly popularity: number;
  readonly fundingMinor: number;
  readonly mediaReach: number;
  readonly corruptionTolerance: number;
  readonly policyBias: readonly LawType[];
}

export interface ElectionResult {
  readonly partyId: EntityId;
  readonly npcVotes: number;
  readonly playerVotes: number;
  readonly totalVotes: number;
}

export interface Election {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly status: "scheduled" | "active" | "completed";
  readonly scheduledTick: number;
  readonly lastTick: number;
  readonly winnerPartyId: EntityId | null;
  readonly npcVoteWeight: number;
  readonly playerVoteWeight: number;
  readonly turnout: number;
  readonly results: readonly ElectionResult[];
}

export interface Law {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly type: LawType;
  readonly status: LawStatus;
  readonly parameters: Readonly<Record<string, string | number | boolean>>;
  readonly proposedBy: "developer_template" | "government" | "party";
  readonly support: number;
  readonly economicImpact: number;
  readonly stabilityImpact: number;
  readonly enactedTick: number | null;
}

export interface TaxPolicy {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly profitTaxRate: number;
  readonly salesTaxRate: number;
  readonly importTariffRate: number;
  readonly environmentalFineMinor: number;
  readonly updatedTick: number;
}

export interface GovernmentBudget {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly tick: number;
  readonly revenueMinor: number;
  readonly spendingMinor: number;
  readonly deficitMinor: number;
  readonly treasuryMinor: number;
  readonly welfareSpendingMinor: number;
  readonly infrastructureSpendingMinor: number;
  readonly bailoutSpendingMinor: number;
}

export interface PublicDebt {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly outstandingDebtMinor: number;
  readonly bondIds: readonly EntityId[];
  readonly debtServiceMinor: number;
  readonly creditRating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
}

export interface Subsidy {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly targetType: "industry" | "company" | "population";
  readonly targetId: EntityId;
  readonly amountMinorPerTick: number;
  readonly active: boolean;
}

export interface License {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly companyId: EntityId;
  readonly industry: Product["category"] | NeedCategory;
  readonly lawId: EntityId;
  readonly status: "active" | "missing" | "revoked";
  readonly issuedTick: number;
  readonly expiresTick: number | null;
}

export interface SanctionPolicy {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly targetCountryId: EntityId;
  readonly importBlocked: boolean;
  readonly exportBlocked: boolean;
  readonly tariffRate: number;
  readonly active: boolean;
}

export interface CorruptionIndex {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly value: number;
  readonly trend: number;
  readonly updatedTick: number;
}

export interface Protest {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly cityId: EntityId | null;
  readonly reason: string;
  readonly intensity: number;
  readonly status: "active" | "resolved";
  readonly startedTick: number;
  readonly resolvedTick: number | null;
}

export interface LobbyingAction {
  readonly id: EntityId;
  readonly playerId: EntityId;
  readonly countryId: EntityId;
  readonly targetPartyId: EntityId | null;
  readonly lawType: LawType;
  readonly amountMinor: number;
  readonly influence: number;
  readonly status: "accepted" | "rejected";
  readonly tick: number;
}

export interface MediaInfluence {
  readonly id: EntityId;
  readonly playerId: EntityId;
  readonly countryId: EntityId;
  readonly targetPartyId: EntityId | null;
  readonly message: string;
  readonly spendMinor: number;
  readonly reach: number;
  readonly influence: number;
  readonly tick: number;
}

export interface War {
  readonly id: EntityId;
  readonly name: string;
  readonly attackerCountryId: EntityId;
  readonly defenderCountryId: EntityId;
  readonly status: WarStatus;
  readonly startedTick: number;
  readonly endedTick: number | null;
  readonly intensity: number;
  readonly recognitionScore: number;
  readonly legalStatus: WarLegalStatus;
}

export interface Front {
  readonly id: EntityId;
  readonly warId: EntityId;
  readonly name: string;
  readonly attackerArmyId: EntityId;
  readonly defenderArmyId: EntityId;
  readonly cellIds: readonly EntityId[];
  readonly pressure: number;
  readonly movementDirection: FrontMovementDirection;
  readonly active: boolean;
}

export interface StrategicCell {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly center: GeoPoint;
  readonly sizeKm: number;
  readonly terrain: StrategicCellTerrain;
  readonly legalControllerCountryId: EntityId;
  readonly factualControllerCountryId: EntityId;
  readonly contested: boolean;
  readonly infrastructureScore: number;
  readonly population: number;
  readonly recognitionStatus: TerritorialRecognitionStatus;
}

export interface Army {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly warId: EntityId;
  readonly name: string;
  readonly doctrine: ArmyDoctrine;
  readonly morale: number;
  readonly readiness: number;
  readonly manpower: number;
  readonly fuelStock: number;
  readonly foodStock: number;
  readonly ammunitionStock: number;
}

export interface MilitaryUnitSupplyNeed {
  readonly food: number;
  readonly fuel: number;
  readonly ammunition: number;
}

export interface MilitaryUnit {
  readonly id: EntityId;
  readonly armyId: EntityId;
  readonly cellId: EntityId;
  readonly unitType: MilitaryUnitType;
  readonly strength: number;
  readonly mobility: number;
  readonly supplyNeedPerTick: MilitaryUnitSupplyNeed;
  readonly combatPower: number;
  readonly readiness: number;
}

export interface MilitarySupply {
  readonly id: EntityId;
  readonly armyId: EntityId;
  readonly productId: EntityId;
  readonly supplyType: MilitarySupplyType;
  readonly requestedQuantity: number;
  readonly deliveredQuantity: number;
  readonly consumedQuantity: number;
  readonly shortageQuantity: number;
  readonly tick: number;
}

export interface Occupation {
  readonly id: EntityId;
  readonly warId: EntityId;
  readonly cellId: EntityId;
  readonly occupierCountryId: EntityId;
  readonly legalOwnerCountryId: EntityId;
  readonly startedTick: number;
  readonly recognition: number;
  readonly taxCaptureRate: number;
  readonly infrastructureControl: number;
}

export interface Treaty {
  readonly id: EntityId;
  readonly name: string;
  readonly type: TreatyType;
  readonly countryIds: readonly EntityId[];
  readonly status: TreatyStatus;
  readonly signedTick: number | null;
  readonly expiresTick: number | null;
}

export interface Sanction {
  readonly id: EntityId;
  readonly sourceCountryId: EntityId;
  readonly targetCountryId: EntityId;
  readonly warId: EntityId | null;
  readonly type: SanctionType;
  readonly severity: number;
  readonly active: boolean;
  readonly startedTick: number;
}

export interface Alliance {
  readonly id: EntityId;
  readonly name: string;
  readonly countryIds: readonly EntityId[];
  readonly stance: AllianceStance;
  readonly active: boolean;
}

export interface Blockade {
  readonly id: EntityId;
  readonly warId: EntityId;
  readonly countryId: EntityId;
  readonly routeId: EntityId | null;
  readonly portId: EntityId | null;
  readonly severity: number;
  readonly active: boolean;
  readonly startedTick: number;
}

export interface RefugeeFlow {
  readonly id: EntityId;
  readonly warId: EntityId;
  readonly originCityId: EntityId;
  readonly destinationCityId: EntityId;
  readonly originCellId: EntityId;
  readonly people: number;
  readonly tick: number;
  readonly status: RefugeeFlowStatus;
}

export interface WarDamage {
  readonly id: EntityId;
  readonly warId: EntityId;
  readonly cellId: EntityId;
  readonly targetType: WarDamageTargetType;
  readonly targetId: EntityId;
  readonly severity: number;
  readonly damageMinor: number;
  readonly tick: number;
  readonly repaired: boolean;
}

export interface MilitaryOrder {
  readonly id: EntityId;
  readonly warId: EntityId;
  readonly countryId: EntityId;
  readonly productId: EntityId;
  readonly supplyType: MilitarySupplyType;
  readonly quantity: number;
  readonly fulfilledQuantity: number;
  readonly maxPriceMinor: number;
  readonly status: MilitaryOrderStatus;
  readonly tick: number;
}

export interface TechnologyEffects {
  readonly productionEfficiency: number;
  readonly inputEfficiency: number;
  readonly logisticsEfficiency: number;
  readonly pollutionReduction: number;
  readonly healthBonus: number;
  readonly discoveryBonus: number;
  readonly militaryEfficiency: number;
  readonly educationBonus: number;
  readonly energyEfficiency: number;
}

export interface Technology {
  readonly id: EntityId;
  readonly name: string;
  readonly domain: TechnologyDomain;
  readonly industry: Product["category"] | NeedCategory | "logistics" | "medicine" | "weapons" | "education" | "energy" | "all";
  readonly accessModel: TechnologyAccessModel;
  readonly researchCostMinor: number;
  readonly effects: TechnologyEffects;
  readonly prerequisites: readonly EntityId[];
}

export interface TechnologyLevel {
  readonly id: EntityId;
  readonly technologyId: EntityId;
  readonly scopeType: TechnologyLevelScope;
  readonly scopeId: EntityId;
  readonly level: number;
  readonly unlocked: boolean;
  readonly progress: number;
  readonly updatedTick: number;
}

export interface ResearchProject {
  readonly id: EntityId;
  readonly technologyId: EntityId;
  readonly ownerType: TechnologyOwnerType;
  readonly ownerId: EntityId;
  readonly countryId: EntityId;
  readonly companyId: EntityId | null;
  readonly name: string;
  readonly fundingPerTickMinor: number;
  readonly accumulatedResearch: number;
  readonly requiredResearch: number;
  readonly targetScopeType: TechnologyLevelScope;
  readonly targetScopeId: EntityId;
  readonly status: ResearchProjectStatus;
  readonly startedTick: number;
  readonly completedTick: number | null;
}

export interface Patent {
  readonly id: EntityId;
  readonly technologyId: EntityId;
  readonly ownerType: TechnologyOwnerType;
  readonly ownerId: EntityId;
  readonly countryId: EntityId;
  readonly filedTick: number;
  readonly expiresTick: number | null;
  readonly active: boolean;
}

export interface LicenseAgreement {
  readonly id: EntityId;
  readonly technologyId: EntityId;
  readonly licensorType: TechnologyOwnerType;
  readonly licensorId: EntityId;
  readonly licenseeType: "company" | "state";
  readonly licenseeId: EntityId;
  readonly scopeType: TechnologyLevelScope;
  readonly scopeId: EntityId;
  readonly royaltyRate: number;
  readonly upfrontFeeMinor: number;
  readonly status: LicenseAgreementStatus;
  readonly startedTick: number;
  readonly expiresTick: number | null;
}

export interface Pollution {
  readonly id: EntityId;
  readonly cityId: EntityId;
  readonly countryId: EntityId;
  readonly sourceType: PollutionSourceType;
  readonly sourceId: EntityId;
  readonly type: PollutionType;
  readonly amount: number;
  readonly tick: number;
}

export interface EnvironmentalIndex {
  readonly id: EntityId;
  readonly cityId: EntityId;
  readonly countryId: EntityId;
  readonly airQuality: number;
  readonly waterQuality: number;
  readonly soilQuality: number;
  readonly carbonIntensity: number;
  readonly biodiversity: number;
  readonly healthImpact: number;
  readonly migrationPressure: number;
  readonly updatedTick: number;
}

export interface ResourceDeposit {
  readonly id: EntityId;
  readonly resourceId: EntityId;
  readonly productId: EntityId | null;
  readonly countryId: EntityId;
  readonly cityId: EntityId | null;
  readonly name: string;
  readonly category: Product["category"] | "mineral" | "water" | "land";
  readonly quantity: number;
  readonly initialQuantity: number;
  readonly extractionPerTick: number;
  readonly discoveryChance: number;
  readonly quality: number;
  readonly status: ResourceDepositStatus;
}

export interface ResourceDiscovery {
  readonly id: EntityId;
  readonly depositId: EntityId;
  readonly countryId: EntityId;
  readonly tick: number;
  readonly discoveredBy: "state_survey" | "company_rd" | "migration" | "trade";
  readonly quantity: number;
}

export interface CleanEnergyPolicy {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly status: CleanEnergyPolicyStatus;
  readonly subsidyMinorPerTick: number;
  readonly pollutionReduction: number;
  readonly technologyId: EntityId | null;
  readonly enactedTick: number | null;
}

export interface BlackMarket {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly cityId: EntityId;
  readonly productId: EntityId;
  readonly trigger: BlackMarketTrigger;
  readonly demandQuantity: number;
  readonly supplyQuantity: number;
  readonly priceMultiplier: number;
  readonly riskLevel: number;
  readonly corruptionInfluence: number;
  readonly active: boolean;
  readonly createdTick: number;
  readonly lastUpdatedTick: number;
}

export interface IllegalTrade {
  readonly id: EntityId;
  readonly blackMarketId: EntityId;
  readonly productId: EntityId;
  readonly sellerCompanyId: EntityId;
  readonly buyerOwnerType: "player" | "company";
  readonly buyerOwnerId: EntityId;
  readonly quantity: number;
  readonly priceMinor: number;
  readonly smugglingRouteId: EntityId | null;
  readonly bribeMinor: number;
  readonly detectionRisk: number;
  readonly status: IllegalTradeStatus;
  readonly createdTick: number;
  readonly resolvedTick: number | null;
}

export interface SmugglingRoute {
  readonly id: EntityId;
  readonly name: string;
  readonly originCityId: EntityId;
  readonly destinationCityId: EntityId;
  readonly productId: EntityId | null;
  readonly mode: TransportMode;
  readonly capacityPerTick: number;
  readonly costMinorPerUnit: number;
  readonly baseDetectionRisk: number;
  readonly corruptionShield: number;
  readonly active: boolean;
  readonly blocked: boolean;
}

export interface CorruptionCase {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly companyId: EntityId | null;
  readonly agencyId: EntityId | null;
  readonly illegalTradeId: EntityId | null;
  readonly amountMinor: number;
  readonly severity: number;
  readonly status: CorruptionCaseStatus;
  readonly tick: number;
}

export interface Investigation {
  readonly id: EntityId;
  readonly agencyId: EntityId;
  readonly countryId: EntityId;
  readonly targetType: "black_market" | "illegal_trade" | "company" | "corruption_case";
  readonly targetId: EntityId;
  readonly status: InvestigationStatus;
  readonly suspicion: number;
  readonly detectionChance: number;
  readonly openedTick: number;
  readonly closedTick: number | null;
  readonly outcome: EnforcementOutcome;
}

export interface EnforcementAgency {
  readonly id: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
  readonly controlScore: number;
  readonly capacityPerTick: number;
  readonly corruptionResistance: number;
  readonly mediaSensitivity: number;
  readonly budgetMinor: number;
  readonly active: boolean;
}

export interface Fine {
  readonly id: EntityId;
  readonly targetType: "company" | "player";
  readonly targetId: EntityId;
  readonly amountMinor: number;
  readonly reason: string;
  readonly status: FineStatus;
  readonly tick: number;
  readonly paidTick: number | null;
}

export interface Confiscation {
  readonly id: EntityId;
  readonly illegalTradeId: EntityId;
  readonly agencyId: EntityId;
  readonly targetType: ConfiscationTargetType;
  readonly targetId: EntityId;
  readonly productId: EntityId | null;
  readonly quantity: number;
  readonly valueMinor: number;
  readonly tick: number;
}

export interface ReputationPenalty {
  readonly id: EntityId;
  readonly targetType: ReputationPenaltyTargetType;
  readonly targetId: EntityId;
  readonly amount: number;
  readonly reason: string;
  readonly tick: number;
}

export interface IllegalContract {
  readonly id: EntityId;
  readonly sellerCompanyId: EntityId;
  readonly buyerOwnerType: "player" | "company";
  readonly buyerOwnerId: EntityId;
  readonly productId: EntityId;
  readonly quantity: number;
  readonly priceMinor: number;
  readonly status: IllegalContractStatus;
  readonly riskLevel: number;
  readonly createdTick: number;
  readonly resolvedTick: number | null;
}

export interface DemandRecord {
  readonly id: EntityId;
  readonly tick: number;
  readonly cohortId: EntityId;
  readonly cityId: EntityId;
  readonly needCategory: NeedCategory;
  readonly desiredQuantity: number;
  readonly purchasedQuantity: number;
  readonly unmetQuantity: number;
  readonly spendingMinor: number;
  readonly averagePriceMinor: number;
}

export interface FinancialEntry {
  readonly ownerType: "company" | "population_cohort" | "market_sink" | "bank" | "central_bank" | "bank_account" | "exchange" | "state";
  readonly ownerId: EntityId;
  readonly amountMinor: number;
  readonly currencyCode: CurrencyCode;
}

export interface FinancialTransaction {
  readonly id: EntityId;
  readonly tick: number;
  readonly type:
    | "RetailSaleTransaction"
    | "LoanOriginationTransaction"
    | "LoanPaymentTransaction"
    | "InterestAccrualTransaction"
    | "TradeSettlementTransaction"
    | "BankruptcyRecoveryTransaction"
    | "CentralBankBondPurchaseTransaction"
    | "DepositLossTransaction"
    | "TaxCollectionTransaction"
    | "GovernmentSpendingTransaction"
    | "SubsidyPaymentTransaction"
    | "GovernmentBondIssuanceTransaction"
    | "NationalizationTransaction"
    | "LobbyingPaymentTransaction"
    | "MediaCampaignTransaction"
    | "ResearchInvestmentTransaction"
    | "CleanEnergySubsidyTransaction"
    | "ResourcePurchaseTransaction"
    | "LandPremiseTransaction"
    | "IllegalTradeTransaction"
    | "FinePaymentTransaction"
    | "ConfiscationTransaction"
    | "CorruptionPaymentTransaction";
  readonly entries: readonly FinancialEntry[];
}

export interface NewsItem {
  readonly id: EntityId;
  readonly tick: number;
  readonly category?: NewsCategory;
  readonly templateId?: EntityId | null;
  readonly headline: string;
  readonly body: string;
  readonly severity: "info" | "warning" | "critical";
  readonly relatedEntityIds: readonly EntityId[];
  readonly reliabilityId?: EntityId | null;
}

export interface EventCause {
  readonly id: EntityId;
  readonly eventId: EntityId;
  readonly tick: number;
  readonly causeType: EventCauseType;
  readonly sourceType: string;
  readonly sourceId: EntityId | null;
  readonly description: string;
  readonly weight: number;
}

export interface EventImpact {
  readonly id: EntityId;
  readonly eventId: EntityId;
  readonly tick: number;
  readonly targetType: string;
  readonly targetId: EntityId | null;
  readonly metricName: string;
  readonly beforeValue: number | null;
  readonly afterValue: number | null;
  readonly delta: number;
  readonly severity: number;
}

export interface MetricChange {
  readonly id: EntityId;
  readonly tick: number;
  readonly metricName: string;
  readonly entityType: string;
  readonly entityId: EntityId | null;
  readonly previousValue: number;
  readonly currentValue: number;
  readonly delta: number;
  readonly percentChange: number;
}

export interface ExplanationCauseContribution {
  readonly label: string;
  readonly causeType: EventCauseType;
  readonly value: number;
  readonly weight: number;
}

export interface Explanation {
  readonly id: EntityId;
  readonly tick: number;
  readonly targetType: ExplanationTargetType;
  readonly targetId: EntityId;
  readonly eventId: EntityId | null;
  readonly title: string;
  readonly summary: string;
  readonly confidence: number;
  readonly reliabilityId: EntityId | null;
  readonly causes: readonly ExplanationCauseContribution[];
  readonly impactIds: readonly EntityId[];
  readonly relatedMetricIds: readonly EntityId[];
  readonly relatedEntityIds: readonly EntityId[];
}

export interface NewsTemplate {
  readonly id: EntityId;
  readonly category: NewsCategory;
  readonly eventType: string;
  readonly headlineTemplate: string;
  readonly bodyTemplate: string;
  readonly severity: NewsItem["severity"];
  readonly active: boolean;
}

export interface Forecast {
  readonly id: EntityId;
  readonly tick: number;
  readonly targetType: "country" | "product" | "market" | "logistics" | "company";
  readonly targetId: EntityId;
  readonly metricName: string;
  readonly currentValue: number;
  readonly predictedValue: number;
  readonly horizonTicks: number;
  readonly confidence: number;
  readonly scenario: "baseline" | "optimistic" | "stress";
  readonly driverExplanationIds: readonly EntityId[];
}

export interface DataReliability {
  readonly id: EntityId;
  readonly countryId: EntityId | null;
  readonly source: "market" | "state" | "exchange" | "media" | "sensor" | "audit";
  readonly grade: DataReliabilityGrade;
  readonly score: number;
  readonly manipulationRisk: number;
  readonly method: string;
  readonly updatedTick: number;
}

export interface PublicStatistic {
  readonly id: EntityId;
  readonly tick: number;
  readonly countryId: EntityId;
  readonly metricName: string;
  readonly value: number;
  readonly unit: "minor" | "ratio" | "count" | "index";
  readonly reliabilityId: EntityId;
  readonly source: DataReliability["source"];
  readonly distorted: boolean;
}

export interface HiddenStatistic {
  readonly id: EntityId;
  readonly tick: number;
  readonly ownerType: "company" | "bank" | "state" | "player";
  readonly ownerId: EntityId;
  readonly metricName: string;
  readonly value: number;
  readonly unit: "minor" | "ratio" | "count" | "index";
  readonly visibilityReason: string;
}

export interface Contract {
  readonly id: EntityId;
  readonly buyerCompanyId: EntityId;
  readonly sellerCompanyId: EntityId;
  readonly productId: EntityId;
  readonly quantity: number;
  readonly status: "draft" | "active" | "fulfilled" | "breached";
}

export interface DomainEvent {
  readonly id: EntityId;
  readonly tick: number;
  readonly type: string;
  readonly message: string;
  readonly entityIds: readonly EntityId[];
  readonly metadata: Readonly<Record<string, string | number | boolean>>;
}

export interface Metric {
  readonly id: EntityId;
  readonly tick: number;
  readonly name: string;
  readonly value: number;
  readonly tags: Readonly<Record<string, string>>;
}

export interface Snapshot {
  readonly id: EntityId;
  readonly tick: number;
  readonly createdAt: string;
  readonly stateHash: string;
}

export interface WorldState {
  readonly currentTick: number;
  readonly currentDate: string;
  readonly countries: readonly Country[];
  readonly cities: readonly City[];
  readonly products: readonly Product[];
  readonly companies: readonly Company[];
  readonly centralBanks: readonly CentralBank[];
  readonly banks: readonly Bank[];
  readonly bankAccounts: readonly BankAccount[];
  readonly loans: readonly Loan[];
  readonly creditScores: readonly CreditScore[];
  readonly interestRates: readonly InterestRate[];
  readonly bonds: readonly Bond[];
  readonly stocks: readonly Stock[];
  readonly exchanges: readonly Exchange[];
  readonly orderBooks: readonly OrderBook[];
  readonly trades: readonly Trade[];
  readonly portfolioPositions: readonly PortfolioPosition[];
  readonly bankruptcies: readonly BankruptcyCase[];
  readonly assetAuctions: readonly AssetAuction[];
  readonly governments: readonly Government[];
  readonly politicalParties: readonly PoliticalParty[];
  readonly elections: readonly Election[];
  readonly laws: readonly Law[];
  readonly taxPolicies: readonly TaxPolicy[];
  readonly governmentBudgets: readonly GovernmentBudget[];
  readonly publicDebt: readonly PublicDebt[];
  readonly subsidies: readonly Subsidy[];
  readonly licenses: readonly License[];
  readonly sanctionPolicies: readonly SanctionPolicy[];
  readonly corruptionIndexes: readonly CorruptionIndex[];
  readonly protests: readonly Protest[];
  readonly lobbyingActions: readonly LobbyingAction[];
  readonly mediaInfluences: readonly MediaInfluence[];
  readonly wars: readonly War[];
  readonly fronts: readonly Front[];
  readonly strategicCells: readonly StrategicCell[];
  readonly armies: readonly Army[];
  readonly militaryUnits: readonly MilitaryUnit[];
  readonly militarySupplies: readonly MilitarySupply[];
  readonly occupations: readonly Occupation[];
  readonly treaties: readonly Treaty[];
  readonly sanctions: readonly Sanction[];
  readonly alliances: readonly Alliance[];
  readonly blockades: readonly Blockade[];
  readonly refugeeFlows: readonly RefugeeFlow[];
  readonly warDamage: readonly WarDamage[];
  readonly militaryOrders: readonly MilitaryOrder[];
  readonly technologies: readonly Technology[];
  readonly technologyLevels: readonly TechnologyLevel[];
  readonly researchProjects: readonly ResearchProject[];
  readonly patents: readonly Patent[];
  readonly licenseAgreements: readonly LicenseAgreement[];
  readonly pollution: readonly Pollution[];
  readonly environmentalIndexes: readonly EnvironmentalIndex[];
  readonly resourceDeposits: readonly ResourceDeposit[];
  readonly resourceDiscoveries: readonly ResourceDiscovery[];
  readonly cleanEnergyPolicies: readonly CleanEnergyPolicy[];
  readonly blackMarkets: readonly BlackMarket[];
  readonly illegalTrades: readonly IllegalTrade[];
  readonly smugglingRoutes: readonly SmugglingRoute[];
  readonly corruptionCases: readonly CorruptionCase[];
  readonly investigations: readonly Investigation[];
  readonly enforcementAgencies: readonly EnforcementAgency[];
  readonly fines: readonly Fine[];
  readonly confiscations: readonly Confiscation[];
  readonly reputationPenalties: readonly ReputationPenalty[];
  readonly illegalContracts: readonly IllegalContract[];
  readonly populationCohorts: readonly PopulationCohort[];
  readonly contracts: readonly Contract[];
  readonly warehouses: readonly Warehouse[];
  readonly inventoryLots: readonly InventoryLot[];
  readonly shipments: readonly Shipment[];
  readonly logisticsRoutes: readonly LogisticsRoute[];
  readonly transportCompanies: readonly TransportCompany[];
  readonly routeNodes: readonly RouteNode[];
  readonly infrastructureLinks: readonly InfrastructureLink[];
  readonly borderCrossings: readonly BorderCrossing[];
  readonly ports: readonly Port[];
  readonly roads: readonly Road[];
  readonly railLines: readonly RailLine[];
  readonly productionPlans: readonly ProductionPlan[];
  readonly retailOffers: readonly RetailOffer[];
  readonly retailPriceChanges: readonly RetailPriceChange[];
  readonly resourceOffers: readonly ResourceOffer[];
  readonly resourcePurchases: readonly ResourcePurchase[];
  readonly manualProductionRuns: readonly ManualProductionRun[];
  readonly demandRecords: readonly DemandRecord[];
  readonly financialTransactions: readonly FinancialTransaction[];
  readonly news: readonly NewsItem[];
  readonly eventCauses: readonly EventCause[];
  readonly eventImpacts: readonly EventImpact[];
  readonly metricChanges: readonly MetricChange[];
  readonly explanations: readonly Explanation[];
  readonly newsTemplates: readonly NewsTemplate[];
  readonly forecasts: readonly Forecast[];
  readonly publicStatistics: readonly PublicStatistic[];
  readonly hiddenStatistics: readonly HiddenStatistic[];
  readonly dataReliability: readonly DataReliability[];
  readonly events: readonly DomainEvent[];
  readonly metrics: readonly Metric[];
  readonly snapshots: readonly Snapshot[];
}

export interface CreateCompanyCommand {
  readonly type: "CreateCompanyCommand";
  readonly commandId: EntityId;
  readonly playerId: EntityId;
  readonly countryId: EntityId;
  readonly name: string;
}

export interface BuyLandCommand {
  readonly type: "BuyLandCommand";
  readonly commandId: EntityId;
  readonly playerId: EntityId;
  readonly companyId: EntityId;
  readonly cityId: EntityId;
  readonly lotId: EntityId;
  readonly mode?: "purchase" | "lease";
}

export interface BuyResourceCommand {
  readonly type: "BuyResourceCommand";
  readonly commandId: EntityId;
  readonly playerId: EntityId;
  readonly buyerCompanyId: EntityId;
  readonly resourceOfferId: EntityId;
  readonly quantity: number;
  readonly maxUnitPriceMinor: number;
  readonly buyerWarehouseId?: EntityId;
}

export interface RunManualProductionCommand {
  readonly type: "RunManualProductionCommand";
  readonly commandId: EntityId;
  readonly playerId: EntityId;
  readonly companyId: EntityId;
  readonly productionPlanId: EntityId;
  readonly requestedQuantity: number;
}

export interface SetRetailPriceCommand {
  readonly type: "SetRetailPriceCommand";
  readonly commandId: EntityId;
  readonly playerId: EntityId;
  readonly companyId: EntityId;
  readonly productId: EntityId;
  readonly priceMinor: number;
  readonly currencyCode: CurrencyCode;
}

export type PlayerCommand = CreateCompanyCommand | BuyLandCommand | BuyResourceCommand | RunManualProductionCommand | SetRetailPriceCommand;

export const ECONOMY_INVARIANTS = [
  "Money changes only through balanced ledger transactions.",
  "Player intent enters the world as backend-validated commands applied on simulation ticks.",
  "Inventory moves only by warehouse to cargo batch to warehouse.",
  "Loans and market orders are validated by simulation-core before balances change.",
  "Ordinary retail goods clear through retail markets, not exchange order books.",
  "Players influence governments through votes, funding, lobbying, and media rather than becoming politicians.",
  "Wars are automated state conflicts; players participate through economic supply, finance, and logistics only.",
  "Strategic cells keep factual and legal territorial control separate.",
  "R&D changes technology levels through validated research projects, patents, or license agreements.",
  "Resource deposits, pollution, and environmental health are tick-updated simulation state.",
  "Taxes, subsidies, nationalization, and bailouts must be represented as auditable financial transactions.",
  "Black market trades are backend-validated risky commands, never direct player balance or inventory edits.",
  "B2B resource purchases move inventory through warehouse records and settle money through balanced ledger transactions on tick commands.",
  "Player land, resource, production, and retail operations change state only through backend-bound tick commands.",
  "Fines, confiscations, bribes, and illegal proceeds are auditable financial transactions and enforcement events.",
  "Important world changes must produce explainable causes, impacts, metrics, and news.",
  "Private company finances stay hidden unless the company is publicly listed.",
  "Public statistics carry reliability and manipulation-risk metadata.",
  "Important actions create audit log records, events, and metrics."
] as const;

export function createInitialWorldState(seed = "demo"): WorldState {
  const createdAt = "2026-01-01T00:00:00.000Z";

  return {
    currentTick: 0,
    currentDate: createdAt,
    countries: [
      {
        id: `${seed}-country-north-coast`,
        name: "North Coast Republic",
        currencyCode: "NCR",
        politicalSystem: "federal_republic",
        stability: 0.72,
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              { lat: 52.1, lon: 13.1 },
              { lat: 54.4, lon: 16.8 },
              { lat: 51.9, lon: 20.4 },
              { lat: 49.8, lon: 16.2 },
              { lat: 52.1, lon: 13.1 }
            ]
          ]
        }
      },
      {
        id: `${seed}-country-south-union`,
        name: "South Union",
        currencyCode: "SOV",
        politicalSystem: "constitutional_monarchy",
        stability: 0.64,
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              { lat: 45.2, lon: 8.4 },
              { lat: 47.9, lon: 12.6 },
              { lat: 44.4, lon: 17.9 },
              { lat: 41.9, lon: 13.2 },
              { lat: 45.2, lon: 8.4 }
            ]
          ]
        }
      }
    ],
    cities: [
      {
        id: `${seed}-city-harborview`,
        countryId: `${seed}-country-north-coast`,
        name: "Harborview",
        location: { lat: 53.2, lon: 15.7 },
        populationTotal: 1_280_000,
        infrastructureScore: 0.78
      },
      {
        id: `${seed}-city-grainford`,
        countryId: `${seed}-country-north-coast`,
        name: "Grainford",
        location: { lat: 51.3, lon: 18.4 },
        populationTotal: 420_000,
        infrastructureScore: 0.61
      },
      {
        id: `${seed}-city-sunport`,
        countryId: `${seed}-country-south-union`,
        name: "Sunport",
        location: { lat: 44.1, lon: 13.8 },
        populationTotal: 890_000,
        infrastructureScore: 0.69
      }
    ],
    products: [
      {
        id: `${seed}-product-wheat`,
        name: "Wheat",
        category: "food",
        weightKg: 1,
        volumeM3: 0.0014,
        shelfLifeDays: 180,
        baseQuality: 0.55,
        exchangeTradeable: true,
        needCategory: "food"
      },
      {
        id: `${seed}-product-bread`,
        name: "Bread",
        category: "food",
        weightKg: 0.5,
        volumeM3: 0.002,
        shelfLifeDays: 3,
        baseQuality: 0.62,
        exchangeTradeable: false,
        needCategory: "food"
      },
      {
        id: `${seed}-product-electricity`,
        name: "Electricity",
        category: "energy",
        weightKg: 0,
        volumeM3: 0,
        shelfLifeDays: null,
        baseQuality: 0.7,
        exchangeTradeable: false,
        needCategory: "energy"
      },
      {
        id: `${seed}-product-apartment-rent`,
        name: "Apartment Rent",
        category: "consumer",
        weightKg: 0,
        volumeM3: 0,
        shelfLifeDays: null,
        baseQuality: 0.58,
        exchangeTradeable: false,
        needCategory: "housing"
      },
      {
        id: `${seed}-product-bus-ticket`,
        name: "Bus Ticket",
        category: "consumer",
        weightKg: 0,
        volumeM3: 0,
        shelfLifeDays: null,
        baseQuality: 0.52,
        exchangeTradeable: false,
        needCategory: "transport"
      },
      {
        id: `${seed}-product-clinic-visit`,
        name: "Clinic Visit",
        category: "consumer",
        weightKg: 0,
        volumeM3: 0,
        shelfLifeDays: null,
        baseQuality: 0.64,
        exchangeTradeable: false,
        needCategory: "medicine"
      },
      {
        id: `${seed}-product-cinema-ticket`,
        name: "Cinema Ticket",
        category: "consumer",
        weightKg: 0,
        volumeM3: 0,
        shelfLifeDays: null,
        baseQuality: 0.57,
        exchangeTradeable: false,
        needCategory: "entertainment"
      },
      {
        id: `${seed}-product-diesel`,
        name: "Diesel Fuel",
        category: "energy",
        weightKg: 0.85,
        volumeM3: 0.001,
        shelfLifeDays: null,
        baseQuality: 0.58,
        exchangeTradeable: false,
        needCategory: "energy"
      },
      {
        id: `${seed}-product-ammunition`,
        name: "Ammunition",
        category: "industrial",
        weightKg: 1,
        volumeM3: 0.002,
        shelfLifeDays: null,
        baseQuality: 0.54,
        exchangeTradeable: false,
        needCategory: "status"
      },
      {
        id: `${seed}-product-field-rations`,
        name: "Field Rations",
        category: "food",
        weightKg: 0.7,
        volumeM3: 0.002,
        shelfLifeDays: 60,
        baseQuality: 0.55,
        exchangeTradeable: false,
        needCategory: "food"
      }
    ],
    companies: [
      {
        id: `${seed}-company-harbor-bakery`,
        ownerType: "npc",
        ownerId: `${seed}-npc-food-operator`,
        countryId: `${seed}-country-north-coast`,
        name: "Harbor Bakery",
        legalStatus: "registered",
        cashBalanceMinor: 250_000_00,
        currencyCode: "NCR",
        reputation: 0.61,
        bankruptcyStatus: "none"
      },
      {
        id: `${seed}-company-urban-homes`,
        ownerType: "npc",
        ownerId: `${seed}-npc-housing-operator`,
        countryId: `${seed}-country-north-coast`,
        name: "Urban Homes",
        legalStatus: "registered",
        cashBalanceMinor: 400_000_00,
        currencyCode: "NCR",
        reputation: 0.58,
        bankruptcyStatus: "none"
      },
      {
        id: `${seed}-company-city-transit`,
        ownerType: "state",
        ownerId: `${seed}-country-north-coast`,
        countryId: `${seed}-country-north-coast`,
        name: "City Transit",
        legalStatus: "registered",
        cashBalanceMinor: 150_000_00,
        currencyCode: "NCR",
        reputation: 0.55,
        bankruptcyStatus: "none"
      },
      {
        id: `${seed}-company-healthpoint`,
        ownerType: "npc",
        ownerId: `${seed}-npc-health-operator`,
        countryId: `${seed}-country-north-coast`,
        name: "HealthPoint",
        legalStatus: "registered",
        cashBalanceMinor: 180_000_00,
        currencyCode: "NCR",
        reputation: 0.64,
        bankruptcyStatus: "none"
      },
      {
        id: `${seed}-company-evening-house`,
        ownerType: "npc",
        ownerId: `${seed}-npc-entertainment-operator`,
        countryId: `${seed}-country-north-coast`,
        name: "Evening House",
        legalStatus: "registered",
        cashBalanceMinor: 90_000_00,
        currencyCode: "NCR",
        reputation: 0.5,
        bankruptcyStatus: "none"
      }
    ],
    centralBanks: [
      {
        id: `${seed}-central-bank-ncr`,
        countryId: `${seed}-country-north-coast`,
        name: "North Coast Central Bank",
        currencyCode: "NCR",
        policyRate: 0.045,
        reserveRequirement: 0.12,
        baseMoneyMinor: 1_500_000_00,
        bondHoldingsMinor: 100_000_00,
        depositInsuranceEnabled: false,
        depositInsuranceLimitMinor: 0
      }
    ],
    banks: [
      {
        id: `${seed}-bank-civic-reserve`,
        countryId: `${seed}-country-north-coast`,
        name: "Civic Reserve Bank",
        currencyCode: "NCR",
        reserveRatio: 0.12,
        riskRating: 0.24,
        capitalMinor: 80_000_00,
        reservesMinor: 90_000_00,
        depositsMinor: 550_000_00,
        loanBookMinor: 160_000_00,
        nonPerformingLoanMinor: 0,
        solvent: true
      }
    ],
    bankAccounts: [
      {
        id: `${seed}-account-player-1`,
        bankId: `${seed}-bank-civic-reserve`,
        ownerType: "player",
        ownerId: "player-1",
        accountType: "checking",
        currencyCode: "NCR",
        balanceMinor: 1_000_000_00,
        reservedMinor: 0,
        insured: false,
        status: "active"
      },
      {
        id: `${seed}-account-harbor-bakery`,
        bankId: `${seed}-bank-civic-reserve`,
        ownerType: "company",
        ownerId: `${seed}-company-harbor-bakery`,
        accountType: "checking",
        currencyCode: "NCR",
        balanceMinor: 250_000_00,
        reservedMinor: 0,
        insured: false,
        status: "active"
      },
      {
        id: `${seed}-account-market-maker`,
        bankId: `${seed}-bank-civic-reserve`,
        ownerType: "exchange",
        ownerId: `${seed}-market-maker`,
        accountType: "settlement",
        currencyCode: "NCR",
        balanceMinor: 2_500_000_00,
        reservedMinor: 0,
        insured: false,
        status: "active"
      },
      {
        id: `${seed}-account-civic-reserve-reserves`,
        bankId: `${seed}-bank-civic-reserve`,
        ownerType: "bank",
        ownerId: `${seed}-bank-civic-reserve`,
        accountType: "reserve",
        currencyCode: "NCR",
        balanceMinor: 90_000_00,
        reservedMinor: 0,
        insured: false,
        status: "active"
      }
    ],
    loans: [
      {
        id: `${seed}-loan-harbor-bakery-working-capital`,
        borrowerType: "company",
        borrowerId: `${seed}-company-harbor-bakery`,
        lenderBankId: `${seed}-bank-civic-reserve`,
        principalMinor: 20_000_00,
        outstandingPrincipalMinor: 20_000_00,
        accruedInterestMinor: 0,
        annualInterestRate: 0.095,
        termTicks: 120,
        remainingTicks: 120,
        paymentPerTickMinor: 25_000,
        status: "active",
        issuedTick: 0,
        nextPaymentTick: 1,
        missedPayments: 0,
        collateralCompanyId: `${seed}-company-harbor-bakery`
      }
    ],
    creditScores: [
      {
        id: `${seed}-credit-company-harbor-bakery`,
        borrowerType: "company",
        borrowerId: `${seed}-company-harbor-bakery`,
        score: 0.72,
        probabilityOfDefault: 0.08,
        lastUpdatedTick: 0
      }
    ],
    interestRates: [
      {
        id: `${seed}-rate-ncr-prime`,
        countryId: `${seed}-country-north-coast`,
        centralBankId: `${seed}-central-bank-ncr`,
        policyRate: 0.045,
        reserveRequirement: 0.12,
        primeRate: 0.075,
        updatedTick: 0
      }
    ],
    bonds: [
      {
        id: `${seed}-bond-ncr-10y`,
        issuerType: "state",
        issuerId: `${seed}-country-north-coast`,
        name: "North Coast 10Y Treasury",
        currencyCode: "NCR",
        faceValueMinor: 100_000,
        couponRate: 0.052,
        maturityTick: 87_600,
        outstandingQuantity: 20_000,
        centralBankEligible: true,
        defaulted: false
      }
    ],
    stocks: [
      {
        id: `${seed}-stock-harbor-bakery`,
        companyId: `${seed}-company-harbor-bakery`,
        ticker: "HBRB",
        name: "Harbor Bakery Common Stock",
        currencyCode: "NCR",
        sharesOutstanding: 1_000_000,
        lastPriceMinor: 1_200
      }
    ],
    exchanges: [
      {
        id: `${seed}-exchange-north`,
        countryId: `${seed}-country-north-coast`,
        name: "North Coast Exchange",
        currencyCode: "NCR",
        listedAssetIds: [`${seed}-stock-harbor-bakery`, `${seed}-bond-ncr-10y`, `${seed}-product-wheat`],
        open: true
      }
    ],
    orderBooks: [
      {
        id: `${seed}-book-stock-harbor-bakery`,
        exchangeId: `${seed}-exchange-north`,
        assetType: "stock",
        assetId: `${seed}-stock-harbor-bakery`,
        lastPriceMinor: 1_200,
        bids: [
          {
            id: `${seed}-order-bid-harbor-stock`,
            exchangeId: `${seed}-exchange-north`,
            ownerType: "exchange",
            ownerId: `${seed}-market-maker`,
            assetType: "stock",
            assetId: `${seed}-stock-harbor-bakery`,
            side: "buy",
            priceMinor: 1_150,
            quantity: 500,
            remainingQuantity: 500,
            status: "open",
            createdTick: 0
          }
        ],
        asks: [
          {
            id: `${seed}-order-ask-harbor-stock`,
            exchangeId: `${seed}-exchange-north`,
            ownerType: "exchange",
            ownerId: `${seed}-market-maker`,
            assetType: "stock",
            assetId: `${seed}-stock-harbor-bakery`,
            side: "sell",
            priceMinor: 1_200,
            quantity: 1_000,
            remainingQuantity: 1_000,
            status: "open",
            createdTick: 0
          }
        ]
      },
      {
        id: `${seed}-book-bond-ncr-10y`,
        exchangeId: `${seed}-exchange-north`,
        assetType: "bond",
        assetId: `${seed}-bond-ncr-10y`,
        lastPriceMinor: 99_000,
        bids: [],
        asks: [
          {
            id: `${seed}-order-ask-ncr-bond`,
            exchangeId: `${seed}-exchange-north`,
            ownerType: "exchange",
            ownerId: `${seed}-market-maker`,
            assetType: "bond",
            assetId: `${seed}-bond-ncr-10y`,
            side: "sell",
            priceMinor: 99_000,
            quantity: 120,
            remainingQuantity: 120,
            status: "open",
            createdTick: 0
          }
        ]
      },
      {
        id: `${seed}-book-wheat`,
        exchangeId: `${seed}-exchange-north`,
        assetType: "commodity",
        assetId: `${seed}-product-wheat`,
        lastPriceMinor: 110,
        bids: [],
        asks: [
          {
            id: `${seed}-order-ask-wheat`,
            exchangeId: `${seed}-exchange-north`,
            ownerType: "exchange",
            ownerId: `${seed}-market-maker`,
            assetType: "commodity",
            assetId: `${seed}-product-wheat`,
            side: "sell",
            priceMinor: 110,
            quantity: 4_000,
            remainingQuantity: 4_000,
            status: "open",
            createdTick: 0
          }
        ]
      }
    ],
    trades: [],
    portfolioPositions: [
      {
        id: `${seed}-position-market-maker-stock`,
        ownerType: "exchange",
        ownerId: `${seed}-market-maker`,
        assetType: "stock",
        assetId: `${seed}-stock-harbor-bakery`,
        quantity: 25_000,
        averageCostMinor: 900
      },
      {
        id: `${seed}-position-market-maker-bond`,
        ownerType: "exchange",
        ownerId: `${seed}-market-maker`,
        assetType: "bond",
        assetId: `${seed}-bond-ncr-10y`,
        quantity: 1_000,
        averageCostMinor: 98_000
      },
      {
        id: `${seed}-position-market-maker-wheat`,
        ownerType: "exchange",
        ownerId: `${seed}-market-maker`,
        assetType: "commodity",
        assetId: `${seed}-product-wheat`,
        quantity: 50_000,
        averageCostMinor: 90
      }
    ],
    bankruptcies: [],
    assetAuctions: [],
    governments: [
      {
        id: `${seed}-government-north-coast`,
        countryId: `${seed}-country-north-coast`,
        name: "North Coast Cabinet",
        regime: "federal_republic",
        rulingPartyId: `${seed}-party-civic-growth`,
        stabilityRating: 0.72,
        bureaucracyScore: 0.64,
        legitimacy: 0.68,
        corruptionLevel: 0.18,
        taxEfficiency: 0.84,
        canNationalize: true,
        canIssueBonds: true,
        importExportControlsActive: true,
        depositInsuranceEnabled: false
      },
      {
        id: `${seed}-government-south-union`,
        countryId: `${seed}-country-south-union`,
        name: "South Union Council",
        regime: "constitutional_monarchy",
        rulingPartyId: `${seed}-party-union-stability`,
        stabilityRating: 0.64,
        bureaucracyScore: 0.56,
        legitimacy: 0.61,
        corruptionLevel: 0.27,
        taxEfficiency: 0.74,
        canNationalize: true,
        canIssueBonds: true,
        importExportControlsActive: true,
        depositInsuranceEnabled: false
      }
    ],
    politicalParties: [
      {
        id: `${seed}-party-civic-growth`,
        countryId: `${seed}-country-north-coast`,
        name: "Civic Growth Party",
        ideology: "market_liberal",
        popularity: 0.42,
        fundingMinor: 2_500_000,
        mediaReach: 0.35,
        corruptionTolerance: 0.18,
        policyBias: ["profit_tax", "deposit_insurance", "bank_bailout"]
      },
      {
        id: `${seed}-party-labor-commons`,
        countryId: `${seed}-country-north-coast`,
        name: "Labor Commons",
        ideology: "social_democrat",
        popularity: 0.37,
        fundingMinor: 1_800_000,
        mediaReach: 0.31,
        corruptionTolerance: 0.12,
        policyBias: ["sales_tax", "environmental_fine", "nationalization"]
      },
      {
        id: `${seed}-party-union-stability`,
        countryId: `${seed}-country-south-union`,
        name: "Union Stability Front",
        ideology: "national_conservative",
        popularity: 0.49,
        fundingMinor: 1_600_000,
        mediaReach: 0.3,
        corruptionTolerance: 0.32,
        policyBias: ["import_tariff", "export_restriction", "martial_law"]
      }
    ],
    elections: [
      {
        id: `${seed}-election-north-coast`,
        countryId: `${seed}-country-north-coast`,
        status: "active",
        scheduledTick: 720,
        lastTick: 0,
        winnerPartyId: null,
        npcVoteWeight: 25,
        playerVoteWeight: 1,
        turnout: 0.61,
        results: [
          {
            partyId: `${seed}-party-civic-growth`,
            npcVotes: 2_600_000,
            playerVotes: 0,
            totalVotes: 2_600_000
          },
          {
            partyId: `${seed}-party-labor-commons`,
            npcVotes: 2_220_000,
            playerVotes: 0,
            totalVotes: 2_220_000
          }
        ]
      }
    ],
    laws: [
      {
        id: `${seed}-law-profit-tax`,
        countryId: `${seed}-country-north-coast`,
        name: "Corporate Profit Tax",
        type: "profit_tax",
        status: "active",
        parameters: { rate: 0.12 },
        proposedBy: "developer_template",
        support: 0.64,
        economicImpact: -0.04,
        stabilityImpact: 0.03,
        enactedTick: 0
      },
      {
        id: `${seed}-law-sales-tax`,
        countryId: `${seed}-country-north-coast`,
        name: "Retail Sales Tax",
        type: "sales_tax",
        status: "active",
        parameters: { rate: 0.05 },
        proposedBy: "developer_template",
        support: 0.58,
        economicImpact: -0.02,
        stabilityImpact: 0.02,
        enactedTick: 0
      },
      {
        id: `${seed}-law-import-tariff`,
        countryId: `${seed}-country-north-coast`,
        name: "Strategic Import Tariff",
        type: "import_tariff",
        status: "active",
        parameters: { rate: 0.08 },
        proposedBy: "developer_template",
        support: 0.52,
        economicImpact: -0.01,
        stabilityImpact: 0.01,
        enactedTick: 0
      },
      {
        id: `${seed}-law-export-restriction`,
        countryId: `${seed}-country-north-coast`,
        name: "Food Export Restriction",
        type: "export_restriction",
        status: "active",
        parameters: { productCategory: "food", capPerTick: 20_000 },
        proposedBy: "developer_template",
        support: 0.57,
        economicImpact: -0.03,
        stabilityImpact: 0.04,
        enactedTick: 0
      },
      {
        id: `${seed}-law-industry-license`,
        countryId: `${seed}-country-north-coast`,
        name: "Food Industry License",
        type: "industry_license",
        status: "active",
        parameters: { industry: "food" },
        proposedBy: "developer_template",
        support: 0.62,
        economicImpact: -0.02,
        stabilityImpact: 0.02,
        enactedTick: 0
      },
      {
        id: `${seed}-law-environmental-fine`,
        countryId: `${seed}-country-north-coast`,
        name: "Environmental Compliance Fine",
        type: "environmental_fine",
        status: "active",
        parameters: { productCategory: "industrial", fineMinor: 12_000 },
        proposedBy: "developer_template",
        support: 0.6,
        economicImpact: -0.01,
        stabilityImpact: 0.02,
        enactedTick: 0
      },
      {
        id: `${seed}-law-martial-law`,
        countryId: `${seed}-country-north-coast`,
        name: "Emergency Martial Law",
        type: "martial_law",
        status: "draft",
        parameters: { stabilityThreshold: 0.35 },
        proposedBy: "developer_template",
        support: 0.22,
        economicImpact: -0.12,
        stabilityImpact: 0.06,
        enactedTick: null
      },
      {
        id: `${seed}-law-nationalization`,
        countryId: `${seed}-country-north-coast`,
        name: "Strategic Nationalization Act",
        type: "nationalization",
        status: "draft",
        parameters: { minStability: 0.4, targetIndustry: "transport" },
        proposedBy: "developer_template",
        support: 0.46,
        economicImpact: -0.08,
        stabilityImpact: -0.02,
        enactedTick: null
      },
      {
        id: `${seed}-law-deposit-insurance`,
        countryId: `${seed}-country-north-coast`,
        name: "Deposit Insurance Act",
        type: "deposit_insurance",
        status: "draft",
        parameters: { limitMinor: 1_000_000 },
        proposedBy: "developer_template",
        support: 0.66,
        economicImpact: -0.01,
        stabilityImpact: 0.05,
        enactedTick: null
      }
    ],
    taxPolicies: [
      {
        id: `${seed}-tax-north-coast`,
        countryId: `${seed}-country-north-coast`,
        profitTaxRate: 0.12,
        salesTaxRate: 0.05,
        importTariffRate: 0.08,
        environmentalFineMinor: 12_000,
        updatedTick: 0
      }
    ],
    governmentBudgets: [
      {
        id: `${seed}-budget-north-coast-0`,
        countryId: `${seed}-country-north-coast`,
        tick: 0,
        revenueMinor: 0,
        spendingMinor: 0,
        deficitMinor: 0,
        treasuryMinor: 50_000_000,
        welfareSpendingMinor: 0,
        infrastructureSpendingMinor: 0,
        bailoutSpendingMinor: 0
      }
    ],
    publicDebt: [
      {
        id: `${seed}-debt-north-coast`,
        countryId: `${seed}-country-north-coast`,
        outstandingDebtMinor: 2_000_000_000,
        bondIds: [`${seed}-bond-ncr-10y`],
        debtServiceMinor: 125_000,
        creditRating: "A"
      }
    ],
    subsidies: [
      {
        id: `${seed}-subsidy-food-security`,
        countryId: `${seed}-country-north-coast`,
        targetType: "industry",
        targetId: "food",
        amountMinorPerTick: 25_000,
        active: true
      }
    ],
    licenses: [
      {
        id: `${seed}-license-harbor-bakery-food`,
        countryId: `${seed}-country-north-coast`,
        companyId: `${seed}-company-harbor-bakery`,
        industry: "food",
        lawId: `${seed}-law-industry-license`,
        status: "active",
        issuedTick: 0,
        expiresTick: null
      }
    ],
    sanctionPolicies: [
      {
        id: `${seed}-sanction-south-union-imports`,
        countryId: `${seed}-country-north-coast`,
        targetCountryId: `${seed}-country-south-union`,
        importBlocked: true,
        exportBlocked: false,
        tariffRate: 0.3,
        active: true
      }
    ],
    corruptionIndexes: [
      {
        id: `${seed}-corruption-north-coast`,
        countryId: `${seed}-country-north-coast`,
        value: 0.18,
        trend: 0,
        updatedTick: 0
      }
    ],
    protests: [],
    lobbyingActions: [],
    mediaInfluences: [],
    wars: [
      {
        id: `${seed}-war-border-crisis`,
        name: "Border Crisis",
        attackerCountryId: `${seed}-country-south-union`,
        defenderCountryId: `${seed}-country-north-coast`,
        status: "active",
        startedTick: 0,
        endedTick: null,
        intensity: 0.62,
        recognitionScore: 0.28,
        legalStatus: "declared"
      }
    ],
    fronts: [
      {
        id: `${seed}-front-border-gate`,
        warId: `${seed}-war-border-crisis`,
        name: "Border Gate Front",
        attackerArmyId: `${seed}-army-south-expeditionary`,
        defenderArmyId: `${seed}-army-north-defense`,
        cellIds: [`${seed}-cell-grainford-farmland`, `${seed}-cell-border-gate`, `${seed}-cell-sunport-corridor`],
        pressure: 0.57,
        movementDirection: "attacker",
        active: true
      }
    ],
    strategicCells: [
      {
        id: `${seed}-cell-harborview-coast`,
        countryId: `${seed}-country-north-coast`,
        name: "Harborview Coastal District",
        center: { lat: 53.2, lon: 15.7 },
        sizeKm: 80,
        terrain: "coast",
        legalControllerCountryId: `${seed}-country-north-coast`,
        factualControllerCountryId: `${seed}-country-north-coast`,
        contested: false,
        infrastructureScore: 0.78,
        population: 1_280_000,
        recognitionStatus: "recognized"
      },
      {
        id: `${seed}-cell-grainford-farmland`,
        countryId: `${seed}-country-north-coast`,
        name: "Grainford Farmland",
        center: { lat: 51.3, lon: 18.4 },
        sizeKm: 120,
        terrain: "plains",
        legalControllerCountryId: `${seed}-country-north-coast`,
        factualControllerCountryId: `${seed}-country-north-coast`,
        contested: true,
        infrastructureScore: 0.61,
        population: 420_000,
        recognitionStatus: "contested"
      },
      {
        id: `${seed}-cell-border-gate`,
        countryId: `${seed}-country-north-coast`,
        name: "South/North Border Gate",
        center: { lat: 47.9, lon: 14.4 },
        sizeKm: 50,
        terrain: "plains",
        legalControllerCountryId: `${seed}-country-north-coast`,
        factualControllerCountryId: `${seed}-country-north-coast`,
        contested: true,
        infrastructureScore: 0.42,
        population: 30_000,
        recognitionStatus: "contested"
      },
      {
        id: `${seed}-cell-sunport-corridor`,
        countryId: `${seed}-country-south-union`,
        name: "Sunport Corridor",
        center: { lat: 44.1, lon: 13.8 },
        sizeKm: 90,
        terrain: "coast",
        legalControllerCountryId: `${seed}-country-south-union`,
        factualControllerCountryId: `${seed}-country-south-union`,
        contested: false,
        infrastructureScore: 0.69,
        population: 890_000,
        recognitionStatus: "recognized"
      }
    ],
    armies: [
      {
        id: `${seed}-army-north-defense`,
        countryId: `${seed}-country-north-coast`,
        warId: `${seed}-war-border-crisis`,
        name: "North Defense Army",
        doctrine: "defensive",
        morale: 0.64,
        readiness: 0.62,
        manpower: 48_000,
        fuelStock: 18_000,
        foodStock: 42_000,
        ammunitionStock: 14_000
      },
      {
        id: `${seed}-army-south-expeditionary`,
        countryId: `${seed}-country-south-union`,
        warId: `${seed}-war-border-crisis`,
        name: "South Expeditionary Force",
        doctrine: "offensive",
        morale: 0.7,
        readiness: 0.71,
        manpower: 56_000,
        fuelStock: 20_000,
        foodStock: 36_000,
        ammunitionStock: 18_000
      }
    ],
    militaryUnits: [
      {
        id: `${seed}-unit-north-border-brigade`,
        armyId: `${seed}-army-north-defense`,
        cellId: `${seed}-cell-border-gate`,
        unitType: "infantry",
        strength: 16_000,
        mobility: 0.45,
        supplyNeedPerTick: { food: 0.35, fuel: 0.12, ammunition: 0.18 },
        combatPower: 0.58,
        readiness: 0.61
      },
      {
        id: `${seed}-unit-north-logistics`,
        armyId: `${seed}-army-north-defense`,
        cellId: `${seed}-cell-grainford-farmland`,
        unitType: "logistics",
        strength: 6_000,
        mobility: 0.52,
        supplyNeedPerTick: { food: 0.28, fuel: 0.2, ammunition: 0.06 },
        combatPower: 0.25,
        readiness: 0.66
      },
      {
        id: `${seed}-unit-south-spearhead`,
        armyId: `${seed}-army-south-expeditionary`,
        cellId: `${seed}-cell-sunport-corridor`,
        unitType: "armor",
        strength: 18_000,
        mobility: 0.72,
        supplyNeedPerTick: { food: 0.32, fuel: 0.55, ammunition: 0.32 },
        combatPower: 0.82,
        readiness: 0.72
      },
      {
        id: `${seed}-unit-south-artillery`,
        armyId: `${seed}-army-south-expeditionary`,
        cellId: `${seed}-cell-border-gate`,
        unitType: "artillery",
        strength: 9_000,
        mobility: 0.42,
        supplyNeedPerTick: { food: 0.3, fuel: 0.25, ammunition: 0.45 },
        combatPower: 0.76,
        readiness: 0.7
      }
    ],
    militarySupplies: [],
    occupations: [],
    treaties: [
      {
        id: `${seed}-treaty-north-coast-defense`,
        name: "North Coast Defense Understanding",
        type: "defense",
        countryIds: [`${seed}-country-north-coast`],
        status: "active",
        signedTick: 0,
        expiresTick: null
      }
    ],
    sanctions: [
      {
        id: `${seed}-sanction-war-transport`,
        sourceCountryId: `${seed}-country-north-coast`,
        targetCountryId: `${seed}-country-south-union`,
        warId: `${seed}-war-border-crisis`,
        type: "transport",
        severity: 0.78,
        active: true,
        startedTick: 0
      }
    ],
    alliances: [
      {
        id: `${seed}-alliance-north-coast-home-defense`,
        name: "North Coast Home Defense Pact",
        countryIds: [`${seed}-country-north-coast`],
        stance: "defensive",
        active: true
      }
    ],
    blockades: [
      {
        id: `${seed}-blockade-border-route`,
        warId: `${seed}-war-border-crisis`,
        countryId: `${seed}-country-north-coast`,
        routeId: `${seed}-route-sunport-harborview-border`,
        portId: null,
        severity: 0.82,
        active: true,
        startedTick: 0
      }
    ],
    refugeeFlows: [],
    warDamage: [],
    militaryOrders: [],
    technologies: [
      {
        id: `${seed}-technology-precision-baking`,
        name: "Precision Baking Lines",
        domain: "production",
        industry: "food",
        accessModel: "patent",
        researchCostMinor: 50_000,
        effects: {
          productionEfficiency: 0.08,
          inputEfficiency: 0.16,
          logisticsEfficiency: 0,
          pollutionReduction: 0.04,
          healthBonus: 0,
          discoveryBonus: 0,
          militaryEfficiency: 0,
          educationBonus: 0,
          energyEfficiency: 0.08
        },
        prerequisites: []
      },
      {
        id: `${seed}-technology-clean-power-grid`,
        name: "Clean Power Grid",
        domain: "energy",
        industry: "energy",
        accessModel: "open",
        researchCostMinor: 80_000,
        effects: {
          productionEfficiency: 0.02,
          inputEfficiency: 0.05,
          logisticsEfficiency: 0.02,
          pollutionReduction: 0.24,
          healthBonus: 0.03,
          discoveryBonus: 0.03,
          militaryEfficiency: 0,
          educationBonus: 0.02,
          energyEfficiency: 0.2
        },
        prerequisites: []
      },
      {
        id: `${seed}-technology-smart-logistics`,
        name: "Smart Logistics Dispatch",
        domain: "logistics",
        industry: "logistics",
        accessModel: "license",
        researchCostMinor: 65_000,
        effects: {
          productionEfficiency: 0,
          inputEfficiency: 0,
          logisticsEfficiency: 0.18,
          pollutionReduction: 0.07,
          healthBonus: 0,
          discoveryBonus: 0,
          militaryEfficiency: 0.04,
          educationBonus: 0,
          energyEfficiency: 0.04
        },
        prerequisites: []
      },
      {
        id: `${seed}-technology-telemedicine`,
        name: "Telemedicine Triage",
        domain: "medicine",
        industry: "medicine",
        accessModel: "trade_secret",
        researchCostMinor: 70_000,
        effects: {
          productionEfficiency: 0.03,
          inputEfficiency: 0.03,
          logisticsEfficiency: 0,
          pollutionReduction: 0,
          healthBonus: 0.1,
          discoveryBonus: 0,
          militaryEfficiency: 0,
          educationBonus: 0.04,
          energyEfficiency: 0
        },
        prerequisites: []
      }
    ],
    technologyLevels: [
      {
        id: `${seed}-tech-level-company-bakery-precision`,
        technologyId: `${seed}-technology-precision-baking`,
        scopeType: "company",
        scopeId: `${seed}-company-harbor-bakery`,
        level: 1,
        unlocked: true,
        progress: 1,
        updatedTick: 0
      },
      {
        id: `${seed}-tech-level-country-clean-grid`,
        technologyId: `${seed}-technology-clean-power-grid`,
        scopeType: "country",
        scopeId: `${seed}-country-north-coast`,
        level: 0.35,
        unlocked: true,
        progress: 1,
        updatedTick: 0
      },
      {
        id: `${seed}-tech-level-industry-food-precision`,
        technologyId: `${seed}-technology-precision-baking`,
        scopeType: "industry",
        scopeId: "food",
        level: 0.18,
        unlocked: true,
        progress: 1,
        updatedTick: 0
      }
    ],
    researchProjects: [
      {
        id: `${seed}-research-smart-logistics`,
        technologyId: `${seed}-technology-smart-logistics`,
        ownerType: "company",
        ownerId: `${seed}-company-city-transit`,
        countryId: `${seed}-country-north-coast`,
        companyId: `${seed}-company-city-transit`,
        name: "Urban dispatch optimization",
        fundingPerTickMinor: 8_000,
        accumulatedResearch: 24_000,
        requiredResearch: 65_000,
        targetScopeType: "company",
        targetScopeId: `${seed}-company-city-transit`,
        status: "active",
        startedTick: 0,
        completedTick: null
      }
    ],
    patents: [
      {
        id: `${seed}-patent-precision-baking`,
        technologyId: `${seed}-technology-precision-baking`,
        ownerType: "company",
        ownerId: `${seed}-company-harbor-bakery`,
        countryId: `${seed}-country-north-coast`,
        filedTick: 0,
        expiresTick: 8_760,
        active: true
      }
    ],
    licenseAgreements: [
      {
        id: `${seed}-license-clean-grid-bakery`,
        technologyId: `${seed}-technology-clean-power-grid`,
        licensorType: "state",
        licensorId: `${seed}-country-north-coast`,
        licenseeType: "company",
        licenseeId: `${seed}-company-harbor-bakery`,
        scopeType: "company",
        scopeId: `${seed}-company-harbor-bakery`,
        royaltyRate: 0.02,
        upfrontFeeMinor: 15_000,
        status: "active",
        startedTick: 0,
        expiresTick: 4_380
      }
    ],
    pollution: [],
    environmentalIndexes: [
      {
        id: `${seed}-environment-harborview`,
        cityId: `${seed}-city-harborview`,
        countryId: `${seed}-country-north-coast`,
        airQuality: 0.74,
        waterQuality: 0.71,
        soilQuality: 0.76,
        carbonIntensity: 0.36,
        biodiversity: 0.62,
        healthImpact: 0.05,
        migrationPressure: 0.04,
        updatedTick: 0
      },
      {
        id: `${seed}-environment-grainford`,
        cityId: `${seed}-city-grainford`,
        countryId: `${seed}-country-north-coast`,
        airQuality: 0.82,
        waterQuality: 0.78,
        soilQuality: 0.81,
        carbonIntensity: 0.22,
        biodiversity: 0.72,
        healthImpact: 0.02,
        migrationPressure: 0.02,
        updatedTick: 0
      },
      {
        id: `${seed}-environment-sunport`,
        cityId: `${seed}-city-sunport`,
        countryId: `${seed}-country-south-union`,
        airQuality: 0.66,
        waterQuality: 0.62,
        soilQuality: 0.69,
        carbonIntensity: 0.44,
        biodiversity: 0.58,
        healthImpact: 0.07,
        migrationPressure: 0.06,
        updatedTick: 0
      }
    ],
    resourceDeposits: [
      {
        id: `${seed}-deposit-grainford-wheat-basin`,
        resourceId: `${seed}-resource-wheat`,
        productId: `${seed}-product-wheat`,
        countryId: `${seed}-country-north-coast`,
        cityId: `${seed}-city-grainford`,
        name: "Grainford Wheat Basin",
        category: "food",
        quantity: 900_000,
        initialQuantity: 1_000_000,
        extractionPerTick: 18_000,
        discoveryChance: 0.02,
        quality: 0.62,
        status: "active"
      },
      {
        id: `${seed}-deposit-sunport-diesel-field`,
        resourceId: `${seed}-resource-oil`,
        productId: `${seed}-product-diesel`,
        countryId: `${seed}-country-south-union`,
        cityId: `${seed}-city-sunport`,
        name: "Sunport Diesel Field",
        category: "energy",
        quantity: 450_000,
        initialQuantity: 600_000,
        extractionPerTick: 9_000,
        discoveryChance: 0.04,
        quality: 0.55,
        status: "active"
      },
      {
        id: `${seed}-deposit-harborview-geothermal`,
        resourceId: `${seed}-resource-geothermal`,
        productId: `${seed}-product-electricity`,
        countryId: `${seed}-country-north-coast`,
        cityId: `${seed}-city-harborview`,
        name: "Harborview Geothermal Anomaly",
        category: "energy",
        quantity: 220_000,
        initialQuantity: 220_000,
        extractionPerTick: 4_000,
        discoveryChance: 0.35,
        quality: 0.77,
        status: "undiscovered"
      }
    ],
    resourceDiscoveries: [],
    cleanEnergyPolicies: [
      {
        id: `${seed}-policy-clean-grid-subsidy`,
        countryId: `${seed}-country-north-coast`,
        name: "Clean Grid Subsidy",
        status: "active",
        subsidyMinorPerTick: 20_000,
        pollutionReduction: 0.12,
        technologyId: `${seed}-technology-clean-power-grid`,
        enactedTick: 0
      }
    ],
    blackMarkets: [],
    illegalTrades: [],
    smugglingRoutes: [
      {
        id: `${seed}-smuggling-route-sunport-harborview`,
        name: "Sunport Harborview Shadow Road",
        originCityId: `${seed}-city-sunport`,
        destinationCityId: `${seed}-city-harborview`,
        productId: null,
        mode: "road",
        capacityPerTick: 7_500,
        costMinorPerUnit: 42,
        baseDetectionRisk: 0.28,
        corruptionShield: 0.18,
        active: true,
        blocked: false
      },
      {
        id: `${seed}-smuggling-route-grainford-harborview`,
        name: "Grainford Harborview Side Roads",
        originCityId: `${seed}-city-grainford`,
        destinationCityId: `${seed}-city-harborview`,
        productId: `${seed}-product-bread`,
        mode: "road",
        capacityPerTick: 4_000,
        costMinorPerUnit: 24,
        baseDetectionRisk: 0.16,
        corruptionShield: 0.08,
        active: true,
        blocked: false
      }
    ],
    corruptionCases: [],
    investigations: [],
    enforcementAgencies: [
      {
        id: `${seed}-agency-north-compliance`,
        countryId: `${seed}-country-north-coast`,
        name: "North Coast Economic Compliance Bureau",
        controlScore: 0.68,
        capacityPerTick: 6,
        corruptionResistance: 0.62,
        mediaSensitivity: 0.55,
        budgetMinor: 3_000_000,
        active: true
      },
      {
        id: `${seed}-agency-south-customs`,
        countryId: `${seed}-country-south-union`,
        name: "South Union Customs Directorate",
        controlScore: 0.48,
        capacityPerTick: 4,
        corruptionResistance: 0.38,
        mediaSensitivity: 0.42,
        budgetMinor: 1_900_000,
        active: true
      }
    ],
    fines: [],
    confiscations: [],
    reputationPenalties: [],
    illegalContracts: [],
    populationCohorts: [
      {
        id: `${seed}-cohort-harborview-services`,
        cityId: `${seed}-city-harborview`,
        size: 620_000,
        incomeLevel: "middle",
        ageGroup: "adult",
        professionGroup: "services",
        educationLevel: "skilled",
        cashBalanceMinor: 120_000_00,
        satisfaction: 0.66
      },
      {
        id: `${seed}-cohort-grainford-agriculture`,
        cityId: `${seed}-city-grainford`,
        size: 190_000,
        incomeLevel: "low",
        ageGroup: "adult",
        professionGroup: "agriculture",
        educationLevel: "basic",
        cashBalanceMinor: 28_000_00,
        satisfaction: 0.59
      }
    ],
    contracts: [],
    warehouses: [
      {
        id: `${seed}-warehouse-harbor-bakery`,
        companyId: `${seed}-company-harbor-bakery`,
        cityId: `${seed}-city-harborview`,
        name: "Harbor Bakery Storehouse",
        warehouseType: "general",
        capacity: 250_000,
        handlingCostMinorPerUnit: 8
      },
      {
        id: `${seed}-warehouse-grainford-elevator`,
        companyId: `${seed}-company-harbor-bakery`,
        cityId: `${seed}-city-grainford`,
        name: "Grainford Wheat Elevator",
        warehouseType: "bulk",
        capacity: 400_000,
        handlingCostMinorPerUnit: 4
      },
      {
        id: `${seed}-warehouse-urban-homes`,
        companyId: `${seed}-company-urban-homes`,
        cityId: `${seed}-city-harborview`,
        name: "Urban Homes Capacity",
        warehouseType: "general",
        capacity: 50_000,
        handlingCostMinorPerUnit: 2
      },
      {
        id: `${seed}-warehouse-city-transit`,
        companyId: `${seed}-company-city-transit`,
        cityId: `${seed}-city-harborview`,
        name: "City Transit Capacity",
        warehouseType: "general",
        capacity: 120_000,
        handlingCostMinorPerUnit: 1
      },
      {
        id: `${seed}-warehouse-healthpoint`,
        companyId: `${seed}-company-healthpoint`,
        cityId: `${seed}-city-harborview`,
        name: "HealthPoint Capacity",
        warehouseType: "cold_storage",
        capacity: 25_000,
        handlingCostMinorPerUnit: 12
      },
      {
        id: `${seed}-warehouse-evening-house`,
        companyId: `${seed}-company-evening-house`,
        cityId: `${seed}-city-harborview`,
        name: "Evening House Capacity",
        warehouseType: "general",
        capacity: 30_000,
        handlingCostMinorPerUnit: 3
      }
    ],
    inventoryLots: [
      {
        id: `${seed}-lot-wheat`,
        warehouseId: `${seed}-warehouse-harbor-bakery`,
        productId: `${seed}-product-wheat`,
        quantity: 20_000,
        quality: 0.56
      },
      {
        id: `${seed}-lot-grainford-wheat`,
        warehouseId: `${seed}-warehouse-grainford-elevator`,
        productId: `${seed}-product-wheat`,
        quantity: 60_000,
        quality: 0.57
      },
      {
        id: `${seed}-lot-bread`,
        warehouseId: `${seed}-warehouse-harbor-bakery`,
        productId: `${seed}-product-bread`,
        quantity: 80_000,
        quality: 0.64
      },
      {
        id: `${seed}-lot-apartment-rent`,
        warehouseId: `${seed}-warehouse-urban-homes`,
        productId: `${seed}-product-apartment-rent`,
        quantity: 18_000,
        quality: 0.58
      },
      {
        id: `${seed}-lot-bus-ticket`,
        warehouseId: `${seed}-warehouse-city-transit`,
        productId: `${seed}-product-bus-ticket`,
        quantity: 65_000,
        quality: 0.53
      },
      {
        id: `${seed}-lot-clinic-visit`,
        warehouseId: `${seed}-warehouse-healthpoint`,
        productId: `${seed}-product-clinic-visit`,
        quantity: 6_000,
        quality: 0.65
      },
      {
        id: `${seed}-lot-cinema-ticket`,
        warehouseId: `${seed}-warehouse-evening-house`,
        productId: `${seed}-product-cinema-ticket`,
        quantity: 14_000,
        quality: 0.58
      }
    ],
    shipments: [],
    logisticsRoutes: [
      {
        id: `${seed}-route-grainford-harborview-road`,
        name: "Grainford to Harborview Road Freight",
        originWarehouseId: `${seed}-warehouse-grainford-elevator`,
        destinationWarehouseId: `${seed}-warehouse-harbor-bakery`,
        nodeIds: [`${seed}-node-grainford`, `${seed}-node-harborview`],
        infrastructureLinkIds: [`${seed}-link-grainford-harborview-road`],
        transportCompanyId: `${seed}-transport-north-freight`,
        mode: "road",
        active: true,
        blockedReason: null
      },
      {
        id: `${seed}-route-sunport-harborview-border`,
        name: "Sunport to Harborview Cross-Border Freight",
        originWarehouseId: `${seed}-warehouse-grainford-elevator`,
        destinationWarehouseId: `${seed}-warehouse-harbor-bakery`,
        nodeIds: [`${seed}-node-sunport`, `${seed}-node-south-north-border`, `${seed}-node-harborview`],
        infrastructureLinkIds: [`${seed}-link-sunport-border-road`, `${seed}-link-border-harborview-road`],
        transportCompanyId: `${seed}-transport-north-freight`,
        mode: "road",
        active: false,
        blockedReason: "Border sanctions block this route."
      }
    ],
    transportCompanies: [
      {
        id: `${seed}-transport-north-freight`,
        name: "North Freight Cooperative",
        countryId: `${seed}-country-north-coast`,
        mode: "road",
        reliability: 0.82,
        capacityPerTick: 35_000,
        costMultiplier: 1,
        cashBalanceMinor: 45_000_00,
        active: true
      }
    ],
    routeNodes: [
      {
        id: `${seed}-node-harborview`,
        type: "city",
        name: "Harborview Logistics Hub",
        cityId: `${seed}-city-harborview`,
        location: { lat: 53.2, lon: 15.7 }
      },
      {
        id: `${seed}-node-grainford`,
        type: "city",
        name: "Grainford Grain Terminal",
        cityId: `${seed}-city-grainford`,
        location: { lat: 51.3, lon: 18.4 }
      },
      {
        id: `${seed}-node-sunport`,
        type: "port",
        name: "Sunport Harbor",
        cityId: `${seed}-city-sunport`,
        location: { lat: 44.1, lon: 13.8 }
      },
      {
        id: `${seed}-node-south-north-border`,
        type: "border",
        name: "South/North Border Gate",
        cityId: null,
        location: { lat: 47.9, lon: 14.4 }
      }
    ],
    infrastructureLinks: [
      {
        id: `${seed}-link-grainford-harborview-road`,
        fromNodeId: `${seed}-node-grainford`,
        toNodeId: `${seed}-node-harborview`,
        mode: "road",
        distanceKm: 260,
        quality: 0.68,
        capacityPerTick: 42_000,
        baseCostMinorPerUnit: 18,
        baseDurationTicks: 2,
        blocked: false,
        sanctionsBlocked: false,
        warDisruptionRisk: 0.04
      },
      {
        id: `${seed}-link-sunport-border-road`,
        fromNodeId: `${seed}-node-sunport`,
        toNodeId: `${seed}-node-south-north-border`,
        mode: "road",
        distanceKm: 420,
        quality: 0.46,
        capacityPerTick: 14_000,
        baseCostMinorPerUnit: 30,
        baseDurationTicks: 4,
        blocked: false,
        sanctionsBlocked: true,
        warDisruptionRisk: 0.18
      },
      {
        id: `${seed}-link-border-harborview-road`,
        fromNodeId: `${seed}-node-south-north-border`,
        toNodeId: `${seed}-node-harborview`,
        mode: "road",
        distanceKm: 540,
        quality: 0.52,
        capacityPerTick: 18_000,
        baseCostMinorPerUnit: 34,
        baseDurationTicks: 5,
        blocked: false,
        sanctionsBlocked: true,
        warDisruptionRisk: 0.16
      }
    ],
    borderCrossings: [
      {
        id: `${seed}-border-south-north`,
        name: "South/North Border Gate",
        fromCountryId: `${seed}-country-south-union`,
        toCountryId: `${seed}-country-north-coast`,
        nodeId: `${seed}-node-south-north-border`,
        open: false,
        sanctionLevel: 0.9,
        delayTicks: 3
      }
    ],
    ports: [
      {
        id: `${seed}-port-sunport`,
        cityId: `${seed}-city-sunport`,
        nodeId: `${seed}-node-sunport`,
        name: "Sunport Harbor",
        capacityPerTick: 60_000,
        quality: 0.71
      }
    ],
    roads: [
      {
        id: `${seed}-road-grainford-harborview`,
        infrastructureLinkId: `${seed}-link-grainford-harborview-road`,
        lanes: 2,
        speedLimitKph: 90
      },
      {
        id: `${seed}-road-sunport-border`,
        infrastructureLinkId: `${seed}-link-sunport-border-road`,
        lanes: 1,
        speedLimitKph: 70
      },
      {
        id: `${seed}-road-border-harborview`,
        infrastructureLinkId: `${seed}-link-border-harborview-road`,
        lanes: 1,
        speedLimitKph: 70
      }
    ],
    railLines: [],
    productionPlans: [
      {
        id: `${seed}-production-bread`,
        companyId: `${seed}-company-harbor-bakery`,
        warehouseId: `${seed}-warehouse-harbor-bakery`,
        outputProductId: `${seed}-product-bread`,
        outputQuantityPerTick: 12_000,
        inputs: [{ productId: `${seed}-product-wheat`, quantityPerOutput: 0.4 }],
        active: true
      },
      {
        id: `${seed}-production-apartment-rent`,
        companyId: `${seed}-company-urban-homes`,
        warehouseId: `${seed}-warehouse-urban-homes`,
        outputProductId: `${seed}-product-apartment-rent`,
        outputQuantityPerTick: 3_000,
        inputs: [],
        active: true
      },
      {
        id: `${seed}-production-bus-ticket`,
        companyId: `${seed}-company-city-transit`,
        warehouseId: `${seed}-warehouse-city-transit`,
        outputProductId: `${seed}-product-bus-ticket`,
        outputQuantityPerTick: 10_000,
        inputs: [],
        active: true
      },
      {
        id: `${seed}-production-clinic-visit`,
        companyId: `${seed}-company-healthpoint`,
        warehouseId: `${seed}-warehouse-healthpoint`,
        outputProductId: `${seed}-product-clinic-visit`,
        outputQuantityPerTick: 1_200,
        inputs: [],
        active: true
      },
      {
        id: `${seed}-production-cinema-ticket`,
        companyId: `${seed}-company-evening-house`,
        warehouseId: `${seed}-warehouse-evening-house`,
        outputProductId: `${seed}-product-cinema-ticket`,
        outputQuantityPerTick: 2_400,
        inputs: [],
        active: true
      }
    ],
    retailOffers: [
      {
        id: `${seed}-offer-bread`,
        companyId: `${seed}-company-harbor-bakery`,
        warehouseId: `${seed}-warehouse-harbor-bakery`,
        productId: `${seed}-product-bread`,
        priceMinor: 320,
        quality: 0.64,
        active: true
      },
      {
        id: `${seed}-offer-apartment-rent`,
        companyId: `${seed}-company-urban-homes`,
        warehouseId: `${seed}-warehouse-urban-homes`,
        productId: `${seed}-product-apartment-rent`,
        priceMinor: 5_000,
        quality: 0.58,
        active: true
      },
      {
        id: `${seed}-offer-bus-ticket`,
        companyId: `${seed}-company-city-transit`,
        warehouseId: `${seed}-warehouse-city-transit`,
        productId: `${seed}-product-bus-ticket`,
        priceMinor: 180,
        quality: 0.53,
        active: true
      },
      {
        id: `${seed}-offer-clinic-visit`,
        companyId: `${seed}-company-healthpoint`,
        warehouseId: `${seed}-warehouse-healthpoint`,
        productId: `${seed}-product-clinic-visit`,
        priceMinor: 1_900,
        quality: 0.65,
        active: true
      },
      {
        id: `${seed}-offer-cinema-ticket`,
        companyId: `${seed}-company-evening-house`,
        warehouseId: `${seed}-warehouse-evening-house`,
        productId: `${seed}-product-cinema-ticket`,
        priceMinor: 700,
        quality: 0.58,
        active: true
      }
    ],
    retailPriceChanges: [],
    resourceOffers: [
      {
        id: `${seed}-resource-offer-grainford-wheat`,
        companyId: `${seed}-company-harbor-bakery`,
        warehouseId: `${seed}-warehouse-grainford-elevator`,
        productId: `${seed}-product-wheat`,
        unitPriceMinor: 85,
        quality: 0.57,
        maxQuantityPerTick: 20_000,
        active: true
      }
    ],
    resourcePurchases: [],
    manualProductionRuns: [],
    demandRecords: [],
    financialTransactions: [],
    news: [],
    eventCauses: [],
    eventImpacts: [],
    metricChanges: [],
    explanations: [],
    newsTemplates: [
      {
        id: `${seed}-news-template-economic-shortage`,
        category: "economic",
        eventType: "ShortageDetectedEvent",
        headlineTemplate: "{product} shortage in {city}",
        bodyTemplate: "Demand exceeded legal supply and households could not satisfy all needs.",
        severity: "warning",
        active: true
      },
      {
        id: `${seed}-news-template-political-protest`,
        category: "political",
        eventType: "ProtestCreatedEvent",
        headlineTemplate: "Public stability falls in {country}",
        bodyTemplate: "Low satisfaction, shortages, or corruption pressure produced protest risk.",
        severity: "warning",
        active: true
      },
      {
        id: `${seed}-news-template-war-front`,
        category: "military",
        eventType: "StrategicCellCapturedEvent",
        headlineTemplate: "Front line shifts",
        bodyTemplate: "Factual control changed while legal recognition remained separate.",
        severity: "critical",
        active: true
      },
      {
        id: `${seed}-news-template-corporate-bankruptcy`,
        category: "corporate",
        eventType: "CompanyBankruptcyOpenedEvent",
        headlineTemplate: "{company} enters bankruptcy",
        bodyTemplate: "Credit stress and cash shortage forced a bankruptcy process.",
        severity: "critical",
        active: true
      },
      {
        id: `${seed}-news-template-exchange-trade`,
        category: "exchange",
        eventType: "ExchangeTradeMatchedEvent",
        headlineTemplate: "Order book clears trades",
        bodyTemplate: "Financial markets matched bids and asks through exchange mechanics.",
        severity: "info",
        active: true
      },
      {
        id: `${seed}-news-template-crime-enforcement`,
        category: "criminal",
        eventType: "IllegalTradeDetectedEvent",
        headlineTemplate: "Enforcement exposes shadow trade",
        bodyTemplate: "A risky illegal trade produced fines, confiscation, or reputation loss.",
        severity: "critical",
        active: true
      },
      {
        id: `${seed}-news-template-ecology-pressure`,
        category: "ecological",
        eventType: "PollutionCreatedEvent",
        headlineTemplate: "Pollution pressure changes",
        bodyTemplate: "Production or war damage changed local environmental conditions.",
        severity: "warning",
        active: true
      }
    ],
    forecasts: [],
    publicStatistics: [],
    hiddenStatistics: [],
    dataReliability: [
      {
        id: `${seed}-reliability-north-market`,
        countryId: `${seed}-country-north-coast`,
        source: "state",
        grade: "high",
        score: 0.86,
        manipulationRisk: 0.08,
        method: "audited market statistics and open budget reporting",
        updatedTick: 0
      },
      {
        id: `${seed}-reliability-south-state`,
        countryId: `${seed}-country-south-union`,
        source: "state",
        grade: "low",
        score: 0.42,
        manipulationRisk: 0.58,
        method: "state published statistics with authoritarian manipulation risk",
        updatedTick: 0
      }
    ],
    events: [
      {
        id: `${seed}-event-world-seeded`,
        tick: 0,
        type: "WorldSeededEvent",
        message: "Initial economy seed loaded.",
        entityIds: [],
        metadata: { seed }
      }
    ],
    metrics: [
      {
        id: `${seed}-metric-population-total`,
        tick: 0,
        name: "population.total",
        value: 2_590_000,
        tags: { scope: "world" }
      }
    ],
    snapshots: [
      {
        id: `${seed}-snapshot-0`,
        tick: 0,
        createdAt,
        stateHash: `${seed}:0`
      }
    ]
  };
}

export function summarizeWorld(state: WorldState) {
  return {
    currentTick: state.currentTick,
    currentDate: state.currentDate,
    countries: state.countries.length,
    cities: state.cities.length,
    products: state.products.length,
    companies: state.companies.length,
    centralBanks: state.centralBanks.length,
    banks: state.banks.length,
    bankAccounts: state.bankAccounts.length,
    loans: state.loans.length,
    bonds: state.bonds.length,
    stocks: state.stocks.length,
    exchanges: state.exchanges.length,
    trades: state.trades.length,
    bankruptcies: state.bankruptcies.length,
    governments: state.governments.length,
    politicalParties: state.politicalParties.length,
    elections: state.elections.length,
    laws: state.laws.length,
    activeLaws: state.laws.filter((law) => law.status === "active").length,
    governmentBudgets: state.governmentBudgets.length,
    protests: state.protests.filter((protest) => protest.status === "active").length,
    wars: (state.wars ?? []).length,
    activeWars: (state.wars ?? []).filter((war) => war.status === "active").length,
    fronts: (state.fronts ?? []).length,
    strategicCells: (state.strategicCells ?? []).length,
    occupiedCells: (state.strategicCells ?? []).filter((cell) => cell.legalControllerCountryId !== cell.factualControllerCountryId).length,
    sanctions: (state.sanctions ?? []).filter((sanction) => sanction.active).length,
    militaryOrders: (state.militaryOrders ?? []).length,
    refugeeFlows: (state.refugeeFlows ?? []).length,
    warDamage: (state.warDamage ?? []).length,
    technologies: (state.technologies ?? []).length,
    unlockedTechnologies: (state.technologyLevels ?? []).filter((level) => level.unlocked).length,
    researchProjects: (state.researchProjects ?? []).length,
    activeResearchProjects: (state.researchProjects ?? []).filter((project) => project.status === "active").length,
    patents: (state.patents ?? []).filter((patent) => patent.active).length,
    licenseAgreements: (state.licenseAgreements ?? []).filter((agreement) => agreement.status === "active").length,
    pollutionRecords: (state.pollution ?? []).length,
    environmentalIndexes: (state.environmentalIndexes ?? []).length,
    resourceDeposits: (state.resourceDeposits ?? []).length,
    activeResourceDeposits: (state.resourceDeposits ?? []).filter((deposit) => deposit.status === "active").length,
    resourceDiscoveries: (state.resourceDiscoveries ?? []).length,
    cleanEnergyPolicies: (state.cleanEnergyPolicies ?? []).filter((policy) => policy.status === "active").length,
    blackMarkets: (state.blackMarkets ?? []).length,
    activeBlackMarkets: (state.blackMarkets ?? []).filter((market) => market.active).length,
    illegalTrades: (state.illegalTrades ?? []).length,
    openInvestigations: (state.investigations ?? []).filter((investigation) => investigation.status === "open").length,
    fines: (state.fines ?? []).length,
    confiscations: (state.confiscations ?? []).length,
    explanations: (state.explanations ?? []).length,
    forecasts: (state.forecasts ?? []).length,
    publicStatistics: (state.publicStatistics ?? []).length,
    hiddenStatistics: (state.hiddenStatistics ?? []).length,
    warehouses: state.warehouses.length,
    shipments: state.shipments.length,
    logisticsRoutes: state.logisticsRoutes.length,
    transportCompanies: state.transportCompanies.length,
    inventoryLots: state.inventoryLots.length,
    retailOffers: state.retailOffers.length,
    retailPriceChanges: (state.retailPriceChanges ?? []).length,
    resourceOffers: (state.resourceOffers ?? []).length,
    resourcePurchases: (state.resourcePurchases ?? []).length,
    manualProductionRuns: (state.manualProductionRuns ?? []).length,
    demandRecords: state.demandRecords.length,
    news: state.news.length,
    populationTotal: state.cities.reduce((total, city) => total + city.populationTotal, 0)
  };
}
