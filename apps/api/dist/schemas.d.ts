import { z } from "zod";
export declare const idParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const createCompanyBodySchema: z.ZodObject<{
    playerId: z.ZodString;
    countryId: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    playerId: string;
    countryId: string;
    name: string;
}, {
    playerId: string;
    countryId: string;
    name: string;
}>;
export declare const createCompanyCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"CreateCompanyCommand">;
    commandId: z.ZodString;
    playerId: z.ZodString;
    countryId: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "CreateCompanyCommand";
    playerId: string;
    countryId: string;
    name: string;
    commandId: string;
}, {
    type: "CreateCompanyCommand";
    playerId: string;
    countryId: string;
    name: string;
    commandId: string;
}>;
export declare const buyLandCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"BuyLandCommand">;
    commandId: z.ZodString;
    playerId: z.ZodString;
    cityId: z.ZodString;
    lotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cityId: string;
    type: "BuyLandCommand";
    playerId: string;
    commandId: string;
    lotId: string;
}, {
    cityId: string;
    type: "BuyLandCommand";
    playerId: string;
    commandId: string;
    lotId: string;
}>;
export declare const setRetailPriceCommandSchema: z.ZodObject<{
    type: z.ZodLiteral<"SetRetailPriceCommand">;
    commandId: z.ZodString;
    playerId: z.ZodString;
    companyId: z.ZodString;
    productId: z.ZodString;
    priceMinor: z.ZodNumber;
    currencyCode: z.ZodEnum<["ECO", "NCR", "SOV"]>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    productId: string;
    priceMinor: number;
    type: "SetRetailPriceCommand";
    playerId: string;
    commandId: string;
    currencyCode: "ECO" | "NCR" | "SOV";
}, {
    companyId: string;
    productId: string;
    priceMinor: number;
    type: "SetRetailPriceCommand";
    playerId: string;
    commandId: string;
    currencyCode: "ECO" | "NCR" | "SOV";
}>;
export declare const playerCommandSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"CreateCompanyCommand">;
    commandId: z.ZodString;
    playerId: z.ZodString;
    countryId: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "CreateCompanyCommand";
    playerId: string;
    countryId: string;
    name: string;
    commandId: string;
}, {
    type: "CreateCompanyCommand";
    playerId: string;
    countryId: string;
    name: string;
    commandId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"BuyLandCommand">;
    commandId: z.ZodString;
    playerId: z.ZodString;
    cityId: z.ZodString;
    lotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cityId: string;
    type: "BuyLandCommand";
    playerId: string;
    commandId: string;
    lotId: string;
}, {
    cityId: string;
    type: "BuyLandCommand";
    playerId: string;
    commandId: string;
    lotId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"SetRetailPriceCommand">;
    commandId: z.ZodString;
    playerId: z.ZodString;
    companyId: z.ZodString;
    productId: z.ZodString;
    priceMinor: z.ZodNumber;
    currencyCode: z.ZodEnum<["ECO", "NCR", "SOV"]>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    productId: string;
    priceMinor: number;
    type: "SetRetailPriceCommand";
    playerId: string;
    commandId: string;
    currencyCode: "ECO" | "NCR" | "SOV";
}, {
    companyId: string;
    productId: string;
    priceMinor: number;
    type: "SetRetailPriceCommand";
    playerId: string;
    commandId: string;
    currencyCode: "ECO" | "NCR" | "SOV";
}>]>;
export declare const simulationTickBodySchema: z.ZodDefault<z.ZodObject<{
    commands: z.ZodDefault<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"CreateCompanyCommand">;
        commandId: z.ZodString;
        playerId: z.ZodString;
        countryId: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "CreateCompanyCommand";
        playerId: string;
        countryId: string;
        name: string;
        commandId: string;
    }, {
        type: "CreateCompanyCommand";
        playerId: string;
        countryId: string;
        name: string;
        commandId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"BuyLandCommand">;
        commandId: z.ZodString;
        playerId: z.ZodString;
        cityId: z.ZodString;
        lotId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cityId: string;
        type: "BuyLandCommand";
        playerId: string;
        commandId: string;
        lotId: string;
    }, {
        cityId: string;
        type: "BuyLandCommand";
        playerId: string;
        commandId: string;
        lotId: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"SetRetailPriceCommand">;
        commandId: z.ZodString;
        playerId: z.ZodString;
        companyId: z.ZodString;
        productId: z.ZodString;
        priceMinor: z.ZodNumber;
        currencyCode: z.ZodEnum<["ECO", "NCR", "SOV"]>;
    }, "strip", z.ZodTypeAny, {
        companyId: string;
        productId: string;
        priceMinor: number;
        type: "SetRetailPriceCommand";
        playerId: string;
        commandId: string;
        currencyCode: "ECO" | "NCR" | "SOV";
    }, {
        companyId: string;
        productId: string;
        priceMinor: number;
        type: "SetRetailPriceCommand";
        playerId: string;
        commandId: string;
        currencyCode: "ECO" | "NCR" | "SOV";
    }>]>, "many">>;
}, "strip", z.ZodTypeAny, {
    commands: ({
        type: "CreateCompanyCommand";
        playerId: string;
        countryId: string;
        name: string;
        commandId: string;
    } | {
        cityId: string;
        type: "BuyLandCommand";
        playerId: string;
        commandId: string;
        lotId: string;
    } | {
        companyId: string;
        productId: string;
        priceMinor: number;
        type: "SetRetailPriceCommand";
        playerId: string;
        commandId: string;
        currencyCode: "ECO" | "NCR" | "SOV";
    })[];
}, {
    commands?: ({
        type: "CreateCompanyCommand";
        playerId: string;
        countryId: string;
        name: string;
        commandId: string;
    } | {
        cityId: string;
        type: "BuyLandCommand";
        playerId: string;
        commandId: string;
        lotId: string;
    } | {
        companyId: string;
        productId: string;
        priceMinor: number;
        type: "SetRetailPriceCommand";
        playerId: string;
        commandId: string;
        currencyCode: "ECO" | "NCR" | "SOV";
    })[] | undefined;
}>>;
export declare const createShipmentBodySchema: z.ZodObject<{
    originWarehouseId: z.ZodString;
    destinationWarehouseId: z.ZodString;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    routeId: z.ZodOptional<z.ZodString>;
    transportCompanyId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    originWarehouseId: string;
    destinationWarehouseId: string;
    quantity: number;
    routeId?: string | undefined;
    transportCompanyId?: string | undefined;
}, {
    productId: string;
    originWarehouseId: string;
    destinationWarehouseId: string;
    quantity: number;
    routeId?: string | undefined;
    transportCompanyId?: string | undefined;
}>;
export declare const resourcePurchaseBodySchema: z.ZodObject<{
    playerId: z.ZodString;
    buyerCompanyId: z.ZodString;
    resourceOfferId: z.ZodString;
    quantity: z.ZodNumber;
    maxUnitPriceMinor: z.ZodNumber;
    buyerWarehouseId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    playerId: string;
    quantity: number;
    buyerCompanyId: string;
    resourceOfferId: string;
    maxUnitPriceMinor: number;
    buyerWarehouseId?: string | undefined;
}, {
    playerId: string;
    quantity: number;
    buyerCompanyId: string;
    resourceOfferId: string;
    maxUnitPriceMinor: number;
    buyerWarehouseId?: string | undefined;
}>;
export declare const manualProductionBodySchema: z.ZodObject<{
    playerId: z.ZodString;
    companyId: z.ZodString;
    productionPlanId: z.ZodString;
    requestedQuantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    playerId: string;
    productionPlanId: string;
    requestedQuantity: number;
}, {
    companyId: string;
    playerId: string;
    productionPlanId: string;
    requestedQuantity: number;
}>;
export declare const retailPriceBodySchema: z.ZodObject<{
    playerId: z.ZodString;
    companyId: z.ZodString;
    priceMinor: z.ZodNumber;
    currencyCode: z.ZodOptional<z.ZodEnum<["ECO", "NCR", "SOV"]>>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    priceMinor: number;
    playerId: string;
    currencyCode?: "ECO" | "NCR" | "SOV" | undefined;
}, {
    companyId: string;
    priceMinor: number;
    playerId: string;
    currencyCode?: "ECO" | "NCR" | "SOV" | undefined;
}>;
export declare const loanApplicationBodySchema: z.ZodObject<{
    borrowerType: z.ZodDefault<z.ZodEnum<["company", "bank"]>>;
    borrowerId: z.ZodString;
    lenderBankId: z.ZodString;
    principalMinor: z.ZodNumber;
    termTicks: z.ZodNumber;
    collateralCompanyId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    borrowerType: "company" | "bank";
    borrowerId: string;
    lenderBankId: string;
    principalMinor: number;
    termTicks: number;
    collateralCompanyId?: string | undefined;
}, {
    borrowerId: string;
    lenderBankId: string;
    principalMinor: number;
    termTicks: number;
    borrowerType?: "company" | "bank" | undefined;
    collateralCompanyId?: string | undefined;
}>;
export declare const loanPaymentBodySchema: z.ZodObject<{
    amountMinor: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amountMinor: number;
}, {
    amountMinor: number;
}>;
export declare const createOrderBodySchema: z.ZodObject<{
    exchangeId: z.ZodString;
    ownerType: z.ZodEnum<["player", "company", "bank", "state", "exchange"]>;
    ownerId: z.ZodString;
    assetType: z.ZodEnum<["stock", "bond", "currency", "commodity"]>;
    assetId: z.ZodString;
    side: z.ZodEnum<["buy", "sell"]>;
    priceMinor: z.ZodNumber;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    priceMinor: number;
    quantity: number;
    exchangeId: string;
    ownerType: "company" | "bank" | "player" | "state" | "exchange";
    ownerId: string;
    assetType: "stock" | "bond" | "currency" | "commodity";
    assetId: string;
    side: "buy" | "sell";
}, {
    priceMinor: number;
    quantity: number;
    exchangeId: string;
    ownerType: "company" | "bank" | "player" | "state" | "exchange";
    ownerId: string;
    assetType: "stock" | "bond" | "currency" | "commodity";
    assetId: string;
    side: "buy" | "sell";
}>;
export declare const illegalTradeBodySchema: z.ZodObject<{
    blackMarketId: z.ZodString;
    sellerCompanyId: z.ZodString;
    buyerOwnerType: z.ZodDefault<z.ZodEnum<["player", "company"]>>;
    buyerOwnerId: z.ZodDefault<z.ZodString>;
    quantity: z.ZodNumber;
    smugglingRouteId: z.ZodOptional<z.ZodString>;
    bribeMinor: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    blackMarketId: string;
    sellerCompanyId: string;
    buyerOwnerType: "company" | "player";
    buyerOwnerId: string;
    smugglingRouteId?: string | undefined;
    bribeMinor?: number | undefined;
}, {
    quantity: number;
    blackMarketId: string;
    sellerCompanyId: string;
    buyerOwnerType?: "company" | "player" | undefined;
    buyerOwnerId?: string | undefined;
    smugglingRouteId?: string | undefined;
    bribeMinor?: number | undefined;
}>;
export declare const researchProjectBodySchema: z.ZodObject<{
    companyId: z.ZodString;
    technologyId: z.ZodString;
    fundingPerTickMinor: z.ZodNumber;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    companyId: string;
    technologyId: string;
    fundingPerTickMinor: number;
    name?: string | undefined;
}, {
    companyId: string;
    technologyId: string;
    fundingPerTickMinor: number;
    name?: string | undefined;
}>;
export declare const lobbyingBodySchema: z.ZodObject<{
    playerId: z.ZodString;
    countryId: z.ZodString;
    targetPartyId: z.ZodOptional<z.ZodString>;
    lawType: z.ZodEnum<["profit_tax", "sales_tax", "import_tariff", "export_restriction", "industry_license", "environmental_fine", "martial_law", "nationalization", "deposit_insurance", "bank_bailout"]>;
    amountMinor: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    playerId: string;
    countryId: string;
    amountMinor: number;
    lawType: "profit_tax" | "sales_tax" | "import_tariff" | "export_restriction" | "industry_license" | "environmental_fine" | "martial_law" | "nationalization" | "deposit_insurance" | "bank_bailout";
    targetPartyId?: string | undefined;
}, {
    playerId: string;
    countryId: string;
    amountMinor: number;
    lawType: "profit_tax" | "sales_tax" | "import_tariff" | "export_restriction" | "industry_license" | "environmental_fine" | "martial_law" | "nationalization" | "deposit_insurance" | "bank_bailout";
    targetPartyId?: string | undefined;
}>;
export declare const mediaCampaignBodySchema: z.ZodObject<{
    playerId: z.ZodString;
    countryId: z.ZodString;
    targetPartyId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    spendMinor: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    message: string;
    playerId: string;
    countryId: string;
    spendMinor: number;
    targetPartyId?: string | undefined;
}, {
    message: string;
    playerId: string;
    countryId: string;
    spendMinor: number;
    targetPartyId?: string | undefined;
}>;
export declare const voteBodySchema: z.ZodObject<{
    playerId: z.ZodString;
    countryId: z.ZodString;
    partyId: z.ZodString;
    choice: z.ZodDefault<z.ZodEnum<["for", "against", "abstain"]>>;
}, "strip", z.ZodTypeAny, {
    playerId: string;
    countryId: string;
    partyId: string;
    choice: "for" | "against" | "abstain";
}, {
    playerId: string;
    countryId: string;
    partyId: string;
    choice?: "for" | "against" | "abstain" | undefined;
}>;
export declare const portfolioQuerySchema: z.ZodDefault<z.ZodObject<{
    ownerType: z.ZodDefault<z.ZodEnum<["player", "company", "bank", "state", "exchange"]>>;
    ownerId: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ownerType: "company" | "bank" | "player" | "state" | "exchange";
    ownerId: string;
}, {
    ownerType?: "company" | "bank" | "player" | "state" | "exchange" | undefined;
    ownerId?: string | undefined;
}>>;
export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;
export type CreateShipmentBody = z.infer<typeof createShipmentBodySchema>;
export type ResourcePurchaseBody = z.infer<typeof resourcePurchaseBodySchema>;
export type ManualProductionBody = z.infer<typeof manualProductionBodySchema>;
export type RetailPriceBody = z.infer<typeof retailPriceBodySchema>;
export type LoanApplicationBody = z.infer<typeof loanApplicationBodySchema>;
export type LoanPaymentBody = z.infer<typeof loanPaymentBodySchema>;
export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type IllegalTradeBody = z.infer<typeof illegalTradeBodySchema>;
export type ResearchProjectBody = z.infer<typeof researchProjectBodySchema>;
export type LobbyingBody = z.infer<typeof lobbyingBodySchema>;
export type MediaCampaignBody = z.infer<typeof mediaCampaignBodySchema>;
export type VoteBody = z.infer<typeof voteBodySchema>;
export type SimulationTickBody = z.infer<typeof simulationTickBodySchema>;
//# sourceMappingURL=schemas.d.ts.map