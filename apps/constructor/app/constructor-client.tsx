"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Cpu,
  Download,
  FileJson,
  FlaskConical,
  Landmark,
  Package,
  Pickaxe,
  Plus,
  Scale,
  Trash2,
  Upload,
  Workflow
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  NEED_CATEGORIES,
  LAW_TEMPLATE_TYPES,
  POLLUTION_SOURCE_CATEGORIES,
  PRODUCT_CATEGORIES,
  RESOURCE_CATEGORIES,
  TECHNOLOGY_ACCESS_MODELS,
  TECHNOLOGY_DOMAINS,
  TRANSPORT_TYPES,
  WAREHOUSE_TYPES,
  createId,
  createInitialConstructorCatalog,
  parseConstructorCatalogJson,
  runMiniSimulation,
  serializeConstructorCatalog,
  validateConstructorCatalog,
  type BuildingDraft,
  type ChainInputDraft,
  type ChainInputKind,
  type ChainWasteDraft,
  type CompanyTypeDraft,
  type ConstructorCatalog,
  type ConstructorNeedCategory,
  type InfrastructureDefaultsDraft,
  type LawDraft,
  type LawTemplateType,
  type ProductCategory,
  type ProductDraft,
  type ProductionChainDraft,
  type PollutionFactorDraft,
  type PollutionSourceCategory,
  type ResourceDepositTemplateDraft,
  type ResourceCategory,
  type ResourceDraft,
  type TechnologyAccessModel,
  type TechnologyDomain,
  type TechnologyDraft,
  type TransportType,
  type ValidationIssue,
  type WarehouseType
} from "../lib/constructor-model";

type SectionId = "products" | "resources" | "chains" | "buildings" | "companyTypes" | "laws" | "technologies";

interface SectionMeta {
  readonly id: SectionId;
  readonly label: string;
  readonly icon: ReactNode;
}

const SECTIONS: readonly SectionMeta[] = [
  { id: "products", label: "Products", icon: <Package className="h-4 w-4" aria-hidden="true" /> },
  { id: "resources", label: "Resources", icon: <Pickaxe className="h-4 w-4" aria-hidden="true" /> },
  { id: "chains", label: "Production Chains", icon: <Workflow className="h-4 w-4" aria-hidden="true" /> },
  { id: "buildings", label: "Buildings", icon: <Building2 className="h-4 w-4" aria-hidden="true" /> },
  { id: "companyTypes", label: "Company Types", icon: <Landmark className="h-4 w-4" aria-hidden="true" /> },
  { id: "laws", label: "Laws", icon: <Scale className="h-4 w-4" aria-hidden="true" /> },
  { id: "technologies", label: "Technologies", icon: <Cpu className="h-4 w-4" aria-hidden="true" /> }
];

export function ConstructorClient() {
  const [catalog, setCatalog] = useState<ConstructorCatalog>(() => createInitialConstructorCatalog());
  const [activeSection, setActiveSection] = useState<SectionId>("products");
  const [selectedProductId, setSelectedProductId] = useState(catalog.products[0]?.id ?? "");
  const [selectedChainId, setSelectedChainId] = useState(catalog.productionChains[0]?.id ?? "");
  const [jsonDraft, setJsonDraft] = useState(() => serializeConstructorCatalog(catalog));
  const [notice, setNotice] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const validationIssues = useMemo(() => validateConstructorCatalog(catalog), [catalog]);
  const simulations = useMemo(() => runMiniSimulation(catalog), [catalog]);
  const exportJson = useMemo(() => serializeConstructorCatalog(catalog), [catalog]);
  const selectedProduct = catalog.products.find((product) => product.id === selectedProductId) ?? catalog.products[0] ?? null;
  const selectedChain = catalog.productionChains.find((chain) => chain.id === selectedChainId) ?? catalog.productionChains[0] ?? null;
  const selectedSimulation = simulations.find((simulation) => simulation.chainId === selectedChain?.id) ?? simulations[0] ?? null;
  const issueCounts = getIssueCounts(validationIssues);

  function updateCatalog(updater: (current: ConstructorCatalog) => ConstructorCatalog) {
    setCatalog((current) => updater(current));
    setNotice(null);
    setImportError(null);
  }

  function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseConstructorCatalogJson(jsonDraft);

    if (!result.ok || !result.catalog) {
      setImportError(result.error ?? "Import blocked by validation errors.");
      setNotice(null);
      return;
    }

    setCatalog(result.catalog);
    setSelectedProductId(result.catalog.products[0]?.id ?? "");
    setSelectedChainId(result.catalog.productionChains[0]?.id ?? "");
    setImportError(null);
    setNotice(`Imported catalog with ${result.issues.length} validation warnings.`);
  }

  function loadCurrentJson() {
    setJsonDraft(exportJson);
    setNotice("Current catalog JSON loaded.");
    setImportError(null);
  }

  function resetDemo() {
    const demo = createInitialConstructorCatalog();
    setCatalog(demo);
    setSelectedProductId(demo.products[0]?.id ?? "");
    setSelectedChainId(demo.productionChains[0]?.id ?? "");
    setJsonDraft(serializeConstructorCatalog(demo));
    setNotice("Demo constructor catalog restored.");
    setImportError(null);
  }

  return (
    <main className="min-h-screen px-3 py-3 text-stone-100 sm:px-5 lg:px-6">
      <header className="grid gap-3 rounded-lg border border-economy-line bg-[#151512]/95 p-3 shadow-2xl lg:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-economy-teal">EconomySim Constructor</p>
          <h1 className="mt-1 text-2xl font-bold text-stone-50">World Data Studio</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <HudBadge icon={<Package className="h-4 w-4" aria-hidden="true" />} label="Products" value={catalog.products.length.toString()} />
          <HudBadge icon={<Workflow className="h-4 w-4" aria-hidden="true" />} label="Chains" value={catalog.productionChains.length.toString()} />
          <HudBadge icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} label="Warnings" value={issueCounts.warning.toString()} tone="warning" />
          <HudBadge icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />} label="Errors" value={issueCounts.error.toString()} tone={issueCounts.error > 0 ? "danger" : "success"} />
        </div>
      </header>

      <div className="mt-3 grid gap-3 xl:grid-cols-[260px_minmax(0,1fr)_390px]">
        <aside className="grid content-start gap-3">
          <Panel title="Sections">
            <nav className="grid gap-2">
              {SECTIONS.map((section) => (
                <button
                  className={`flex min-h-10 items-center gap-2 rounded-md border px-3 text-left text-sm font-semibold transition ${
                    activeSection === section.id
                      ? "border-economy-gold bg-economy-gold text-[#17110a]"
                      : "border-[#3b3831] bg-black/25 text-stone-200 hover:border-economy-teal"
                  }`}
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  type="button"
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>
          </Panel>

          <ValidationPanel issues={validationIssues} />
          <InfrastructureDefaultsPanel catalog={catalog} onChange={updateCatalog} />
        </aside>

        <section className="min-w-0">
          {activeSection === "products" ? (
            <ProductEditor
              catalog={catalog}
              onChange={updateCatalog}
              selectedProduct={selectedProduct}
              selectedProductId={selectedProductId}
              onSelectProduct={setSelectedProductId}
            />
          ) : null}
          {activeSection === "resources" ? <ResourcesEditor catalog={catalog} onChange={updateCatalog} /> : null}
          {activeSection === "chains" ? (
            <ProductionChainEditor
              catalog={catalog}
              onChange={updateCatalog}
              selectedChain={selectedChain}
              selectedChainId={selectedChainId}
              selectedSimulation={selectedSimulation}
              onSelectChain={setSelectedChainId}
            />
          ) : null}
          {activeSection === "buildings" ? <BuildingsEditor catalog={catalog} onChange={updateCatalog} /> : null}
          {activeSection === "companyTypes" ? <CompanyTypesEditor catalog={catalog} onChange={updateCatalog} /> : null}
          {activeSection === "laws" ? <LawsEditor catalog={catalog} onChange={updateCatalog} /> : null}
          {activeSection === "technologies" ? <TechnologiesEditor catalog={catalog} onChange={updateCatalog} /> : null}
        </section>

        <aside className="grid content-start gap-3">
          {notice ? <Notice message={notice} onClose={() => setNotice(null)} /> : null}
          {importError ? <ErrorNotice message={importError} /> : null}
          <MiniSimulationPanel simulations={simulations} selectedChainId={selectedChain?.id ?? null} />
          <JsonPanel exportJson={exportJson} jsonDraft={jsonDraft} onDraftChange={setJsonDraft} onImport={handleImport} onLoadCurrent={loadCurrentJson} onResetDemo={resetDemo} />
        </aside>
      </div>
    </main>
  );
}

function ProductEditor({
  catalog,
  onChange,
  onSelectProduct,
  selectedProduct,
  selectedProductId
}: {
  readonly catalog: ConstructorCatalog;
  readonly onChange: (updater: (current: ConstructorCatalog) => ConstructorCatalog) => void;
  readonly onSelectProduct: (id: string) => void;
  readonly selectedProduct: ProductDraft | null;
  readonly selectedProductId: string;
}) {
  function patchProduct(patch: Partial<ProductDraft>) {
    if (!selectedProduct) {
      return;
    }

    onChange((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === selectedProduct.id ? { ...product, ...patch } : product))
    }));
  }

  function addProduct() {
    const product: ProductDraft = {
      id: createId("product", "new product"),
      name: "New Product",
      category: "consumer",
      weightKg: 1,
      volumeM3: 0.01,
      shelfLifeDays: null,
      baseQuality: 0.5,
      brandManufacturer: "Unassigned",
      needCategory: "entertainment"
    };

    onChange((current) => ({ ...current, products: [...current.products, product] }));
    onSelectProduct(product.id);
  }

  function removeProduct() {
    if (!selectedProduct) {
      return;
    }

    onChange((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== selectedProduct.id),
      productionChains: current.productionChains.filter((chain) => chain.outputProductId !== selectedProduct.id)
    }));
    onSelectProduct(catalog.products.find((product) => product.id !== selectedProduct.id)?.id ?? "");
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Panel title="Products">
        <ItemList
          items={catalog.products.map((product) => ({ id: product.id, title: product.name, detail: `${product.category} / ${product.needCategory}` }))}
          selectedId={selectedProductId}
          onSelect={onSelectProduct}
        />
        <IconButton className="mt-3 w-full" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={addProduct}>
          Add product
        </IconButton>
      </Panel>

      <Panel title="Product editor">
        {selectedProduct ? (
          <div className="grid gap-3 md:grid-cols-2">
            <TextField label="Название" value={selectedProduct.name} onChange={(value) => patchProduct({ name: value })} />
            <TextField label="Бренд/производитель" value={selectedProduct.brandManufacturer} onChange={(value) => patchProduct({ brandManufacturer: value })} />
            <SelectField
              label="Категория"
              value={selectedProduct.category}
              options={PRODUCT_CATEGORIES}
              onChange={(value) => patchProduct({ category: value as ProductCategory })}
            />
            <SelectField
              label="Потребность"
              value={selectedProduct.needCategory}
              options={NEED_CATEGORIES}
              onChange={(value) => patchProduct({ needCategory: value as ConstructorNeedCategory })}
            />
            <NumberField label="Вес" min={0} value={selectedProduct.weightKg} onChange={(value) => patchProduct({ weightKg: value })} />
            <NumberField label="Объем" min={0} step={0.001} value={selectedProduct.volumeM3} onChange={(value) => patchProduct({ volumeM3: value })} />
            <NumberField
              label="Срок годности"
              min={0}
              value={selectedProduct.shelfLifeDays ?? 0}
              onChange={(value) => patchProduct({ shelfLifeDays: value === 0 ? null : value })}
            />
            <NumberField label="Качество" max={1} min={0} step={0.01} value={selectedProduct.baseQuality} onChange={(value) => patchProduct({ baseQuality: value })} />
            <div className="md:col-span-2">
              <IconButton icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} onClick={removeProduct} tone="danger">
                Delete product
              </IconButton>
            </div>
          </div>
        ) : (
          <EmptyState>No product selected.</EmptyState>
        )}
      </Panel>
    </div>
  );
}

function ResourcesEditor({ catalog, onChange }: EditorProps) {
  function patchResource(resourceId: string, patch: Partial<ResourceDraft>) {
    onChange((current) => ({
      ...current,
      resources: current.resources.map((resource) => (resource.id === resourceId ? { ...resource, ...patch } : resource))
    }));
  }

  function addResource() {
    const resource: ResourceDraft = {
      id: createId("resource", "new resource"),
      name: "New Resource",
      category: "industrial",
      unit: "unit",
      baseCostMinor: 100,
      scarcity: 0.3,
      renewable: false
    };

    onChange((current) => ({ ...current, resources: [...current.resources, resource] }));
  }

  return (
    <Panel title="Resources">
      <EditableGrid onAdd={addResource}>
        {catalog.resources.map((resource) => (
          <RowCard key={resource.id} title={resource.name} subtitle={`${resource.category} / ${resource.unit}`}>
            <TextField label="Name" value={resource.name} onChange={(value) => patchResource(resource.id, { name: value })} />
            <SelectField label="Category" value={resource.category} options={RESOURCE_CATEGORIES} onChange={(value) => patchResource(resource.id, { category: value as ResourceCategory })} />
            <TextField label="Unit" value={resource.unit} onChange={(value) => patchResource(resource.id, { unit: value })} />
            <NumberField label="Base cost" min={0} value={resource.baseCostMinor} onChange={(value) => patchResource(resource.id, { baseCostMinor: value })} />
            <NumberField label="Scarcity" max={1} min={0} step={0.01} value={resource.scarcity} onChange={(value) => patchResource(resource.id, { scarcity: value })} />
            <ToggleField label="Renewable" value={resource.renewable} onChange={(value) => patchResource(resource.id, { renewable: value })} />
          </RowCard>
        ))}
      </EditableGrid>
    </Panel>
  );
}

function ProductionChainEditor({
  catalog,
  onChange,
  onSelectChain,
  selectedChain,
  selectedChainId,
  selectedSimulation
}: {
  readonly catalog: ConstructorCatalog;
  readonly onChange: (updater: (current: ConstructorCatalog) => ConstructorCatalog) => void;
  readonly onSelectChain: (id: string) => void;
  readonly selectedChain: ProductionChainDraft | null;
  readonly selectedChainId: string;
  readonly selectedSimulation: ReturnType<typeof runMiniSimulation>[number] | null;
}) {
  function patchChain(patch: Partial<ProductionChainDraft>) {
    if (!selectedChain) {
      return;
    }

    onChange((current) => ({
      ...current,
      productionChains: current.productionChains.map((chain) => (chain.id === selectedChain.id ? { ...chain, ...patch } : chain))
    }));
  }

  function addChain() {
    const chain: ProductionChainDraft = {
      id: createId("chain", "new chain"),
      name: "New Production Chain",
      inputs: catalog.resources[0] ? [{ kind: "resource", id: catalog.resources[0].id, quantity: 1 }] : [],
      outputProductId: catalog.products[0]?.id ?? "",
      outputQuantity: 1,
      targetPriceMinor: 500,
      laborHours: 0.1,
      energyKwh: 0.1,
      durationHours: 1,
      equipmentBuildingIds: [],
      waste: []
    };

    onChange((current) => ({ ...current, productionChains: [...current.productionChains, chain] }));
    onSelectChain(chain.id);
  }

  function removeChain() {
    if (!selectedChain) {
      return;
    }

    onChange((current) => ({ ...current, productionChains: current.productionChains.filter((chain) => chain.id !== selectedChain.id) }));
    onSelectChain(catalog.productionChains.find((chain) => chain.id !== selectedChain.id)?.id ?? "");
  }

  function patchInput(index: number, patch: Partial<ChainInputDraft>) {
    if (!selectedChain) {
      return;
    }

    patchChain({
      inputs: selectedChain.inputs.map((input, inputIndex) => (inputIndex === index ? { ...input, ...patch } : input))
    });
  }

  function addInput() {
    if (!selectedChain || !catalog.resources[0]) {
      return;
    }

    patchChain({ inputs: [...selectedChain.inputs, { kind: "resource", id: catalog.resources[0].id, quantity: 1 }] });
  }

  function removeInput(index: number) {
    if (!selectedChain) {
      return;
    }

    patchChain({ inputs: selectedChain.inputs.filter((_, inputIndex) => inputIndex !== index) });
  }

  function patchWaste(index: number, patch: Partial<ChainWasteDraft>) {
    if (!selectedChain) {
      return;
    }

    patchChain({
      waste: selectedChain.waste.map((waste, wasteIndex) => (wasteIndex === index ? { ...waste, ...patch } : waste))
    });
  }

  function addWaste() {
    if (!selectedChain || !catalog.resources[0]) {
      return;
    }

    patchChain({ waste: [...selectedChain.waste, { resourceId: catalog.resources[0].id, quantity: 0.1 }] });
  }

  function removeWaste(index: number) {
    if (!selectedChain) {
      return;
    }

    patchChain({ waste: selectedChain.waste.filter((_, wasteIndex) => wasteIndex !== index) });
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Panel title="Production Chains">
        <ItemList
          items={catalog.productionChains.map((chain) => ({
            id: chain.id,
            title: chain.name,
            detail: catalog.products.find((product) => product.id === chain.outputProductId)?.name ?? chain.outputProductId
          }))}
          selectedId={selectedChainId}
          onSelect={onSelectChain}
        />
        <IconButton className="mt-3 w-full" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={addChain}>
          Add chain
        </IconButton>
      </Panel>

      <Panel title="Production chain editor">
        {selectedChain ? (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <TextField label="Name" value={selectedChain.name} onChange={(value) => patchChain({ name: value })} />
              <SelectField label="Output" value={selectedChain.outputProductId} options={catalog.products.map((product) => product.id)} optionLabels={nameMap(catalog.products)} onChange={(value) => patchChain({ outputProductId: value })} />
              <NumberField label="Output qty" min={0} step={0.01} value={selectedChain.outputQuantity} onChange={(value) => patchChain({ outputQuantity: value })} />
              <NumberField label="Target price" min={0} value={selectedChain.targetPriceMinor} onChange={(value) => patchChain({ targetPriceMinor: value })} />
              <NumberField label="Труд" min={0} step={0.01} value={selectedChain.laborHours} onChange={(value) => patchChain({ laborHours: value })} />
              <NumberField label="Энергия" min={0} step={0.01} value={selectedChain.energyKwh} onChange={(value) => patchChain({ energyKwh: value })} />
              <NumberField label="Время" min={0} step={0.01} value={selectedChain.durationHours} onChange={(value) => patchChain({ durationHours: value })} />
            </div>

            <Subsection title="Inputs">
              <div className="grid gap-2">
                {selectedChain.inputs.map((input, index) => (
                  <div className="grid gap-2 rounded-md border border-[#3b3831] bg-black/20 p-2 md:grid-cols-[120px_1fr_110px_auto]" key={`${input.kind}-${input.id}-${index}`}>
                    <SelectField
                      label="Kind"
                      value={input.kind}
                      options={["resource", "product"]}
                      onChange={(value) => {
                        const kind = value as ChainInputKind;
                        patchInput(index, {
                          kind,
                          id: kind === "resource" ? catalog.resources[0]?.id ?? "" : catalog.products[0]?.id ?? ""
                        });
                      }}
                    />
                    <SelectField
                      label="Input"
                      value={input.id}
                      options={input.kind === "resource" ? catalog.resources.map((resource) => resource.id) : catalog.products.map((product) => product.id)}
                      optionLabels={input.kind === "resource" ? nameMap(catalog.resources) : nameMap(catalog.products)}
                      onChange={(value) => patchInput(index, { id: value })}
                    />
                    <NumberField label="Qty" min={0} step={0.01} value={input.quantity} onChange={(value) => patchInput(index, { quantity: value })} />
                    <IconButton icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} onClick={() => removeInput(index)} tone="danger">
                      Remove
                    </IconButton>
                  </div>
                ))}
                <IconButton icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={addInput}>
                  Add input
                </IconButton>
              </div>
            </Subsection>

            <Subsection title="Оборудование">
              <div className="grid gap-2 sm:grid-cols-2">
                {catalog.buildings.map((building) => (
                  <label className="flex items-center gap-2 rounded-md border border-[#3b3831] bg-black/20 px-3 py-2 text-sm text-stone-200" key={building.id}>
                    <input
                      checked={selectedChain.equipmentBuildingIds.includes(building.id)}
                      onChange={(event) => {
                        const nextIds = event.target.checked
                          ? [...selectedChain.equipmentBuildingIds, building.id]
                          : selectedChain.equipmentBuildingIds.filter((id) => id !== building.id);
                        patchChain({ equipmentBuildingIds: nextIds });
                      }}
                      type="checkbox"
                    />
                    {building.name}
                  </label>
                ))}
              </div>
            </Subsection>

            <Subsection title="Отходы">
              <div className="grid gap-2">
                {selectedChain.waste.map((waste, index) => (
                  <div className="grid gap-2 rounded-md border border-[#3b3831] bg-black/20 p-2 md:grid-cols-[1fr_110px_auto]" key={`${waste.resourceId}-${index}`}>
                    <SelectField label="Resource" value={waste.resourceId} options={catalog.resources.map((resource) => resource.id)} optionLabels={nameMap(catalog.resources)} onChange={(value) => patchWaste(index, { resourceId: value })} />
                    <NumberField label="Qty" min={0} step={0.01} value={waste.quantity} onChange={(value) => patchWaste(index, { quantity: value })} />
                    <IconButton icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} onClick={() => removeWaste(index)} tone="danger">
                      Remove
                    </IconButton>
                  </div>
                ))}
                <IconButton icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={addWaste}>
                  Add waste
                </IconButton>
              </div>
            </Subsection>

            {selectedSimulation ? <ChainSimulationCard simulation={selectedSimulation} /> : null}
            <IconButton icon={<Trash2 className="h-4 w-4" aria-hidden="true" />} onClick={removeChain} tone="danger">
              Delete chain
            </IconButton>
          </div>
        ) : (
          <EmptyState>No production chain selected.</EmptyState>
        )}
      </Panel>
    </div>
  );
}

function BuildingsEditor({ catalog, onChange }: EditorProps) {
  function patchBuilding(buildingId: string, patch: Partial<BuildingDraft>) {
    onChange((current) => ({
      ...current,
      buildings: current.buildings.map((building) => (building.id === buildingId ? { ...building, ...patch } : building))
    }));
  }

  return (
    <Panel title="Buildings">
      <EditableGrid>
        {catalog.buildings.map((building) => (
          <RowCard key={building.id} title={building.name} subtitle={`${building.category} / capacity ${building.capacity}`}>
            <TextField label="Name" value={building.name} onChange={(value) => patchBuilding(building.id, { name: value })} />
            <NumberField label="Build cost" min={0} value={building.buildCostMinor} onChange={(value) => patchBuilding(building.id, { buildCostMinor: value })} />
            <NumberField label="Maintenance" min={0} value={building.maintenanceMinor} onChange={(value) => patchBuilding(building.id, { maintenanceMinor: value })} />
            <NumberField label="Energy" min={0} value={building.energyKwh} onChange={(value) => patchBuilding(building.id, { energyKwh: value })} />
            <NumberField label="Capacity" min={1} value={building.capacity} onChange={(value) => patchBuilding(building.id, { capacity: value })} />
            <SelectField label="Warehouse type" value={building.warehouseType} options={WAREHOUSE_TYPES} onChange={(value) => patchBuilding(building.id, { warehouseType: value as WarehouseType })} />
          </RowCard>
        ))}
      </EditableGrid>
    </Panel>
  );
}

function CompanyTypesEditor({ catalog, onChange }: EditorProps) {
  function patchCompanyType(companyTypeId: string, patch: Partial<CompanyTypeDraft>) {
    onChange((current) => ({
      ...current,
      companyTypes: current.companyTypes.map((companyType) => (companyType.id === companyTypeId ? { ...companyType, ...patch } : companyType))
    }));
  }

  return (
    <Panel title="Company Types">
      <EditableGrid>
        {catalog.companyTypes.map((companyType) => (
          <RowCard key={companyType.id} title={companyType.name} subtitle={`${companyType.allowedBuildingIds.length} buildings`}>
            <TextField label="Name" value={companyType.name} onChange={(value) => patchCompanyType(companyType.id, { name: value })} />
            <NumberField label="License cost" min={0} value={companyType.licenseCostMinor} onChange={(value) => patchCompanyType(companyType.id, { licenseCostMinor: value })} />
            <NumberField label="Reputation" max={1} min={0} step={0.01} value={companyType.reputationRequirement} onChange={(value) => patchCompanyType(companyType.id, { reputationRequirement: value })} />
            <SelectField
              label="Transport type"
              value={companyType.transportType ?? "none"}
              options={["none", ...TRANSPORT_TYPES]}
              onChange={(value) => patchCompanyType(companyType.id, { transportType: value === "none" ? null : (value as TransportType) })}
            />
            <div className="md:col-span-2">
              <CheckList
                items={catalog.buildings.map((building) => ({ id: building.id, label: building.name }))}
                selectedIds={companyType.allowedBuildingIds}
                onChange={(ids) => patchCompanyType(companyType.id, { allowedBuildingIds: ids })}
              />
            </div>
          </RowCard>
        ))}
      </EditableGrid>
    </Panel>
  );
}

function LawsEditor({ catalog, onChange }: EditorProps) {
  function patchLaw(lawId: string, patch: Partial<LawDraft>) {
    onChange((current) => ({
      ...current,
      laws: current.laws.map((law) => (law.id === lawId ? { ...law, ...patch } : law))
    }));
  }

  function addLaw() {
    const law: LawDraft = {
      id: createId("law", "new law"),
      name: "New Law Template",
      type: "profit_tax",
      enabled: false,
      parameters: { rate: 0.05 },
      restrictions: "Country must have a functioning tax authority.",
      economicImpact: -0.01,
      stabilityImpact: 0.01,
      taxRate: 0.05,
      subsidyMinor: 0,
      targetCategory: "all"
    };

    onChange((current) => ({ ...current, laws: [...current.laws, law] }));
  }

  return (
    <Panel title="Laws">
      <EditableGrid onAdd={addLaw}>
        {catalog.laws.map((law) => (
          <RowCard key={law.id} title={law.name} subtitle={law.enabled ? "enabled" : "disabled"}>
            <TextField label="Name" value={law.name} onChange={(value) => patchLaw(law.id, { name: value })} />
            <SelectField label="Law type" value={law.type} options={LAW_TEMPLATE_TYPES} onChange={(value) => patchLaw(law.id, { type: value as LawTemplateType })} />
            <SelectField label="Target" value={law.targetCategory} options={["all", ...PRODUCT_CATEGORIES]} onChange={(value) => patchLaw(law.id, { targetCategory: value as ProductCategory | "all" })} />
            <TextField
              label="Parameters JSON"
              value={serializeLawParameters(law.parameters)}
              onChange={(value) => patchLaw(law.id, { parameters: parseLawParameters(value, law.parameters) })}
            />
            <TextField label="Restrictions" value={law.restrictions} onChange={(value) => patchLaw(law.id, { restrictions: value })} />
            <NumberField label="Tax rate" max={1} min={0} step={0.01} value={law.taxRate} onChange={(value) => patchLaw(law.id, { taxRate: value })} />
            <NumberField label="Subsidy" min={0} value={law.subsidyMinor} onChange={(value) => patchLaw(law.id, { subsidyMinor: value })} />
            <NumberField label="Economic impact" max={1} min={-1} step={0.01} value={law.economicImpact} onChange={(value) => patchLaw(law.id, { economicImpact: value })} />
            <NumberField label="Stability impact" max={1} min={-1} step={0.01} value={law.stabilityImpact} onChange={(value) => patchLaw(law.id, { stabilityImpact: value })} />
            <ToggleField label="Enabled" value={law.enabled} onChange={(value) => patchLaw(law.id, { enabled: value })} />
          </RowCard>
        ))}
      </EditableGrid>
    </Panel>
  );
}

function TechnologiesEditor({ catalog, onChange }: EditorProps) {
  function patchTechnology(technologyId: string, patch: Partial<TechnologyDraft>) {
    onChange((current) => ({
      ...current,
      technologies: current.technologies.map((technology) => (technology.id === technologyId ? { ...technology, ...patch } : technology))
    }));
  }

  function patchDepositTemplate(depositId: string, patch: Partial<ResourceDepositTemplateDraft>) {
    onChange((current) => ({
      ...current,
      resourceDepositTemplates: current.resourceDepositTemplates.map((deposit) => (deposit.id === depositId ? { ...deposit, ...patch } : deposit))
    }));
  }

  function patchPollutionFactor(factorId: string, patch: Partial<PollutionFactorDraft>) {
    onChange((current) => ({
      ...current,
      pollutionFactors: current.pollutionFactors.map((factor) => (factor.id === factorId ? { ...factor, ...patch } : factor))
    }));
  }

  function addTechnology() {
    const technology: TechnologyDraft = {
      id: createId("technology", "new"),
      name: "New Technology",
      domain: "production",
      industry: "all",
      accessModel: "open",
      researchCostMinor: 50_000,
      unlocked: false,
      efficiencyBonus: 0.05,
      energyReduction: 0.03,
      inputReduction: 0.04,
      pollutionReduction: 0.02,
      logisticsBonus: 0,
      healthBonus: 0,
      discoveryBonus: 0,
      requiredTechnologyIds: []
    };

    onChange((current) => ({ ...current, technologies: [...current.technologies, technology] }));
  }

  function addDepositTemplate() {
    const resource = catalog.resources[0];
    const deposit: ResourceDepositTemplateDraft = {
      id: createId("deposit-template", resource?.name ?? "resource"),
      name: "New Deposit",
      resourceId: resource?.id ?? "",
      productId: null,
      category: resource?.category ?? "mineral",
      initialQuantity: 100_000,
      extractionPerTick: 1_000,
      discoveryChance: 0.05,
      quality: 0.5
    };

    onChange((current) => ({ ...current, resourceDepositTemplates: [...current.resourceDepositTemplates, deposit] }));
  }

  function addPollutionFactor() {
    const factor: PollutionFactorDraft = {
      id: createId("pollution", "factor"),
      sourceCategory: "industrial",
      air: 0.004,
      water: 0.001,
      soil: 0.001,
      carbon: 0.006
    };

    onChange((current) => ({ ...current, pollutionFactors: [...current.pollutionFactors, factor] }));
  }

  return (
    <Panel title="Technologies">
      <div className="grid gap-4">
        <Subsection title="Technology effects">
          <EditableGrid onAdd={addTechnology}>
            {catalog.technologies.map((technology) => (
              <RowCard key={technology.id} title={technology.name} subtitle={`${technology.domain} / ${technology.accessModel}`}>
                <TextField label="Name" value={technology.name} onChange={(value) => patchTechnology(technology.id, { name: value })} />
                <SelectField label="Domain" value={technology.domain} options={TECHNOLOGY_DOMAINS} onChange={(value) => patchTechnology(technology.id, { domain: value as TechnologyDomain })} />
                <SelectField
                  label="Access"
                  value={technology.accessModel}
                  options={TECHNOLOGY_ACCESS_MODELS}
                  onChange={(value) => patchTechnology(technology.id, { accessModel: value as TechnologyAccessModel })}
                />
                <SelectField
                  label="Industry"
                  value={technology.industry}
                  options={["all", "logistics", "weapons", "education", ...PRODUCT_CATEGORIES, ...NEED_CATEGORIES]}
                  onChange={(value) => patchTechnology(technology.id, { industry: value as TechnologyDraft["industry"] })}
                />
                <NumberField label="Research cost" min={0} value={technology.researchCostMinor} onChange={(value) => patchTechnology(technology.id, { researchCostMinor: value })} />
                <ToggleField label="Unlocked" value={technology.unlocked} onChange={(value) => patchTechnology(technology.id, { unlocked: value })} />
                <NumberField label="Efficiency" max={1} min={0} step={0.01} value={technology.efficiencyBonus} onChange={(value) => patchTechnology(technology.id, { efficiencyBonus: value })} />
                <NumberField label="Input reduction" max={1} min={0} step={0.01} value={technology.inputReduction} onChange={(value) => patchTechnology(technology.id, { inputReduction: value })} />
                <NumberField label="Energy reduction" max={1} min={0} step={0.01} value={technology.energyReduction} onChange={(value) => patchTechnology(technology.id, { energyReduction: value })} />
                <NumberField label="Pollution reduction" max={1} min={0} step={0.01} value={technology.pollutionReduction} onChange={(value) => patchTechnology(technology.id, { pollutionReduction: value })} />
                <NumberField label="Logistics bonus" max={1} min={0} step={0.01} value={technology.logisticsBonus} onChange={(value) => patchTechnology(technology.id, { logisticsBonus: value })} />
                <NumberField label="Health bonus" max={1} min={0} step={0.01} value={technology.healthBonus} onChange={(value) => patchTechnology(technology.id, { healthBonus: value })} />
                <NumberField label="Discovery bonus" max={1} min={0} step={0.01} value={technology.discoveryBonus} onChange={(value) => patchTechnology(technology.id, { discoveryBonus: value })} />
                <div className="md:col-span-3">
                  <CheckList
                    items={catalog.technologies.filter((candidate) => candidate.id !== technology.id).map((candidate) => ({ id: candidate.id, label: candidate.name }))}
                    selectedIds={technology.requiredTechnologyIds}
                    onChange={(ids) => patchTechnology(technology.id, { requiredTechnologyIds: ids })}
                  />
                </div>
              </RowCard>
            ))}
          </EditableGrid>
        </Subsection>

        <Subsection title="Resource deposit templates">
          <EditableGrid onAdd={addDepositTemplate}>
            {catalog.resourceDepositTemplates.map((deposit) => (
              <RowCard key={deposit.id} title={deposit.name} subtitle={`${deposit.category} / discovery ${Math.round(deposit.discoveryChance * 100)}%`}>
                <TextField label="Name" value={deposit.name} onChange={(value) => patchDepositTemplate(deposit.id, { name: value })} />
                <SelectField label="Resource" value={deposit.resourceId} options={catalog.resources.map((resource) => resource.id)} onChange={(value) => patchDepositTemplate(deposit.id, { resourceId: value })} />
                <SelectField
                  label="Product"
                  value={deposit.productId ?? "none"}
                  options={["none", ...catalog.products.map((product) => product.id)]}
                  onChange={(value) => patchDepositTemplate(deposit.id, { productId: value === "none" ? null : value })}
                />
                <SelectField label="Category" value={deposit.category} options={RESOURCE_CATEGORIES} onChange={(value) => patchDepositTemplate(deposit.id, { category: value as ResourceCategory })} />
                <NumberField label="Initial quantity" min={1} value={deposit.initialQuantity} onChange={(value) => patchDepositTemplate(deposit.id, { initialQuantity: value })} />
                <NumberField label="Extraction/tick" min={0} value={deposit.extractionPerTick} onChange={(value) => patchDepositTemplate(deposit.id, { extractionPerTick: value })} />
                <NumberField label="Discovery chance" max={1} min={0} step={0.01} value={deposit.discoveryChance} onChange={(value) => patchDepositTemplate(deposit.id, { discoveryChance: value })} />
                <NumberField label="Quality" max={1} min={0} step={0.01} value={deposit.quality} onChange={(value) => patchDepositTemplate(deposit.id, { quality: value })} />
              </RowCard>
            ))}
          </EditableGrid>
        </Subsection>

        <Subsection title="Pollution factors">
          <EditableGrid onAdd={addPollutionFactor}>
            {catalog.pollutionFactors.map((factor) => (
              <RowCard key={factor.id} title={factor.sourceCategory} subtitle="per output unit">
                <SelectField
                  label="Source"
                  value={factor.sourceCategory}
                  options={POLLUTION_SOURCE_CATEGORIES}
                  onChange={(value) => patchPollutionFactor(factor.id, { sourceCategory: value as PollutionSourceCategory })}
                />
                <NumberField label="Air" min={0} step={0.001} value={factor.air} onChange={(value) => patchPollutionFactor(factor.id, { air: value })} />
                <NumberField label="Water" min={0} step={0.001} value={factor.water} onChange={(value) => patchPollutionFactor(factor.id, { water: value })} />
                <NumberField label="Soil" min={0} step={0.001} value={factor.soil} onChange={(value) => patchPollutionFactor(factor.id, { soil: value })} />
                <NumberField label="Carbon" min={0} step={0.001} value={factor.carbon} onChange={(value) => patchPollutionFactor(factor.id, { carbon: value })} />
              </RowCard>
            ))}
          </EditableGrid>
        </Subsection>
      </div>
    </Panel>
  );
}

function ValidationPanel({ issues }: { readonly issues: readonly ValidationIssue[] }) {
  const visibleIssues = issues.slice(0, 10);

  return (
    <Panel title="Validation">
      {visibleIssues.length > 0 ? (
        <div className="grid gap-2" data-testid="validation-panel">
          {visibleIssues.map((issue, index) => (
            <div className={`rounded-md border p-2 text-sm ${issue.severity === "error" ? "border-rose-500/40 bg-rose-950/30 text-rose-100" : "border-economy-gold/40 bg-economy-gold/10 text-stone-200"}`} key={`${issue.entityType}-${issue.entityId}-${issue.field ?? "entity"}-${index}`}>
              <div className="font-semibold">{issue.severity.toUpperCase()} / {issue.entityType}</div>
              <div className="mt-1 text-xs leading-5">{issue.message}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-economy-teal/40 bg-economy-teal/10 p-3 text-sm text-economy-teal">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Valid catalog
        </div>
      )}
    </Panel>
  );
}

function InfrastructureDefaultsPanel({ catalog, onChange }: EditorProps) {
  function patchInfrastructureDefaults(patch: Partial<InfrastructureDefaultsDraft>) {
    onChange((current) => ({
      ...current,
      infrastructureDefaults: {
        ...current.infrastructureDefaults,
        ...patch
      }
    }));
  }

  return (
    <Panel title="Infrastructure defaults">
      <div className="grid gap-3">
        <NumberField
          label="Road quality"
          max={1}
          min={0}
          step={0.01}
          value={catalog.infrastructureDefaults.roadQuality}
          onChange={(value) => patchInfrastructureDefaults({ roadQuality: value })}
        />
        <NumberField
          label="Rail quality"
          max={1}
          min={0}
          step={0.01}
          value={catalog.infrastructureDefaults.railQuality}
          onChange={(value) => patchInfrastructureDefaults({ railQuality: value })}
        />
        <NumberField
          label="Port quality"
          max={1}
          min={0}
          step={0.01}
          value={catalog.infrastructureDefaults.portQuality}
          onChange={(value) => patchInfrastructureDefaults({ portQuality: value })}
        />
        <NumberField
          label="Route capacity"
          min={1}
          value={catalog.infrastructureDefaults.routeCapacityPerTick}
          onChange={(value) => patchInfrastructureDefaults({ routeCapacityPerTick: value })}
        />
        <NumberField
          label="Border delay"
          min={0}
          value={catalog.infrastructureDefaults.borderDelayTicks}
          onChange={(value) => patchInfrastructureDefaults({ borderDelayTicks: value })}
        />
        <NumberField
          label="Base cost"
          min={0}
          value={catalog.infrastructureDefaults.baseCostMinorPerUnit}
          onChange={(value) => patchInfrastructureDefaults({ baseCostMinorPerUnit: value })}
        />
      </div>
    </Panel>
  );
}

function MiniSimulationPanel({
  selectedChainId,
  simulations
}: {
  readonly selectedChainId: string | null;
  readonly simulations: ReturnType<typeof runMiniSimulation>;
}) {
  const selected = simulations.find((simulation) => simulation.chainId === selectedChainId) ?? simulations[0] ?? null;

  return (
    <Panel title="Test mini-simulation">
      {selected ? (
        <ChainSimulationCard simulation={selected} compact />
      ) : (
        <EmptyState>No chains to simulate.</EmptyState>
      )}
    </Panel>
  );
}

function ChainSimulationCard({
  compact = false,
  simulation
}: {
  readonly compact?: boolean;
  readonly simulation: ReturnType<typeof runMiniSimulation>[number];
}) {
  return (
    <div className="rounded-md border border-[#3b3831] bg-black/20 p-3" data-testid="mini-simulation">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <div className="font-semibold text-stone-50">{simulation.chainName}</div>
          <div className="text-xs text-stone-400">{simulation.outputProductName} / {simulation.runs} runs</div>
        </div>
        <span className={`rounded px-2 py-1 text-xs font-bold ${simulation.profitMinor >= 0 ? "bg-economy-teal/15 text-economy-teal" : "bg-rose-500/15 text-rose-200"}`}>
          {formatMoney(simulation.profitMinor)}
        </span>
      </div>
      <div className={`grid gap-2 ${compact ? "grid-cols-2" : "md:grid-cols-4"}`}>
        <Metric label="Cost" value={formatMoney(simulation.totalCostMinor)} />
        <Metric label="Revenue" value={formatMoney(simulation.revenueMinor)} />
        <Metric label="Break-even" value={formatMoney(simulation.breakEvenPriceMinor)} />
        <Metric label="Demand risk" value={simulation.demandRisk} />
      </div>
      {simulation.warnings.length > 0 ? (
        <div className="mt-3 rounded-md border border-economy-gold/40 bg-economy-gold/10 p-2 text-xs text-economy-gold">
          {simulation.warnings.join(", ")}
        </div>
      ) : null}
    </div>
  );
}

function JsonPanel({
  exportJson,
  jsonDraft,
  onDraftChange,
  onImport,
  onLoadCurrent,
  onResetDemo
}: {
  readonly exportJson: string;
  readonly jsonDraft: string;
  readonly onDraftChange: (value: string) => void;
  readonly onImport: (event: FormEvent<HTMLFormElement>) => void;
  readonly onLoadCurrent: () => void;
  readonly onResetDemo: () => void;
}) {
  return (
    <Panel title="JSON import/export">
      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <IconButton icon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={onLoadCurrent}>
            Load export
          </IconButton>
          <IconButton icon={<FlaskConical className="h-4 w-4" aria-hidden="true" />} onClick={onResetDemo} tone="warning">
            Demo
          </IconButton>
        </div>
        <textarea className="min-h-32 rounded-md border border-[#3b3831] bg-[#0d0f0d] p-2 font-mono text-xs text-stone-200 outline-none focus:border-economy-gold" readOnly value={exportJson} />
        <form className="grid gap-2" onSubmit={onImport}>
          <textarea
            className="min-h-32 rounded-md border border-[#3b3831] bg-[#0d0f0d] p-2 font-mono text-xs text-stone-200 outline-none focus:border-economy-teal"
            onChange={(event) => onDraftChange(event.target.value)}
            value={jsonDraft}
          />
          <IconButton icon={<Upload className="h-4 w-4" aria-hidden="true" />} type="submit">
            Import JSON
          </IconButton>
        </form>
      </div>
    </Panel>
  );
}

interface EditorProps {
  readonly catalog: ConstructorCatalog;
  readonly onChange: (updater: (current: ConstructorCatalog) => ConstructorCatalog) => void;
}

function EditableGrid({ children, onAdd }: { readonly children: ReactNode; readonly onAdd?: () => void }) {
  return (
    <div className="grid gap-3">
      {onAdd ? (
        <IconButton className="w-fit" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={onAdd}>
          Add
        </IconButton>
      ) : null}
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function RowCard({ children, subtitle, title }: { readonly children: ReactNode; readonly subtitle: string; readonly title: string }) {
  return (
    <article className="rounded-md border border-[#3b3831] bg-black/20 p-3">
      <div className="mb-3">
        <h2 className="font-semibold text-stone-50">{title}</h2>
        <p className="text-xs text-stone-400">{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">{children}</div>
    </article>
  );
}

function CheckList({
  items,
  onChange,
  selectedIds
}: {
  readonly items: readonly { readonly id: string; readonly label: string }[];
  readonly onChange: (ids: readonly string[]) => void;
  readonly selectedIds: readonly string[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <label className="flex items-center gap-2 rounded-md border border-[#3b3831] bg-black/20 px-3 py-2 text-sm text-stone-200" key={item.id}>
          <input
            checked={selectedIds.includes(item.id)}
            onChange={(event) => {
              const nextIds = event.target.checked ? [...selectedIds, item.id] : selectedIds.filter((id) => id !== item.id);
              onChange(nextIds);
            }}
            type="checkbox"
          />
          {item.label}
        </label>
      ))}
    </div>
  );
}

function ItemList({
  items,
  onSelect,
  selectedId
}: {
  readonly items: readonly { readonly id: string; readonly title: string; readonly detail: string }[];
  readonly onSelect: (id: string) => void;
  readonly selectedId: string;
}) {
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <button
          className={`rounded-md border px-3 py-2 text-left transition ${
            selectedId === item.id ? "border-economy-gold bg-economy-gold/15" : "border-[#3b3831] bg-black/20 hover:border-economy-teal"
          }`}
          key={item.id}
          onClick={() => onSelect(item.id)}
          type="button"
        >
          <div className="font-semibold text-stone-50">{item.title}</div>
          <div className="mt-1 text-xs text-stone-400">{item.detail}</div>
        </button>
      ))}
    </div>
  );
}

function Panel({ children, title }: { readonly children: ReactNode; readonly title: string }) {
  return (
    <section className="rounded-lg border border-economy-line bg-[#171813]/95 p-3 shadow-xl">
      <div className="mb-3 flex items-center gap-2 border-b border-[#2f332c] pb-2 text-sm font-bold uppercase tracking-wide text-stone-300">
        <FileJson className="h-4 w-4 text-economy-gold" aria-hidden="true" />
        {title}
      </div>
      {children}
    </section>
  );
}

function Subsection({ children, title }: { readonly children: ReactNode; readonly title: string }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-sm font-bold uppercase tracking-wide text-economy-teal">{title}</h2>
      {children}
    </section>
  );
}

function TextField({ label, onChange, value }: { readonly label: string; readonly onChange: (value: string) => void; readonly value: string }) {
  return (
    <label className="grid gap-1 text-sm text-stone-300">
      {label}
      <input className="min-h-10 rounded-md border border-[#3b3831] bg-[#0d0f0d] px-3 text-stone-50 outline-none focus:border-economy-gold" onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

function NumberField({
  label,
  max,
  min,
  onChange,
  step = 1,
  value
}: {
  readonly label: string;
  readonly max?: number;
  readonly min?: number;
  readonly onChange: (value: number) => void;
  readonly step?: number;
  readonly value: number;
}) {
  return (
    <label className="grid gap-1 text-sm text-stone-300">
      {label}
      <input
        className="min-h-10 rounded-md border border-[#3b3831] bg-[#0d0f0d] px-3 text-stone-50 outline-none focus:border-economy-gold"
        max={max}
        min={min}
        onChange={(event) => onChange(toNumber(event.target.value))}
        step={step}
        type="number"
        value={Number.isFinite(value) ? value : 0}
      />
    </label>
  );
}

function SelectField({
  label,
  onChange,
  optionLabels,
  options,
  value
}: {
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly optionLabels?: Readonly<Record<string, string>>;
  readonly options: readonly string[];
  readonly value: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-stone-300">
      {label}
      <select className="min-h-10 rounded-md border border-[#3b3831] bg-[#0d0f0d] px-3 text-stone-50 outline-none focus:border-economy-gold" onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, onChange, value }: { readonly label: string; readonly onChange: (value: boolean) => void; readonly value: boolean }) {
  return (
    <label className="flex min-h-10 items-center gap-2 rounded-md border border-[#3b3831] bg-black/20 px-3 text-sm text-stone-300">
      <input checked={value} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}

function IconButton({
  children,
  className = "",
  icon,
  onClick,
  tone = "default",
  type = "button"
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly icon: ReactNode;
  readonly onClick?: () => void;
  readonly tone?: "default" | "danger" | "warning";
  readonly type?: "button" | "submit";
}) {
  const toneClass = {
    default: "border-economy-teal/70 bg-economy-teal text-[#06110f] hover:bg-[#6bcbbb]",
    danger: "border-rose-400/70 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30",
    warning: "border-economy-gold/70 bg-economy-gold/20 text-economy-gold hover:bg-economy-gold/30"
  }[tone];

  return (
    <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${toneClass} ${className}`} onClick={onClick} type={type}>
      {icon}
      {children}
    </button>
  );
}

function HudBadge({
  icon,
  label,
  tone = "default",
  value
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly tone?: "default" | "success" | "warning" | "danger";
  readonly value: string;
}) {
  const toneClass = {
    default: "text-stone-50",
    danger: "text-rose-200",
    success: "text-economy-teal",
    warning: "text-economy-gold"
  }[tone];

  return (
    <div className="flex min-h-11 items-center gap-2 rounded-md border border-[#3b3831] bg-black/25 px-3">
      <span className={toneClass}>{icon}</span>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-stone-500">{label}</div>
        <div className={`text-sm font-bold ${toneClass}`}>{value}</div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-md border border-[#3b3831] bg-black/25 p-2">
      <div className="truncate text-[11px] uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 truncate text-sm font-bold text-stone-50">{value}</div>
    </div>
  );
}

function Notice({ message, onClose }: { readonly message: string; readonly onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-economy-teal/50 bg-economy-teal/15 p-3 text-sm text-stone-100">
      <span>{message}</span>
      <button className="rounded-md border border-economy-teal/50 px-2 py-1 text-xs font-bold" onClick={onClose} type="button">
        OK
      </button>
    </div>
  );
}

function ErrorNotice({ message }: { readonly message: string }) {
  return (
    <div className="rounded-lg border border-rose-500/50 bg-rose-950/35 p-3 text-sm text-rose-100">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function EmptyState({ children }: { readonly children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-[#3b3831] bg-black/20 p-3 text-sm text-stone-400">{children}</div>;
}

function getIssueCounts(issues: readonly ValidationIssue[]) {
  return {
    error: issues.filter((issue) => issue.severity === "error").length,
    warning: issues.filter((issue) => issue.severity === "warning").length
  };
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "NCR",
    maximumFractionDigits: 0
  }).format(value / 100);
}

function serializeLawParameters(parameters: LawDraft["parameters"]): string {
  return JSON.stringify(parameters);
}

function parseLawParameters(value: string, fallback: LawDraft["parameters"]): LawDraft["parameters"] {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallback;
    }

    const parameters: Record<string, string | number | boolean> = {};

    for (const [key, rawValue] of Object.entries(parsed)) {
      if (typeof rawValue === "string" || typeof rawValue === "boolean") {
        parameters[key] = rawValue;
      } else if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
        parameters[key] = rawValue;
      }
    }

    return parameters;
  } catch {
    return fallback;
  }
}

function nameMap(items: readonly { readonly id: string; readonly name: string }[]): Readonly<Record<string, string>> {
  return Object.fromEntries(items.map((item) => [item.id, item.name]));
}
