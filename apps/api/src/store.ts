import type {
  AuditLog,
  BankAccount,
  Company,
  CreditScore,
  DomainEvent,
  EventCause,
  EventImpact,
  Explanation,
  FinancialEntry,
  FinancialTransaction,
  InventoryLot,
  ManualProductionRun,
  Metric,
  NewsItem,
  PlayerCommandRecord,
  ProductionInput,
  ProductionPlan,
  ResourceOffer,
  ResourcePurchase,
  RetailOffer,
  RetailPriceChange,
  Shipment,
  Warehouse,
  WorldState
} from "@economysim/domain";
import { createInitialWorldState } from "@economysim/domain";

export interface StoreHealth {
  readonly kind: "memory" | "prisma";
  readonly status: "ok" | "degraded";
  readonly message?: string;
}

export interface PersistenceConsistencyStatus {
  readonly mode: "memory" | "snapshot-plus-normalized";
  readonly status: "memory" | "empty" | "consistent" | "snapshot-only" | "normalized-ahead" | "snapshot-ahead" | "diverged" | "degraded";
  readonly snapshotTick: number | null;
  readonly normalizedLatestTick: number | null;
  readonly hydratedFromNormalized: boolean;
  readonly snapshotFallbackAvailable: boolean;
  readonly normalizedSources: readonly string[];
  readonly message?: string;
}

export interface WorldStore {
  readonly kind: "memory" | "prisma";
  loadWorld(): Promise<WorldState>;
  saveWorld(state: WorldState): Promise<void>;
  consistencyStatus(): Promise<PersistenceConsistencyStatus>;
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

  async consistencyStatus(): Promise<PersistenceConsistencyStatus> {
    return {
      mode: "memory",
      status: "memory",
      snapshotTick: this.state.currentTick,
      normalizedLatestTick: null,
      hydratedFromNormalized: false,
      snapshotFallbackAvailable: true,
      normalizedSources: [],
      message: "In-memory store has no normalized read model."
    };
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
  readonly tick?: number;
  readonly createdAt?: Date | string;
  readonly payload: unknown;
}

interface PrismaSnapshotDelegate {
  findFirst(args: unknown): Promise<PrismaSnapshotRecord | null>;
  create(args: unknown): Promise<unknown>;
}

interface PrismaReadWriteDelegate {
  findFirst?(args: unknown): Promise<unknown | null>;
  findMany?(args?: unknown): Promise<unknown[]>;
  upsert?(args: unknown): Promise<unknown>;
  create?(args: unknown): Promise<unknown>;
  createMany?(args: unknown): Promise<unknown>;
}

export interface PrismaClientLike {
  readonly snapshot: PrismaSnapshotDelegate;
  readonly company?: PrismaReadWriteDelegate;
  readonly warehouse?: PrismaReadWriteDelegate;
  readonly bankAccount?: PrismaReadWriteDelegate;
  readonly creditScore?: PrismaReadWriteDelegate;
  readonly productionPlan?: PrismaReadWriteDelegate;
  readonly retailOffer?: PrismaReadWriteDelegate;
  readonly inventoryLot?: PrismaReadWriteDelegate;
  readonly resourceOffer?: PrismaReadWriteDelegate;
  readonly resourcePurchase?: PrismaReadWriteDelegate;
  readonly shipment?: PrismaReadWriteDelegate;
  readonly manualProductionRun?: PrismaReadWriteDelegate;
  readonly retailPriceChange?: PrismaReadWriteDelegate;
  readonly financialTransaction?: PrismaReadWriteDelegate;
  readonly playerCommandRecord?: PrismaReadWriteDelegate;
  readonly event?: PrismaReadWriteDelegate;
  readonly metric?: PrismaReadWriteDelegate;
  readonly auditLog?: PrismaReadWriteDelegate;
  readonly newsItem?: PrismaReadWriteDelegate;
  readonly eventCause?: PrismaReadWriteDelegate;
  readonly eventImpact?: PrismaReadWriteDelegate;
  readonly explanation?: PrismaReadWriteDelegate;
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
      const snapshotState = upgradeWorldState(snapshot.payload as WorldState, this.seed);
      return hydrateWorldFromNormalizedReadModel(this.prisma, snapshotState, this.seed);
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

  async consistencyStatus(): Promise<PersistenceConsistencyStatus> {
    try {
      const snapshot = await this.prisma.snapshot.findFirst({
        orderBy: [{ tick: "desc" }, { createdAt: "desc" }]
      });
      const normalized = await collectNormalizedReadModel(this.prisma);
      return buildConsistencyStatus({
        snapshotTick: typeof snapshot?.tick === "number" ? snapshot.tick : null,
        snapshotFallbackAvailable: Boolean(snapshot),
        normalized
      });
    } catch (error) {
      return {
        mode: "snapshot-plus-normalized",
        status: "degraded",
        snapshotTick: null,
        normalizedLatestTick: null,
        hydratedFromNormalized: false,
        snapshotFallbackAvailable: false,
        normalizedSources: [],
        message: error instanceof Error ? error.message : "Could not inspect normalized persistence consistency."
      };
    }
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

  for (const offer of state.resourceOffers) {
    await prisma.resourceOffer?.upsert?.({
      where: { id: offer.id },
      update: {
        companyId: offer.companyId,
        warehouseId: offer.warehouseId,
        productId: offer.productId,
        unitPriceMinor: BigInt(offer.unitPriceMinor),
        quality: offer.quality,
        maxQuantityPerTick: offer.maxQuantityPerTick,
        active: offer.active
      },
      create: {
        id: offer.id,
        companyId: offer.companyId,
        warehouseId: offer.warehouseId,
        productId: offer.productId,
        unitPriceMinor: BigInt(offer.unitPriceMinor),
        quality: offer.quality,
        maxQuantityPerTick: offer.maxQuantityPerTick,
        active: offer.active
      }
    });
  }

  for (const shipment of state.shipments) {
    await prisma.shipment?.upsert?.({
      where: { id: shipment.id },
      update: {
        originWarehouseId: shipment.originWarehouseId,
        destinationWarehouseId: shipment.destinationWarehouseId,
        productId: shipment.productId,
        quantity: shipment.quantity,
        routeId: shipment.routeId,
        transportCompanyId: shipment.transportCompanyId,
        costMinor: BigInt(shipment.costMinor),
        durationTicks: shipment.durationTicks,
        remainingTicks: shipment.remainingTicks,
        risk: shipment.risk,
        status: shipment.status,
        createdTick: shipment.createdTick,
        departedTick: shipment.departedTick,
        deliveredTick: shipment.deliveredTick,
        blockedReason: shipment.blockedReason
      },
      create: {
        id: shipment.id,
        originWarehouseId: shipment.originWarehouseId,
        destinationWarehouseId: shipment.destinationWarehouseId,
        productId: shipment.productId,
        quantity: shipment.quantity,
        routeId: shipment.routeId,
        transportCompanyId: shipment.transportCompanyId,
        costMinor: BigInt(shipment.costMinor),
        durationTicks: shipment.durationTicks,
        remainingTicks: shipment.remainingTicks,
        risk: shipment.risk,
        status: shipment.status,
        createdTick: shipment.createdTick,
        departedTick: shipment.departedTick,
        deliveredTick: shipment.deliveredTick,
        blockedReason: shipment.blockedReason
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
        goodsCostMinor: BigInt(purchase.goodsCostMinor),
        logisticsCostMinor: BigInt(purchase.logisticsCostMinor),
        quality: purchase.quality,
        deliveryMode: purchase.deliveryMode,
        shipmentId: purchase.shipmentId,
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
        goodsCostMinor: BigInt(purchase.goodsCostMinor),
        logisticsCostMinor: BigInt(purchase.logisticsCostMinor),
        quality: purchase.quality,
        deliveryMode: purchase.deliveryMode,
        shipmentId: purchase.shipmentId,
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

  for (const transaction of state.financialTransactions) {
    await prisma.financialTransaction?.upsert?.({
      where: { id: transaction.id },
      update: {
        tick: transaction.tick,
        type: transaction.type
      },
      create: {
        id: transaction.id,
        tick: transaction.tick,
        type: transaction.type,
        entries: {
          create: transaction.entries.map((entry) => ({
            ownerType: entry.ownerType,
            ownerId: entry.ownerId,
            amountMinor: BigInt(entry.amountMinor),
            currencyCode: entry.currencyCode
          }))
        }
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

  for (const newsItem of state.news) {
    await prisma.newsItem?.upsert?.({
      where: { id: newsItem.id },
      update: {
        tick: newsItem.tick,
        category: newsItem.category ?? null,
        templateId: newsItem.templateId ?? null,
        headline: newsItem.headline,
        body: newsItem.body,
        severity: newsItem.severity,
        relatedEntityIds: newsItem.relatedEntityIds,
        reliabilityId: newsItem.reliabilityId ?? null
      },
      create: {
        id: newsItem.id,
        tick: newsItem.tick,
        category: newsItem.category ?? null,
        templateId: newsItem.templateId ?? null,
        headline: newsItem.headline,
        body: newsItem.body,
        severity: newsItem.severity,
        relatedEntityIds: newsItem.relatedEntityIds,
        reliabilityId: newsItem.reliabilityId ?? null
      }
    });
  }

  for (const cause of state.eventCauses) {
    await prisma.eventCause?.upsert?.({
      where: { id: cause.id },
      update: {
        eventId: cause.eventId,
        tick: cause.tick,
        causeType: cause.causeType,
        sourceType: cause.sourceType,
        sourceId: cause.sourceId,
        description: cause.description,
        weight: cause.weight
      },
      create: {
        id: cause.id,
        eventId: cause.eventId,
        tick: cause.tick,
        causeType: cause.causeType,
        sourceType: cause.sourceType,
        sourceId: cause.sourceId,
        description: cause.description,
        weight: cause.weight
      }
    });
  }

  for (const impact of state.eventImpacts) {
    await prisma.eventImpact?.upsert?.({
      where: { id: impact.id },
      update: {
        eventId: impact.eventId,
        tick: impact.tick,
        targetType: impact.targetType,
        targetId: impact.targetId,
        metricName: impact.metricName,
        beforeValue: impact.beforeValue,
        afterValue: impact.afterValue,
        delta: impact.delta,
        severity: impact.severity
      },
      create: {
        id: impact.id,
        eventId: impact.eventId,
        tick: impact.tick,
        targetType: impact.targetType,
        targetId: impact.targetId,
        metricName: impact.metricName,
        beforeValue: impact.beforeValue,
        afterValue: impact.afterValue,
        delta: impact.delta,
        severity: impact.severity
      }
    });
  }

  for (const explanation of state.explanations) {
    await prisma.explanation?.upsert?.({
      where: { id: explanation.id },
      update: {
        tick: explanation.tick,
        targetType: explanation.targetType,
        targetId: explanation.targetId,
        eventId: explanation.eventId,
        title: explanation.title,
        summary: explanation.summary,
        confidence: explanation.confidence,
        reliabilityId: explanation.reliabilityId,
        causes: explanation.causes,
        impactIds: explanation.impactIds,
        relatedMetricIds: explanation.relatedMetricIds,
        relatedEntityIds: explanation.relatedEntityIds
      },
      create: {
        id: explanation.id,
        tick: explanation.tick,
        targetType: explanation.targetType,
        targetId: explanation.targetId,
        eventId: explanation.eventId,
        title: explanation.title,
        summary: explanation.summary,
        confidence: explanation.confidence,
        reliabilityId: explanation.reliabilityId,
        causes: explanation.causes,
        impactIds: explanation.impactIds,
        relatedMetricIds: explanation.relatedMetricIds,
        relatedEntityIds: explanation.relatedEntityIds
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


interface NormalizedReadModel {
  readonly companies: readonly Company[];
  readonly bankAccounts: readonly BankAccount[];
  readonly creditScores: readonly CreditScore[];
  readonly warehouses: readonly Warehouse[];
  readonly inventoryLots: readonly InventoryLot[];
  readonly productionPlans: readonly ProductionPlan[];
  readonly retailOffers: readonly RetailOffer[];
  readonly resourceOffers: readonly ResourceOffer[];
  readonly shipments: readonly Shipment[];
  readonly resourcePurchases: readonly ResourcePurchase[];
  readonly manualProductionRuns: readonly ManualProductionRun[];
  readonly retailPriceChanges: readonly RetailPriceChange[];
  readonly financialTransactions: readonly FinancialTransaction[];
  readonly events: readonly DomainEvent[];
  readonly metrics: readonly Metric[];
  readonly news: readonly NewsItem[];
  readonly eventCauses: readonly EventCause[];
  readonly eventImpacts: readonly EventImpact[];
  readonly explanations: readonly Explanation[];
  readonly playerCommands: readonly PlayerCommandRecord[];
  readonly auditLogs: readonly AuditLog[];
  readonly sources: readonly string[];
  readonly latestTick: number | null;
}

async function hydrateWorldFromNormalizedReadModel(prisma: PrismaClientLike, snapshotState: WorldState, seed: string): Promise<WorldState> {
  const normalized = await collectNormalizedReadModel(prisma);

  if (normalized.sources.length === 0) {
    return snapshotState;
  }

  return upgradeWorldState(
    {
      ...snapshotState,
      companies: mergeById(snapshotState.companies, normalized.companies),
      bankAccounts: mergeById(snapshotState.bankAccounts, normalized.bankAccounts),
      creditScores: mergeById(snapshotState.creditScores, normalized.creditScores),
      warehouses: mergeById(snapshotState.warehouses, normalized.warehouses),
      inventoryLots: mergeById(snapshotState.inventoryLots, normalized.inventoryLots),
      productionPlans: mergeById(snapshotState.productionPlans, normalized.productionPlans),
      retailOffers: mergeById(snapshotState.retailOffers, normalized.retailOffers),
      resourceOffers: mergeById(snapshotState.resourceOffers ?? [], normalized.resourceOffers),
      shipments: mergeById(snapshotState.shipments ?? [], normalized.shipments),
      resourcePurchases: mergeById(snapshotState.resourcePurchases ?? [], normalized.resourcePurchases),
      manualProductionRuns: mergeById(snapshotState.manualProductionRuns ?? [], normalized.manualProductionRuns),
      retailPriceChanges: mergeById(snapshotState.retailPriceChanges ?? [], normalized.retailPriceChanges),
      financialTransactions: mergeById(snapshotState.financialTransactions ?? [], normalized.financialTransactions),
      events: sortByTickThenId(mergeById(snapshotState.events, normalized.events)),
      metrics: sortByTickThenId(mergeById(snapshotState.metrics, normalized.metrics)),
      news: sortByTickThenId(mergeById(snapshotState.news ?? [], normalized.news)),
      eventCauses: sortByTickThenId(mergeById(snapshotState.eventCauses ?? [], normalized.eventCauses)),
      eventImpacts: sortByTickThenId(mergeById(snapshotState.eventImpacts ?? [], normalized.eventImpacts)),
      explanations: sortByTickThenId(mergeById(snapshotState.explanations ?? [], normalized.explanations)),
      playerCommands: sortByCommandTime(mergeById(snapshotState.playerCommands ?? [], normalized.playerCommands)),
      auditLogs: sortByTickThenId(mergeById(snapshotState.auditLogs ?? [], normalized.auditLogs))
    },
    seed
  );
}

async function collectNormalizedReadModel(prisma: PrismaClientLike): Promise<NormalizedReadModel> {
  const companies = mapRows(await readRows(prisma.company, "companies", {}), toCompany);
  const bankAccounts = mapRows(await readRows(prisma.bankAccount, "bankAccounts", {}), toBankAccount);
  const creditScores = mapRows(await readRows(prisma.creditScore, "creditScores", {}), toCreditScore);
  const warehouses = mapRows(await readRows(prisma.warehouse, "warehouses", {}), toWarehouse);
  const inventoryLots = mapRows(await readRows(prisma.inventoryLot, "inventoryLots", {}), toInventoryLot);
  const productionPlans = mapRows(await readRows(prisma.productionPlan, "productionPlans", {}), toProductionPlan);
  const retailOffers = mapRows(await readRows(prisma.retailOffer, "retailOffers", {}), toRetailOffer);
  const resourceOffers = mapRows(await readRows(prisma.resourceOffer, "resourceOffers", {}), toResourceOffer);
  const shipments = mapRows(await readRows(prisma.shipment, "shipments", { orderBy: [{ createdTick: "asc" }, { id: "asc" }] }), toShipment);
  const resourcePurchases = mapRows(await readRows(prisma.resourcePurchase, "resourcePurchases", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toResourcePurchase);
  const manualProductionRuns = mapRows(await readRows(prisma.manualProductionRun, "manualProductionRuns", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toManualProductionRun);
  const retailPriceChanges = mapRows(await readRows(prisma.retailPriceChange, "retailPriceChanges", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toRetailPriceChange);
  const financialTransactions = mapRows(
    await readRows(prisma.financialTransaction, "financialTransactions", { include: { entries: true }, orderBy: [{ tick: "asc" }, { id: "asc" }] }),
    toFinancialTransaction
  );
  const events = mapRows(await readRows(prisma.event, "events", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toDomainEvent);
  const metrics = mapRows(await readRows(prisma.metric, "metrics", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toMetric);
  const news = mapRows(await readRows(prisma.newsItem, "news", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toNewsItem);
  const eventCauses = mapRows(await readRows(prisma.eventCause, "eventCauses", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toEventCause);
  const eventImpacts = mapRows(await readRows(prisma.eventImpact, "eventImpacts", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toEventImpact);
  const explanations = mapRows(await readRows(prisma.explanation, "explanations", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toExplanation);
  const playerCommands = mapRows(
    await readRows(prisma.playerCommandRecord, "playerCommands", { orderBy: [{ tickReceived: "asc" }, { id: "asc" }] }),
    toPlayerCommandRecord
  );
  const auditLogs = mapRows(await readRows(prisma.auditLog, "auditLogs", { orderBy: [{ tick: "asc" }, { id: "asc" }] }), toAuditLog);
  const sources = [
    tupleSource("companies", companies),
    tupleSource("bankAccounts", bankAccounts),
    tupleSource("creditScores", creditScores),
    tupleSource("warehouses", warehouses),
    tupleSource("inventoryLots", inventoryLots),
    tupleSource("productionPlans", productionPlans),
    tupleSource("retailOffers", retailOffers),
    tupleSource("resourceOffers", resourceOffers),
    tupleSource("shipments", shipments),
    tupleSource("resourcePurchases", resourcePurchases),
    tupleSource("manualProductionRuns", manualProductionRuns),
    tupleSource("retailPriceChanges", retailPriceChanges),
    tupleSource("financialTransactions", financialTransactions),
    tupleSource("events", events),
    tupleSource("metrics", metrics),
    tupleSource("news", news),
    tupleSource("eventCauses", eventCauses),
    tupleSource("eventImpacts", eventImpacts),
    tupleSource("explanations", explanations),
    tupleSource("playerCommands", playerCommands),
    tupleSource("auditLogs", auditLogs)
  ].filter((source): source is string => Boolean(source));
  const latestTick = maxNullable([
    ...shipments.map((item) => item.deliveredTick ?? item.departedTick ?? item.createdTick),
    ...resourcePurchases.map((item) => item.tick),
    ...manualProductionRuns.map((item) => item.tick),
    ...retailPriceChanges.map((item) => item.tick),
    ...financialTransactions.map((item) => item.tick),
    ...events.map((item) => item.tick),
    ...metrics.map((item) => item.tick),
    ...news.map((item) => item.tick),
    ...eventCauses.map((item) => item.tick),
    ...eventImpacts.map((item) => item.tick),
    ...explanations.map((item) => item.tick),
    ...playerCommands.map((item) => item.tickApplied ?? item.tickScheduled ?? item.tickReceived),
    ...auditLogs.map((item) => item.tick)
  ]);

  return {
    companies,
    bankAccounts,
    creditScores,
    warehouses,
    inventoryLots,
    productionPlans,
    retailOffers,
    resourceOffers,
    shipments,
    resourcePurchases,
    manualProductionRuns,
    retailPriceChanges,
    financialTransactions,
    events,
    metrics,
    news,
    eventCauses,
    eventImpacts,
    explanations,
    playerCommands,
    auditLogs,
    sources,
    latestTick
  };
}

function buildConsistencyStatus(input: {
  readonly snapshotTick: number | null;
  readonly snapshotFallbackAvailable: boolean;
  readonly normalized: NormalizedReadModel;
}): PersistenceConsistencyStatus {
  const normalizedLatestTick = input.normalized.latestTick;
  let status: PersistenceConsistencyStatus["status"] = "empty";
  let message: string | undefined;

  if (input.snapshotTick === null && normalizedLatestTick === null) {
    status = "empty";
    message = "No snapshot or normalized player-loop rows found.";
  } else if (input.snapshotTick !== null && normalizedLatestTick === null) {
    status = "snapshot-only";
    message = "Snapshot fallback is available, but no normalized player-loop rows were found.";
  } else if (input.snapshotTick === null && normalizedLatestTick !== null) {
    status = "normalized-ahead";
    message = "Normalized rows exist but no snapshot fallback is available.";
  } else if (input.snapshotTick === normalizedLatestTick) {
    status = "consistent";
  } else if (input.snapshotTick !== null && normalizedLatestTick !== null && normalizedLatestTick > input.snapshotTick) {
    status = "normalized-ahead";
    message = "Normalized read model contains ticks newer than the latest snapshot.";
  } else if (input.snapshotTick !== null && normalizedLatestTick !== null && input.snapshotTick > normalizedLatestTick) {
    status = "snapshot-ahead";
    message = "Snapshot is newer than normalized player-loop rows; some rows may not be hydrated yet.";
  } else {
    status = "diverged";
  }

  return {
    mode: "snapshot-plus-normalized",
    status,
    snapshotTick: input.snapshotTick,
    normalizedLatestTick,
    hydratedFromNormalized: input.normalized.sources.length > 0,
    snapshotFallbackAvailable: input.snapshotFallbackAvailable,
    normalizedSources: input.normalized.sources,
    ...(message ? { message } : {})
  };
}

async function readRows(delegate: PrismaReadWriteDelegate | undefined, _source: string, args: unknown): Promise<unknown[]> {
  if (!delegate?.findMany) {
    return [];
  }

  return delegate.findMany(args);
}

function mapRows<T>(rows: readonly unknown[], mapper: (row: Record<string, unknown>) => T): T[] {
  return rows.filter(isRecord).map(mapper);
}

function tupleSource(name: string, values: readonly unknown[]): string | null {
  return values.length > 0 ? `${name}:${values.length}` : null;
}

function maxNullable(values: readonly number[]): number | null {
  const finite = values.filter((value) => Number.isFinite(value));
  return finite.length > 0 ? Math.max(...finite) : null;
}

function mergeById<T extends { readonly id: string }>(base: readonly T[], overlay: readonly T[]): readonly T[] {
  if (overlay.length === 0) {
    return base;
  }

  const merged = new Map<string, T>();

  for (const item of base) {
    merged.set(item.id, item);
  }

  for (const item of overlay) {
    merged.set(item.id, item);
  }

  return [...merged.values()];
}

function sortByTickThenId<T extends { readonly id: string; readonly tick: number }>(items: readonly T[]): readonly T[] {
  return [...items].sort((left, right) => left.tick - right.tick || left.id.localeCompare(right.id));
}

function sortByCommandTime(items: readonly PlayerCommandRecord[]): readonly PlayerCommandRecord[] {
  return [...items].sort((left, right) => left.tickReceived - right.tickReceived || left.id.localeCompare(right.id));
}

function toCompany(row: Record<string, unknown>): Company {
  return {
    id: stringField(row, "id"),
    ownerType: stringField(row, "ownerType") as Company["ownerType"],
    ownerId: stringField(row, "ownerId"),
    countryId: stringField(row, "countryId"),
    name: stringField(row, "name"),
    legalStatus: stringField(row, "legalStatus") as Company["legalStatus"],
    cashBalanceMinor: numberField(row, "cashBalanceMinor"),
    currencyCode: stringField(row, "currencyCode") as Company["currencyCode"],
    reputation: numberField(row, "reputation"),
    bankruptcyStatus: stringField(row, "bankruptcyStatus") as Company["bankruptcyStatus"]
  };
}

function toBankAccount(row: Record<string, unknown>): BankAccount {
  return {
    id: stringField(row, "id"),
    bankId: stringField(row, "bankId"),
    ownerType: stringField(row, "ownerType") as BankAccount["ownerType"],
    ownerId: stringField(row, "ownerId"),
    accountType: stringField(row, "accountType") as BankAccount["accountType"],
    currencyCode: stringField(row, "currencyCode") as BankAccount["currencyCode"],
    balanceMinor: numberField(row, "balanceMinor"),
    reservedMinor: numberField(row, "reservedMinor"),
    insured: booleanField(row, "insured"),
    status: stringField(row, "status") as BankAccount["status"]
  };
}

function toCreditScore(row: Record<string, unknown>): CreditScore {
  return {
    id: stringField(row, "id"),
    borrowerType: stringField(row, "borrowerType") as CreditScore["borrowerType"],
    borrowerId: stringField(row, "borrowerId"),
    score: numberField(row, "score"),
    probabilityOfDefault: numberField(row, "probabilityOfDefault"),
    lastUpdatedTick: numberField(row, "lastUpdatedTick")
  };
}

function toWarehouse(row: Record<string, unknown>): Warehouse {
  return {
    id: stringField(row, "id"),
    companyId: stringField(row, "companyId"),
    cityId: stringField(row, "cityId"),
    name: stringField(row, "name"),
    warehouseType: stringField(row, "warehouseType") as Warehouse["warehouseType"],
    capacity: numberField(row, "capacity"),
    handlingCostMinorPerUnit: numberField(row, "handlingCostMinorPerUnit")
  };
}

function toInventoryLot(row: Record<string, unknown>): InventoryLot {
  return {
    id: stringField(row, "id"),
    warehouseId: stringField(row, "warehouseId"),
    productId: stringField(row, "productId"),
    quantity: numberField(row, "quantity"),
    quality: numberField(row, "quality")
  };
}

function toProductionPlan(row: Record<string, unknown>): ProductionPlan {
  return {
    id: stringField(row, "id"),
    companyId: stringField(row, "companyId"),
    warehouseId: stringField(row, "warehouseId"),
    outputProductId: stringField(row, "outputProductId"),
    outputQuantityPerTick: numberField(row, "outputQuantityPerTick"),
    inputs: jsonArray(row, "inputs") as readonly ProductionInput[],
    active: booleanField(row, "active")
  };
}

function toRetailOffer(row: Record<string, unknown>): RetailOffer {
  return {
    id: stringField(row, "id"),
    companyId: stringField(row, "companyId"),
    warehouseId: stringField(row, "warehouseId"),
    productId: stringField(row, "productId"),
    priceMinor: numberField(row, "priceMinor"),
    quality: numberField(row, "quality"),
    active: booleanField(row, "active")
  };
}

function toResourceOffer(row: Record<string, unknown>): ResourceOffer {
  return {
    id: stringField(row, "id"),
    companyId: stringField(row, "companyId"),
    warehouseId: stringField(row, "warehouseId"),
    productId: stringField(row, "productId"),
    unitPriceMinor: numberField(row, "unitPriceMinor"),
    quality: numberField(row, "quality"),
    maxQuantityPerTick: numberField(row, "maxQuantityPerTick"),
    active: booleanField(row, "active")
  };
}

function toShipment(row: Record<string, unknown>): Shipment {
  return {
    id: stringField(row, "id"),
    originWarehouseId: stringField(row, "originWarehouseId"),
    destinationWarehouseId: stringField(row, "destinationWarehouseId"),
    productId: stringField(row, "productId"),
    quantity: numberField(row, "quantity"),
    routeId: stringField(row, "routeId"),
    transportCompanyId: stringField(row, "transportCompanyId"),
    costMinor: numberField(row, "costMinor"),
    durationTicks: numberField(row, "durationTicks"),
    remainingTicks: numberField(row, "remainingTicks"),
    risk: numberField(row, "risk"),
    status: stringField(row, "status") as Shipment["status"],
    createdTick: numberField(row, "createdTick"),
    departedTick: nullableNumber(row, "departedTick"),
    deliveredTick: nullableNumber(row, "deliveredTick"),
    blockedReason: nullableString(row, "blockedReason")
  };
}

function toResourcePurchase(row: Record<string, unknown>): ResourcePurchase {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    playerId: stringField(row, "playerId"),
    buyerCompanyId: stringField(row, "buyerCompanyId"),
    sellerCompanyId: stringField(row, "sellerCompanyId"),
    sellerWarehouseId: stringField(row, "sellerWarehouseId"),
    buyerWarehouseId: stringField(row, "buyerWarehouseId"),
    productId: stringField(row, "productId"),
    quantity: numberField(row, "quantity"),
    unitPriceMinor: numberField(row, "unitPriceMinor"),
    totalPriceMinor: numberField(row, "totalPriceMinor"),
    goodsCostMinor: nullableNumber(row, "goodsCostMinor") ?? numberField(row, "totalPriceMinor"),
    logisticsCostMinor: nullableNumber(row, "logisticsCostMinor") ?? 0,
    quality: numberField(row, "quality"),
    deliveryMode: (nullableString(row, "deliveryMode") ?? "pickup") as ResourcePurchase["deliveryMode"],
    shipmentId: nullableString(row, "shipmentId"),
    status: stringField(row, "status") as ResourcePurchase["status"]
  };
}

function toManualProductionRun(row: Record<string, unknown>): ManualProductionRun {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    playerId: stringField(row, "playerId"),
    companyId: stringField(row, "companyId"),
    productionPlanId: stringField(row, "productionPlanId"),
    warehouseId: stringField(row, "warehouseId"),
    outputProductId: stringField(row, "outputProductId"),
    requestedQuantity: numberField(row, "requestedQuantity"),
    producedQuantity: numberField(row, "producedQuantity"),
    inputConsumptions: jsonArray(row, "inputConsumptions") as ManualProductionRun["inputConsumptions"],
    status: stringField(row, "status") as ManualProductionRun["status"]
  };
}

function toRetailPriceChange(row: Record<string, unknown>): RetailPriceChange {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    playerId: stringField(row, "playerId"),
    companyId: stringField(row, "companyId"),
    retailOfferId: stringField(row, "retailOfferId"),
    productId: stringField(row, "productId"),
    oldPriceMinor: numberField(row, "oldPriceMinor"),
    newPriceMinor: numberField(row, "newPriceMinor"),
    currencyCode: stringField(row, "currencyCode") as RetailPriceChange["currencyCode"],
    status: stringField(row, "status") as RetailPriceChange["status"]
  };
}

function toFinancialTransaction(row: Record<string, unknown>): FinancialTransaction {
  const entries = arrayField(row, "entries")
    .filter(isRecord)
    .map(toFinancialEntry);

  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    type: stringField(row, "type") as FinancialTransaction["type"],
    entries
  };
}

function toFinancialEntry(row: Record<string, unknown>): FinancialEntry {
  return {
    ownerType: stringField(row, "ownerType") as FinancialEntry["ownerType"],
    ownerId: stringField(row, "ownerId"),
    amountMinor: numberField(row, "amountMinor"),
    currencyCode: stringField(row, "currencyCode") as FinancialEntry["currencyCode"]
  };
}

function toDomainEvent(row: Record<string, unknown>): DomainEvent {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    type: stringField(row, "type"),
    message: stringField(row, "message"),
    entityIds: stringArray(row, "entityIds"),
    metadata: jsonRecord(row, "metadata") as DomainEvent["metadata"]
  };
}

function toMetric(row: Record<string, unknown>): Metric {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    name: stringField(row, "name"),
    value: numberField(row, "value"),
    tags: jsonRecord(row, "tags") as Metric["tags"]
  };
}

function toNewsItem(row: Record<string, unknown>): NewsItem {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    category: (nullableString(row, "category") ?? undefined) as NewsItem["category"],
    templateId: nullableString(row, "templateId"),
    headline: stringField(row, "headline"),
    body: stringField(row, "body"),
    severity: stringField(row, "severity") as NewsItem["severity"],
    relatedEntityIds: stringArray(row, "relatedEntityIds"),
    reliabilityId: nullableString(row, "reliabilityId")
  };
}

function toEventCause(row: Record<string, unknown>): EventCause {
  return {
    id: stringField(row, "id"),
    eventId: stringField(row, "eventId"),
    tick: numberField(row, "tick"),
    causeType: stringField(row, "causeType") as EventCause["causeType"],
    sourceType: stringField(row, "sourceType"),
    sourceId: nullableString(row, "sourceId"),
    description: stringField(row, "description"),
    weight: numberField(row, "weight")
  };
}

function toEventImpact(row: Record<string, unknown>): EventImpact {
  return {
    id: stringField(row, "id"),
    eventId: stringField(row, "eventId"),
    tick: numberField(row, "tick"),
    targetType: stringField(row, "targetType"),
    targetId: nullableString(row, "targetId"),
    metricName: stringField(row, "metricName"),
    beforeValue: nullableNumber(row, "beforeValue"),
    afterValue: nullableNumber(row, "afterValue"),
    delta: numberField(row, "delta"),
    severity: numberField(row, "severity")
  };
}

function toExplanation(row: Record<string, unknown>): Explanation {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    targetType: stringField(row, "targetType") as Explanation["targetType"],
    targetId: stringField(row, "targetId"),
    eventId: nullableString(row, "eventId"),
    title: stringField(row, "title"),
    summary: stringField(row, "summary"),
    confidence: numberField(row, "confidence"),
    reliabilityId: nullableString(row, "reliabilityId"),
    causes: jsonArray(row, "causes") as Explanation["causes"],
    impactIds: stringArray(row, "impactIds"),
    relatedMetricIds: stringArray(row, "relatedMetricIds"),
    relatedEntityIds: stringArray(row, "relatedEntityIds")
  };
}

function toPlayerCommandRecord(row: Record<string, unknown>): PlayerCommandRecord {
  return {
    id: stringField(row, "id"),
    commandId: stringField(row, "commandId"),
    idempotencyKey: stringField(row, "idempotencyKey"),
    status: stringField(row, "status") as PlayerCommandRecord["status"],
    commandType: stringField(row, "commandType") as PlayerCommandRecord["commandType"],
    command: jsonRecord(row, "command") as unknown as PlayerCommandRecord["command"],
    userId: stringField(row, "userId"),
    playerId: stringField(row, "playerId"),
    tickReceived: numberField(row, "tickReceived"),
    tickScheduled: numberField(row, "tickScheduled"),
    tickApplied: nullableNumber(row, "tickApplied"),
    resultEventIds: stringArray(row, "resultEventIds"),
    resultMetricIds: stringArray(row, "resultMetricIds"),
    resultFinancialTransactionIds: stringArray(row, "resultFinancialTransactionIds"),
    affectedEntityIds: stringArray(row, "affectedEntityIds"),
    rejectionCode: nullableString(row, "rejectionCode"),
    rejectionMessage: nullableString(row, "rejectionMessage"),
    createdAt: dateStringField(row, "createdAt"),
    updatedAt: dateStringField(row, "updatedAt")
  };
}

function toAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: stringField(row, "id"),
    tick: numberField(row, "tick"),
    userId: nullableString(row, "userId"),
    playerId: nullableString(row, "playerId"),
    actionType: stringField(row, "actionType"),
    commandId: nullableString(row, "commandId"),
    idempotencyKey: nullableString(row, "idempotencyKey"),
    result: stringField(row, "result") as AuditLog["result"],
    affectedEntityIds: stringArray(row, "affectedEntities"),
    eventIds: stringArray(row, "eventIds"),
    metricIds: stringArray(row, "metricIds"),
    financialTransactionIds: stringArray(row, "financialTransactionIds"),
    metadata: jsonRecord(row, "metadata") as AuditLog["metadata"],
    createdAt: dateStringField(row, "createdAt")
  };
}

function stringField(row: Record<string, unknown>, key: string): string {
  const value = row[key];
  return typeof value === "string" ? value : String(value ?? "");
}

function nullableString(row: Record<string, unknown>, key: string): string | null {
  const value = row[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberField(row: Record<string, unknown>, key: string): number {
  const value = row[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return Number(value);
  }

  return 0;
}

function nullableNumber(row: Record<string, unknown>, key: string): number | null {
  const value = row[key];
  return value === null || value === undefined ? null : numberField(row, key);
}

function booleanField(row: Record<string, unknown>, key: string): boolean {
  const value = row[key];
  return typeof value === "boolean" ? value : value === "true" || value === 1;
}

function dateStringField(row: Record<string, unknown>, key: string): string {
  const value = row[key];

  if (value instanceof Date) {
    return value.toISOString();
  }

  return typeof value === "string" && value.length > 0 ? value : new Date(0).toISOString();
}

function jsonArray(row: Record<string, unknown>, key: string): readonly unknown[] {
  return arrayField(row, key);
}

function stringArray(row: Record<string, unknown>, key: string): readonly string[] {
  return arrayField(row, key)
    .filter((value): value is string => typeof value === "string")
    .filter((value) => value.length > 0);
}

function arrayField(row: Record<string, unknown>, key: string): readonly unknown[] {
  const value = row[key];
  return Array.isArray(value) ? value : [];
}

function jsonRecord(row: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = row[key];
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function upgradeWorldState(state: WorldState, seed: string): WorldState {
  const retailPriceChanges = state.retailPriceChanges ?? [];
  const resourceOffers = state.resourceOffers ?? [];
  const resourcePurchases = (state.resourcePurchases ?? []).map((purchase) => ({
    ...purchase,
    goodsCostMinor: purchase.goodsCostMinor ?? purchase.totalPriceMinor,
    logisticsCostMinor: purchase.logisticsCostMinor ?? 0,
    deliveryMode: purchase.deliveryMode ?? "pickup",
    shipmentId: purchase.shipmentId ?? null,
    status: purchase.status ?? "completed"
  }));
  const manualProductionRuns = state.manualProductionRuns ?? [];
  const financialTransactions = state.financialTransactions ?? [];
  const news = state.news ?? [];
  const eventCauses = state.eventCauses ?? [];
  const eventImpacts = state.eventImpacts ?? [];
  const explanations = state.explanations ?? [];
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
    financialTransactions,
    news,
    eventCauses,
    eventImpacts,
    explanations,
    playerCommands,
    auditLogs
  };
}
