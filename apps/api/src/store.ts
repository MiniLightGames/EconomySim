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

export interface PrismaClientLike {
  readonly snapshot: PrismaSnapshotDelegate;
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

    await this.prisma.snapshot.create({
      data: {
        id: snapshot.id,
        tick: snapshot.tick,
        stateHash: snapshot.stateHash,
        payload: persistedState
      }
    });
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

function upgradeWorldState(state: WorldState, seed: string): WorldState {
  const retailPriceChanges = state.retailPriceChanges ?? [];
  const resourceOffers = state.resourceOffers ?? [];
  const resourcePurchases = state.resourcePurchases ?? [];
  const manualProductionRuns = state.manualProductionRuns ?? [];
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
    manualProductionRuns
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
