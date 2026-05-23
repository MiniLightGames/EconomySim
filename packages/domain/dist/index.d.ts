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
export type LawType = "profit_tax" | "sales_tax" | "import_tariff" | "export_restriction" | "industry_license" | "environmental_fine" | "martial_law" | "nationalization" | "deposit_insurance" | "bank_bailout";
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
export type EventCauseType = "demand" | "supply" | "cost" | "logistics" | "tax" | "shortage" | "sanction" | "war" | "marketing" | "credit" | "policy" | "corruption" | "ecology";
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
    readonly type: "RetailSaleTransaction" | "LoanOriginationTransaction" | "LoanPaymentTransaction" | "InterestAccrualTransaction" | "TradeSettlementTransaction" | "BankruptcyRecoveryTransaction" | "CentralBankBondPurchaseTransaction" | "DepositLossTransaction" | "TaxCollectionTransaction" | "GovernmentSpendingTransaction" | "SubsidyPaymentTransaction" | "GovernmentBondIssuanceTransaction" | "NationalizationTransaction" | "LobbyingPaymentTransaction" | "MediaCampaignTransaction" | "ResearchInvestmentTransaction" | "CleanEnergySubsidyTransaction" | "ResourcePurchaseTransaction" | "IllegalTradeTransaction" | "FinePaymentTransaction" | "ConfiscationTransaction" | "CorruptionPaymentTransaction";
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
    readonly cityId: EntityId;
    readonly lotId: EntityId;
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
export type PlayerCommand = CreateCompanyCommand | BuyLandCommand | SetRetailPriceCommand;
export declare const ECONOMY_INVARIANTS: readonly ["Money changes only through balanced ledger transactions.", "Player intent enters the world as backend-validated commands.", "Inventory moves only by warehouse to cargo batch to warehouse.", "Loans and market orders are validated by simulation-core before balances change.", "Ordinary retail goods clear through retail markets, not exchange order books.", "Players influence governments through votes, funding, lobbying, and media rather than becoming politicians.", "Wars are automated state conflicts; players participate through economic supply, finance, and logistics only.", "Strategic cells keep factual and legal territorial control separate.", "R&D changes technology levels through validated research projects, patents, or license agreements.", "Resource deposits, pollution, and environmental health are tick-updated simulation state.", "Taxes, subsidies, nationalization, and bailouts must be represented as auditable financial transactions.", "Black market trades are backend-validated risky commands, never direct player balance or inventory edits.", "B2B resource purchases move inventory through warehouse records and settle money through balanced ledger transactions.", "Player retail prices change only through backend-validated retail offer commands.", "Fines, confiscations, bribes, and illegal proceeds are auditable financial transactions and enforcement events.", "Important world changes must produce explainable causes, impacts, metrics, and news.", "Private company finances stay hidden unless the company is publicly listed.", "Public statistics carry reliability and manipulation-risk metadata.", "Important actions create audit log records, events, and metrics."];
export declare function createInitialWorldState(seed?: string): WorldState;
export declare function summarizeWorld(state: WorldState): {
    currentTick: number;
    currentDate: string;
    countries: number;
    cities: number;
    products: number;
    companies: number;
    centralBanks: number;
    banks: number;
    bankAccounts: number;
    loans: number;
    bonds: number;
    stocks: number;
    exchanges: number;
    trades: number;
    bankruptcies: number;
    governments: number;
    politicalParties: number;
    elections: number;
    laws: number;
    activeLaws: number;
    governmentBudgets: number;
    protests: number;
    wars: number;
    activeWars: number;
    fronts: number;
    strategicCells: number;
    occupiedCells: number;
    sanctions: number;
    militaryOrders: number;
    refugeeFlows: number;
    warDamage: number;
    technologies: number;
    unlockedTechnologies: number;
    researchProjects: number;
    activeResearchProjects: number;
    patents: number;
    licenseAgreements: number;
    pollutionRecords: number;
    environmentalIndexes: number;
    resourceDeposits: number;
    activeResourceDeposits: number;
    resourceDiscoveries: number;
    cleanEnergyPolicies: number;
    blackMarkets: number;
    activeBlackMarkets: number;
    illegalTrades: number;
    openInvestigations: number;
    fines: number;
    confiscations: number;
    explanations: number;
    forecasts: number;
    publicStatistics: number;
    hiddenStatistics: number;
    warehouses: number;
    shipments: number;
    logisticsRoutes: number;
    transportCompanies: number;
    inventoryLots: number;
    retailOffers: number;
    retailPriceChanges: number;
    resourceOffers: number;
    resourcePurchases: number;
    manualProductionRuns: number;
    demandRecords: number;
    news: number;
    populationTotal: number;
};
//# sourceMappingURL=index.d.ts.map