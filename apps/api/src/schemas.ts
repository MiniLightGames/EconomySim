import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().trim().min(1).max(160)
});


const temporaryRefSchema = z.string().trim().regex(/^\$[a-z][a-z0-9-]*:[a-z0-9][a-z0-9-]*(?::[a-z][a-z0-9-]*)?$/i, "Temporary references must look like $entity:alias.").max(160);
const commandDependencySchema = z.array(z.string().trim().min(1).max(160)).max(20).default([]);
const commandBatchHintsSchema = {
  temporaryRef: temporaryRefSchema.optional(),
  dependsOn: commandDependencySchema.optional()
};

export const createCompanyBodySchema = z.object({
  countryId: z.string().trim().min(1).max(160),
  name: z.string().trim().min(2).max(80)
});

export const landPurchaseBodySchema = z.object({
  companyId: z.string().trim().min(1).max(160),
  cityId: z.string().trim().min(1).max(160),
  lotId: z.string().trim().min(1).max(160).optional(),
  mode: z.enum(["purchase", "lease"]).default("purchase")
});

export const createCompanyCommandSchema = z.object({
  ...commandBatchHintsSchema,
  type: z.literal("CreateCompanyCommand"),
  commandId: z.string().trim().min(1).max(160),
  countryId: z.string().trim().min(1).max(160),
  name: z.string().trim().min(2).max(80)
});

export const buyLandCommandSchema = z.object({
  ...commandBatchHintsSchema,
  type: z.literal("BuyLandCommand"),
  commandId: z.string().trim().min(1).max(160),
  companyId: z.string().trim().min(1).max(160),
  cityId: z.string().trim().min(1).max(160),
  lotId: z.string().trim().min(1).max(160),
  mode: z.enum(["purchase", "lease"]).optional()
});

export const buyResourceCommandSchema = z.object({
  ...commandBatchHintsSchema,
  type: z.literal("BuyResourceCommand"),
  commandId: z.string().trim().min(1).max(160),
  buyerCompanyId: z.string().trim().min(1).max(160),
  resourceOfferId: z.string().trim().min(1).max(160),
  quantity: z.number().int().positive().max(1_000_000_000),
  maxUnitPriceMinor: z.number().int().positive().max(10_000_000_000),
  buyerWarehouseId: z.string().trim().min(1).max(160).optional(),
  deliveryMode: z.enum(["pickup", "delivery"]).default("pickup"),
  routeId: z.string().trim().min(1).max(160).optional(),
  transportCompanyId: z.string().trim().min(1).max(160).optional()
});

export const runManualProductionCommandSchema = z.object({
  ...commandBatchHintsSchema,
  type: z.literal("RunManualProductionCommand"),
  commandId: z.string().trim().min(1).max(160),
  companyId: z.string().trim().min(1).max(160),
  productionPlanId: z.string().trim().min(1).max(160),
  requestedQuantity: z.number().int().positive().max(1_000_000_000)
});

export const setRetailPriceCommandSchema = z.object({
  ...commandBatchHintsSchema,
  type: z.literal("SetRetailPriceCommand"),
  commandId: z.string().trim().min(1).max(160),
  companyId: z.string().trim().min(1).max(160),
  productId: z.string().trim().min(1).max(160),
  priceMinor: z.number().int().positive().max(1_000_000_000),
  currencyCode: z.enum(["ECO", "NCR", "SOV"])
});

export const playerCommandSchema = z.discriminatedUnion("type", [
  createCompanyCommandSchema,
  buyLandCommandSchema,
  buyResourceCommandSchema,
  runManualProductionCommandSchema,
  setRetailPriceCommandSchema
]);

export const simulationTickBodySchema = z
  .object({
    commands: z.array(playerCommandSchema).max(50).default([]),
    failurePolicy: z.enum(["all_or_nothing", "partial"]).default("all_or_nothing")
  })
  .default({ commands: [], failurePolicy: "all_or_nothing" });

export const createShipmentBodySchema = z.object({
  originWarehouseId: z.string().trim().min(1).max(160),
  destinationWarehouseId: z.string().trim().min(1).max(160),
  productId: z.string().trim().min(1).max(160),
  quantity: z.number().int().positive().max(1_000_000_000),
  routeId: z.string().trim().min(1).max(160).optional(),
  transportCompanyId: z.string().trim().min(1).max(160).optional()
});

export const resourcePurchaseBodySchema = z.object({
  buyerCompanyId: z.string().trim().min(1).max(160),
  resourceOfferId: z.string().trim().min(1).max(160),
  quantity: z.number().int().positive().max(1_000_000_000),
  maxUnitPriceMinor: z.number().int().positive().max(10_000_000_000),
  buyerWarehouseId: z.string().trim().min(1).max(160).optional(),
  deliveryMode: z.enum(["pickup", "delivery"]).default("pickup"),
  routeId: z.string().trim().min(1).max(160).optional(),
  transportCompanyId: z.string().trim().min(1).max(160).optional()
});

export const manualProductionBodySchema = z.object({
  companyId: z.string().trim().min(1).max(160),
  productionPlanId: z.string().trim().min(1).max(160),
  requestedQuantity: z.number().int().positive().max(1_000_000_000)
});

export const retailPriceBodySchema = z.object({
  companyId: z.string().trim().min(1).max(160),
  priceMinor: z.number().int().positive().max(1_000_000_000),
  currencyCode: z.enum(["ECO", "NCR", "SOV"]).optional()
});

export const loanApplicationBodySchema = z.object({
  borrowerType: z.enum(["company", "bank"]).default("company"),
  borrowerId: z.string().trim().min(1).max(160),
  lenderBankId: z.string().trim().min(1).max(160),
  principalMinor: z.number().int().positive().max(10_000_000_000),
  termTicks: z.number().int().positive().max(87_600),
  collateralCompanyId: z.string().trim().min(1).max(160).optional()
});

export const loanPaymentBodySchema = z.object({
  amountMinor: z.number().int().positive().max(10_000_000_000)
});

export const createOrderBodySchema = z.object({
  exchangeId: z.string().trim().min(1).max(160),
  ownerType: z.enum(["player", "company", "bank", "state", "exchange"]),
  ownerId: z.string().trim().min(1).max(160),
  assetType: z.enum(["stock", "bond", "currency", "commodity"]),
  assetId: z.string().trim().min(1).max(160),
  side: z.enum(["buy", "sell"]),
  priceMinor: z.number().int().positive().max(10_000_000_000),
  quantity: z.number().int().positive().max(1_000_000_000)
});

export const illegalTradeBodySchema = z.object({
  blackMarketId: z.string().trim().min(1).max(260),
  sellerCompanyId: z.string().trim().min(1).max(160),
  buyerOwnerType: z.enum(["player", "company"]).default("player"),
  buyerOwnerId: z.string().trim().min(1).max(160).default("player-1"),
  quantity: z.number().int().positive().max(1_000_000_000),
  smugglingRouteId: z.string().trim().min(1).max(160).optional(),
  bribeMinor: z.number().int().min(0).max(10_000_000_000).optional()
});

export const researchProjectBodySchema = z.object({
  companyId: z.string().trim().min(1).max(160),
  technologyId: z.string().trim().min(1).max(160),
  fundingPerTickMinor: z.number().int().positive().max(10_000_000_000),
  name: z.string().trim().min(2).max(120).optional()
});

const lawTypeSchema = z.enum([
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

export const lobbyingBodySchema = z.object({
  countryId: z.string().trim().min(1).max(160),
  targetPartyId: z.string().trim().min(1).max(160).optional(),
  lawType: lawTypeSchema,
  amountMinor: z.number().int().positive().max(10_000_000_000)
});

export const mediaCampaignBodySchema = z.object({
  countryId: z.string().trim().min(1).max(160),
  targetPartyId: z.string().trim().min(1).max(160).optional(),
  message: z.string().trim().min(2).max(240),
  spendMinor: z.number().int().positive().max(10_000_000_000)
});

export const voteBodySchema = z.object({
  countryId: z.string().trim().min(1).max(160),
  partyId: z.string().trim().min(1).max(160),
  choice: z.enum(["for", "against", "abstain"]).default("for")
});

export const portfolioQuerySchema = z
  .object({
    ownerType: z.enum(["player", "company", "bank", "state", "exchange"]).default("player"),
    ownerId: z.string().trim().min(1).max(160).default("player-1")
  })
  .default({ ownerType: "player", ownerId: "player-1" });

export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;
export type LandPurchaseBody = z.infer<typeof landPurchaseBodySchema>;
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
