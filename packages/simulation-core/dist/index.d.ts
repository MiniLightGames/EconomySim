import type { BankAccount, DomainEvent, Election, FinancialAssetType, LawType, Loan, LogisticsRoute, LobbyingAction, MediaInfluence, Metric, Order, IllegalTrade, PlayerCommand, ResearchProject, ResourcePurchase, RetailOffer, RetailPriceChange, Shipment, ManualProductionRun, Trade, VoteChoice, WorldState } from "@economysim/domain";
export interface TickInput {
    readonly state: WorldState;
    readonly commands: readonly PlayerCommand[];
    readonly seed: string;
}
export interface TickResult {
    readonly state: WorldState;
    readonly events: readonly DomainEvent[];
    readonly metrics: readonly Metric[];
    readonly acceptedCommands: readonly string[];
    readonly rejectedCommands: readonly RejectedCommand[];
}
export interface RejectedCommand {
    readonly commandId: string;
    readonly code: string;
    readonly message: string;
}
export interface CreateShipmentInput {
    readonly originWarehouseId: string;
    readonly destinationWarehouseId: string;
    readonly productId: string;
    readonly quantity: number;
    readonly routeId?: string;
    readonly transportCompanyId?: string;
}
export interface ShipmentQuote {
    readonly routeId: string;
    readonly transportCompanyId: string;
    readonly costMinor: number;
    readonly durationTicks: number;
    readonly risk: number;
    readonly blockedReason: string | null;
}
export interface CreateShipmentResult {
    readonly state: WorldState;
    readonly shipment: Shipment;
    readonly quote: ShipmentQuote;
}
export interface BuyResourceInput {
    readonly playerId: string;
    readonly buyerCompanyId: string;
    readonly resourceOfferId: string;
    readonly quantity: number;
    readonly maxUnitPriceMinor: number;
    readonly buyerWarehouseId?: string;
}
export interface BuyResourceResult {
    readonly state: WorldState;
    readonly purchase: ResourcePurchase;
}
export interface RunManualProductionInput {
    readonly playerId: string;
    readonly companyId: string;
    readonly productionPlanId: string;
    readonly requestedQuantity: number;
}
export interface RunManualProductionResult {
    readonly state: WorldState;
    readonly productionRun: ManualProductionRun;
}
export interface SetRetailOfferPriceInput {
    readonly playerId: string;
    readonly companyId: string;
    readonly retailOfferId: string;
    readonly priceMinor: number;
    readonly currencyCode?: string;
}
export interface SetRetailOfferPriceResult {
    readonly state: WorldState;
    readonly retailOffer: RetailOffer;
    readonly priceChange: RetailPriceChange;
}
export interface LoanApplicationInput {
    readonly borrowerType: "company" | "bank";
    readonly borrowerId: string;
    readonly lenderBankId: string;
    readonly principalMinor: number;
    readonly termTicks: number;
    readonly collateralCompanyId?: string;
}
export interface LoanApplicationResult {
    readonly state: WorldState;
    readonly loan: Loan;
    readonly account: BankAccount;
}
export interface LoanPaymentInput {
    readonly loanId: string;
    readonly amountMinor: number;
}
export interface LoanPaymentResult {
    readonly state: WorldState;
    readonly loan: Loan;
    readonly paidPrincipalMinor: number;
    readonly paidInterestMinor: number;
}
export interface CreateOrderInput {
    readonly exchangeId: string;
    readonly ownerType: Order["ownerType"];
    readonly ownerId: string;
    readonly assetType: FinancialAssetType;
    readonly assetId: string;
    readonly side: Order["side"];
    readonly priceMinor: number;
    readonly quantity: number;
}
export interface CreateOrderResult {
    readonly state: WorldState;
    readonly order: Order;
    readonly trades: readonly Trade[];
}
export interface CreateIllegalTradeInput {
    readonly blackMarketId: string;
    readonly sellerCompanyId: string;
    readonly buyerOwnerType: "player" | "company";
    readonly buyerOwnerId: string;
    readonly quantity: number;
    readonly smugglingRouteId?: string;
    readonly bribeMinor?: number;
}
export interface CreateIllegalTradeResult {
    readonly state: WorldState;
    readonly illegalTrade: IllegalTrade;
}
export interface LobbyingInput {
    readonly playerId: string;
    readonly countryId: string;
    readonly targetPartyId?: string;
    readonly lawType: LawType;
    readonly amountMinor: number;
}
export interface LobbyingResult {
    readonly state: WorldState;
    readonly action: LobbyingAction;
}
export interface MediaCampaignInput {
    readonly playerId: string;
    readonly countryId: string;
    readonly targetPartyId?: string;
    readonly message: string;
    readonly spendMinor: number;
}
export interface MediaCampaignResult {
    readonly state: WorldState;
    readonly influence: MediaInfluence;
}
export interface VoteInput {
    readonly playerId: string;
    readonly countryId: string;
    readonly partyId: string;
    readonly choice: VoteChoice;
}
export interface VoteResult {
    readonly state: WorldState;
    readonly election: Election;
}
export interface StartResearchProjectInput {
    readonly companyId: string;
    readonly technologyId: string;
    readonly fundingPerTickMinor: number;
    readonly name?: string;
}
export interface StartResearchProjectResult {
    readonly state: WorldState;
    readonly project: ResearchProject;
}
export declare function runTick(input: TickInput): TickResult;
export declare function runTicks(state: WorldState, count: number, seed?: string): WorldState;
export declare function buyResource(state: WorldState, input: BuyResourceInput, seed?: string): BuyResourceResult;
export declare function runManualProduction(state: WorldState, input: RunManualProductionInput, seed?: string): RunManualProductionResult;
export declare function setRetailOfferPrice(state: WorldState, input: SetRetailOfferPriceInput, seed?: string): SetRetailOfferPriceResult;
export declare function startResearchProject(state: WorldState, input: StartResearchProjectInput, seed?: string): StartResearchProjectResult;
export declare function createShipment(state: WorldState, input: CreateShipmentInput, seed?: string): CreateShipmentResult;
export declare function quoteShipment(state: WorldState, route: LogisticsRoute, quantity: number, transportCompanyId?: string): ShipmentQuote;
export declare function applyForLoan(state: WorldState, input: LoanApplicationInput, seed?: string): LoanApplicationResult;
export declare function payLoan(state: WorldState, input: LoanPaymentInput, seed?: string): LoanPaymentResult;
export declare function placeOrder(state: WorldState, input: CreateOrderInput, seed?: string): CreateOrderResult;
export declare function createIllegalTrade(state: WorldState, input: CreateIllegalTradeInput, seed?: string): CreateIllegalTradeResult;
export declare function fundLobbying(state: WorldState, input: LobbyingInput, seed?: string): LobbyingResult;
export declare function runMediaCampaign(state: WorldState, input: MediaCampaignInput, seed?: string): MediaCampaignResult;
export declare function castVote(state: WorldState, input: VoteInput, seed?: string): VoteResult;
export declare function assertNoInvalidEconomyValues(state: WorldState): void;
//# sourceMappingURL=index.d.ts.map