export const PRODUCT_CATEGORIES = ["food", "energy", "industrial", "consumer"] as const;
export const RESOURCE_CATEGORIES = ["agricultural", "mineral", "energy", "industrial", "service"] as const;
export const NEED_CATEGORIES = ["food", "housing", "transport", "medicine", "entertainment", "energy"] as const;
export const WAREHOUSE_TYPES = ["general", "cold_storage", "bulk", "port_terminal"] as const;
export const TRANSPORT_TYPES = ["road", "rail", "sea", "multimodal"] as const;
export const TECHNOLOGY_DOMAINS = ["production", "logistics", "medicine", "weapons", "education", "energy", "agriculture"] as const;
export const TECHNOLOGY_ACCESS_MODELS = ["open", "patent", "license", "trade_secret"] as const;
export const POLLUTION_SOURCE_CATEGORIES = ["food", "energy", "industrial", "consumer", "logistics"] as const;
export const LAW_TEMPLATE_TYPES = [
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
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];
export type ConstructorNeedCategory = (typeof NEED_CATEGORIES)[number];
export type ValidationSeverity = "error" | "warning";
export type ChainInputKind = "resource" | "product";
export type WarehouseType = (typeof WAREHOUSE_TYPES)[number];
export type TransportType = (typeof TRANSPORT_TYPES)[number];
export type TechnologyDomain = (typeof TECHNOLOGY_DOMAINS)[number];
export type TechnologyAccessModel = (typeof TECHNOLOGY_ACCESS_MODELS)[number];
export type PollutionSourceCategory = (typeof POLLUTION_SOURCE_CATEGORIES)[number];
export type LawTemplateType = (typeof LAW_TEMPLATE_TYPES)[number];

export interface ProductDraft {
  readonly id: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly weightKg: number;
  readonly volumeM3: number;
  readonly shelfLifeDays: number | null;
  readonly baseQuality: number;
  readonly brandManufacturer: string;
  readonly needCategory: ConstructorNeedCategory;
}

export interface ResourceDraft {
  readonly id: string;
  readonly name: string;
  readonly category: ResourceCategory;
  readonly unit: string;
  readonly baseCostMinor: number;
  readonly scarcity: number;
  readonly renewable: boolean;
}

export interface ChainInputDraft {
  readonly kind: ChainInputKind;
  readonly id: string;
  readonly quantity: number;
}

export interface ChainWasteDraft {
  readonly resourceId: string;
  readonly quantity: number;
}

export interface ProductionChainDraft {
  readonly id: string;
  readonly name: string;
  readonly inputs: readonly ChainInputDraft[];
  readonly outputProductId: string;
  readonly outputQuantity: number;
  readonly targetPriceMinor: number;
  readonly laborHours: number;
  readonly energyKwh: number;
  readonly durationHours: number;
  readonly equipmentBuildingIds: readonly string[];
  readonly waste: readonly ChainWasteDraft[];
}

export interface BuildingDraft {
  readonly id: string;
  readonly name: string;
  readonly category: "factory" | "farm" | "retail" | "office" | "utility";
  readonly buildCostMinor: number;
  readonly maintenanceMinor: number;
  readonly energyKwh: number;
  readonly capacity: number;
  readonly warehouseType: WarehouseType;
}

export interface CompanyTypeDraft {
  readonly id: string;
  readonly name: string;
  readonly licenseCostMinor: number;
  readonly allowedBuildingIds: readonly string[];
  readonly reputationRequirement: number;
  readonly transportType: TransportType | null;
}

export interface LawDraft {
  readonly id: string;
  readonly name: string;
  readonly type: LawTemplateType;
  readonly enabled: boolean;
  readonly parameters: Readonly<Record<string, string | number | boolean>>;
  readonly restrictions: string;
  readonly economicImpact: number;
  readonly stabilityImpact: number;
  readonly taxRate: number;
  readonly subsidyMinor: number;
  readonly targetCategory: ProductCategory | "all";
}

export interface TechnologyDraft {
  readonly id: string;
  readonly name: string;
  readonly domain: TechnologyDomain;
  readonly industry: ProductCategory | ConstructorNeedCategory | "logistics" | "weapons" | "education" | "all";
  readonly accessModel: TechnologyAccessModel;
  readonly researchCostMinor: number;
  readonly unlocked: boolean;
  readonly efficiencyBonus: number;
  readonly energyReduction: number;
  readonly inputReduction: number;
  readonly pollutionReduction: number;
  readonly logisticsBonus: number;
  readonly healthBonus: number;
  readonly discoveryBonus: number;
  readonly requiredTechnologyIds: readonly string[];
}

export interface ResourceDepositTemplateDraft {
  readonly id: string;
  readonly name: string;
  readonly resourceId: string;
  readonly productId: string | null;
  readonly category: ResourceCategory;
  readonly initialQuantity: number;
  readonly extractionPerTick: number;
  readonly discoveryChance: number;
  readonly quality: number;
}

export interface PollutionFactorDraft {
  readonly id: string;
  readonly sourceCategory: PollutionSourceCategory;
  readonly air: number;
  readonly water: number;
  readonly soil: number;
  readonly carbon: number;
}

export interface ConstructorCatalog {
  readonly schemaVersion: 1;
  readonly products: readonly ProductDraft[];
  readonly resources: readonly ResourceDraft[];
  readonly productionChains: readonly ProductionChainDraft[];
  readonly buildings: readonly BuildingDraft[];
  readonly companyTypes: readonly CompanyTypeDraft[];
  readonly laws: readonly LawDraft[];
  readonly technologies: readonly TechnologyDraft[];
  readonly resourceDepositTemplates: readonly ResourceDepositTemplateDraft[];
  readonly pollutionFactors: readonly PollutionFactorDraft[];
  readonly infrastructureDefaults: InfrastructureDefaultsDraft;
}

export interface InfrastructureDefaultsDraft {
  readonly roadQuality: number;
  readonly railQuality: number;
  readonly portQuality: number;
  readonly routeCapacityPerTick: number;
  readonly borderDelayTicks: number;
  readonly baseCostMinorPerUnit: number;
}

export interface ValidationIssue {
  readonly severity: ValidationSeverity;
  readonly entityType: string;
  readonly entityId: string;
  readonly field?: string;
  readonly message: string;
}

export interface MiniSimulationResult {
  readonly chainId: string;
  readonly chainName: string;
  readonly outputProductName: string;
  readonly runs: number;
  readonly outputQuantity: number;
  readonly totalCostMinor: number;
  readonly revenueMinor: number;
  readonly profitMinor: number;
  readonly margin: number;
  readonly breakEvenPriceMinor: number;
  readonly demandRisk: "low" | "medium" | "high";
  readonly warnings: readonly string[];
}

export interface ImportResult {
  readonly ok: boolean;
  readonly catalog?: ConstructorCatalog;
  readonly issues: readonly ValidationIssue[];
  readonly error?: string;
}

const LABOR_COST_MINOR_PER_HOUR = 1_800;
const ENERGY_COST_MINOR_PER_KWH = 75;
const SIMULATION_RUNS = 10;

export function createInitialConstructorCatalog(): ConstructorCatalog {
  return {
    schemaVersion: 1,
    products: [
      {
        id: "product-bread",
        name: "Bread",
        category: "food",
        weightKg: 0.5,
        volumeM3: 0.002,
        shelfLifeDays: 3,
        baseQuality: 0.62,
        brandManufacturer: "Harbor Bakery",
        needCategory: "food"
      },
      {
        id: "product-clinic-visit",
        name: "Clinic Visit",
        category: "consumer",
        weightKg: 0,
        volumeM3: 0,
        shelfLifeDays: null,
        baseQuality: 0.66,
        brandManufacturer: "HealthPoint",
        needCategory: "medicine"
      },
      {
        id: "product-bus-ticket",
        name: "Bus Ticket",
        category: "consumer",
        weightKg: 0,
        volumeM3: 0,
        shelfLifeDays: null,
        baseQuality: 0.54,
        brandManufacturer: "City Transit",
        needCategory: "transport"
      }
    ],
    resources: [
      {
        id: "resource-wheat",
        name: "Wheat",
        category: "agricultural",
        unit: "kg",
        baseCostMinor: 90,
        scarcity: 0.32,
        renewable: true
      },
      {
        id: "resource-electricity",
        name: "Electricity",
        category: "energy",
        unit: "kWh",
        baseCostMinor: 75,
        scarcity: 0.18,
        renewable: false
      },
      {
        id: "resource-medical-supplies",
        name: "Medical Supplies",
        category: "industrial",
        unit: "pack",
        baseCostMinor: 540,
        scarcity: 0.42,
        renewable: false
      }
    ],
    productionChains: [
      {
        id: "chain-bread",
        name: "Bakery Line",
        inputs: [{ kind: "resource", id: "resource-wheat", quantity: 0.42 }],
        outputProductId: "product-bread",
        outputQuantity: 1,
        targetPriceMinor: 320,
        laborHours: 0.03,
        energyKwh: 0.07,
        durationHours: 0.04,
        equipmentBuildingIds: ["building-bakery"],
        waste: [{ resourceId: "resource-wheat", quantity: 0.01 }]
      },
      {
        id: "chain-clinic-visit",
        name: "Primary Clinic Shift",
        inputs: [{ kind: "resource", id: "resource-medical-supplies", quantity: 0.2 }],
        outputProductId: "product-clinic-visit",
        outputQuantity: 1,
        targetPriceMinor: 1_900,
        laborHours: 0.35,
        energyKwh: 0.12,
        durationHours: 0.5,
        equipmentBuildingIds: ["building-clinic"],
        waste: []
      }
    ],
    buildings: [
      {
        id: "building-bakery",
        name: "Bakery",
        category: "factory",
        buildCostMinor: 7_500_000,
        maintenanceMinor: 38_000,
        energyKwh: 80,
        capacity: 12_000,
        warehouseType: "general"
      },
      {
        id: "building-clinic",
        name: "Clinic",
        category: "office",
        buildCostMinor: 19_000_000,
        maintenanceMinor: 84_000,
        energyKwh: 140,
        capacity: 1_200,
        warehouseType: "cold_storage"
      }
    ],
    companyTypes: [
      {
        id: "company-type-retail-producer",
        name: "Retail Producer",
        licenseCostMinor: 250_000,
        allowedBuildingIds: ["building-bakery"],
        reputationRequirement: 0.2,
        transportType: "road"
      },
      {
        id: "company-type-health-provider",
        name: "Health Provider",
        licenseCostMinor: 1_200_000,
        allowedBuildingIds: ["building-clinic"],
        reputationRequirement: 0.45,
        transportType: null
      }
    ],
    laws: [
      {
        id: "law-food-safety",
        name: "Food Safety Standard",
        type: "industry_license",
        enabled: true,
        parameters: { industry: "food", annualFeeMinor: 250_000 },
        restrictions: "Only licensed food producers can operate retail food chains.",
        economicImpact: -0.02,
        stabilityImpact: 0.03,
        taxRate: 0.04,
        subsidyMinor: 0,
        targetCategory: "food"
      },
      {
        id: "law-health-subsidy",
        name: "Basic Health Subsidy",
        type: "sales_tax",
        enabled: true,
        parameters: { rate: 0.02, earmark: "medicine" },
        restrictions: "Applies to consumer services and funds health subsidies.",
        economicImpact: -0.01,
        stabilityImpact: 0.04,
        taxRate: 0.02,
        subsidyMinor: 350,
        targetCategory: "consumer"
      }
    ],
    technologies: [
      {
        id: "technology-heat-recovery-ovens",
        name: "Heat Recovery Ovens",
        domain: "production",
        industry: "food",
        accessModel: "patent",
        researchCostMinor: 50_000,
        unlocked: true,
        efficiencyBonus: 0.08,
        energyReduction: 0.12,
        inputReduction: 0.16,
        pollutionReduction: 0.04,
        logisticsBonus: 0,
        healthBonus: 0,
        discoveryBonus: 0,
        requiredTechnologyIds: []
      },
      {
        id: "technology-clinic-triage-ai",
        name: "Clinic Triage AI",
        domain: "medicine",
        industry: "medicine",
        accessModel: "trade_secret",
        researchCostMinor: 70_000,
        unlocked: false,
        efficiencyBonus: 0.14,
        energyReduction: 0.02,
        inputReduction: 0.03,
        pollutionReduction: 0,
        logisticsBonus: 0,
        healthBonus: 0.1,
        discoveryBonus: 0,
        requiredTechnologyIds: []
      }
    ],
    resourceDepositTemplates: [
      {
        id: "deposit-template-wheat-basin",
        name: "Wheat Basin",
        resourceId: "resource-wheat",
        productId: "product-bread",
        category: "agricultural",
        initialQuantity: 1_000_000,
        extractionPerTick: 18_000,
        discoveryChance: 0.02,
        quality: 0.62
      },
      {
        id: "deposit-template-clean-energy",
        name: "Geothermal Anomaly",
        resourceId: "resource-electricity",
        productId: null,
        category: "energy",
        initialQuantity: 220_000,
        extractionPerTick: 4_000,
        discoveryChance: 0.35,
        quality: 0.77
      }
    ],
    pollutionFactors: [
      {
        id: "pollution-food-light-industry",
        sourceCategory: "food",
        air: 0.002,
        water: 0.0006,
        soil: 0.0004,
        carbon: 0.001
      },
      {
        id: "pollution-energy-carbon",
        sourceCategory: "energy",
        air: 0.006,
        water: 0.001,
        soil: 0.0007,
        carbon: 0.012
      }
    ],
    infrastructureDefaults: {
      roadQuality: 0.68,
      railQuality: 0.74,
      portQuality: 0.7,
      routeCapacityPerTick: 40_000,
      borderDelayTicks: 2,
      baseCostMinorPerUnit: 18
    }
  };
}

export function validateConstructorCatalog(catalog: ConstructorCatalog): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const productIds = new Set(catalog.products.map((product) => product.id));
  const resourceIds = new Set(catalog.resources.map((resource) => resource.id));
  const buildingIds = new Set(catalog.buildings.map((building) => building.id));
  const technologyIds = new Set(catalog.technologies.map((technology) => technology.id));

  pushDuplicateIssues("product", catalog.products.map((product) => product.id), issues);
  pushDuplicateIssues("resource", catalog.resources.map((resource) => resource.id), issues);
  pushDuplicateIssues("productionChain", catalog.productionChains.map((chain) => chain.id), issues);
  pushDuplicateIssues("building", catalog.buildings.map((building) => building.id), issues);
  pushDuplicateIssues("companyType", catalog.companyTypes.map((companyType) => companyType.id), issues);
  pushDuplicateIssues("law", catalog.laws.map((law) => law.id), issues);
  pushDuplicateIssues("technology", catalog.technologies.map((technology) => technology.id), issues);
  pushDuplicateIssues("resourceDepositTemplate", catalog.resourceDepositTemplates.map((deposit) => deposit.id), issues);
  pushDuplicateIssues("pollutionFactor", catalog.pollutionFactors.map((factor) => factor.id), issues);

  for (const product of catalog.products) {
    pushTextIssue(product.name, "product", product.id, "name", "Product name is required.", issues);
    pushTextIssue(product.brandManufacturer, "product", product.id, "brandManufacturer", "Brand/manufacturer is required.", issues);
    pushRangeIssue(product.weightKg, 0, Number.MAX_SAFE_INTEGER, "product", product.id, "weightKg", "Weight cannot be negative.", issues);
    pushRangeIssue(product.volumeM3, 0, Number.MAX_SAFE_INTEGER, "product", product.id, "volumeM3", "Volume cannot be negative.", issues);
    if (product.shelfLifeDays !== null) {
      pushRangeIssue(product.shelfLifeDays, 0, Number.MAX_SAFE_INTEGER, "product", product.id, "shelfLifeDays", "Shelf life cannot be negative.", issues);
    }
    pushRangeIssue(product.baseQuality, 0, 1, "product", product.id, "baseQuality", "Quality must be between 0 and 1.", issues);
  }

  for (const resource of catalog.resources) {
    pushTextIssue(resource.name, "resource", resource.id, "name", "Resource name is required.", issues);
    pushTextIssue(resource.unit, "resource", resource.id, "unit", "Resource unit is required.", issues);
    pushRangeIssue(resource.baseCostMinor, 0, Number.MAX_SAFE_INTEGER, "resource", resource.id, "baseCostMinor", "Resource cost cannot be negative.", issues);
    pushRangeIssue(resource.scarcity, 0, 1, "resource", resource.id, "scarcity", "Scarcity must be between 0 and 1.", issues);
  }

  for (const building of catalog.buildings) {
    pushTextIssue(building.name, "building", building.id, "name", "Building name is required.", issues);
    pushRangeIssue(building.buildCostMinor, 0, Number.MAX_SAFE_INTEGER, "building", building.id, "buildCostMinor", "Build cost cannot be negative.", issues);
    pushRangeIssue(building.maintenanceMinor, 0, Number.MAX_SAFE_INTEGER, "building", building.id, "maintenanceMinor", "Maintenance cannot be negative.", issues);
    pushRangeIssue(building.energyKwh, 0, Number.MAX_SAFE_INTEGER, "building", building.id, "energyKwh", "Energy cannot be negative.", issues);
    pushRangeIssue(building.capacity, 1, Number.MAX_SAFE_INTEGER, "building", building.id, "capacity", "Capacity must be positive.", issues);
  }

  pushRangeIssue(catalog.infrastructureDefaults.roadQuality, 0, 1, "infrastructureDefaults", "road", "roadQuality", "Road quality must be between 0 and 1.", issues);
  pushRangeIssue(catalog.infrastructureDefaults.railQuality, 0, 1, "infrastructureDefaults", "rail", "railQuality", "Rail quality must be between 0 and 1.", issues);
  pushRangeIssue(catalog.infrastructureDefaults.portQuality, 0, 1, "infrastructureDefaults", "port", "portQuality", "Port quality must be between 0 and 1.", issues);
  pushRangeIssue(
    catalog.infrastructureDefaults.routeCapacityPerTick,
    1,
    Number.MAX_SAFE_INTEGER,
    "infrastructureDefaults",
    "route",
    "routeCapacityPerTick",
    "Route capacity must be positive.",
    issues
  );
  pushRangeIssue(
    catalog.infrastructureDefaults.borderDelayTicks,
    0,
    Number.MAX_SAFE_INTEGER,
    "infrastructureDefaults",
    "border",
    "borderDelayTicks",
    "Border delay cannot be negative.",
    issues
  );
  pushRangeIssue(
    catalog.infrastructureDefaults.baseCostMinorPerUnit,
    0,
    Number.MAX_SAFE_INTEGER,
    "infrastructureDefaults",
    "cost",
    "baseCostMinorPerUnit",
    "Base transport cost cannot be negative.",
    issues
  );

  for (const chain of catalog.productionChains) {
    validateProductionChain(chain, productIds, resourceIds, buildingIds, issues);
    const economics = calculateChainEconomics(catalog, chain);

    if (economics.totalCostMinor === 0 && economics.revenueMinor > 0) {
      issues.push({
        severity: "warning",
        entityType: "productionChain",
        entityId: chain.id,
        field: "inputs",
        message: "Potential infinite profit: chain has positive output revenue with zero modeled cost."
      });
    }

    if (economics.totalCostMinor > 0 && economics.margin > 5) {
      issues.push({
        severity: "warning",
        entityType: "productionChain",
        entityId: chain.id,
        field: "targetPriceMinor",
        message: "Potential runaway profit: simulated margin is above 500%."
      });
    }
  }

  for (const companyType of catalog.companyTypes) {
    pushTextIssue(companyType.name, "companyType", companyType.id, "name", "Company type name is required.", issues);
    pushRangeIssue(
      companyType.licenseCostMinor,
      0,
      Number.MAX_SAFE_INTEGER,
      "companyType",
      companyType.id,
      "licenseCostMinor",
      "License cost cannot be negative.",
      issues
    );
    pushRangeIssue(
      companyType.reputationRequirement,
      0,
      1,
      "companyType",
      companyType.id,
      "reputationRequirement",
      "Reputation requirement must be between 0 and 1.",
      issues
    );

    for (const buildingId of companyType.allowedBuildingIds) {
      if (!buildingIds.has(buildingId)) {
        issues.push({
          severity: "error",
          entityType: "companyType",
          entityId: companyType.id,
          field: "allowedBuildingIds",
          message: `Unknown allowed building: ${buildingId}.`
        });
      }
    }
  }

  for (const law of catalog.laws) {
    pushTextIssue(law.name, "law", law.id, "name", "Law name is required.", issues);
    if (!LAW_TEMPLATE_TYPES.includes(law.type)) {
      issues.push({
        severity: "error",
        entityType: "law",
        entityId: law.id,
        field: "type",
        message: `Unknown law template type: ${law.type}.`
      });
    }
    if (Object.keys(law.parameters).length === 0) {
      issues.push({
        severity: "warning",
        entityType: "law",
        entityId: law.id,
        field: "parameters",
        message: "Law template has no parameters."
      });
    }
    if ((law.type === "profit_tax" || law.type === "sales_tax" || law.type === "import_tariff") && typeof law.parameters.rate !== "number") {
      issues.push({
        severity: "error",
        entityType: "law",
        entityId: law.id,
        field: "parameters.rate",
        message: "Tax and tariff law templates require a numeric rate parameter."
      });
    }
    if (law.type === "industry_license" && typeof law.parameters.industry !== "string") {
      issues.push({
        severity: "error",
        entityType: "law",
        entityId: law.id,
        field: "parameters.industry",
        message: "Industry license templates require an industry parameter."
      });
    }
    pushRangeIssue(law.economicImpact, -1, 1, "law", law.id, "economicImpact", "Economic impact must be between -1 and 1.", issues);
    pushRangeIssue(law.stabilityImpact, -1, 1, "law", law.id, "stabilityImpact", "Stability impact must be between -1 and 1.", issues);
    pushRangeIssue(law.taxRate, 0, 1, "law", law.id, "taxRate", "Tax rate must be between 0 and 1.", issues);
    pushRangeIssue(law.subsidyMinor, 0, Number.MAX_SAFE_INTEGER, "law", law.id, "subsidyMinor", "Subsidy cannot be negative.", issues);
  }

  for (const technology of catalog.technologies) {
    pushTextIssue(technology.name, "technology", technology.id, "name", "Technology name is required.", issues);
    if (!TECHNOLOGY_DOMAINS.includes(technology.domain)) {
      issues.push({
        severity: "error",
        entityType: "technology",
        entityId: technology.id,
        field: "domain",
        message: `Unknown technology domain: ${technology.domain}.`
      });
    }
    if (!TECHNOLOGY_ACCESS_MODELS.includes(technology.accessModel)) {
      issues.push({
        severity: "error",
        entityType: "technology",
        entityId: technology.id,
        field: "accessModel",
        message: `Unknown technology access model: ${technology.accessModel}.`
      });
    }
    pushRangeIssue(
      technology.researchCostMinor,
      0,
      Number.MAX_SAFE_INTEGER,
      "technology",
      technology.id,
      "researchCostMinor",
      "Research cost cannot be negative.",
      issues
    );
    pushRangeIssue(
      technology.efficiencyBonus,
      0,
      1,
      "technology",
      technology.id,
      "efficiencyBonus",
      "Efficiency bonus must be between 0 and 1.",
      issues
    );
    pushRangeIssue(
      technology.energyReduction,
      0,
      1,
      "technology",
      technology.id,
      "energyReduction",
      "Energy reduction must be between 0 and 1.",
      issues
    );
    pushRangeIssue(technology.inputReduction, 0, 1, "technology", technology.id, "inputReduction", "Input reduction must be between 0 and 1.", issues);
    pushRangeIssue(
      technology.pollutionReduction,
      0,
      1,
      "technology",
      technology.id,
      "pollutionReduction",
      "Pollution reduction must be between 0 and 1.",
      issues
    );
    pushRangeIssue(technology.logisticsBonus, 0, 1, "technology", technology.id, "logisticsBonus", "Logistics bonus must be between 0 and 1.", issues);
    pushRangeIssue(technology.healthBonus, 0, 1, "technology", technology.id, "healthBonus", "Health bonus must be between 0 and 1.", issues);
    pushRangeIssue(technology.discoveryBonus, 0, 1, "technology", technology.id, "discoveryBonus", "Discovery bonus must be between 0 and 1.", issues);

    for (const requiredTechnologyId of technology.requiredTechnologyIds) {
      if (!technologyIds.has(requiredTechnologyId)) {
        issues.push({
          severity: "error",
          entityType: "technology",
          entityId: technology.id,
          field: "requiredTechnologyIds",
          message: `Unknown required technology: ${requiredTechnologyId}.`
        });
      }
    }
  }

  for (const deposit of catalog.resourceDepositTemplates) {
    pushTextIssue(deposit.name, "resourceDepositTemplate", deposit.id, "name", "Resource deposit name is required.", issues);
    if (!resourceIds.has(deposit.resourceId)) {
      issues.push({
        severity: "error",
        entityType: "resourceDepositTemplate",
        entityId: deposit.id,
        field: "resourceId",
        message: `Unknown resource: ${deposit.resourceId}.`
      });
    }
    if (deposit.productId !== null && !productIds.has(deposit.productId)) {
      issues.push({
        severity: "error",
        entityType: "resourceDepositTemplate",
        entityId: deposit.id,
        field: "productId",
        message: `Unknown product: ${deposit.productId}.`
      });
    }
    pushRangeIssue(
      deposit.initialQuantity,
      1,
      Number.MAX_SAFE_INTEGER,
      "resourceDepositTemplate",
      deposit.id,
      "initialQuantity",
      "Initial quantity must be positive.",
      issues
    );
    pushRangeIssue(
      deposit.extractionPerTick,
      0,
      Number.MAX_SAFE_INTEGER,
      "resourceDepositTemplate",
      deposit.id,
      "extractionPerTick",
      "Extraction per tick cannot be negative.",
      issues
    );
    pushRangeIssue(deposit.discoveryChance, 0, 1, "resourceDepositTemplate", deposit.id, "discoveryChance", "Discovery chance must be between 0 and 1.", issues);
    pushRangeIssue(deposit.quality, 0, 1, "resourceDepositTemplate", deposit.id, "quality", "Deposit quality must be between 0 and 1.", issues);
  }

  for (const factor of catalog.pollutionFactors) {
    if (!POLLUTION_SOURCE_CATEGORIES.includes(factor.sourceCategory)) {
      issues.push({
        severity: "error",
        entityType: "pollutionFactor",
        entityId: factor.id,
        field: "sourceCategory",
        message: `Unknown pollution source category: ${factor.sourceCategory}.`
      });
    }
    pushRangeIssue(factor.air, 0, 100, "pollutionFactor", factor.id, "air", "Air pollution factor cannot be negative.", issues);
    pushRangeIssue(factor.water, 0, 100, "pollutionFactor", factor.id, "water", "Water pollution factor cannot be negative.", issues);
    pushRangeIssue(factor.soil, 0, 100, "pollutionFactor", factor.id, "soil", "Soil pollution factor cannot be negative.", issues);
    pushRangeIssue(factor.carbon, 0, 100, "pollutionFactor", factor.id, "carbon", "Carbon pollution factor cannot be negative.", issues);
  }

  pushProductionCycleWarnings(catalog, issues);

  return issues;
}

export function runMiniSimulation(catalog: ConstructorCatalog): readonly MiniSimulationResult[] {
  return catalog.productionChains.map((chain) => {
    const economics = calculateChainEconomics(catalog, chain);
    const product = catalog.products.find((candidate) => candidate.id === chain.outputProductId);
    const warnings: string[] = [];

    if (economics.totalCostMinor === 0 && economics.revenueMinor > 0) {
      warnings.push("zero-cost positive-revenue chain");
    }

    if (economics.margin > 5) {
      warnings.push("margin above 500%");
    }

    if (chain.waste.reduce((total, item) => total + nonNegative(item.quantity), 0) > chain.outputQuantity) {
      warnings.push("waste exceeds output quantity");
    }

    return {
      chainId: chain.id,
      chainName: chain.name,
      outputProductName: product?.name ?? chain.outputProductId,
      runs: SIMULATION_RUNS,
      outputQuantity: Math.round(nonNegative(chain.outputQuantity) * SIMULATION_RUNS * 100) / 100,
      totalCostMinor: Math.round(economics.totalCostMinor * SIMULATION_RUNS),
      revenueMinor: Math.round(economics.revenueMinor * SIMULATION_RUNS),
      profitMinor: Math.round(economics.profitMinor * SIMULATION_RUNS),
      margin: clamp(economics.margin, -1, 999),
      breakEvenPriceMinor: economics.breakEvenPriceMinor,
      demandRisk: getDemandRisk(catalog, chain),
      warnings
    };
  });
}

export function serializeConstructorCatalog(catalog: ConstructorCatalog): string {
  return JSON.stringify(catalog, null, 2);
}

export function parseConstructorCatalogJson(value: string): ImportResult {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!isConstructorCatalog(parsed)) {
      return {
        ok: false,
        issues: [],
        error: "JSON does not match the constructor catalog shape."
      };
    }

    const catalog = sanitizeCatalog(parsed);
    const issues = validateConstructorCatalog(catalog);
    const hasErrors = issues.some((issue) => issue.severity === "error");

    return {
      ok: !hasErrors,
      catalog,
      issues
    };
  } catch (error) {
    return {
      ok: false,
      issues: [],
      error: error instanceof Error ? error.message : "Invalid JSON."
    };
  }
}

export function createId(prefix: string, name: string): string {
  const slug = name
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${prefix}-${slug || "draft"}-${Date.now().toString(36)}`;
}

function validateProductionChain(
  chain: ProductionChainDraft,
  productIds: ReadonlySet<string>,
  resourceIds: ReadonlySet<string>,
  buildingIds: ReadonlySet<string>,
  issues: ValidationIssue[]
): void {
  pushTextIssue(chain.name, "productionChain", chain.id, "name", "Production chain name is required.", issues);

  if (!productIds.has(chain.outputProductId)) {
    issues.push({
      severity: "error",
      entityType: "productionChain",
      entityId: chain.id,
      field: "outputProductId",
      message: `Unknown output product: ${chain.outputProductId}.`
    });
  }

  pushRangeIssue(chain.outputQuantity, 0.000001, Number.MAX_SAFE_INTEGER, "productionChain", chain.id, "outputQuantity", "Output quantity must be positive.", issues);
  pushRangeIssue(chain.targetPriceMinor, 0, Number.MAX_SAFE_INTEGER, "productionChain", chain.id, "targetPriceMinor", "Target price cannot be negative.", issues);
  pushRangeIssue(chain.laborHours, 0, Number.MAX_SAFE_INTEGER, "productionChain", chain.id, "laborHours", "Labor cannot be negative.", issues);
  pushRangeIssue(chain.energyKwh, 0, Number.MAX_SAFE_INTEGER, "productionChain", chain.id, "energyKwh", "Energy cannot be negative.", issues);
  pushRangeIssue(chain.durationHours, 0, Number.MAX_SAFE_INTEGER, "productionChain", chain.id, "durationHours", "Time cannot be negative.", issues);

  if (chain.inputs.length === 0) {
    issues.push({
      severity: "warning",
      entityType: "productionChain",
      entityId: chain.id,
      field: "inputs",
      message: "Production chain has no inputs."
    });
  }

  for (const input of chain.inputs) {
    const exists = input.kind === "resource" ? resourceIds.has(input.id) : productIds.has(input.id);

    if (!exists) {
      issues.push({
        severity: "error",
        entityType: "productionChain",
        entityId: chain.id,
        field: "inputs",
        message: `Unknown ${input.kind} input: ${input.id}.`
      });
    }

    pushRangeIssue(input.quantity, 0.000001, Number.MAX_SAFE_INTEGER, "productionChain", chain.id, "inputs.quantity", "Input quantity must be positive.", issues);
  }

  for (const buildingId of chain.equipmentBuildingIds) {
    if (!buildingIds.has(buildingId)) {
      issues.push({
        severity: "error",
        entityType: "productionChain",
        entityId: chain.id,
        field: "equipmentBuildingIds",
        message: `Unknown equipment building: ${buildingId}.`
      });
    }
  }

  for (const waste of chain.waste) {
    if (!resourceIds.has(waste.resourceId)) {
      issues.push({
        severity: "error",
        entityType: "productionChain",
        entityId: chain.id,
        field: "waste",
        message: `Unknown waste resource: ${waste.resourceId}.`
      });
    }

    pushRangeIssue(waste.quantity, 0, Number.MAX_SAFE_INTEGER, "productionChain", chain.id, "waste.quantity", "Waste cannot be negative.", issues);
  }
}

function calculateChainEconomics(catalog: ConstructorCatalog, chain: ProductionChainDraft) {
  const inputCostMinor = chain.inputs.reduce((total, input) => total + getInputCostMinor(catalog, input), 0);
  const laborCostMinor = nonNegative(chain.laborHours) * LABOR_COST_MINOR_PER_HOUR;
  const energyCostMinor = nonNegative(chain.energyKwh) * ENERGY_COST_MINOR_PER_KWH;
  const equipmentCostMinor = chain.equipmentBuildingIds.reduce((total, buildingId) => {
    const building = catalog.buildings.find((candidate) => candidate.id === buildingId);
    const hourlyMaintenance = building ? nonNegative(building.maintenanceMinor) / 720 : 0;
    return total + hourlyMaintenance * Math.max(1, nonNegative(chain.durationHours));
  }, 0);
  const totalCostMinor = Math.max(0, inputCostMinor + laborCostMinor + energyCostMinor + equipmentCostMinor);
  const revenueMinor = Math.max(0, nonNegative(chain.targetPriceMinor) * nonNegative(chain.outputQuantity));
  const profitMinor = revenueMinor - totalCostMinor;
  const margin = totalCostMinor > 0 ? profitMinor / totalCostMinor : revenueMinor > 0 ? 999 : 0;
  const breakEvenPriceMinor = chain.outputQuantity > 0 ? Math.ceil(totalCostMinor / chain.outputQuantity) : 0;

  return {
    totalCostMinor,
    revenueMinor,
    profitMinor,
    margin,
    breakEvenPriceMinor
  };
}

function getInputCostMinor(catalog: ConstructorCatalog, input: ChainInputDraft): number {
  if (input.kind === "resource") {
    const resource = catalog.resources.find((candidate) => candidate.id === input.id);
    return resource ? nonNegative(resource.baseCostMinor) * nonNegative(input.quantity) : 0;
  }

  const sourceChain = catalog.productionChains.find((candidate) => candidate.outputProductId === input.id);
  return sourceChain ? nonNegative(sourceChain.targetPriceMinor) * nonNegative(input.quantity) : 0;
}

function getDemandRisk(catalog: ConstructorCatalog, chain: ProductionChainDraft): MiniSimulationResult["demandRisk"] {
  const product = catalog.products.find((candidate) => candidate.id === chain.outputProductId);

  if (!product) {
    return "high";
  }

  if (product.needCategory === "food" || product.needCategory === "medicine" || product.needCategory === "transport") {
    return "low";
  }

  if (product.needCategory === "housing" || product.needCategory === "energy") {
    return "medium";
  }

  return "high";
}

function pushProductionCycleWarnings(catalog: ConstructorCatalog, issues: ValidationIssue[]): void {
  const adjacency = new Map<string, string[]>();

  for (const chain of catalog.productionChains) {
    for (const input of chain.inputs) {
      if (input.kind === "product") {
        const outputs = adjacency.get(input.id) ?? [];
        outputs.push(chain.outputProductId);
        adjacency.set(input.id, outputs);

        if (input.id === chain.outputProductId) {
          issues.push({
            severity: "warning",
            entityType: "productionChain",
            entityId: chain.id,
            field: "inputs",
            message: "Potential unlimited product cycle: chain consumes its own output."
          });
        }
      }
    }
  }

  for (const productId of adjacency.keys()) {
    if (hasCycle(productId, adjacency, new Set(), new Set())) {
      issues.push({
        severity: "warning",
        entityType: "productionGraph",
        entityId: productId,
        message: `Potential unlimited product cycle involving ${productId}.`
      });
    }
  }
}

function hasCycle(node: string, adjacency: ReadonlyMap<string, readonly string[]>, visiting: Set<string>, visited: Set<string>): boolean {
  if (visiting.has(node)) {
    return true;
  }

  if (visited.has(node)) {
    return false;
  }

  visiting.add(node);

  for (const next of adjacency.get(node) ?? []) {
    if (hasCycle(next, adjacency, visiting, visited)) {
      return true;
    }
  }

  visiting.delete(node);
  visited.add(node);
  return false;
}

function pushDuplicateIssues(entityType: string, ids: readonly string[], issues: ValidationIssue[]): void {
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      issues.push({
        severity: "error",
        entityType,
        entityId: id,
        message: `Duplicate ${entityType} id: ${id}.`
      });
    }

    seen.add(id);
  }
}

function pushTextIssue(
  value: string,
  entityType: string,
  entityId: string,
  field: string,
  message: string,
  issues: ValidationIssue[]
): void {
  if (value.trim().length === 0) {
    issues.push({ severity: "error", entityType, entityId, field, message });
  }
}

function pushRangeIssue(
  value: number,
  min: number,
  max: number,
  entityType: string,
  entityId: string,
  field: string,
  message: string,
  issues: ValidationIssue[]
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    issues.push({ severity: "error", entityType, entityId, field, message });
  }
}

function isConstructorCatalog(value: unknown): value is ConstructorCatalog {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    record.schemaVersion === 1 &&
    Array.isArray(record.products) &&
    Array.isArray(record.resources) &&
    Array.isArray(record.productionChains) &&
    Array.isArray(record.buildings) &&
    Array.isArray(record.companyTypes) &&
    Array.isArray(record.laws) &&
    Array.isArray(record.technologies) &&
    (record.resourceDepositTemplates === undefined || Array.isArray(record.resourceDepositTemplates)) &&
    (record.pollutionFactors === undefined || Array.isArray(record.pollutionFactors)) &&
    typeof record.infrastructureDefaults === "object" &&
    record.infrastructureDefaults !== null
  );
}

function sanitizeCatalog(catalog: ConstructorCatalog): ConstructorCatalog {
  const resourceDepositTemplates = catalog.resourceDepositTemplates ?? [];
  const pollutionFactors = catalog.pollutionFactors ?? [];

  return {
    schemaVersion: 1,
    products: catalog.products.map((product) => ({
      ...product,
      weightKg: nonNegative(product.weightKg),
      volumeM3: nonNegative(product.volumeM3),
      shelfLifeDays: product.shelfLifeDays === null ? null : nonNegative(product.shelfLifeDays),
      baseQuality: clamp(product.baseQuality, 0, 1)
    })),
    resources: catalog.resources.map((resource) => ({
      ...resource,
      baseCostMinor: nonNegative(resource.baseCostMinor),
      scarcity: clamp(resource.scarcity, 0, 1)
    })),
    productionChains: catalog.productionChains.map((chain) => ({
      ...chain,
      inputs: chain.inputs.map((input) => ({ ...input, quantity: nonNegative(input.quantity) })),
      outputQuantity: nonNegative(chain.outputQuantity),
      targetPriceMinor: nonNegative(chain.targetPriceMinor),
      laborHours: nonNegative(chain.laborHours),
      energyKwh: nonNegative(chain.energyKwh),
      durationHours: nonNegative(chain.durationHours),
      waste: chain.waste.map((waste) => ({ ...waste, quantity: nonNegative(waste.quantity) }))
    })),
    buildings: catalog.buildings.map((building) => ({
      ...building,
      buildCostMinor: nonNegative(building.buildCostMinor),
      maintenanceMinor: nonNegative(building.maintenanceMinor),
      energyKwh: nonNegative(building.energyKwh),
      capacity: nonNegative(building.capacity),
      warehouseType: building.warehouseType ?? "general"
    })),
    companyTypes: catalog.companyTypes.map((companyType) => ({
      ...companyType,
      licenseCostMinor: nonNegative(companyType.licenseCostMinor),
      reputationRequirement: clamp(companyType.reputationRequirement, 0, 1),
      transportType: companyType.transportType ?? null
    })),
    laws: catalog.laws.map((law) => ({
      ...law,
      type: LAW_TEMPLATE_TYPES.includes(law.type) ? law.type : "profit_tax",
      parameters: sanitizeLawParameters(law.parameters),
      restrictions: typeof law.restrictions === "string" ? law.restrictions : "",
      economicImpact: clamp(law.economicImpact ?? 0, -1, 1),
      stabilityImpact: clamp(law.stabilityImpact ?? 0, -1, 1),
      taxRate: clamp(law.taxRate, 0, 1),
      subsidyMinor: nonNegative(law.subsidyMinor)
    })),
    technologies: catalog.technologies.map((technology) => ({
      ...technology,
      domain: TECHNOLOGY_DOMAINS.includes(technology.domain) ? technology.domain : "production",
      accessModel: TECHNOLOGY_ACCESS_MODELS.includes(technology.accessModel) ? technology.accessModel : "open",
      researchCostMinor: nonNegative(technology.researchCostMinor),
      efficiencyBonus: clamp(technology.efficiencyBonus, 0, 1),
      energyReduction: clamp(technology.energyReduction, 0, 1),
      inputReduction: clamp(technology.inputReduction, 0, 1),
      pollutionReduction: clamp(technology.pollutionReduction, 0, 1),
      logisticsBonus: clamp(technology.logisticsBonus, 0, 1),
      healthBonus: clamp(technology.healthBonus, 0, 1),
      discoveryBonus: clamp(technology.discoveryBonus, 0, 1)
    })),
    resourceDepositTemplates: resourceDepositTemplates.map((deposit) => ({
      ...deposit,
      productId: deposit.productId ?? null,
      initialQuantity: nonNegative(deposit.initialQuantity),
      extractionPerTick: nonNegative(deposit.extractionPerTick),
      discoveryChance: clamp(deposit.discoveryChance, 0, 1),
      quality: clamp(deposit.quality, 0, 1)
    })),
    pollutionFactors: pollutionFactors.map((factor) => ({
      ...factor,
      sourceCategory: POLLUTION_SOURCE_CATEGORIES.includes(factor.sourceCategory) ? factor.sourceCategory : "industrial",
      air: nonNegative(factor.air),
      water: nonNegative(factor.water),
      soil: nonNegative(factor.soil),
      carbon: nonNegative(factor.carbon)
    })),
    infrastructureDefaults: {
      roadQuality: clamp(catalog.infrastructureDefaults.roadQuality, 0, 1),
      railQuality: clamp(catalog.infrastructureDefaults.railQuality, 0, 1),
      portQuality: clamp(catalog.infrastructureDefaults.portQuality, 0, 1),
      routeCapacityPerTick: nonNegative(catalog.infrastructureDefaults.routeCapacityPerTick),
      borderDelayTicks: nonNegative(catalog.infrastructureDefaults.borderDelayTicks),
      baseCostMinorPerUnit: nonNegative(catalog.infrastructureDefaults.baseCostMinorPerUnit)
    }
  };
}

function sanitizeLawParameters(value: unknown): Readonly<Record<string, string | number | boolean>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const parameters: Record<string, string | number | boolean> = {};

  for (const [key, rawValue] of Object.entries(value)) {
    if (typeof rawValue === "string" || typeof rawValue === "boolean") {
      parameters[key] = rawValue;
    } else if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
      parameters[key] = rawValue;
    }
  }

  return parameters;
}

function nonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}
