import type {
  BankAccount,
  Company,
  CreditScore,
  DomainEvent,
  License,
  ProductionPlan,
  RetailOffer,
  Warehouse,
  WorldState
} from "@economysim/domain";
import { createInitialWorldState } from "@economysim/domain";
import { ApiError } from "./errors";

export interface StoreHealth {
  readonly kind: "memory" | "prisma";
  readonly status: "ok" | "degraded";
  readonly message?: string;
}

export interface WorldStore {
  readonly kind: "memory" | "prisma";
  loadWorld(): Promise<WorldState>;
  saveWorld(state: WorldState): Promise<void>;
  health(): Promise<StoreHealth>;
  close(): Promise<void>;
}

export class InMemoryWorldStore implements WorldStore {
  readonly kind = "memory" as const;
  private state: WorldState;

  constructor(initialState: WorldState = createInitialWorldState("api")) {
    this.state = initialState;
  }

  async loadWorld(): Promise<WorldState> {
    return upgradeWorldState(structuredClone(this.state), "api");
  }

  async saveWorld(state: WorldState): Promise<void> {
    this.state = structuredClone(state);
  }

  async health(): Promise<StoreHealth> {
    return {
      kind: this.kind,
      status: "ok",
      message: "In-memory bootstrap store is active."
    };
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }
}

interface PrismaSnapshotRecord {
  readonly payload: unknown;
}

interface PrismaSnapshotDelegate {
  findFirst(args: unknown): Promise<PrismaSnapshotRecord | null>;
  create(args: unknown): Promise<unknown>;
}

interface PrismaWriteDelegate {
  upsert?(args: unknown): Promise<unknown>;
  create?(args: unknown): Promise<unknown>;
  createMany?(args: unknown): Promise<unknown>;
}

export interface PrismaClientLike {
  readonly snapshot: PrismaSnapshotDelegate;
  readonly company?: PrismaWriteDelegate;
  readonly warehouse?: PrismaWriteDelegate;
  readonly bankAccount?: PrismaWriteDelegate;
  readonly creditScore?: PrismaWriteDelegate;
  readonly productionPlan?: PrismaWriteDelegate;
  readonly retailOffer?: PrismaWriteDelegate;
  readonly inventoryLot?: PrismaWriteDelegate;
  readonly resourcePurchase?: PrismaWriteDelegate;
  readonly manualProductionRun?: PrismaWriteDelegate;
  readonly retailPriceChange?: PrismaWriteDelegate;
  readonly financialTransaction?: PrismaWriteDelegate;
  readonly playerCommandRecord?: PrismaWriteDelegate;
  readonly event?: PrismaWriteDelegate;
  readonly metric?: PrismaWriteDelegate;
  readonly auditLog?: PrismaWriteDelegate;
  $transaction?<T>(fn: (tx: PrismaClientLike) => Promise<T>): Promise<T>;
  $queryRawUnsafe(query: string): Promise<unknown>;
  $disconnect(): Promise<void>;
}

export class PrismaWorldStore implements WorldStore {
  readonly kind = "prisma" as const;
  private saveSequence = 0;

  constructor(
    private readonly prisma: PrismaClientLike,
    private readonly seed = "api"
  ) {}

  async loadWorld(): Promise<WorldState> {
    const snapshot = await this.prisma.snapshot.findFirst({
      orderBy: [{ tick: "desc" }, { createdAt: "desc" }]
    });

    if (snapshot) {
      return upgradeWorldState(snapshot.payload as WorldState, this.seed);
    }

    const state = createInitialWorldState(this.seed);
    await this.saveWorld(state);
    return state;
  }

  async saveWorld(state: WorldState): Promise<void> {
    this.saveSequence += 1;
    const createdAt = new Date().toISOString();
    const snapshot = {
      id: `${this.seed}-snapshot-${state.currentTick}-${Date.now()}-${this.saveSequence}`,
      tick: state.currentTick,
      createdAt,
      stateHash: `${this.seed}:${state.currentTick}:${Date.now()}:${this.saveSequence}`
    };
    const persistedState: WorldState = {
      ...state,
      snapshots: [...state.snapshots, snapshot]
    };

    await this.writeTransaction(async (tx) => {
      await persistNormalizedWorldState(tx, persistedState);
      await tx.snapshot.create({
        data: {
          id: snapshot.id,
          tick: snapshot.tick,
          stateHash: snapshot.stateHash,
          payload: persistedState
        }
      });
    });
  }

  private async writeTransaction<T>(fn: (tx: PrismaClientLike) => Promise<T>): Promise<T> {
    if (this.prisma.$transaction) {
      return this.prisma.$transaction(fn);
    }

    return fn(this.prisma);
  }

  async health(): Promise<StoreHealth> {
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");
      return {
        kind: this.kind,
        status: "ok"
      };
    } catch (error) {
      return {
        kind: this.kind,
        status: "degraded",
        message: error instanceof Error ? error.message : "Prisma health check failed."
      };
    }
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}


async function persistNormalizedWorldState(prisma: PrismaClientLike, state: WorldState): Promise<void> {
  for (const company of state.companies) {
    await prisma.company?.upsert?.({
      where: { id: company.id },
      update: {
        ownerType: company.ownerType,
        ownerId: company.ownerId,
        countryId: company.countryId,
        name: company.name,
        legalStatus: company.legalStatus,
        cashBalanceMinor: BigInt(company.cashBalanceMinor),
        currencyCode: company.currencyCode,
        reputation: company.reputation,
        bankruptcyStatus: company.bankruptcyStatus
      },
      create: {
        id: company.id,
        ownerType: company.ownerType,
        ownerId: company.ownerId,
        countryId: company.countryId,
        name: company.name,
        legalStatus: company.legalStatus,
        cashBalanceMinor: BigInt(company.cashBalanceMinor),
        currencyCode: company.currencyCode,
        reputation: company.reputation,
        bankruptcyStatus: company.bankruptcyStatus
      }
    });
  }

  for (const account of state.bankAccounts) {
    await prisma.bankAccount?.upsert?.({
      where: { id: account.id },
      update: {
        bankId: account.bankId,
        ownerType: account.ownerType,
        ownerId: account.ownerId,
        accountType: account.accountType,
        currencyCode: account.currencyCode,
        balanceMinor: BigInt(account.balanceMinor),
        reservedMinor: BigInt(account.reservedMinor),
        insured: account.insured,
        status: account.status
      },
      create: {
        id: account.id,
        bankId: account.bankId,
        ownerType: account.ownerType,
        ownerId: account.ownerId,
        accountType: account.accountType,
        currencyCode: account.currencyCode,
        balanceMinor: BigInt(account.balanceMinor),
        reservedMinor: BigInt(account.reservedMinor),
        insured: account.insured,
        status: account.status
      }
    });
  }

  for (const score of state.creditScores) {
    await prisma.creditScore?.upsert?.({
      where: { id: score.id },
      update: {
        borrowerType: score.borrowerType,
        borrowerId: score.borrowerId,
        score: score.score,
        probabilityOfDefault: score.probabilityOfDefault,
        lastUpdatedTick: score.lastUpdatedTick
      },
      create: {
        id: score.id,
        borrowerType: score.borrowerType,
        borrowerId: score.borrowerId,
        score: score.score,
        probabilityOfDefault: score.probabilityOfDefault,
        lastUpdatedTick: score.lastUpdatedTick
      }
    });
  }

  for (const warehouse of state.warehouses) {
    await prisma.warehouse?.upsert?.({
      where: { id: warehouse.id },
      update: {
        companyId: warehouse.companyId,
        cityId: warehouse.cityId,
        name: warehouse.name,
        warehouseType: warehouse.warehouseType,
        capacity: warehouse.capacity,
        handlingCostMinorPerUnit: warehouse.handlingCostMinorPerUnit
      },
      create: {
        id: warehouse.id,
        companyId: warehouse.companyId,
        cityId: warehouse.cityId,
        name: warehouse.name,
        warehouseType: warehouse.warehouseType,
        capacity: warehouse.capacity,
        handlingCostMinorPerUnit: warehouse.handlingCostMinorPerUnit
      }
    });
  }

  for (const lot of state.inventoryLots) {
    await prisma.inventoryLot?.upsert?.({
      where: { id: lot.id },
      update: {
        warehouseId: lot.warehouseId,
        productId: lot.productId,
        quantity: lot.quantity,
        quality: lot.quality
      },
      create: {
        id: lot.id,
        warehouseId: lot.warehouseId,
        productId: lot.productId,
        quantity: lot.quantity,
        quality: lot.quality
      }
    });
  }

  for (const plan of state.productionPlans) {
    await prisma.productionPlan?.upsert?.({
      where: { id: plan.id },
      update: {
        companyId: plan.companyId,
        warehouseId: plan.warehouseId,
        outputProductId: plan.outputProductId,
        outputQuantityPerTick: plan.outputQuantityPerTick,
        inputs: plan.inputs,
        active: plan.active
      },
      create: {
        id: plan.id,
        companyId: plan.companyId,
        warehouseId: plan.warehouseId,
        outputProductId: plan.outputProductId,
        outputQuantityPerTick: plan.outputQuantityPerTick,
        inputs: plan.inputs,
        active: plan.active
      }
    });
  }

  for (const offer of state.retailOffers) {
    await prisma.retailOffer?.upsert?.({
      where: { id: offer.id },
      update: {
        companyId: offer.companyId,
        warehouseId: offer.warehouseId,
        productId: offer.productId,
        priceMinor: offer.priceMinor,
        quality: offer.quality,
        active: offer.active
      },
      create: {
        id: offer.id,
        companyId: offer.companyId,
        warehouseId: offer.warehouseId,
        productId: offer.productId,
        priceMinor: offer.priceMinor,
        quality: offer.quality,
        active: offer.active
      }
    });
  }

  for (const purchase of state.resourcePurchases) {
    await prisma.resourcePurchase?.upsert?.({
      where: { id: purchase.id },
      update: {
        tick: purchase.tick,
        playerId: purchase.playerId,
        buyerCompanyId: purchase.buyerCompanyId,
        sellerCompanyId: purchase.sellerCompanyId,
        sellerWarehouseId: purchase.sellerWarehouseId,
        buyerWarehouseId: purchase.buyerWarehouseId,
        productId: purchase.productId,
        quantity: purchase.quantity,
        unitPriceMinor: BigInt(purchase.unitPriceMinor),
        totalPriceMinor: BigInt(purchase.totalPriceMinor),
        quality: purchase.quality,
        status: purchase.status
      },
      create: {
        id: purchase.id,
        tick: purchase.tick,
        playerId: purchase.playerId,
        buyerCompanyId: purchase.buyerCompanyId,
        sellerCompanyId: purchase.sellerCompanyId,
        sellerWarehouseId: purchase.sellerWarehouseId,
        buyerWarehouseId: purchase.buyerWarehouseId,
        productId: purchase.productId,
        quantity: purchase.quantity,
        unitPriceMinor: BigInt(purchase.unitPriceMinor),
        totalPriceMinor: BigInt(purchase.totalPriceMinor),
        quality: purchase.quality,
        status: purchase.status
      }
    });
  }

  for (const run of state.manualProductionRuns) {
    await prisma.manualProductionRun?.upsert?.({
      where: { id: run.id },
      update: {
        tick: run.tick,
        playerId: run.playerId,
        companyId: run.companyId,
        productionPlanId: run.productionPlanId,
        warehouseId: run.warehouseId,
        outputProductId: run.outputProductId,
        requestedQuantity: run.requestedQuantity,
        producedQuantity: run.producedQuantity,
        inputConsumptions: run.inputConsumptions,
        status: run.status
      },
      create: {
        id: run.id,
        tick: run.tick,
        playerId: run.playerId,
        companyId: run.companyId,
        productionPlanId: run.productionPlanId,
        warehouseId: run.warehouseId,
        outputProductId: run.outputProductId,
        requestedQuantity: run.requestedQuantity,
        producedQuantity: run.producedQuantity,
        inputConsumptions: run.inputConsumptions,
        status: run.status
      }
    });
  }

  for (const change of state.retailPriceChanges) {
    await prisma.retailPriceChange?.upsert?.({
      where: { id: change.id },
      update: {
        tick: change.tick,
        playerId: change.playerId,
        companyId: change.companyId,
        retailOfferId: change.retailOfferId,
        productId: change.productId,
        oldPriceMinor: BigInt(change.oldPriceMinor),
        newPriceMinor: BigInt(change.newPriceMinor),
        currencyCode: change.currencyCode,
        status: change.status
      },
      create: {
        id: change.id,
        tick: change.tick,
        playerId: change.playerId,
        companyId: change.companyId,
        retailOfferId: change.retailOfferId,
        productId: change.productId,
        oldPriceMinor: BigInt(change.oldPriceMinor),
        newPriceMinor: BigInt(change.newPriceMinor),
        currencyCode: change.currencyCode,
        status: change.status
      }
    });
  }

  for (const event of state.events.slice(-100)) {
    await prisma.event?.upsert?.({
      where: { id: event.id },
      update: {
        tick: event.tick,
        type: event.type,
        message: event.message,
        entityIds: event.entityIds,
        metadata: event.metadata
      },
      create: {
        id: event.id,
        tick: event.tick,
        type: event.type,
        message: event.message,
        entityIds: event.entityIds,
        metadata: event.metadata
      }
    });
  }

  for (const metric of state.metrics.slice(-100)) {
    await prisma.metric?.upsert?.({
      where: { id: metric.id },
      update: {
        tick: metric.tick,
        name: metric.name,
        value: metric.value,
        tags: metric.tags
      },
      create: {
        id: metric.id,
        tick: metric.tick,
        name: metric.name,
        value: metric.value,
        tags: metric.tags
      }
    });
  }

  for (const command of state.playerCommands ?? []) {
    await prisma.playerCommandRecord?.upsert?.({
      where: { id: command.id },
      update: {
        commandId: command.commandId,
        idempotencyKey: command.idempotencyKey,
        status: command.status,
        commandType: command.commandType,
        command: command.command,
        userId: command.userId,
        playerId: command.playerId,
        tickReceived: command.tickReceived,
        tickScheduled: command.tickScheduled,
        tickApplied: command.tickApplied,
        resultEventIds: command.resultEventIds,
        resultMetricIds: command.resultMetricIds,
        resultFinancialTransactionIds: command.resultFinancialTransactionIds,
        affectedEntityIds: command.affectedEntityIds,
        rejectionCode: command.rejectionCode,
        rejectionMessage: command.rejectionMessage,
        createdAt: new Date(command.createdAt),
        updatedAt: new Date(command.updatedAt)
      },
      create: {
        id: command.id,
        commandId: command.commandId,
        idempotencyKey: command.idempotencyKey,
        status: command.status,
        commandType: command.commandType,
        command: command.command,
        userId: command.userId,
        playerId: command.playerId,
        tickReceived: command.tickReceived,
        tickScheduled: command.tickScheduled,
        tickApplied: command.tickApplied,
        resultEventIds: command.resultEventIds,
        resultMetricIds: command.resultMetricIds,
        resultFinancialTransactionIds: command.resultFinancialTransactionIds,
        affectedEntityIds: command.affectedEntityIds,
        rejectionCode: command.rejectionCode,
        rejectionMessage: command.rejectionMessage,
        createdAt: new Date(command.createdAt),
        updatedAt: new Date(command.updatedAt)
      }
    });
  }

  for (const auditLog of state.auditLogs ?? []) {
    await prisma.auditLog?.upsert?.({
      where: { id: auditLog.id },
      update: {
        userId: auditLog.userId,
        playerId: auditLog.playerId,
        actionType: auditLog.actionType,
        commandId: auditLog.commandId,
        idempotencyKey: auditLog.idempotencyKey,
        payloadHash: `${auditLog.actionType}:${auditLog.commandId ?? auditLog.id}:${auditLog.result}`,
        tick: auditLog.tick,
        result: auditLog.result,
        affectedEntities: auditLog.affectedEntityIds,
        eventIds: auditLog.eventIds,
        metricIds: auditLog.metricIds,
        financialTransactionIds: auditLog.financialTransactionIds,
        metadata: auditLog.metadata,
        createdAt: new Date(auditLog.createdAt)
      },
      create: {
        id: auditLog.id,
        userId: auditLog.userId,
        playerId: auditLog.playerId,
        actionType: auditLog.actionType,
        commandId: auditLog.commandId,
        idempotencyKey: auditLog.idempotencyKey,
        payloadHash: `${auditLog.actionType}:${auditLog.commandId ?? auditLog.id}:${auditLog.result}`,
        tick: auditLog.tick,
        result: auditLog.result,
        affectedEntities: auditLog.affectedEntityIds,
        eventIds: auditLog.eventIds,
        metricIds: auditLog.metricIds,
        financialTransactionIds: auditLog.financialTransactionIds,
        metadata: auditLog.metadata,
        createdAt: new Date(auditLog.createdAt)
      }
    });
  }
}

function upgradeWorldState(state: WorldState, seed: string): WorldState {
  const retailPriceChanges = state.retailPriceChanges ?? [];
  const resourceOffers = state.resourceOffers ?? [];
  const resourcePurchases = state.resourcePurchases ?? [];
  const manualProductionRuns = state.manualProductionRuns ?? [];
  const playerCommands = state.playerCommands ?? [];
  const auditLogs = state.auditLogs ?? [];
  const wheat = state.products.find((product) => product.name.toLocaleLowerCase() === "wheat") ?? null;
  const grainfordWarehouse =
    state.warehouses.find(
      (warehouse) =>
        warehouse.name.toLocaleLowerCase().includes("grainford") &&
        state.inventoryLots.some((lot) => lot.warehouseId === warehouse.id && lot.productId === wheat?.id && lot.quantity > 0)
    ) ?? null;
  const sellerCompany = grainfordWarehouse ? state.companies.find((company) => company.id === grainfordWarehouse.companyId) ?? null : null;
  const hasDefaultResourceOffer = wheat
    ? resourceOffers.some((offer) => offer.productId === wheat.id && offer.warehouseId === grainfordWarehouse?.id)
    : true;
  const upgradedResourceOffers =
    wheat && grainfordWarehouse && sellerCompany && !hasDefaultResourceOffer
      ? [
          ...resourceOffers,
          {
            id: `${seed}-resource-offer-grainford-wheat`,
            companyId: sellerCompany.id,
            warehouseId: grainfordWarehouse.id,
            productId: wheat.id,
            unitPriceMinor: 85,
            quality: wheat.baseQuality,
            maxQuantityPerTick: 20_000,
            active: true
          }
        ]
      : resourceOffers;

  return {
    ...state,
    retailPriceChanges,
    resourceOffers: upgradedResourceOffers,
    resourcePurchases,
    manualProductionRuns,
    playerCommands,
    auditLogs
  };
}

export function addCompanyToWorld(
  state: WorldState,
  input: {
    readonly playerId: string;
    readonly countryId: string;
    readonly name: string;
  }
): { readonly state: WorldState; readonly company: Company } {
  const country = state.countries.find((candidate) => candidate.id === input.countryId);

  if (!country) {
    throw new ApiError(400, "UNKNOWN_COUNTRY", "Company cannot be registered in an unknown country.", {
      countryId: input.countryId
    });
  }

  const starterCity = state.cities.find((city) => city.countryId === input.countryId) ?? null;

  if (!starterCity) {
    throw new ApiError(400, "NO_CITY_AVAILABLE", "Company needs at least one city in the selected country.", {
      countryId: input.countryId
    });
  }

  const normalizedName = input.name.trim();
  const nameExists = state.companies.some(
    (company) => company.countryId === input.countryId && company.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
  );

  if (nameExists) {
    throw new ApiError(400, "COMPANY_NAME_TAKEN", "Company name is already registered in this country.", {
      countryId: input.countryId,
      name: normalizedName
    });
  }

  const company: Company = {
    id: `company-${state.currentTick + 1}-${slugify(normalizedName)}`,
    ownerType: "player",
    ownerId: input.playerId,
    countryId: input.countryId,
    name: normalizedName,
    legalStatus: "registered",
    cashBalanceMinor: 0,
    currencyCode: country.currencyCode,
    reputation: 0.5,
    bankruptcyStatus: "none"
  };
  const bank = state.banks.find((candidate) => candidate.countryId === input.countryId && candidate.solvent) ?? state.banks[0] ?? null;
  const account: BankAccount | null = bank
    ? {
        id: `account-${state.currentTick + 1}-${company.id}`,
        bankId: bank.id,
        ownerType: "company",
        ownerId: company.id,
        accountType: "checking",
        currencyCode: country.currencyCode,
        balanceMinor: 0,
        reservedMinor: 0,
        insured: false,
        status: "active"
      }
    : null;
  const starterWarehouse: Warehouse = {
    id: `warehouse-${state.currentTick + 1}-${company.id}-starter`,
    companyId: company.id,
    cityId: starterCity.id,
    name: `${company.name} Starter Warehouse`,
    warehouseType: "general",
    capacity: 50_000,
    handlingCostMinorPerUnit: 6
  };
  const wheatProduct = state.products.find((product) => product.name.toLocaleLowerCase() === "wheat") ?? null;
  const breadProduct = state.products.find((product) => product.name.toLocaleLowerCase() === "bread") ?? null;
  const starterProductionPlan: ProductionPlan | null =
    wheatProduct && breadProduct
      ? {
          id: `production-${state.currentTick + 1}-${company.id}-bread`,
          companyId: company.id,
          warehouseId: starterWarehouse.id,
          outputProductId: breadProduct.id,
          outputQuantityPerTick: 2_000,
          inputs: [{ productId: wheatProduct.id, quantityPerOutput: 0.4 }],
          active: false
        }
      : null;
  const starterRetailOffer: RetailOffer | null =
    breadProduct && starterProductionPlan
      ? {
          id: `offer-${state.currentTick + 1}-${company.id}-bread`,
          companyId: company.id,
          warehouseId: starterWarehouse.id,
          productId: breadProduct.id,
          priceMinor: 340,
          quality: breadProduct.baseQuality,
          active: true
        }
      : null;
  const foodLicenseLaw = state.laws.find(
    (law) => law.countryId === input.countryId && law.type === "industry_license" && law.status === "active" && law.parameters.industry === "food"
  );
  const starterLicense: License | null =
    foodLicenseLaw && starterProductionPlan
      ? {
          id: `license-${state.currentTick + 1}-${company.id}-food`,
          countryId: input.countryId,
          companyId: company.id,
          industry: "food",
          lawId: foodLicenseLaw.id,
          status: "active",
          issuedTick: state.currentTick,
          expiresTick: null
        }
      : null;
  const creditScore: CreditScore = {
    id: `credit-company-${company.id}`,
    borrowerType: "company",
    borrowerId: company.id,
    score: 0.52,
    probabilityOfDefault: 0.18,
    lastUpdatedTick: state.currentTick
  };
  const event: DomainEvent = {
    id: `event-${state.currentTick}-company-${company.id}-registered`,
    tick: state.currentTick,
    type: "CompanyRegisteredEvent",
    message: `${company.name} registered in ${country.name}.`,
    entityIds: [company.id, country.id, input.playerId],
    metadata: {
      companyId: company.id,
      countryId: country.id,
      playerId: input.playerId,
      starterWarehouseId: starterWarehouse.id,
      starterProductionPlanId: starterProductionPlan?.id ?? ""
    }
  };

  return {
    company,
    state: {
      ...state,
      companies: [...state.companies, company],
      bankAccounts: account ? [...state.bankAccounts, account] : state.bankAccounts,
      creditScores: [...state.creditScores, creditScore],
      warehouses: [...state.warehouses, starterWarehouse],
      productionPlans: starterProductionPlan ? [...state.productionPlans, starterProductionPlan] : state.productionPlans,
      retailOffers: starterRetailOffer ? [...state.retailOffers, starterRetailOffer] : state.retailOffers,
      licenses: starterLicense ? [...state.licenses, starterLicense] : state.licenses,
      events: [...state.events, event]
    }
  };
}

function slugify(value: string): string {
  const slug = value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "company";
}
