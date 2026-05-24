"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioQuerySchema = exports.voteBodySchema = exports.mediaCampaignBodySchema = exports.lobbyingBodySchema = exports.researchProjectBodySchema = exports.illegalTradeBodySchema = exports.createOrderBodySchema = exports.loanPaymentBodySchema = exports.loanApplicationBodySchema = exports.retailPriceBodySchema = exports.manualProductionBodySchema = exports.resourcePurchaseBodySchema = exports.createShipmentBodySchema = exports.simulationTickBodySchema = exports.playerCommandSchema = exports.setRetailPriceCommandSchema = exports.runManualProductionCommandSchema = exports.buyResourceCommandSchema = exports.buyLandCommandSchema = exports.createCompanyCommandSchema = exports.landPurchaseBodySchema = exports.createCompanyBodySchema = exports.idParamsSchema = void 0;
const zod_1 = require("zod");
exports.idParamsSchema = zod_1.z.object({
    id: zod_1.z.string().trim().min(1).max(160)
});
exports.createCompanyBodySchema = zod_1.z.object({
    countryId: zod_1.z.string().trim().min(1).max(160),
    name: zod_1.z.string().trim().min(2).max(80)
});
exports.landPurchaseBodySchema = zod_1.z.object({
    companyId: zod_1.z.string().trim().min(1).max(160),
    cityId: zod_1.z.string().trim().min(1).max(160),
    lotId: zod_1.z.string().trim().min(1).max(160).optional(),
    mode: zod_1.z.enum(["purchase", "lease"]).default("purchase")
});
exports.createCompanyCommandSchema = zod_1.z.object({
    type: zod_1.z.literal("CreateCompanyCommand"),
    commandId: zod_1.z.string().trim().min(1).max(160),
    playerId: zod_1.z.string().trim().min(1).max(128).optional(),
    countryId: zod_1.z.string().trim().min(1).max(160),
    name: zod_1.z.string().trim().min(2).max(80)
});
exports.buyLandCommandSchema = zod_1.z.object({
    type: zod_1.z.literal("BuyLandCommand"),
    commandId: zod_1.z.string().trim().min(1).max(160),
    playerId: zod_1.z.string().trim().min(1).max(128).optional(),
    companyId: zod_1.z.string().trim().min(1).max(160),
    cityId: zod_1.z.string().trim().min(1).max(160),
    lotId: zod_1.z.string().trim().min(1).max(160),
    mode: zod_1.z.enum(["purchase", "lease"]).optional()
});
exports.buyResourceCommandSchema = zod_1.z.object({
    type: zod_1.z.literal("BuyResourceCommand"),
    commandId: zod_1.z.string().trim().min(1).max(160),
    playerId: zod_1.z.string().trim().min(1).max(128).optional(),
    buyerCompanyId: zod_1.z.string().trim().min(1).max(160),
    resourceOfferId: zod_1.z.string().trim().min(1).max(160),
    quantity: zod_1.z.number().int().positive().max(1_000_000_000),
    maxUnitPriceMinor: zod_1.z.number().int().positive().max(10_000_000_000),
    buyerWarehouseId: zod_1.z.string().trim().min(1).max(160).optional()
});
exports.runManualProductionCommandSchema = zod_1.z.object({
    type: zod_1.z.literal("RunManualProductionCommand"),
    commandId: zod_1.z.string().trim().min(1).max(160),
    playerId: zod_1.z.string().trim().min(1).max(128).optional(),
    companyId: zod_1.z.string().trim().min(1).max(160),
    productionPlanId: zod_1.z.string().trim().min(1).max(160),
    requestedQuantity: zod_1.z.number().int().positive().max(1_000_000_000)
});
exports.setRetailPriceCommandSchema = zod_1.z.object({
    type: zod_1.z.literal("SetRetailPriceCommand"),
    commandId: zod_1.z.string().trim().min(1).max(160),
    playerId: zod_1.z.string().trim().min(1).max(128).optional(),
    companyId: zod_1.z.string().trim().min(1).max(160),
    productId: zod_1.z.string().trim().min(1).max(160),
    priceMinor: zod_1.z.number().int().positive().max(1_000_000_000),
    currencyCode: zod_1.z.enum(["ECO", "NCR", "SOV"])
});
exports.playerCommandSchema = zod_1.z.discriminatedUnion("type", [
    exports.createCompanyCommandSchema,
    exports.buyLandCommandSchema,
    exports.buyResourceCommandSchema,
    exports.runManualProductionCommandSchema,
    exports.setRetailPriceCommandSchema
]);
exports.simulationTickBodySchema = zod_1.z
    .object({
    commands: zod_1.z.array(exports.playerCommandSchema).max(50).default([])
})
    .default({ commands: [] });
exports.createShipmentBodySchema = zod_1.z.object({
    originWarehouseId: zod_1.z.string().trim().min(1).max(160),
    destinationWarehouseId: zod_1.z.string().trim().min(1).max(160),
    productId: zod_1.z.string().trim().min(1).max(160),
    quantity: zod_1.z.number().int().positive().max(1_000_000_000),
    routeId: zod_1.z.string().trim().min(1).max(160).optional(),
    transportCompanyId: zod_1.z.string().trim().min(1).max(160).optional()
});
exports.resourcePurchaseBodySchema = zod_1.z.object({
    buyerCompanyId: zod_1.z.string().trim().min(1).max(160),
    resourceOfferId: zod_1.z.string().trim().min(1).max(160),
    quantity: zod_1.z.number().int().positive().max(1_000_000_000),
    maxUnitPriceMinor: zod_1.z.number().int().positive().max(10_000_000_000),
    buyerWarehouseId: zod_1.z.string().trim().min(1).max(160).optional()
});
exports.manualProductionBodySchema = zod_1.z.object({
    companyId: zod_1.z.string().trim().min(1).max(160),
    productionPlanId: zod_1.z.string().trim().min(1).max(160),
    requestedQuantity: zod_1.z.number().int().positive().max(1_000_000_000)
});
exports.retailPriceBodySchema = zod_1.z.object({
    companyId: zod_1.z.string().trim().min(1).max(160),
    priceMinor: zod_1.z.number().int().positive().max(1_000_000_000),
    currencyCode: zod_1.z.enum(["ECO", "NCR", "SOV"]).optional()
});
exports.loanApplicationBodySchema = zod_1.z.object({
    borrowerType: zod_1.z.enum(["company", "bank"]).default("company"),
    borrowerId: zod_1.z.string().trim().min(1).max(160),
    lenderBankId: zod_1.z.string().trim().min(1).max(160),
    principalMinor: zod_1.z.number().int().positive().max(10_000_000_000),
    termTicks: zod_1.z.number().int().positive().max(87_600),
    collateralCompanyId: zod_1.z.string().trim().min(1).max(160).optional()
});
exports.loanPaymentBodySchema = zod_1.z.object({
    amountMinor: zod_1.z.number().int().positive().max(10_000_000_000)
});
exports.createOrderBodySchema = zod_1.z.object({
    exchangeId: zod_1.z.string().trim().min(1).max(160),
    ownerType: zod_1.z.enum(["player", "company", "bank", "state", "exchange"]),
    ownerId: zod_1.z.string().trim().min(1).max(160),
    assetType: zod_1.z.enum(["stock", "bond", "currency", "commodity"]),
    assetId: zod_1.z.string().trim().min(1).max(160),
    side: zod_1.z.enum(["buy", "sell"]),
    priceMinor: zod_1.z.number().int().positive().max(10_000_000_000),
    quantity: zod_1.z.number().int().positive().max(1_000_000_000)
});
exports.illegalTradeBodySchema = zod_1.z.object({
    blackMarketId: zod_1.z.string().trim().min(1).max(260),
    sellerCompanyId: zod_1.z.string().trim().min(1).max(160),
    buyerOwnerType: zod_1.z.enum(["player", "company"]).default("player"),
    buyerOwnerId: zod_1.z.string().trim().min(1).max(160).default("player-1"),
    quantity: zod_1.z.number().int().positive().max(1_000_000_000),
    smugglingRouteId: zod_1.z.string().trim().min(1).max(160).optional(),
    bribeMinor: zod_1.z.number().int().min(0).max(10_000_000_000).optional()
});
exports.researchProjectBodySchema = zod_1.z.object({
    companyId: zod_1.z.string().trim().min(1).max(160),
    technologyId: zod_1.z.string().trim().min(1).max(160),
    fundingPerTickMinor: zod_1.z.number().int().positive().max(10_000_000_000),
    name: zod_1.z.string().trim().min(2).max(120).optional()
});
const lawTypeSchema = zod_1.z.enum([
    "profit_tax",
    "sales_tax",
    "import_tariff",
    "export_restriction",
    "industry_license",
    "environmental_fine",
    "martial_law",
    "nationalization",
    "deposit_insurance",
    "bank_bailout"
]);
exports.lobbyingBodySchema = zod_1.z.object({
    countryId: zod_1.z.string().trim().min(1).max(160),
    targetPartyId: zod_1.z.string().trim().min(1).max(160).optional(),
    lawType: lawTypeSchema,
    amountMinor: zod_1.z.number().int().positive().max(10_000_000_000)
});
exports.mediaCampaignBodySchema = zod_1.z.object({
    countryId: zod_1.z.string().trim().min(1).max(160),
    targetPartyId: zod_1.z.string().trim().min(1).max(160).optional(),
    message: zod_1.z.string().trim().min(2).max(240),
    spendMinor: zod_1.z.number().int().positive().max(10_000_000_000)
});
exports.voteBodySchema = zod_1.z.object({
    countryId: zod_1.z.string().trim().min(1).max(160),
    partyId: zod_1.z.string().trim().min(1).max(160),
    choice: zod_1.z.enum(["for", "against", "abstain"]).default("for")
});
exports.portfolioQuerySchema = zod_1.z
    .object({
    ownerType: zod_1.z.enum(["player", "company", "bank", "state", "exchange"]).default("player"),
    ownerId: zod_1.z.string().trim().min(1).max(160).default("player-1")
})
    .default({ ownerType: "player", ownerId: "player-1" });
//# sourceMappingURL=schemas.js.map