"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTick = runTick;
exports.runTicks = runTicks;
exports.buyResource = buyResource;
exports.runManualProduction = runManualProduction;
exports.setRetailOfferPrice = setRetailOfferPrice;
exports.startResearchProject = startResearchProject;
exports.createShipment = createShipment;
exports.quoteShipment = quoteShipment;
exports.applyForLoan = applyForLoan;
exports.payLoan = payLoan;
exports.placeOrder = placeOrder;
exports.createIllegalTrade = createIllegalTrade;
exports.fundLobbying = fundLobbying;
exports.runMediaCampaign = runMediaCampaign;
exports.castVote = castVote;
exports.assertNoInvalidEconomyValues = assertNoInvalidEconomyValues;
const NEED_CATEGORIES = ["food", "housing", "transport", "medicine", "entertainment"];
const NEED_PROFILE = {
    food: { unitsPerPersonPerTick: 0.025, budgetShare: 0.35 },
    housing: { unitsPerPersonPerTick: 0.003, budgetShare: 0.3 },
    transport: { unitsPerPersonPerTick: 0.012, budgetShare: 0.16 },
    medicine: { unitsPerPersonPerTick: 0.002, budgetShare: 0.09 },
    entertainment: { unitsPerPersonPerTick: 0.004, budgetShare: 0.1 }
};
const MONTHLY_TICK_INTERVAL = 24 * 30;
const INCOME_NEED_MULTIPLIER = {
    low: {
        food: 1,
        housing: 0.75,
        transport: 0.65,
        medicine: 0.55,
        entertainment: 0.25
    },
    middle: {
        food: 1,
        housing: 1,
        transport: 1,
        medicine: 0.85,
        entertainment: 0.75
    },
    high: {
        food: 1.05,
        housing: 1.35,
        transport: 1.25,
        medicine: 1.2,
        entertainment: 1.4
    }
};
function runTick(input) {
    const loadedState = normalizeWorldState(input.state);
    const nextTick = input.state.currentTick + 1;
    const currentDate = addGameHours(loadedState.currentDate, 1);
    const acceptedCommands = [];
    const rejectedCommands = [];
    const commandEvents = [];
    const countries = loadedState.countries.map((country) => ({ ...country }));
    const cities = loadedState.cities.map((city) => ({ ...city }));
    const companies = loadedState.companies.map((company) => ({ ...company }));
    const landParcels = (loadedState.landParcels ?? []).map((parcel) => ({
        ...parcel,
        allowedBusinessTypes: [...parcel.allowedBusinessTypes]
    }));
    const premises = (loadedState.premises ?? []).map((premise) => ({ ...premise }));
    const populationCohorts = loadedState.populationCohorts.map((cohort) => ({ ...cohort }));
    const warehouses = loadedState.warehouses.map((warehouse) => ({ ...warehouse }));
    const productionPlans = loadedState.productionPlans.map((plan) => ({
        ...plan,
        inputs: plan.inputs.map((productionInput) => ({ ...productionInput }))
    }));
    const inventoryLots = loadedState.inventoryLots.map((lot) => ({ ...lot }));
    const retailOffers = loadedState.retailOffers.map((offer) => ({ ...offer }));
    const retailPriceChanges = [...loadedState.retailPriceChanges];
    const shipments = loadedState.shipments.map((shipment) => ({ ...shipment }));
    const logisticsRoutes = loadedState.logisticsRoutes.map((route) => ({
        ...route,
        nodeIds: [...route.nodeIds],
        infrastructureLinkIds: [...route.infrastructureLinkIds]
    }));
    const infrastructureLinks = loadedState.infrastructureLinks.map((link) => ({ ...link }));
    const transportCompanies = loadedState.transportCompanies.map((company) => ({ ...company }));
    const centralBanks = loadedState.centralBanks.map((bank) => ({ ...bank }));
    const banks = loadedState.banks.map((bank) => ({ ...bank }));
    const bankAccounts = loadedState.bankAccounts.map((account) => ({ ...account }));
    const loans = loadedState.loans.map((loan) => ({ ...loan }));
    const creditScores = loadedState.creditScores.map((score) => ({ ...score }));
    const orderBooks = loadedState.orderBooks.map((book) => ({
        ...book,
        bids: book.bids.map((order) => ({ ...order })),
        asks: book.asks.map((order) => ({ ...order }))
    }));
    const portfolioPositions = loadedState.portfolioPositions.map((position) => ({ ...position }));
    const bankruptcies = loadedState.bankruptcies.map((bankruptcy) => ({ ...bankruptcy }));
    const assetAuctions = loadedState.assetAuctions.map((auction) => ({ ...auction }));
    const governments = loadedState.governments.map((government) => ({ ...government }));
    const politicalParties = loadedState.politicalParties.map((party) => ({
        ...party,
        policyBias: [...party.policyBias]
    }));
    const elections = loadedState.elections.map((election) => ({
        ...election,
        results: election.results.map((result) => ({ ...result }))
    }));
    const laws = loadedState.laws.map((law) => ({ ...law, parameters: { ...law.parameters } }));
    const taxPolicies = loadedState.taxPolicies.map((policy) => ({ ...policy }));
    const governmentBudgets = loadedState.governmentBudgets.map((budget) => ({ ...budget }));
    const publicDebt = loadedState.publicDebt.map((debt) => ({ ...debt, bondIds: [...debt.bondIds] }));
    const subsidies = loadedState.subsidies.map((subsidy) => ({ ...subsidy }));
    const licenses = loadedState.licenses.map((license) => ({ ...license }));
    const sanctionPolicies = loadedState.sanctionPolicies.map((policy) => ({ ...policy }));
    const corruptionIndexes = loadedState.corruptionIndexes.map((index) => ({ ...index }));
    const protests = loadedState.protests.map((protest) => ({ ...protest }));
    const lobbyingActions = loadedState.lobbyingActions.map((action) => ({ ...action }));
    const mediaInfluences = loadedState.mediaInfluences.map((influence) => ({ ...influence }));
    const wars = loadedState.wars.map((war) => ({ ...war }));
    const fronts = loadedState.fronts.map((front) => ({ ...front, cellIds: [...front.cellIds] }));
    const strategicCells = loadedState.strategicCells.map((cell) => ({ ...cell, center: { ...cell.center } }));
    const armies = loadedState.armies.map((army) => ({ ...army }));
    const militaryUnits = loadedState.militaryUnits.map((unit) => ({
        ...unit,
        supplyNeedPerTick: { ...unit.supplyNeedPerTick }
    }));
    const militarySupplies = loadedState.militarySupplies.map((supply) => ({ ...supply }));
    const occupations = loadedState.occupations.map((occupation) => ({ ...occupation }));
    const treaties = loadedState.treaties.map((treaty) => ({ ...treaty, countryIds: [...treaty.countryIds] }));
    const sanctions = loadedState.sanctions.map((sanction) => ({ ...sanction }));
    const alliances = loadedState.alliances.map((alliance) => ({ ...alliance, countryIds: [...alliance.countryIds] }));
    const blockades = loadedState.blockades.map((blockade) => ({ ...blockade }));
    const refugeeFlows = loadedState.refugeeFlows.map((flow) => ({ ...flow }));
    const warDamage = loadedState.warDamage.map((damage) => ({ ...damage }));
    const militaryOrders = loadedState.militaryOrders.map((order) => ({ ...order }));
    const technologies = loadedState.technologies.map((technology) => ({
        ...technology,
        effects: { ...technology.effects },
        prerequisites: [...technology.prerequisites]
    }));
    const technologyLevels = loadedState.technologyLevels.map((level) => ({ ...level }));
    const researchProjects = loadedState.researchProjects.map((project) => ({ ...project }));
    const patents = loadedState.patents.map((patent) => ({ ...patent }));
    const licenseAgreements = loadedState.licenseAgreements.map((agreement) => ({ ...agreement }));
    const pollution = loadedState.pollution.map((record) => ({ ...record }));
    const environmentalIndexes = loadedState.environmentalIndexes.map((index) => ({ ...index }));
    const resourceDeposits = loadedState.resourceDeposits.map((deposit) => ({ ...deposit }));
    const resourceDiscoveries = loadedState.resourceDiscoveries.map((discovery) => ({ ...discovery }));
    const cleanEnergyPolicies = loadedState.cleanEnergyPolicies.map((policy) => ({ ...policy }));
    const blackMarkets = loadedState.blackMarkets.map((market) => ({ ...market }));
    const illegalTrades = loadedState.illegalTrades.map((trade) => ({ ...trade }));
    const smugglingRoutes = loadedState.smugglingRoutes.map((route) => ({ ...route }));
    const corruptionCases = loadedState.corruptionCases.map((item) => ({ ...item }));
    const investigations = loadedState.investigations.map((item) => ({ ...item }));
    const enforcementAgencies = loadedState.enforcementAgencies.map((agency) => ({ ...agency }));
    const fines = loadedState.fines.map((fine) => ({ ...fine }));
    const confiscations = loadedState.confiscations.map((confiscation) => ({ ...confiscation }));
    const reputationPenalties = loadedState.reputationPenalties.map((penalty) => ({ ...penalty }));
    const illegalContracts = loadedState.illegalContracts.map((contract) => ({ ...contract }));
    const eventCauses = loadedState.eventCauses.map((cause) => ({ ...cause }));
    const eventImpacts = loadedState.eventImpacts.map((impact) => ({ ...impact }));
    const metricChanges = loadedState.metricChanges.map((change) => ({ ...change }));
    const explanations = loadedState.explanations.map((explanation) => ({
        ...explanation,
        causes: explanation.causes.map((cause) => ({ ...cause })),
        impactIds: [...explanation.impactIds],
        relatedMetricIds: [...explanation.relatedMetricIds],
        relatedEntityIds: [...explanation.relatedEntityIds]
    }));
    const newsTemplates = loadedState.newsTemplates.map((template) => ({ ...template }));
    const forecasts = loadedState.forecasts.map((forecast) => ({
        ...forecast,
        driverExplanationIds: [...forecast.driverExplanationIds]
    }));
    const publicStatistics = loadedState.publicStatistics.map((statistic) => ({ ...statistic }));
    const hiddenStatistics = loadedState.hiddenStatistics.map((statistic) => ({ ...statistic }));
    const trades = [...loadedState.trades];
    const economyEvents = [];
    const economyMetrics = [];
    const commandNews = [];
    const demandRecords = [];
    const financialTransactions = [];
    const resourcePurchases = loadedState.resourcePurchases.map((purchase) => ({ ...purchase }));
    const manualProductionRuns = [...loadedState.manualProductionRuns];
    const commandAdjustedState = {
        ...loadedState,
        companies,
        landParcels,
        premises,
        bankAccounts,
        creditScores,
        warehouses,
        productionPlans,
        inventoryLots,
        retailOffers,
        retailPriceChanges,
        resourcePurchases,
        manualProductionRuns,
        shipments,
        logisticsRoutes,
        transportCompanies,
        financialTransactions: loadedState.financialTransactions,
        licenses
    };
    for (const command of input.commands) {
        const rejection = validateCommand(commandAdjustedState, command);
        if (rejection) {
            rejectedCommands.push(rejection);
            continue;
        }
        acceptedCommands.push(command.commandId);
        commandEvents.push({
            id: `${input.seed}-event-${nextTick}-${command.commandId}`,
            tick: nextTick,
            type: "CommandAcceptedEvent",
            message: `${command.type} accepted for simulation processing.`,
            entityIds: [command.playerId],
            metadata: {
                commandId: command.commandId,
                commandType: command.type
            }
        });
        applyAcceptedPlayerCommand({
            state: commandAdjustedState,
            command,
            companies,
            landParcels,
            premises,
            bankAccounts,
            creditScores,
            warehouses,
            productionPlans,
            inventoryLots,
            retailOffers,
            retailPriceChanges,
            licenses,
            resourcePurchases,
            manualProductionRuns,
            shipments,
            logisticsRoutes,
            transportCompanies,
            financialTransactions,
            events: economyEvents,
            metrics: economyMetrics,
            news: commandNews,
            tick: nextTick,
            seed: input.seed
        });
    }
    processRecurringPremiseCosts({
        tick: nextTick,
        seed: input.seed,
        companies,
        premises,
        bankAccounts,
        financialTransactions,
        events: economyEvents,
        metrics: economyMetrics,
        news: commandNews
    });
    processProduction({
        state: commandAdjustedState,
        companies,
        inventoryLots,
        technologies,
        technologyLevels,
        nextTick,
        seed: input.seed,
        events: economyEvents,
        metrics: economyMetrics
    });
    processTechnologyAndEcology({
        state: commandAdjustedState,
        companies,
        cities,
        populationCohorts,
        bankAccounts,
        technologies,
        technologyLevels,
        researchProjects,
        patents,
        licenseAgreements,
        pollution,
        environmentalIndexes,
        resourceDeposits,
        resourceDiscoveries,
        cleanEnergyPolicies,
        nextTick,
        seed: input.seed,
        financialTransactions,
        events: economyEvents,
        metrics: economyMetrics
    });
    processPopulationDemand({
        state: commandAdjustedState,
        companies,
        populationCohorts,
        inventoryLots,
        nextTick,
        seed: input.seed,
        demandRecords,
        financialTransactions,
        events: economyEvents,
        metrics: economyMetrics
    });
    processLogistics({
        state: commandAdjustedState,
        shipments,
        inventoryLots,
        resourcePurchases,
        nextTick,
        seed: input.seed,
        events: economyEvents,
        metrics: economyMetrics
    });
    processFinance({
        state: commandAdjustedState,
        centralBanks,
        banks,
        bankAccounts,
        companies,
        loans,
        creditScores,
        orderBooks,
        portfolioPositions,
        bankruptcies,
        assetAuctions,
        trades,
        nextTick,
        seed: input.seed,
        financialTransactions,
        events: economyEvents,
        metrics: economyMetrics
    });
    processGovernment({
        state: commandAdjustedState,
        countries,
        governments,
        politicalParties,
        elections,
        laws,
        taxPolicies,
        governmentBudgets,
        publicDebt,
        subsidies,
        licenses,
        sanctionPolicies,
        corruptionIndexes,
        protests,
        lobbyingActions,
        mediaInfluences,
        companies,
        populationCohorts,
        centralBanks,
        banks,
        bankAccounts,
        nextTick,
        seed: input.seed,
        financialTransactions,
        events: economyEvents,
        metrics: economyMetrics
    });
    processWarAndGeopolitics({
        state: commandAdjustedState,
        countries,
        cities,
        warehouses,
        shipments,
        logisticsRoutes,
        infrastructureLinks,
        transportCompanies,
        populationCohorts,
        wars,
        fronts,
        strategicCells,
        armies,
        militaryUnits,
        militarySupplies,
        occupations,
        treaties,
        sanctions,
        alliances,
        blockades,
        refugeeFlows,
        warDamage,
        militaryOrders,
        nextTick,
        seed: input.seed,
        events: economyEvents,
        metrics: economyMetrics
    });
    processCrimeAndBlackMarket({
        state: commandAdjustedState,
        countries,
        cities,
        products: loadedState.products,
        companies,
        populationCohorts,
        warehouses,
        inventoryLots,
        demandRecords,
        bankAccounts,
        laws,
        taxPolicies,
        governments,
        corruptionIndexes,
        mediaInfluences,
        wars,
        sanctions,
        blackMarkets,
        illegalTrades,
        smugglingRoutes,
        corruptionCases,
        investigations,
        enforcementAgencies,
        fines,
        confiscations,
        reputationPenalties,
        illegalContracts,
        nextTick,
        seed: input.seed,
        financialTransactions,
        events: economyEvents,
        metrics: economyMetrics
    });
    const dataReliability = updateDataReliability({
        existing: loadedState.dataReliability,
        countries,
        governments,
        corruptionIndexes,
        nextTick,
        seed: input.seed
    });
    const news = [
        ...commandNews,
        ...createNews({
            nextTick,
            seed: input.seed,
            demandRecords,
            financialTransactions,
            metrics: economyMetrics,
            newsTemplates,
            dataReliability
        })
    ];
    const newsEvents = news.map((item) => ({
        id: `${input.seed}-event-${nextTick}-${item.id}`,
        tick: nextTick,
        type: "NewsCreatedEvent",
        message: item.headline,
        entityIds: item.relatedEntityIds,
        metadata: {
            newsId: item.id,
            severity: item.severity
        }
    }));
    const tickEvents = [
        ...commandEvents,
        ...economyEvents,
        ...newsEvents,
        {
            id: `${input.seed}-event-${nextTick}-world-ticked`,
            tick: nextTick,
            type: "WorldTickedEvent",
            message: "World advanced by one game hour.",
            entityIds: [],
            metadata: {
                acceptedCommands: acceptedCommands.length,
                rejectedCommands: rejectedCommands.length
            }
        }
    ];
    const metrics = [
        ...economyMetrics,
        {
            id: `${input.seed}-metric-${nextTick}-tick-duration`,
            tick: nextTick,
            name: "simulation.tick.duration_ms",
            value: 0,
            tags: { worker: "bootstrap" }
        },
        {
            id: `${input.seed}-metric-${nextTick}-commands-accepted`,
            tick: nextTick,
            name: "simulation.commands.accepted",
            value: acceptedCommands.length,
            tags: { scope: "tick" }
        }
    ];
    const tickMetricChanges = createMetricChanges({
        previousMetrics: loadedState.metrics,
        currentMetrics: metrics,
        nextTick,
        seed: input.seed
    });
    const tickEventCauses = createEventCauses({
        events: tickEvents,
        demandRecords,
        metrics,
        nextTick,
        seed: input.seed
    });
    const tickEventImpacts = createEventImpacts({
        events: tickEvents,
        metricChanges: tickMetricChanges,
        nextTick,
        seed: input.seed
    });
    const tickExplanations = createExplanations({
        state: commandAdjustedState,
        countries,
        cities,
        products: loadedState.products,
        companies,
        warehouses,
        inventoryLots,
        shipments,
        logisticsRoutes,
        taxPolicies,
        sanctions,
        wars,
        protests,
        demandRecords,
        metrics,
        metricChanges: tickMetricChanges,
        events: tickEvents,
        eventImpacts: tickEventImpacts,
        dataReliability,
        nextTick,
        seed: input.seed
    });
    const tickPublicStatistics = createPublicStatistics({
        state: commandAdjustedState,
        countries,
        cities,
        companies,
        populationCohorts,
        demandRecords,
        financialTransactions,
        metrics,
        governmentBudgets,
        logisticsRoutes,
        shipments,
        dataReliability,
        nextTick,
        seed: input.seed
    });
    const tickHiddenStatistics = createHiddenStatistics({
        companies,
        banks,
        bankAccounts,
        stocks: loadedState.stocks,
        nextTick,
        seed: input.seed
    });
    const tickForecasts = createForecasts({
        state: commandAdjustedState,
        products: loadedState.products,
        countries,
        demandRecords,
        metrics,
        publicStatistics: tickPublicStatistics,
        explanations: tickExplanations,
        nextTick,
        seed: input.seed
    });
    const snapshot = {
        id: `${input.seed}-snapshot-${nextTick}`,
        tick: nextTick,
        createdAt: currentDate,
        stateHash: `${input.seed}:${nextTick}:${countries.length}:${cities.length}:${loadedState.products.length}:${inventoryLots.length}:${demandRecords.length}:${laws.length}:${wars.length}:${warDamage.length}:${technologyLevels.length}:${pollution.length}:${resourceDeposits.length}:${blackMarkets.length}:${illegalTrades.length}:${investigations.length}:${tickExplanations.length}:${tickForecasts.length}`
    };
    const state = {
        ...loadedState,
        currentTick: nextTick,
        currentDate,
        countries,
        cities,
        companies,
        landParcels,
        premises,
        populationCohorts,
        warehouses,
        inventoryLots,
        shipments,
        logisticsRoutes,
        infrastructureLinks,
        transportCompanies,
        retailOffers,
        retailPriceChanges,
        productionPlans,
        resourcePurchases,
        manualProductionRuns,
        centralBanks,
        banks,
        bankAccounts,
        loans,
        creditScores,
        orderBooks,
        trades,
        portfolioPositions,
        bankruptcies,
        assetAuctions,
        governments,
        politicalParties,
        elections,
        laws,
        taxPolicies,
        governmentBudgets,
        publicDebt,
        subsidies,
        licenses,
        sanctionPolicies,
        corruptionIndexes,
        protests,
        lobbyingActions,
        mediaInfluences,
        wars,
        fronts,
        strategicCells,
        armies,
        militaryUnits,
        militarySupplies,
        occupations,
        treaties,
        sanctions,
        alliances,
        blockades,
        refugeeFlows,
        warDamage,
        militaryOrders,
        technologies,
        technologyLevels,
        researchProjects,
        patents,
        licenseAgreements,
        pollution,
        environmentalIndexes,
        resourceDeposits,
        resourceDiscoveries,
        cleanEnergyPolicies,
        blackMarkets,
        illegalTrades,
        smugglingRoutes,
        corruptionCases,
        investigations,
        enforcementAgencies,
        fines,
        confiscations,
        reputationPenalties,
        illegalContracts,
        demandRecords: [...loadedState.demandRecords, ...demandRecords],
        financialTransactions: [...loadedState.financialTransactions, ...financialTransactions],
        news: [...loadedState.news, ...news],
        eventCauses: [...eventCauses, ...tickEventCauses],
        eventImpacts: [...eventImpacts, ...tickEventImpacts],
        metricChanges: [...metricChanges, ...tickMetricChanges],
        explanations: [...explanations, ...tickExplanations],
        newsTemplates,
        forecasts: [...forecasts, ...tickForecasts],
        publicStatistics: [...publicStatistics, ...tickPublicStatistics],
        hiddenStatistics: [...hiddenStatistics, ...tickHiddenStatistics],
        dataReliability,
        events: [...loadedState.events, ...tickEvents],
        metrics: [...loadedState.metrics, ...metrics],
        snapshots: [...loadedState.snapshots, snapshot]
    };
    assertNoInvalidEconomyValues(state);
    return {
        state,
        events: tickEvents,
        metrics,
        acceptedCommands,
        rejectedCommands
    };
}
function runTicks(state, count, seed = "scenario") {
    let currentState = state;
    for (let index = 0; index < count; index += 1) {
        currentState = runTick({
            state: currentState,
            commands: [],
            seed
        }).state;
    }
    return currentState;
}
function buyResource(state, input, seed = "operations") {
    const loadedState = normalizeWorldState(state);
    const quantity = sanitizeQuantity(input.quantity);
    const maxUnitPriceMinor = sanitizeMoney(input.maxUnitPriceMinor);
    const offer = loadedState.resourceOffers.find((candidate) => candidate.id === input.resourceOfferId);
    if (!offer || !offer.active) {
        throw new Error("UNKNOWN_OR_INACTIVE_RESOURCE_OFFER");
    }
    if (quantity <= 0 || maxUnitPriceMinor <= 0) {
        throw new Error("INVALID_RESOURCE_PURCHASE");
    }
    if (offer.unitPriceMinor > maxUnitPriceMinor) {
        throw new Error("RESOURCE_PRICE_EXCEEDS_LIMIT");
    }
    if (quantity > offer.maxQuantityPerTick) {
        throw new Error("RESOURCE_QUANTITY_EXCEEDS_OFFER_LIMIT");
    }
    const product = loadedState.products.find((candidate) => candidate.id === offer.productId);
    const sellerWarehouse = loadedState.warehouses.find((warehouse) => warehouse.id === offer.warehouseId);
    const sellerCompany = loadedState.companies.find((company) => company.id === offer.companyId);
    const buyerCompany = loadedState.companies.find((company) => company.id === input.buyerCompanyId);
    const buyerWarehouse = (input.buyerWarehouseId
        ? loadedState.warehouses.find((warehouse) => warehouse.id === input.buyerWarehouseId && warehouse.companyId === input.buyerCompanyId)
        : loadedState.warehouses.find((warehouse) => warehouse.companyId === input.buyerCompanyId)) ?? null;
    if (!product) {
        throw new Error("UNKNOWN_PRODUCT");
    }
    if (!sellerWarehouse || !sellerCompany || sellerCompany.legalStatus !== "registered") {
        throw new Error("UNKNOWN_OR_INACTIVE_RESOURCE_SELLER");
    }
    if (!buyerCompany || buyerCompany.ownerType !== "player" || buyerCompany.ownerId !== input.playerId || buyerCompany.legalStatus !== "registered") {
        throw new Error("PLAYER_COMPANY_REQUIRED");
    }
    if (!buyerWarehouse) {
        throw new Error("BUYER_WAREHOUSE_REQUIRED");
    }
    if (sellerCompany.currencyCode !== buyerCompany.currencyCode) {
        throw new Error("CURRENCY_MISMATCH");
    }
    const inventoryLots = loadedState.inventoryLots.map((lot) => ({ ...lot }));
    const availableQuantity = getAvailableQuantity(inventoryLots, sellerWarehouse.id, product.id);
    if (availableQuantity < quantity) {
        throw new Error("INSUFFICIENT_RESOURCE_INVENTORY");
    }
    const totalPriceMinor = sanitizeMoney(offer.unitPriceMinor * quantity);
    const companies = loadedState.companies.map((company) => ({ ...company }));
    const bankAccounts = loadedState.bankAccounts.map((account) => ({ ...account }));
    const mutableSellerCompany = companies.find((company) => company.id === sellerCompany.id);
    const buyerAccount = getSettlementAccount(bankAccounts, "player", input.playerId, buyerCompany.currencyCode);
    if (!buyerAccount) {
        throw new Error("PLAYER_ACCOUNT_NOT_FOUND");
    }
    if (getAvailableCashMinor(buyerAccount) < totalPriceMinor) {
        throw new Error("INSUFFICIENT_PLAYER_BALANCE");
    }
    const consumedQuantity = consumeInventory(inventoryLots, sellerWarehouse.id, product.id, quantity);
    if (consumedQuantity < quantity) {
        throw new Error("INSUFFICIENT_RESOURCE_INVENTORY");
    }
    addInventory({
        inventoryLots,
        warehouseId: buyerWarehouse.id,
        productId: product.id,
        quantity,
        quality: offer.quality,
        lotId: `${seed}-lot-${loadedState.currentTick}-${input.buyerCompanyId}-${product.id}-resource`,
        unitCostMinor: quantity > 0 ? sanitizeMoney(totalPriceMinor / quantity) : 0,
        totalCostMinor: totalPriceMinor,
        costSourceType: "resource_purchase",
        costSourceId: `${seed}-resource-purchase-${loadedState.currentTick}-${loadedState.resourcePurchases.length + 1}`
    });
    buyerAccount.balanceMinor = sanitizeMoney(buyerAccount.balanceMinor - totalPriceMinor);
    const sellerAccount = getSettlementAccount(bankAccounts, "company", sellerCompany.id, sellerCompany.currencyCode);
    if (sellerAccount) {
        sellerAccount.balanceMinor = sanitizeMoney(sellerAccount.balanceMinor + totalPriceMinor);
    }
    if (mutableSellerCompany) {
        mutableSellerCompany.cashBalanceMinor = sanitizeMoney(mutableSellerCompany.cashBalanceMinor + totalPriceMinor);
    }
    const purchase = {
        id: `${seed}-resource-purchase-${loadedState.currentTick}-${loadedState.resourcePurchases.length + 1}`,
        tick: loadedState.currentTick,
        playerId: input.playerId,
        buyerCompanyId: buyerCompany.id,
        sellerCompanyId: sellerCompany.id,
        sellerWarehouseId: sellerWarehouse.id,
        buyerWarehouseId: buyerWarehouse.id,
        productId: product.id,
        quantity,
        unitPriceMinor: offer.unitPriceMinor,
        totalPriceMinor,
        goodsCostMinor: totalPriceMinor,
        logisticsCostMinor: 0,
        quality: offer.quality,
        deliveryMode: "pickup",
        shipmentId: null,
        status: "completed"
    };
    const transaction = {
        id: `${seed}-tx-${loadedState.currentTick}-resource-purchase-${loadedState.resourcePurchases.length + 1}`,
        tick: loadedState.currentTick,
        type: "ResourcePurchaseTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: buyerAccount.id,
                amountMinor: -totalPriceMinor,
                currencyCode: buyerCompany.currencyCode
            },
            {
                ownerType: "company",
                ownerId: sellerCompany.id,
                amountMinor: totalPriceMinor,
                currencyCode: sellerCompany.currencyCode
            }
        ]
    };
    const event = {
        id: `${seed}-event-${loadedState.currentTick}-${purchase.id}`,
        tick: loadedState.currentTick,
        type: "ResourcePurchasedEvent",
        message: `${buyerCompany.name} bought ${quantity} units of ${product.name}.`,
        entityIds: [purchase.id, buyerCompany.id, sellerCompany.id, product.id, buyerWarehouse.id],
        metadata: {
            purchaseId: purchase.id,
            buyerCompanyId: buyerCompany.id,
            sellerCompanyId: sellerCompany.id,
            productId: product.id,
            quantity,
            totalPriceMinor
        }
    };
    const metric = {
        id: `${seed}-metric-${loadedState.currentTick}-${purchase.id}`,
        tick: loadedState.currentTick,
        name: "resource.purchase.quantity",
        value: quantity,
        tags: {
            productId: product.id,
            buyerCompanyId: buyerCompany.id,
            sellerCompanyId: sellerCompany.id
        }
    };
    const newsItem = {
        id: `${seed}-news-${loadedState.currentTick}-${purchase.id}`,
        tick: loadedState.currentTick,
        category: "corporate",
        templateId: null,
        headline: `${buyerCompany.name} secures ${product.name}`,
        body: `${quantity} units moved from ${sellerWarehouse.name} to ${buyerWarehouse.name} through a validated resource purchase.`,
        severity: "info",
        relatedEntityIds: [buyerCompany.id, sellerCompany.id, product.id],
        reliabilityId: null
    };
    const nextState = {
        ...loadedState,
        companies,
        bankAccounts,
        inventoryLots,
        resourcePurchases: [...loadedState.resourcePurchases, purchase],
        financialTransactions: [...loadedState.financialTransactions, transaction],
        events: [...loadedState.events, event],
        metrics: [...loadedState.metrics, metric],
        news: [...loadedState.news, newsItem]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        purchase,
        shipment: null
    };
}
function runManualProduction(state, input, seed = "operations") {
    const loadedState = normalizeWorldState(state);
    const requestedQuantity = sanitizeQuantity(input.requestedQuantity);
    const company = loadedState.companies.find((candidate) => candidate.id === input.companyId);
    const plan = loadedState.productionPlans.find((candidate) => candidate.id === input.productionPlanId && candidate.companyId === input.companyId);
    if (!company || company.ownerType !== "player" || company.ownerId !== input.playerId || company.legalStatus !== "registered") {
        throw new Error("PLAYER_COMPANY_REQUIRED");
    }
    if (!plan) {
        throw new Error("UNKNOWN_PRODUCTION_PLAN");
    }
    if (requestedQuantity <= 0) {
        throw new Error("INVALID_PRODUCTION_QUANTITY");
    }
    const warehouse = loadedState.warehouses.find((candidate) => candidate.id === plan.warehouseId && candidate.companyId === company.id);
    const outputProduct = loadedState.products.find((candidate) => candidate.id === plan.outputProductId);
    if (!warehouse) {
        throw new Error("PRODUCTION_WAREHOUSE_REQUIRED");
    }
    if (!outputProduct) {
        throw new Error("UNKNOWN_PRODUCT");
    }
    if (requiresIndustryLicense(loadedState, company, outputProduct.category) && !hasActiveIndustryLicense(loadedState, company, outputProduct.category)) {
        throw new Error("COMPANY_LICENSE_REQUIRED");
    }
    const inventoryLots = loadedState.inventoryLots.map((lot) => ({ ...lot }));
    const inputEfficiency = getTechnologyEffectForCompany({
        technologies: loadedState.technologies,
        technologyLevels: loadedState.technologyLevels
    }, company, outputProduct, "inputEfficiency");
    const outputLimit = sanitizeQuantity(Math.min(requestedQuantity, plan.outputQuantityPerTick));
    const maxOutputByInputs = plan.inputs.reduce((maxOutput, productionInput) => {
        const available = getAvailableQuantity(inventoryLots, plan.warehouseId, productionInput.productId);
        const adjustedQuantityPerOutput = getAdjustedInputQuantityPerOutput(productionInput.quantityPerOutput, inputEfficiency);
        const inputLimitedOutput = adjustedQuantityPerOutput > 0 ? Math.floor(available / adjustedQuantityPerOutput) : maxOutput;
        return Math.min(maxOutput, inputLimitedOutput);
    }, outputLimit);
    const producedQuantity = sanitizeQuantity(maxOutputByInputs);
    if (producedQuantity <= 0) {
        throw new Error("INSUFFICIENT_PRODUCTION_INPUTS");
    }
    const inputConsumptions = [];
    let inputCostMinor = 0;
    for (const productionInput of plan.inputs) {
        const adjustedQuantityPerOutput = getAdjustedInputQuantityPerOutput(productionInput.quantityPerOutput, inputEfficiency);
        const requestedInputQuantity = Math.ceil(producedQuantity * adjustedQuantityPerOutput);
        const consumed = consumeInventoryWithCost(inventoryLots, plan.warehouseId, productionInput.productId, requestedInputQuantity);
        const unitCostMinor = consumed.quantity > 0 ? sanitizeMoney(consumed.totalCostMinor / consumed.quantity) : 0;
        inputCostMinor += consumed.totalCostMinor;
        inputConsumptions.push({
            productId: productionInput.productId,
            quantity: consumed.quantity,
            unitCostMinor,
            totalCostMinor: consumed.totalCostMinor
        });
    }
    const outputTotalCostMinor = sanitizeMoney(inputCostMinor);
    const outputUnitCostMinor = producedQuantity > 0 ? sanitizeMoney(outputTotalCostMinor / producedQuantity) : 0;
    addInventory({
        inventoryLots,
        warehouseId: plan.warehouseId,
        productId: plan.outputProductId,
        quantity: producedQuantity,
        quality: outputProduct.baseQuality,
        lotId: `${seed}-lot-${loadedState.currentTick}-${plan.id}-manual-output`,
        unitCostMinor: outputUnitCostMinor,
        totalCostMinor: outputTotalCostMinor,
        costSourceType: "production",
        costSourceId: `${seed}-production-run-${loadedState.currentTick}-${loadedState.manualProductionRuns.length + 1}`
    });
    const productionRun = {
        id: `${seed}-production-run-${loadedState.currentTick}-${loadedState.manualProductionRuns.length + 1}`,
        tick: loadedState.currentTick,
        playerId: input.playerId,
        companyId: company.id,
        productionPlanId: plan.id,
        warehouseId: warehouse.id,
        outputProductId: outputProduct.id,
        requestedQuantity,
        producedQuantity,
        inputConsumptions,
        inputCostMinor: outputTotalCostMinor,
        outputUnitCostMinor,
        outputTotalCostMinor,
        status: "completed"
    };
    const event = {
        id: `${seed}-event-${loadedState.currentTick}-${productionRun.id}`,
        tick: loadedState.currentTick,
        type: "ManualProductionRunEvent",
        message: `${company.name} produced ${producedQuantity} units of ${outputProduct.name}.`,
        entityIds: [productionRun.id, company.id, warehouse.id, outputProduct.id],
        metadata: {
            productionRunId: productionRun.id,
            companyId: company.id,
            productId: outputProduct.id,
            requestedQuantity,
            producedQuantity,
            inputCostMinor: outputTotalCostMinor,
            outputUnitCostMinor,
            outputTotalCostMinor
        }
    };
    const metric = {
        id: `${seed}-metric-${loadedState.currentTick}-${productionRun.id}`,
        tick: loadedState.currentTick,
        name: "production.manual.output.quantity",
        value: producedQuantity,
        tags: {
            companyId: company.id,
            productId: outputProduct.id,
            planId: plan.id
        }
    };
    const newsItem = {
        id: `${seed}-news-${loadedState.currentTick}-${productionRun.id}`,
        tick: loadedState.currentTick,
        category: "corporate",
        templateId: null,
        headline: `${company.name} starts production`,
        body: `${producedQuantity} units of ${outputProduct.name} were produced from player-owned warehouse inventory.`,
        severity: "info",
        relatedEntityIds: [company.id, outputProduct.id, warehouse.id],
        reliabilityId: null
    };
    const nextState = {
        ...loadedState,
        inventoryLots,
        manualProductionRuns: [...loadedState.manualProductionRuns, productionRun],
        events: [...loadedState.events, event],
        metrics: [...loadedState.metrics, metric],
        news: [...loadedState.news, newsItem]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        productionRun
    };
}
function setRetailOfferPrice(state, input, seed = "operations") {
    const loadedState = normalizeWorldState(state);
    const retailOffers = loadedState.retailOffers.map((offer) => ({ ...offer }));
    const retailPriceChanges = [...loadedState.retailPriceChanges];
    const events = [];
    const metrics = [];
    const news = [];
    const result = applyRetailPriceUpdate({
        state: loadedState,
        retailOffers,
        retailPriceChanges,
        events,
        metrics,
        news,
        input,
        tick: loadedState.currentTick,
        seed
    });
    const nextState = {
        ...loadedState,
        retailOffers,
        retailPriceChanges,
        events: [...loadedState.events, ...events],
        metrics: [...loadedState.metrics, ...metrics],
        news: [...loadedState.news, ...news]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        retailOffer: result.retailOffer,
        priceChange: result.priceChange
    };
}
function startResearchProject(state, input, seed = "technology") {
    const loadedState = normalizeWorldState(state);
    const fundingPerTickMinor = sanitizeMoney(input.fundingPerTickMinor);
    const company = loadedState.companies.find((candidate) => candidate.id === input.companyId);
    const technology = loadedState.technologies.find((candidate) => candidate.id === input.technologyId);
    if (!company || company.legalStatus !== "registered") {
        throw new Error("UNKNOWN_COMPANY");
    }
    if (!technology) {
        throw new Error("UNKNOWN_TECHNOLOGY");
    }
    if (fundingPerTickMinor <= 0) {
        throw new Error("INVALID_RESEARCH_FUNDING");
    }
    if (company.cashBalanceMinor < fundingPerTickMinor) {
        throw new Error("INSUFFICIENT_RESEARCH_FUNDS");
    }
    const existingActiveProject = loadedState.researchProjects.some((project) => project.companyId === company.id && project.technologyId === technology.id && project.status === "active");
    if (existingActiveProject) {
        throw new Error("RESEARCH_ALREADY_ACTIVE");
    }
    const project = {
        id: `${seed}-research-${loadedState.currentTick}-${slugify(technology.name)}-${loadedState.researchProjects.length + 1}`,
        technologyId: technology.id,
        ownerType: "company",
        ownerId: company.id,
        countryId: company.countryId,
        companyId: company.id,
        name: input.name?.trim() || `${technology.name} R&D`,
        fundingPerTickMinor,
        accumulatedResearch: 0,
        requiredResearch: technology.researchCostMinor,
        targetScopeType: "company",
        targetScopeId: company.id,
        status: "active",
        startedTick: loadedState.currentTick,
        completedTick: null
    };
    const event = {
        id: `${seed}-event-${loadedState.currentTick}-${project.id}-started`,
        tick: loadedState.currentTick,
        type: "ResearchProjectStartedEvent",
        message: `${company.name} started R&D for ${technology.name}.`,
        entityIds: [project.id, company.id, technology.id],
        metadata: {
            projectId: project.id,
            companyId: company.id,
            technologyId: technology.id,
            fundingPerTickMinor
        }
    };
    const nextState = {
        ...loadedState,
        researchProjects: [...loadedState.researchProjects, project],
        events: [...loadedState.events, event]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        project
    };
}
function createShipment(state, input, seed = "logistics") {
    const loadedState = normalizeWorldState(state);
    const quantity = sanitizeQuantity(input.quantity);
    const originWarehouse = loadedState.warehouses.find((warehouse) => warehouse.id === input.originWarehouseId);
    const destinationWarehouse = loadedState.warehouses.find((warehouse) => warehouse.id === input.destinationWarehouseId);
    const product = loadedState.products.find((candidate) => candidate.id === input.productId);
    if (!originWarehouse) {
        throw new Error("UNKNOWN_ORIGIN_WAREHOUSE");
    }
    if (!destinationWarehouse) {
        throw new Error("UNKNOWN_DESTINATION_WAREHOUSE");
    }
    if (!product) {
        throw new Error("UNKNOWN_PRODUCT");
    }
    if (quantity <= 0) {
        throw new Error("INVALID_SHIPMENT_QUANTITY");
    }
    const route = selectRoute(loadedState, input);
    if (!route) {
        throw new Error("NO_ROUTE_AVAILABLE");
    }
    const quote = quoteShipment(loadedState, route, quantity, input.transportCompanyId);
    if (quote.blockedReason) {
        throw new Error(`ROUTE_BLOCKED:${quote.blockedReason}`);
    }
    const inventoryLots = loadedState.inventoryLots.map((lot) => ({ ...lot }));
    const consumedQuantity = consumeInventory(inventoryLots, originWarehouse.id, product.id, quantity);
    if (consumedQuantity < quantity) {
        throw new Error("INSUFFICIENT_INVENTORY");
    }
    const shipment = {
        id: `${seed}-shipment-${loadedState.currentTick}-${loadedState.shipments.length + 1}`,
        originWarehouseId: originWarehouse.id,
        destinationWarehouseId: destinationWarehouse.id,
        productId: product.id,
        quantity,
        routeId: quote.routeId,
        transportCompanyId: quote.transportCompanyId,
        costMinor: quote.costMinor,
        durationTicks: quote.durationTicks,
        remainingTicks: quote.durationTicks,
        risk: quote.risk,
        status: "in_transit",
        createdTick: loadedState.currentTick,
        departedTick: loadedState.currentTick,
        deliveredTick: null,
        blockedReason: null
    };
    const event = {
        id: `${seed}-event-${loadedState.currentTick}-${shipment.id}-created`,
        tick: loadedState.currentTick,
        type: "ShipmentCreatedEvent",
        message: `${quantity} units of ${product.name} departed ${originWarehouse.name}.`,
        entityIds: [shipment.id, originWarehouse.id, destinationWarehouse.id, product.id],
        metadata: {
            shipmentId: shipment.id,
            routeId: shipment.routeId,
            quantity,
            costMinor: shipment.costMinor,
            durationTicks: shipment.durationTicks,
            risk: shipment.risk
        }
    };
    const metric = {
        id: `${seed}-metric-${loadedState.currentTick}-${shipment.id}-created`,
        tick: loadedState.currentTick,
        name: "logistics.shipment.created",
        value: quantity,
        tags: {
            routeId: shipment.routeId,
            productId: product.id,
            status: shipment.status
        }
    };
    const nextState = {
        ...loadedState,
        inventoryLots,
        shipments: [...loadedState.shipments, shipment],
        events: [...loadedState.events, event],
        metrics: [...loadedState.metrics, metric]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        shipment,
        quote
    };
}
function quoteShipment(state, route, quantity, transportCompanyId) {
    const loadedState = normalizeWorldState(state);
    const company = getTransportCompanyForRoute(loadedState, route, transportCompanyId);
    const links = route.infrastructureLinkIds
        .map((linkId) => loadedState.infrastructureLinks.find((candidate) => candidate.id === linkId))
        .filter((link) => link !== undefined);
    const linkBlocked = links.find((link) => link.blocked || link.sanctionsBlocked);
    const borderBlocked = loadedState.borderCrossings.find((border) => route.nodeIds.includes(border.nodeId) && (!border.open || border.sanctionLevel >= 0.85));
    const routeCapacity = Math.max(1, Math.min(...links.map((link) => link.capacityPerTick), company?.capacityPerTick ?? Number.MAX_SAFE_INTEGER));
    const routeLoad = loadedState.shipments
        .filter((shipment) => shipment.routeId === route.id && shipment.status === "in_transit")
        .reduce((total, shipment) => total + shipment.quantity, 0);
    const overloadRatio = Math.max(0, (routeLoad + sanitizeQuantity(quantity) - routeCapacity) / routeCapacity);
    const overloadMultiplier = 1 + overloadRatio * 0.75;
    const qualityPenalty = links.length > 0 ? average(links.map((link) => 1 + (1 - clamp(link.quality, 0, 1)) * 0.9)) : 1.5;
    const borderDelayTicks = loadedState.borderCrossings
        .filter((border) => route.nodeIds.includes(border.nodeId))
        .reduce((total, border) => total + sanitizeQuantity(border.delayTicks), 0);
    const baseCostMinor = links.reduce((total, link) => total + sanitizeMoney(link.baseCostMinorPerUnit), 0) * sanitizeQuantity(quantity);
    const handlingCostMinor = getRouteHandlingCostMinor(loadedState, route, sanitizeQuantity(quantity));
    const costMinor = sanitizeMoney((baseCostMinor * qualityPenalty + handlingCostMinor) * overloadMultiplier * (company?.costMultiplier ?? 1.35));
    const baseDurationTicks = links.reduce((total, link) => total + Math.max(1, sanitizeQuantity(link.baseDurationTicks)), 0);
    const durationTicks = Math.max(1, Math.ceil(baseDurationTicks * qualityPenalty * overloadMultiplier + borderDelayTicks));
    const risk = clamp(average(links.map((link) => link.warDisruptionRisk + (1 - link.quality) * 0.25)) +
        (company ? 1 - company.reliability : 0.35) * 0.3 +
        overloadRatio * 0.2 +
        (borderBlocked ? 0.5 : 0), 0, 1);
    const blockedReason = route.blockedReason ??
        (!route.active ? "Route is inactive." : null) ??
        (linkBlocked ? (linkBlocked.sanctionsBlocked ? "Sanctions block an infrastructure link." : "Infrastructure link is blocked.") : null) ??
        (borderBlocked ? "Border crossing is closed or sanctioned." : null) ??
        (!company || !company.active ? "No active transport company is available." : null);
    return {
        routeId: route.id,
        transportCompanyId: company?.id ?? route.transportCompanyId,
        costMinor,
        durationTicks,
        risk,
        blockedReason
    };
}
function applyForLoan(state, input, seed = "finance") {
    const loadedState = normalizeWorldState(state);
    const principalMinor = sanitizeMoney(input.principalMinor);
    const termTicks = Math.max(1, sanitizeQuantity(input.termTicks));
    const banks = loadedState.banks.map((bank) => ({ ...bank }));
    const bankAccounts = loadedState.bankAccounts.map((account) => ({ ...account }));
    const companies = loadedState.companies.map((company) => ({ ...company }));
    const loans = loadedState.loans.map((loan) => ({ ...loan }));
    const creditScores = loadedState.creditScores.map((score) => ({ ...score }));
    const lender = banks.find((bank) => bank.id === input.lenderBankId);
    if (!lender || !lender.solvent) {
        throw new Error("UNKNOWN_OR_INACTIVE_BANK");
    }
    if (principalMinor <= 0) {
        throw new Error("INVALID_LOAN_AMOUNT");
    }
    const borrowerExists = input.borrowerType === "company"
        ? companies.some((company) => company.id === input.borrowerId && company.legalStatus === "registered")
        : banks.some((bank) => bank.id === input.borrowerId && bank.solvent);
    if (!borrowerExists) {
        throw new Error("INVALID_BORROWER");
    }
    const score = getOrCreateCreditScore(creditScores, input.borrowerType, input.borrowerId, loadedState.currentTick, seed);
    const capacityMinor = calculateLoanCapacityMinor(loadedState, lender, score);
    if (principalMinor > capacityMinor) {
        throw new Error("LOAN_CAPACITY_EXCEEDED");
    }
    const countryRate = loadedState.interestRates.find((rate) => rate.countryId === lender.countryId)?.primeRate ??
        loadedState.centralBanks.find((bank) => bank.countryId === lender.countryId)?.policyRate ??
        0.08;
    const annualInterestRate = clamp(countryRate + score.probabilityOfDefault * 0.45 + lender.riskRating * 0.08, 0.01, 0.65);
    const paymentPerTickMinor = Math.max(1, sanitizeMoney(Math.ceil((principalMinor * (1 + annualInterestRate)) / termTicks)));
    const account = ensureBankAccount({
        accounts: bankAccounts,
        bankId: lender.id,
        ownerType: input.borrowerType,
        ownerId: input.borrowerId,
        currencyCode: lender.currencyCode,
        seed
    });
    account.balanceMinor = sanitizeMoney(account.balanceMinor + principalMinor);
    lender.loanBookMinor = sanitizeMoney(lender.loanBookMinor + principalMinor);
    lender.depositsMinor = sanitizeMoney(lender.depositsMinor + principalMinor);
    const borrowerCompany = input.borrowerType === "company" ? companies.find((company) => company.id === input.borrowerId) : null;
    if (borrowerCompany) {
        borrowerCompany.cashBalanceMinor = sanitizeMoney(borrowerCompany.cashBalanceMinor + principalMinor);
    }
    const loan = {
        id: `${seed}-loan-${loadedState.currentTick}-${loans.length + 1}`,
        borrowerType: input.borrowerType,
        borrowerId: input.borrowerId,
        lenderBankId: lender.id,
        principalMinor,
        outstandingPrincipalMinor: principalMinor,
        accruedInterestMinor: 0,
        annualInterestRate,
        termTicks,
        remainingTicks: termTicks,
        paymentPerTickMinor,
        status: "active",
        issuedTick: loadedState.currentTick,
        nextPaymentTick: loadedState.currentTick + 1,
        missedPayments: 0,
        collateralCompanyId: input.collateralCompanyId ?? (input.borrowerType === "company" ? input.borrowerId : null)
    };
    const transaction = {
        id: `${seed}-tx-${loadedState.currentTick}-loan-${loans.length + 1}`,
        tick: loadedState.currentTick,
        type: "LoanOriginationTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: account.id,
                amountMinor: principalMinor,
                currencyCode: account.currencyCode
            },
            {
                ownerType: "bank",
                ownerId: lender.id,
                amountMinor: -principalMinor,
                currencyCode: lender.currencyCode
            }
        ]
    };
    const event = {
        id: `${seed}-event-${loadedState.currentTick}-${loan.id}-originated`,
        tick: loadedState.currentTick,
        type: "LoanOriginatedEvent",
        message: `${lender.name} issued a ${principalMinor} minor-unit loan.`,
        entityIds: [loan.id, lender.id, input.borrowerId],
        metadata: {
            loanId: loan.id,
            borrowerId: input.borrowerId,
            lenderBankId: lender.id,
            principalMinor,
            annualInterestRate
        }
    };
    loans.push(loan);
    const nextState = {
        ...loadedState,
        banks,
        bankAccounts,
        companies,
        loans,
        creditScores,
        financialTransactions: [...loadedState.financialTransactions, transaction],
        events: [...loadedState.events, event],
        metrics: [
            ...loadedState.metrics,
            {
                id: `${seed}-metric-${loadedState.currentTick}-${loan.id}-originated`,
                tick: loadedState.currentTick,
                name: "finance.loan.originated_minor",
                value: principalMinor,
                tags: {
                    bankId: lender.id,
                    borrowerType: input.borrowerType,
                    borrowerId: input.borrowerId
                }
            }
        ]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        loan,
        account
    };
}
function payLoan(state, input, seed = "finance") {
    const loadedState = normalizeWorldState(state);
    const amountMinor = sanitizeMoney(input.amountMinor);
    const banks = loadedState.banks.map((bank) => ({ ...bank }));
    const bankAccounts = loadedState.bankAccounts.map((account) => ({ ...account }));
    const companies = loadedState.companies.map((company) => ({ ...company }));
    const loans = loadedState.loans.map((loan) => ({ ...loan }));
    const financialTransactions = [];
    const events = [];
    const metrics = [];
    const loan = loans.find((candidate) => candidate.id === input.loanId);
    if (!loan) {
        throw new Error("UNKNOWN_LOAN");
    }
    if (amountMinor <= 0) {
        throw new Error("INVALID_PAYMENT_AMOUNT");
    }
    const payment = applyLoanPaymentMutable({
        loan,
        amountMinor,
        banks,
        bankAccounts,
        companies,
        tick: loadedState.currentTick,
        seed,
        financialTransactions,
        events,
        metrics,
        allowPartial: false
    });
    const nextState = {
        ...loadedState,
        banks,
        bankAccounts,
        companies,
        loans,
        financialTransactions: [...loadedState.financialTransactions, ...financialTransactions],
        events: [...loadedState.events, ...events],
        metrics: [...loadedState.metrics, ...metrics]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        loan,
        paidPrincipalMinor: payment.paidPrincipalMinor,
        paidInterestMinor: payment.paidInterestMinor
    };
}
function placeOrder(state, input, seed = "finance") {
    const loadedState = normalizeWorldState(state);
    const quantity = sanitizeQuantity(input.quantity);
    const priceMinor = sanitizeMoney(input.priceMinor);
    const exchange = loadedState.exchanges.find((candidate) => candidate.id === input.exchangeId);
    if (!exchange || !exchange.open) {
        throw new Error("UNKNOWN_OR_CLOSED_EXCHANGE");
    }
    if (!isExchangeAssetTradeable(loadedState, input.assetType, input.assetId)) {
        throw new Error("ASSET_NOT_EXCHANGE_TRADEABLE");
    }
    if (quantity <= 0 || priceMinor <= 0) {
        throw new Error("INVALID_ORDER");
    }
    const bankAccounts = loadedState.bankAccounts.map((account) => ({ ...account }));
    const orderBooks = loadedState.orderBooks.map((book) => ({
        ...book,
        bids: book.bids.map((order) => ({ ...order })),
        asks: book.asks.map((order) => ({ ...order }))
    }));
    const portfolioPositions = loadedState.portfolioPositions.map((position) => ({ ...position }));
    const financialTransactions = [];
    const events = [];
    const metrics = [];
    const trades = [...loadedState.trades];
    const book = getOrCreateOrderBook(orderBooks, exchange, input.assetType, input.assetId, priceMinor, seed);
    const account = getSettlementAccount(bankAccounts, input.ownerType, input.ownerId, exchange.currencyCode);
    if (!account || account.status !== "active") {
        throw new Error("SETTLEMENT_ACCOUNT_REQUIRED");
    }
    const maxValueMinor = sanitizeMoney(priceMinor * quantity);
    if (input.side === "buy") {
        if (getAvailableCashMinor(account) < maxValueMinor) {
            throw new Error("INSUFFICIENT_CASH");
        }
        account.reservedMinor = sanitizeMoney(account.reservedMinor + maxValueMinor);
    }
    else if (getPositionQuantity(portfolioPositions, input.ownerType, input.ownerId, input.assetType, input.assetId) < quantity) {
        throw new Error("INSUFFICIENT_ASSET_POSITION");
    }
    const order = {
        id: `${seed}-order-${loadedState.currentTick}-${loadedState.trades.length + countOrders(orderBooks) + 1}`,
        exchangeId: exchange.id,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        assetType: input.assetType,
        assetId: input.assetId,
        side: input.side,
        priceMinor,
        quantity,
        remainingQuantity: quantity,
        status: "open",
        createdTick: loadedState.currentTick
    };
    if (order.side === "buy") {
        book.bids.push(order);
    }
    else {
        book.asks.push(order);
    }
    const tradeStart = trades.length;
    matchOrderBook({
        book,
        bankAccounts,
        portfolioPositions,
        trades,
        financialTransactions,
        events,
        metrics,
        tick: loadedState.currentTick,
        seed
    });
    const createdOrder = book.bids.find((candidate) => candidate.id === order.id) ?? book.asks.find((candidate) => candidate.id === order.id) ?? order;
    const newTrades = trades.slice(tradeStart);
    const nextState = {
        ...loadedState,
        bankAccounts,
        orderBooks,
        trades,
        portfolioPositions,
        financialTransactions: [...loadedState.financialTransactions, ...financialTransactions],
        events: [...loadedState.events, ...events],
        metrics: [...loadedState.metrics, ...metrics]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        order: createdOrder,
        trades: newTrades
    };
}
function createIllegalTrade(state, input, seed = "crime") {
    const loadedState = normalizeWorldState(state);
    const quantity = sanitizeQuantity(input.quantity);
    const bribeMinor = sanitizeMoney(input.bribeMinor ?? 0);
    const blackMarket = loadedState.blackMarkets.find((market) => market.id === input.blackMarketId);
    if (!blackMarket || !blackMarket.active) {
        throw new Error("UNKNOWN_OR_INACTIVE_BLACK_MARKET");
    }
    if (quantity <= 0) {
        throw new Error("INVALID_ILLEGAL_TRADE_QUANTITY");
    }
    const product = loadedState.products.find((candidate) => candidate.id === blackMarket.productId);
    const seller = loadedState.companies.find((company) => company.id === input.sellerCompanyId);
    if (!product) {
        throw new Error("UNKNOWN_PRODUCT");
    }
    if (!seller || seller.legalStatus !== "registered") {
        throw new Error("UNKNOWN_OR_INACTIVE_SELLER");
    }
    if (seller.countryId !== blackMarket.countryId && loadedState.cities.find((city) => city.id === blackMarket.cityId)?.countryId !== seller.countryId) {
        throw new Error("SELLER_OUTSIDE_MARKET");
    }
    if (getCompanyInventoryQuantity(loadedState.warehouses, loadedState.inventoryLots, seller.id, product.id) < quantity) {
        throw new Error("INSUFFICIENT_INVENTORY");
    }
    if (input.buyerOwnerType === "company") {
        const buyer = loadedState.companies.find((company) => company.id === input.buyerOwnerId && company.legalStatus === "registered");
        if (!buyer) {
            throw new Error("UNKNOWN_BUYER");
        }
    }
    else if (input.buyerOwnerType !== "player") {
        throw new Error("UNKNOWN_BUYER");
    }
    const route = input.smugglingRouteId
        ? loadedState.smugglingRoutes.find((candidate) => candidate.id === input.smugglingRouteId) ?? null
        : loadedState.smugglingRoutes.find((candidate) => candidate.active &&
            !candidate.blocked &&
            candidate.destinationCityId === blackMarket.cityId &&
            (candidate.productId === null || candidate.productId === product.id)) ?? null;
    if (input.smugglingRouteId && !route) {
        throw new Error("UNKNOWN_SMUGGLING_ROUTE");
    }
    if (route && (!route.active || route.blocked)) {
        throw new Error("SMUGGLING_ROUTE_BLOCKED");
    }
    if (route && route.productId !== null && route.productId !== product.id) {
        throw new Error("ROUTE_PRODUCT_MISMATCH");
    }
    if (route && quantity > route.capacityPerTick) {
        throw new Error("SMUGGLING_ROUTE_CAPACITY_EXCEEDED");
    }
    const priceMinor = calculateIllegalTradePriceMinor(loadedState, blackMarket, quantity);
    const buyerAccount = getSettlementAccount(loadedState.bankAccounts.map((account) => ({ ...account })), input.buyerOwnerType, input.buyerOwnerId, seller.currencyCode);
    if (!buyerAccount || getAvailableCashMinor(buyerAccount) < priceMinor) {
        throw new Error("INSUFFICIENT_BUYER_BALANCE");
    }
    const detectionRisk = calculateIllegalTradeDetectionRisk({
        state: loadedState,
        blackMarket,
        route,
        seller,
        quantity,
        priceMinor,
        bribeMinor
    });
    const trade = {
        id: `${seed}-illegal-trade-${loadedState.currentTick}-${loadedState.illegalTrades.length + 1}`,
        blackMarketId: blackMarket.id,
        productId: product.id,
        sellerCompanyId: seller.id,
        buyerOwnerType: input.buyerOwnerType,
        buyerOwnerId: input.buyerOwnerId,
        quantity,
        priceMinor,
        smugglingRouteId: route?.id ?? null,
        bribeMinor,
        detectionRisk,
        status: "pending",
        createdTick: loadedState.currentTick,
        resolvedTick: null
    };
    const event = {
        id: `${seed}-event-${loadedState.currentTick}-${trade.id}`,
        tick: loadedState.currentTick,
        type: "IllegalTradeCreatedEvent",
        message: `Illegal trade for ${quantity} units of ${product.name} entered the shadow market.`,
        entityIds: [trade.id, blackMarket.id, seller.id, product.id, input.buyerOwnerId],
        metadata: {
            blackMarketId: blackMarket.id,
            sellerCompanyId: seller.id,
            productId: product.id,
            quantity,
            priceMinor,
            detectionRisk
        }
    };
    const metric = {
        id: `${seed}-metric-${loadedState.currentTick}-${trade.id}-created`,
        tick: loadedState.currentTick,
        name: "crime.illegal_trade.created",
        value: quantity,
        tags: {
            productId: product.id,
            countryId: blackMarket.countryId
        }
    };
    const nextState = {
        ...loadedState,
        illegalTrades: [...loadedState.illegalTrades, trade],
        events: [...loadedState.events, event],
        metrics: [...loadedState.metrics, metric]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        illegalTrade: trade
    };
}
function fundLobbying(state, input, seed = "government") {
    const loadedState = normalizeWorldState(state);
    const amountMinor = sanitizeMoney(input.amountMinor);
    const country = loadedState.countries.find((candidate) => candidate.id === input.countryId);
    const bankAccounts = loadedState.bankAccounts.map((account) => ({ ...account }));
    const politicalParties = loadedState.politicalParties.map((party) => ({
        ...party,
        policyBias: [...party.policyBias]
    }));
    const laws = loadedState.laws.map((law) => ({ ...law, parameters: { ...law.parameters } }));
    const governmentBudgets = loadedState.governmentBudgets.map((budget) => ({ ...budget }));
    const financialTransactions = [];
    if (!country) {
        throw new Error("UNKNOWN_COUNTRY");
    }
    if (amountMinor <= 0) {
        throw new Error("INVALID_POLITICAL_SPEND");
    }
    const targetParty = input.targetPartyId ? politicalParties.find((party) => party.id === input.targetPartyId) : null;
    if (input.targetPartyId && (!targetParty || targetParty.countryId !== input.countryId)) {
        throw new Error("UNKNOWN_PARTY");
    }
    const account = debitPlayerAccount(bankAccounts, input.playerId, country.currencyCode, amountMinor);
    const corruption = loadedState.corruptionIndexes.find((index) => index.countryId === input.countryId)?.value ?? 0.2;
    const influence = clamp(Math.log10(amountMinor + 10) / 8 + (targetParty?.corruptionTolerance ?? 0) * 0.08 - corruption * 0.08, 0.01, 0.8);
    if (targetParty) {
        targetParty.fundingMinor = sanitizeMoney(targetParty.fundingMinor + amountMinor);
        targetParty.popularity = clamp(targetParty.popularity + influence * 0.02, 0, 1);
    }
    else {
        const latestBudget = getLatestBudget(governmentBudgets, input.countryId);
        if (latestBudget) {
            latestBudget.treasuryMinor = sanitizeMoney(latestBudget.treasuryMinor + Math.floor(amountMinor * 0.25));
        }
    }
    for (const law of laws) {
        if (law.countryId === input.countryId && law.type === input.lawType && law.status === "draft") {
            law.support = clamp(law.support + influence * 0.12, 0, 1);
        }
    }
    const action = {
        id: `${seed}-lobbying-${loadedState.currentTick}-${loadedState.lobbyingActions.length + 1}`,
        playerId: input.playerId,
        countryId: input.countryId,
        targetPartyId: targetParty?.id ?? null,
        lawType: input.lawType,
        amountMinor,
        influence,
        status: "accepted",
        tick: loadedState.currentTick
    };
    financialTransactions.push({
        id: `${seed}-tx-${loadedState.currentTick}-${action.id}`,
        tick: loadedState.currentTick,
        type: "LobbyingPaymentTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: account.id,
                amountMinor: -amountMinor,
                currencyCode: account.currencyCode
            },
            {
                ownerType: "state",
                ownerId: targetParty?.id ?? input.countryId,
                amountMinor,
                currencyCode: account.currencyCode
            }
        ]
    });
    const nextState = {
        ...loadedState,
        bankAccounts,
        politicalParties,
        laws,
        governmentBudgets,
        lobbyingActions: [...loadedState.lobbyingActions, action],
        financialTransactions: [...loadedState.financialTransactions, ...financialTransactions],
        events: [
            ...loadedState.events,
            {
                id: `${seed}-event-${loadedState.currentTick}-${action.id}`,
                tick: loadedState.currentTick,
                type: "LobbyingActionCreatedEvent",
                message: `Player lobbying influenced ${input.lawType} policy by ${influence.toFixed(3)}.`,
                entityIds: [input.playerId, input.countryId, ...(targetParty ? [targetParty.id] : [])],
                metadata: {
                    playerId: input.playerId,
                    countryId: input.countryId,
                    lawType: input.lawType,
                    amountMinor,
                    influence
                }
            }
        ]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        action
    };
}
function runMediaCampaign(state, input, seed = "government") {
    const loadedState = normalizeWorldState(state);
    const spendMinor = sanitizeMoney(input.spendMinor);
    const country = loadedState.countries.find((candidate) => candidate.id === input.countryId);
    const bankAccounts = loadedState.bankAccounts.map((account) => ({ ...account }));
    const politicalParties = loadedState.politicalParties.map((party) => ({
        ...party,
        policyBias: [...party.policyBias]
    }));
    if (!country) {
        throw new Error("UNKNOWN_COUNTRY");
    }
    if (spendMinor <= 0 || input.message.trim().length === 0) {
        throw new Error("INVALID_MEDIA_CAMPAIGN");
    }
    const targetParty = input.targetPartyId ? politicalParties.find((party) => party.id === input.targetPartyId) : null;
    if (input.targetPartyId && (!targetParty || targetParty.countryId !== input.countryId)) {
        throw new Error("UNKNOWN_PARTY");
    }
    const account = debitPlayerAccount(bankAccounts, input.playerId, country.currencyCode, spendMinor);
    const reach = clamp(Math.sqrt(spendMinor / 1_000_000) * 0.08, 0.01, 0.65);
    const influence = clamp(reach * 0.55, 0.005, 0.4);
    if (targetParty) {
        targetParty.mediaReach = clamp(targetParty.mediaReach + reach * 0.08, 0, 1);
        targetParty.popularity = clamp(targetParty.popularity + influence * 0.025, 0, 1);
    }
    const mediaInfluence = {
        id: `${seed}-media-${loadedState.currentTick}-${loadedState.mediaInfluences.length + 1}`,
        playerId: input.playerId,
        countryId: input.countryId,
        targetPartyId: targetParty?.id ?? null,
        message: input.message.trim().slice(0, 240),
        spendMinor,
        reach,
        influence,
        tick: loadedState.currentTick
    };
    const transaction = {
        id: `${seed}-tx-${loadedState.currentTick}-${mediaInfluence.id}`,
        tick: loadedState.currentTick,
        type: "MediaCampaignTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: account.id,
                amountMinor: -spendMinor,
                currencyCode: account.currencyCode
            },
            {
                ownerType: "market_sink",
                ownerId: "media-market",
                amountMinor: spendMinor,
                currencyCode: account.currencyCode
            }
        ]
    };
    const nextState = {
        ...loadedState,
        bankAccounts,
        politicalParties,
        mediaInfluences: [...loadedState.mediaInfluences, mediaInfluence],
        financialTransactions: [...loadedState.financialTransactions, transaction],
        events: [
            ...loadedState.events,
            {
                id: `${seed}-event-${loadedState.currentTick}-${mediaInfluence.id}`,
                tick: loadedState.currentTick,
                type: "MediaCampaignCreatedEvent",
                message: "A player-funded media campaign shifted public attention.",
                entityIds: [input.playerId, input.countryId, ...(targetParty ? [targetParty.id] : [])],
                metadata: {
                    playerId: input.playerId,
                    countryId: input.countryId,
                    spendMinor,
                    reach,
                    influence
                }
            }
        ]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        influence: mediaInfluence
    };
}
function castVote(state, input, seed = "government") {
    const loadedState = normalizeWorldState(state);
    const country = loadedState.countries.find((candidate) => candidate.id === input.countryId);
    const party = loadedState.politicalParties.find((candidate) => candidate.id === input.partyId && candidate.countryId === input.countryId);
    if (!country) {
        throw new Error("UNKNOWN_COUNTRY");
    }
    if (!party) {
        throw new Error("UNKNOWN_PARTY");
    }
    if (!playerHasPoliticalEligibility(loadedState, input.playerId)) {
        throw new Error("VOTER_HAS_NO_ASSETS");
    }
    const elections = loadedState.elections.map((election) => ({
        ...election,
        results: election.results.map((result) => ({ ...result }))
    }));
    const politicalParties = loadedState.politicalParties.map((candidate) => ({
        ...candidate,
        policyBias: [...candidate.policyBias]
    }));
    const election = elections.find((candidate) => candidate.countryId === input.countryId && candidate.status === "active");
    if (!election) {
        throw new Error("NO_ACTIVE_ELECTION");
    }
    let result = election.results.find((candidate) => candidate.partyId === input.partyId);
    if (!result) {
        result = {
            partyId: input.partyId,
            npcVotes: 0,
            playerVotes: 0,
            totalVotes: 0
        };
        election.results.push(result);
    }
    if (input.choice === "for") {
        result.playerVotes = sanitizeQuantity(result.playerVotes + election.playerVoteWeight);
        result.totalVotes = sanitizeQuantity(result.npcVotes + result.playerVotes);
        const mutableParty = politicalParties.find((candidate) => candidate.id === input.partyId);
        if (mutableParty) {
            mutableParty.popularity = clamp(mutableParty.popularity + 0.001, 0, 1);
        }
    }
    else if (input.choice === "against") {
        const mutableParty = politicalParties.find((candidate) => candidate.id === input.partyId);
        if (mutableParty) {
            mutableParty.popularity = clamp(mutableParty.popularity - 0.001, 0, 1);
        }
    }
    election.lastTick = loadedState.currentTick;
    const winner = election.results.reduce((leader, candidate) => (!leader || candidate.totalVotes > leader.totalVotes ? candidate : leader), null);
    election.winnerPartyId = winner?.partyId ?? null;
    const nextElection = {
        ...election,
        results: election.results.map((candidate) => ({ ...candidate }))
    };
    const nextState = {
        ...loadedState,
        elections,
        politicalParties,
        events: [
            ...loadedState.events,
            {
                id: `${seed}-event-${loadedState.currentTick}-vote-${input.playerId}-${input.partyId}`,
                tick: loadedState.currentTick,
                type: "PlayerVoteCastEvent",
                message: `Player vote recorded as ${input.choice}. NPC voting power remains dominant.`,
                entityIds: [input.playerId, input.countryId, input.partyId],
                metadata: {
                    playerId: input.playerId,
                    countryId: input.countryId,
                    partyId: input.partyId,
                    choice: input.choice,
                    npcVoteWeight: election.npcVoteWeight,
                    playerVoteWeight: election.playerVoteWeight
                }
            }
        ]
    };
    assertNoInvalidEconomyValues(nextState);
    return {
        state: nextState,
        election: nextElection
    };
}
function selectRoute(state, input) {
    if (input.routeId) {
        return state.logisticsRoutes.find((route) => route.id === input.routeId) ?? null;
    }
    return (state.logisticsRoutes.find((route) => route.originWarehouseId === input.originWarehouseId &&
        route.destinationWarehouseId === input.destinationWarehouseId &&
        (!input.transportCompanyId || route.transportCompanyId === input.transportCompanyId)) ?? null);
}
function resolveShipmentQuote(state, input) {
    const route = selectRoute(state, input);
    if (!route) {
        return null;
    }
    return quoteShipment(state, route, input.quantity, input.transportCompanyId);
}
function getTransportCompanyForRoute(state, route, transportCompanyId) {
    const requestedCompany = transportCompanyId
        ? state.transportCompanies.find((company) => company.id === transportCompanyId)
        : null;
    if (requestedCompany) {
        return requestedCompany;
    }
    return state.transportCompanies.find((company) => company.id === route.transportCompanyId) ?? null;
}
function getRouteHandlingCostMinor(state, route, quantity) {
    const origin = state.warehouses.find((warehouse) => warehouse.id === route.originWarehouseId);
    const destination = state.warehouses.find((warehouse) => warehouse.id === route.destinationWarehouseId);
    const originCost = sanitizeMoney(origin?.handlingCostMinorPerUnit ?? 0);
    const destinationCost = sanitizeMoney(destination?.handlingCostMinorPerUnit ?? 0);
    return sanitizeMoney((originCost + destinationCost) * sanitizeQuantity(quantity));
}
function calculateLoanCapacityMinor(state, bank, score) {
    const centralBank = state.centralBanks.find((candidate) => candidate.countryId === bank.countryId);
    const reserveRequirement = clamp(centralBank?.reserveRequirement ?? bank.reserveRatio, 0.01, 1);
    const reserveCapacityMinor = sanitizeMoney(Math.floor(bank.reservesMinor / reserveRequirement) - bank.depositsMinor);
    const capitalCapacityMinor = sanitizeMoney(bank.capitalMinor * 10 - bank.loanBookMinor);
    const riskMultiplier = clamp(1 - bank.riskRating * 0.6 - score.probabilityOfDefault * 0.8, 0, 1);
    return sanitizeMoney(Math.min(reserveCapacityMinor, capitalCapacityMinor) * riskMultiplier);
}
function getOrCreateCreditScore(scores, borrowerType, borrowerId, tick, seed) {
    const existing = scores.find((score) => score.borrowerType === borrowerType && score.borrowerId === borrowerId);
    if (existing) {
        return existing;
    }
    const score = {
        id: `${seed}-credit-${borrowerType}-${borrowerId}`,
        borrowerType,
        borrowerId,
        score: 0.55,
        probabilityOfDefault: 0.16,
        lastUpdatedTick: tick
    };
    scores.push(score);
    return score;
}
function ensureBankAccount(input) {
    const existing = input.accounts.find((account) => account.bankId === input.bankId &&
        account.ownerType === input.ownerType &&
        account.ownerId === input.ownerId &&
        account.currencyCode === input.currencyCode &&
        account.status === "active");
    if (existing) {
        return existing;
    }
    const account = {
        id: `${input.seed}-account-${input.ownerType}-${input.ownerId}`,
        bankId: input.bankId,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        accountType: input.ownerType === "bank" ? "reserve" : "checking",
        currencyCode: input.currencyCode,
        balanceMinor: 0,
        reservedMinor: 0,
        insured: false,
        status: "active"
    };
    input.accounts.push(account);
    return account;
}
function getBorrowerAccount(accounts, loan) {
    return (accounts.find((account) => account.ownerType === loan.borrowerType &&
        account.ownerId === loan.borrowerId &&
        account.bankId === loan.lenderBankId &&
        account.status === "active") ?? null);
}
function applyLoanPaymentMutable(input) {
    if (input.loan.status !== "active" && input.loan.status !== "restructured") {
        throw new Error("LOAN_NOT_PAYABLE");
    }
    const account = getBorrowerAccount(input.bankAccounts, input.loan);
    if (!account) {
        throw new Error("BORROWER_ACCOUNT_NOT_FOUND");
    }
    const requestedMinor = sanitizeMoney(input.amountMinor);
    const dueMinor = sanitizeMoney(input.loan.outstandingPrincipalMinor + input.loan.accruedInterestMinor);
    const payableMinor = sanitizeMoney(Math.min(requestedMinor, dueMinor));
    const availableMinor = getAvailableCashMinor(account);
    const actualPaymentMinor = input.allowPartial ? sanitizeMoney(Math.min(payableMinor, availableMinor)) : payableMinor;
    if (actualPaymentMinor <= 0 || availableMinor < actualPaymentMinor) {
        throw new Error("INSUFFICIENT_CASH");
    }
    const paidInterestMinor = sanitizeMoney(Math.min(input.loan.accruedInterestMinor, actualPaymentMinor));
    const paidPrincipalMinor = sanitizeMoney(actualPaymentMinor - paidInterestMinor);
    const bank = input.banks.find((candidate) => candidate.id === input.loan.lenderBankId);
    account.balanceMinor = sanitizeMoney(account.balanceMinor - actualPaymentMinor);
    input.loan.accruedInterestMinor = sanitizeMoney(input.loan.accruedInterestMinor - paidInterestMinor);
    input.loan.outstandingPrincipalMinor = sanitizeMoney(input.loan.outstandingPrincipalMinor - paidPrincipalMinor);
    input.loan.remainingTicks = sanitizeQuantity(input.loan.remainingTicks - 1);
    input.loan.nextPaymentTick = input.tick + 1;
    input.loan.missedPayments = 0;
    if (bank) {
        bank.loanBookMinor = sanitizeMoney(bank.loanBookMinor - paidPrincipalMinor);
        bank.capitalMinor = sanitizeMoney(bank.capitalMinor + paidInterestMinor);
        bank.depositsMinor = sanitizeMoney(bank.depositsMinor - actualPaymentMinor);
    }
    const company = input.loan.borrowerType === "company" ? input.companies.find((candidate) => candidate.id === input.loan.borrowerId) : null;
    if (company) {
        company.cashBalanceMinor = sanitizeMoney(company.cashBalanceMinor - actualPaymentMinor);
    }
    if (input.loan.outstandingPrincipalMinor <= 0 && input.loan.accruedInterestMinor <= 0) {
        input.loan.status = "paid";
        input.loan.remainingTicks = 0;
    }
    input.financialTransactions.push({
        id: `${input.seed}-tx-${input.tick}-${input.loan.id}-payment-${input.financialTransactions.length + 1}`,
        tick: input.tick,
        type: "LoanPaymentTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: account.id,
                amountMinor: -actualPaymentMinor,
                currencyCode: account.currencyCode
            },
            {
                ownerType: "bank",
                ownerId: input.loan.lenderBankId,
                amountMinor: actualPaymentMinor,
                currencyCode: account.currencyCode
            }
        ]
    });
    input.events.push({
        id: `${input.seed}-event-${input.tick}-${input.loan.id}-payment-${input.financialTransactions.length}`,
        tick: input.tick,
        type: "LoanPaymentMadeEvent",
        message: `Loan ${input.loan.id} received a ${actualPaymentMinor} payment.`,
        entityIds: [input.loan.id, input.loan.borrowerId, input.loan.lenderBankId],
        metadata: {
            loanId: input.loan.id,
            paidPrincipalMinor,
            paidInterestMinor,
            remainingPrincipalMinor: input.loan.outstandingPrincipalMinor
        }
    });
    input.metrics.push({
        id: `${input.seed}-metric-${input.tick}-${input.loan.id}-payment`,
        tick: input.tick,
        name: "finance.loan.payment_minor",
        value: actualPaymentMinor,
        tags: {
            loanId: input.loan.id,
            borrowerId: input.loan.borrowerId
        }
    });
    return {
        paidPrincipalMinor,
        paidInterestMinor
    };
}
function markLoanDefaulted(context, loan, reason) {
    if (loan.status === "defaulted") {
        return;
    }
    loan.status = "defaulted";
    const bank = context.banks.find((candidate) => candidate.id === loan.lenderBankId);
    if (bank) {
        bank.nonPerformingLoanMinor = sanitizeMoney(bank.nonPerformingLoanMinor + loan.outstandingPrincipalMinor + loan.accruedInterestMinor);
    }
    context.events.push({
        id: `${context.seed}-event-${context.nextTick}-${loan.id}-defaulted`,
        tick: context.nextTick,
        type: "LoanDefaultedEvent",
        message: `Loan ${loan.id} defaulted: ${reason}`,
        entityIds: [loan.id, loan.borrowerId, loan.lenderBankId],
        metadata: {
            loanId: loan.id,
            borrowerId: loan.borrowerId,
            lenderBankId: loan.lenderBankId,
            outstandingMinor: loan.outstandingPrincipalMinor,
            accruedInterestMinor: loan.accruedInterestMinor,
            reason
        }
    });
}
function isExchangeAssetTradeable(state, assetType, assetId) {
    if (assetType === "stock") {
        return state.stocks.some((stock) => stock.id === assetId);
    }
    if (assetType === "bond") {
        return state.bonds.some((bond) => bond.id === assetId && !bond.defaulted);
    }
    if (assetType === "commodity") {
        return state.products.some((product) => product.id === assetId && product.exchangeTradeable);
    }
    if (assetType === "currency") {
        return state.countries.some((country) => country.currencyCode === assetId);
    }
    return false;
}
function getOrCreateOrderBook(orderBooks, exchange, assetType, assetId, priceMinor, seed) {
    const existing = orderBooks.find((book) => book.exchangeId === exchange.id && book.assetType === assetType && book.assetId === assetId);
    if (existing) {
        return existing;
    }
    const book = {
        id: `${seed}-book-${exchange.id}-${assetType}-${assetId}`,
        exchangeId: exchange.id,
        assetType,
        assetId,
        bids: [],
        asks: [],
        lastPriceMinor: priceMinor
    };
    orderBooks.push(book);
    return book;
}
function getSettlementAccount(accounts, ownerType, ownerId, currencyCode) {
    return (accounts.find((account) => account.ownerType === ownerType &&
        account.ownerId === ownerId &&
        account.currencyCode === currencyCode &&
        account.status === "active") ?? null);
}
function getAvailableCashMinor(account) {
    return sanitizeMoney(account.balanceMinor - account.reservedMinor);
}
function debitPlayerAccount(accounts, playerId, currencyCode, amountMinor) {
    const account = accounts.find((candidate) => candidate.ownerType === "player" &&
        candidate.ownerId === playerId &&
        candidate.currencyCode === currencyCode &&
        candidate.status === "active");
    if (!account) {
        throw new Error("PLAYER_ACCOUNT_NOT_FOUND");
    }
    if (getAvailableCashMinor(account) < amountMinor) {
        throw new Error("INSUFFICIENT_PLAYER_BALANCE");
    }
    account.balanceMinor = sanitizeMoney(account.balanceMinor - amountMinor);
    return account;
}
function playerHasPoliticalEligibility(state, playerId) {
    return (state.bankAccounts.some((account) => account.ownerType === "player" && account.ownerId === playerId && getAvailableCashMinor(account) > 0) ||
        state.portfolioPositions.some((position) => position.ownerType === "player" && position.ownerId === playerId && position.quantity > 0) ||
        state.companies.some((company) => company.ownerType === "player" && company.ownerId === playerId && company.legalStatus === "registered"));
}
function requiresIndustryLicense(state, company, industry) {
    return state.laws.some((law) => law.countryId === company.countryId &&
        law.type === "industry_license" &&
        law.status === "active" &&
        law.parameters.industry === industry);
}
function hasActiveIndustryLicense(state, company, industry) {
    return state.licenses.some((license) => license.countryId === company.countryId &&
        license.companyId === company.id &&
        license.industry === industry &&
        license.status === "active" &&
        (license.expiresTick === null || license.expiresTick >= state.currentTick));
}
function getLatestBudget(budgets, countryId) {
    return budgets
        .filter((budget) => budget.countryId === countryId)
        .sort((left, right) => right.tick - left.tick)[0] ?? null;
}
function getPositionQuantity(positions, ownerType, ownerId, assetType, assetId) {
    return sanitizeQuantity(positions
        .filter((position) => position.ownerType === ownerType && position.ownerId === ownerId && position.assetType === assetType && position.assetId === assetId)
        .reduce((total, position) => total + position.quantity, 0));
}
function countOrders(orderBooks) {
    return orderBooks.reduce((total, book) => total + book.bids.length + book.asks.length, 0);
}
function matchOrderBook(input) {
    const openBids = () => input.book.bids
        .filter((order) => order.status !== "filled" && order.status !== "cancelled" && order.remainingQuantity > 0)
        .sort((left, right) => right.priceMinor - left.priceMinor || left.createdTick - right.createdTick);
    const openAsks = () => input.book.asks
        .filter((order) => order.status !== "filled" && order.status !== "cancelled" && order.remainingQuantity > 0)
        .sort((left, right) => left.priceMinor - right.priceMinor || left.createdTick - right.createdTick);
    let bids = openBids();
    let asks = openAsks();
    while (bids.length > 0 && asks.length > 0) {
        const bid = bids[0];
        const ask = asks[0];
        if (bid.priceMinor < ask.priceMinor) {
            break;
        }
        const quantity = sanitizeQuantity(Math.min(bid.remainingQuantity, ask.remainingQuantity));
        const priceMinor = ask.priceMinor;
        const valueMinor = sanitizeMoney(priceMinor * quantity);
        const buyerAccount = getSettlementAccount(input.bankAccounts, bid.ownerType, bid.ownerId, "NCR");
        const sellerAccount = getSettlementAccount(input.bankAccounts, ask.ownerType, ask.ownerId, "NCR");
        if (!buyerAccount || !sellerAccount || quantity <= 0 || valueMinor <= 0 || buyerAccount.balanceMinor < valueMinor) {
            bid.status = "rejected";
            break;
        }
        if (getPositionQuantity(input.portfolioPositions, ask.ownerType, ask.ownerId, ask.assetType, ask.assetId) < quantity) {
            ask.status = "rejected";
            break;
        }
        buyerAccount.reservedMinor = sanitizeMoney(buyerAccount.reservedMinor - bid.priceMinor * quantity);
        buyerAccount.balanceMinor = sanitizeMoney(buyerAccount.balanceMinor - valueMinor);
        sellerAccount.balanceMinor = sanitizeMoney(sellerAccount.balanceMinor + valueMinor);
        transferPosition({
            positions: input.portfolioPositions,
            sellerOwnerType: ask.ownerType,
            sellerOwnerId: ask.ownerId,
            buyerOwnerType: bid.ownerType,
            buyerOwnerId: bid.ownerId,
            assetType: ask.assetType,
            assetId: ask.assetId,
            quantity,
            priceMinor,
            seed: input.seed
        });
        bid.remainingQuantity = sanitizeQuantity(bid.remainingQuantity - quantity);
        ask.remainingQuantity = sanitizeQuantity(ask.remainingQuantity - quantity);
        bid.status = bid.remainingQuantity === 0 ? "filled" : "partially_filled";
        ask.status = ask.remainingQuantity === 0 ? "filled" : "partially_filled";
        input.book.lastPriceMinor = priceMinor;
        const trade = {
            id: `${input.seed}-trade-${input.tick}-${input.trades.length + 1}`,
            exchangeId: input.book.exchangeId,
            buyOrderId: bid.id,
            sellOrderId: ask.id,
            assetType: input.book.assetType,
            assetId: input.book.assetId,
            priceMinor,
            quantity,
            buyerOwnerType: bid.ownerType,
            buyerOwnerId: bid.ownerId,
            sellerOwnerType: ask.ownerType,
            sellerOwnerId: ask.ownerId,
            tick: input.tick
        };
        input.trades.push(trade);
        input.financialTransactions.push({
            id: `${input.seed}-tx-${input.tick}-${trade.id}`,
            tick: input.tick,
            type: "TradeSettlementTransaction",
            entries: [
                {
                    ownerType: "bank_account",
                    ownerId: buyerAccount.id,
                    amountMinor: -valueMinor,
                    currencyCode: buyerAccount.currencyCode
                },
                {
                    ownerType: "bank_account",
                    ownerId: sellerAccount.id,
                    amountMinor: valueMinor,
                    currencyCode: sellerAccount.currencyCode
                }
            ]
        });
        input.events.push({
            id: `${input.seed}-event-${input.tick}-${trade.id}`,
            tick: input.tick,
            type: "ExchangeTradeMatchedEvent",
            message: `${quantity} units traded at ${priceMinor}.`,
            entityIds: [trade.id, input.book.exchangeId, input.book.assetId],
            metadata: {
                tradeId: trade.id,
                assetType: trade.assetType,
                assetId: trade.assetId,
                priceMinor,
                quantity
            }
        });
        input.metrics.push({
            id: `${input.seed}-metric-${input.tick}-${trade.id}`,
            tick: input.tick,
            name: "finance.exchange.trade_value_minor",
            value: valueMinor,
            tags: {
                exchangeId: trade.exchangeId,
                assetType: trade.assetType,
                assetId: trade.assetId
            }
        });
        bids = openBids();
        asks = openAsks();
    }
}
function transferPosition(input) {
    const seller = input.positions.find((position) => position.ownerType === input.sellerOwnerType &&
        position.ownerId === input.sellerOwnerId &&
        position.assetType === input.assetType &&
        position.assetId === input.assetId);
    if (seller) {
        seller.quantity = sanitizeQuantity(seller.quantity - input.quantity);
    }
    const buyer = input.positions.find((position) => position.ownerType === input.buyerOwnerType &&
        position.ownerId === input.buyerOwnerId &&
        position.assetType === input.assetType &&
        position.assetId === input.assetId);
    if (buyer) {
        const previousQuantity = buyer.quantity;
        const nextQuantity = sanitizeQuantity(previousQuantity + input.quantity);
        buyer.averageCostMinor =
            nextQuantity > 0 ? sanitizeMoney((buyer.averageCostMinor * previousQuantity + input.priceMinor * input.quantity) / nextQuantity) : input.priceMinor;
        buyer.quantity = nextQuantity;
        return;
    }
    input.positions.push({
        id: `${input.seed}-position-${input.buyerOwnerType}-${input.buyerOwnerId}-${input.assetType}-${input.assetId}`,
        ownerType: input.buyerOwnerType,
        ownerId: input.buyerOwnerId,
        assetType: input.assetType,
        assetId: input.assetId,
        quantity: input.quantity,
        averageCostMinor: input.priceMinor
    });
}
function applyAcceptedPlayerCommand(input) {
    const { command } = input;
    if (command.type === "CreateCompanyCommand") {
        applyCreateCompanyCommand(input, command);
        return;
    }
    if (command.type === "BuyLandCommand") {
        applyBuyLandCommand(input, command);
        return;
    }
    if (command.type === "BuyResourceCommand") {
        const result = applyBuyResourceCommand(input, command);
        input.resourcePurchases.push(result.purchase);
        return;
    }
    if (command.type === "RunManualProductionCommand") {
        const result = applyRunManualProductionCommand(input, command);
        input.manualProductionRuns.push(result.productionRun);
        return;
    }
    if (command.type === "SetRetailPriceCommand") {
        applyRetailPriceUpdate({
            state: input.state,
            retailOffers: input.retailOffers,
            retailPriceChanges: input.retailPriceChanges,
            events: input.events,
            metrics: input.metrics,
            news: input.news,
            input: {
                playerId: command.playerId,
                companyId: command.companyId,
                productId: command.productId,
                priceMinor: command.priceMinor,
                currencyCode: command.currencyCode,
                commandId: command.commandId
            },
            tick: input.tick,
            seed: input.seed
        });
    }
}
function applyCreateCompanyCommand(input, command) {
    const country = input.state.countries.find((candidate) => candidate.id === command.countryId);
    if (!country) {
        throw new Error("UNKNOWN_COUNTRY");
    }
    const normalizedName = command.name.trim();
    const nameExists = input.companies.some((company) => company.countryId === command.countryId && company.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase());
    if (nameExists) {
        throw new Error("COMPANY_NAME_TAKEN");
    }
    const company = {
        id: `${input.seed}-company-${input.tick}-${slugify(normalizedName)}`,
        ownerType: "player",
        ownerId: command.playerId,
        countryId: command.countryId,
        name: normalizedName,
        legalStatus: "registered",
        cashBalanceMinor: 0,
        currencyCode: country.currencyCode,
        reputation: 0.5,
        bankruptcyStatus: "none"
    };
    const bank = input.state.banks.find((candidate) => candidate.countryId === command.countryId && candidate.solvent) ?? input.state.banks[0] ?? null;
    input.companies.push(company);
    if (bank) {
        input.bankAccounts.push({
            id: `${input.seed}-account-${input.tick}-${company.id}`,
            bankId: bank.id,
            ownerType: "company",
            ownerId: company.id,
            accountType: "checking",
            currencyCode: country.currencyCode,
            balanceMinor: 0,
            reservedMinor: 0,
            insured: false,
            status: "active"
        });
    }
    input.creditScores.push({
        id: `${input.seed}-credit-company-${company.id}`,
        borrowerType: "company",
        borrowerId: company.id,
        score: 0.52,
        probabilityOfDefault: 0.18,
        lastUpdatedTick: input.tick
    });
    input.events.push({
        id: `${input.seed}-event-${input.tick}-${command.commandId}-company-registered`,
        tick: input.tick,
        type: "CompanyRegisteredEvent",
        message: `${company.name} registered in ${country.name}.`,
        entityIds: [company.id, country.id, command.playerId],
        metadata: {
            commandId: command.commandId,
            companyId: company.id,
            countryId: country.id,
            playerId: command.playerId
        }
    });
    input.metrics.push({
        id: `${input.seed}-metric-${input.tick}-${command.commandId}-company-created`,
        tick: input.tick,
        name: "company.player.created",
        value: 1,
        tags: {
            companyId: company.id,
            countryId: country.id,
            playerId: command.playerId
        }
    });
    input.news.push({
        id: `${input.seed}-news-${input.tick}-${command.commandId}-company-registered`,
        tick: input.tick,
        category: "corporate",
        templateId: null,
        headline: `${company.name} registered`,
        body: `The company is registered through the player command journal. It still needs a land or premise command before operations can start.`,
        severity: "info",
        relatedEntityIds: [company.id, country.id],
        reliabilityId: null
    });
}
function processRecurringPremiseCosts(input) {
    if (input.tick <= 0 || input.tick % MONTHLY_TICK_INTERVAL !== 0) {
        return;
    }
    for (const premise of input.premises) {
        if (premise.status !== "active" || !premise.companyId) {
            continue;
        }
        const company = input.companies.find((candidate) => candidate.id === premise.companyId) ?? null;
        if (!company) {
            continue;
        }
        const rentMinor = premise.acquisitionMode === "lease" ? premise.monthlyRentMinor : 0;
        const maintenanceMinor = premise.maintenanceMinorPerMonth;
        const totalMinor = sanitizeMoney(rentMinor + maintenanceMinor);
        if (totalMinor <= 0) {
            continue;
        }
        const account = getSettlementAccount(input.bankAccounts, "player", company.ownerId, company.currencyCode);
        if (!account) {
            continue;
        }
        const paidMinor = Math.min(getAvailableCashMinor(account), totalMinor);
        account.balanceMinor = sanitizeMoney(account.balanceMinor - paidMinor);
        input.financialTransactions.push({
            id: `${input.seed}-tx-${input.tick}-${premise.id}-recurring-premise-cost`,
            tick: input.tick,
            type: "LandPremiseTransaction",
            entries: [
                {
                    ownerType: "bank_account",
                    ownerId: account.id,
                    amountMinor: -paidMinor,
                    currencyCode: company.currencyCode
                },
                {
                    ownerType: "state",
                    ownerId: premise.cityId,
                    amountMinor: paidMinor,
                    currencyCode: company.currencyCode
                }
            ]
        });
        input.events.push({
            id: `${input.seed}-event-${input.tick}-${premise.id}-recurring-premise-cost`,
            tick: input.tick,
            type: "LandPremiseRecurringCostEvent",
            message: `${company.name} paid recurring premise ${premise.acquisitionMode === "lease" ? "rent and " : ""}maintenance for ${premise.name}.`,
            entityIds: [company.id, premise.id, account.id],
            metadata: {
                companyId: company.id,
                premiseId: premise.id,
                rentMinor,
                maintenanceMinor,
                paidMinor,
                unpaidMinor: sanitizeMoney(totalMinor - paidMinor)
            }
        });
        input.metrics.push({
            id: `${input.seed}-metric-${input.tick}-${premise.id}-recurring-premise-cost`,
            tick: input.tick,
            name: "land.premise.recurring_cost_minor",
            value: paidMinor,
            tags: {
                companyId: company.id,
                premiseId: premise.id,
                mode: premise.acquisitionMode
            }
        });
        if (paidMinor < totalMinor) {
            input.news.push({
                id: `${input.seed}-news-${input.tick}-${premise.id}-premise-cost-shortfall`,
                tick: input.tick,
                category: "corporate",
                templateId: null,
                headline: `${company.name} misses part of premise costs`,
                body: `The company paid ${paidMinor} of ${totalMinor} due for rent/maintenance. This is a business-risk signal for future credit and license checks.`,
                severity: "warning",
                relatedEntityIds: [company.id, premise.id],
                reliabilityId: null
            });
        }
    }
}
function applyBuyLandCommand(input, command) {
    const company = input.companies.find((candidate) => candidate.id === command.companyId);
    const city = input.state.cities.find((candidate) => candidate.id === command.cityId);
    if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
        throw new Error("PLAYER_COMPANY_REQUIRED");
    }
    if (!city || city.countryId !== company.countryId) {
        throw new Error("CITY_COMPANY_COUNTRY_MISMATCH");
    }
    if (input.warehouses.some((warehouse) => warehouse.companyId === company.id && warehouse.cityId === city.id)) {
        throw new Error("COMPANY_PREMISE_ALREADY_EXISTS");
    }
    const requestedPremiseId = command.premiseId ?? command.lotId;
    const requestedPremise = input.premises.find((premise) => premise.id === requestedPremiseId) ?? null;
    const requestedLandParcelId = command.landParcelId ?? requestedPremise?.landParcelId ?? command.lotId;
    const explicitLandParcel = input.landParcels.find((parcel) => parcel.id === requestedLandParcelId) ?? null;
    const availablePremise = requestedPremise ??
        input.premises.find((premise) => premise.cityId === city.id && premise.status === "available" && isStarterBusinessZoningAllowed(premise.zoning)) ??
        null;
    const landParcel = explicitLandParcel ??
        (availablePremise ? input.landParcels.find((parcel) => parcel.id === availablePremise.landParcelId) ?? null : null) ??
        input.landParcels.find((parcel) => parcel.cityId === city.id && parcel.status === "available" && isStarterBusinessZoningAllowed(parcel.zoning)) ??
        null;
    if (!landParcel) {
        throw new Error("LAND_PARCEL_NOT_AVAILABLE");
    }
    if (landParcel.cityId !== city.id || landParcel.countryId !== company.countryId) {
        throw new Error("LAND_CITY_COUNTRY_MISMATCH");
    }
    if (landParcel.status !== "available") {
        throw new Error("LAND_PARCEL_NOT_AVAILABLE");
    }
    if (!isStarterBusinessZoningAllowed(landParcel.zoning)) {
        throw new Error("ZONING_NOT_ALLOWED");
    }
    const premise = availablePremise ?? createPremiseFromLandParcel(input, landParcel, command.mode ?? "purchase");
    if (premise.cityId !== city.id || premise.landParcelId !== landParcel.id) {
        throw new Error("PREMISE_LAND_MISMATCH");
    }
    if (premise.status !== "available") {
        throw new Error("PREMISE_NOT_AVAILABLE");
    }
    if (!isStarterBusinessZoningAllowed(premise.zoning)) {
        throw new Error("ZONING_NOT_ALLOWED");
    }
    const acquisitionMode = command.mode ?? "purchase";
    const initialCostMinor = sanitizeMoney(acquisitionMode === "lease"
        ? Math.max(premise.monthlyRentMinor, landParcel.monthlyRentMinor) + Math.max(premise.maintenanceMinorPerMonth, landParcel.maintenanceMinorPerMonth)
        : Math.max(premise.purchasePriceMinor, landParcel.marketPriceMinor) + Math.max(premise.maintenanceMinorPerMonth, landParcel.maintenanceMinorPerMonth));
    const monthlyObligationMinor = sanitizeMoney((acquisitionMode === "lease" ? Math.max(premise.monthlyRentMinor, landParcel.monthlyRentMinor) : 0) +
        Math.max(premise.maintenanceMinorPerMonth, landParcel.maintenanceMinorPerMonth));
    const playerAccount = getSettlementAccount(input.bankAccounts, "player", command.playerId, company.currencyCode);
    if (!playerAccount) {
        throw new Error("PLAYER_ACCOUNT_NOT_FOUND");
    }
    if (getAvailableCashMinor(playerAccount) < initialCostMinor) {
        throw new Error("INSUFFICIENT_PLAYER_BALANCE");
    }
    playerAccount.balanceMinor = sanitizeMoney(playerAccount.balanceMinor - initialCostMinor);
    landParcel.status = acquisitionMode === "lease" ? "leased" : "owned";
    landParcel.ownerType = "company";
    landParcel.ownerId = company.id;
    const starterWarehouse = {
        id: `${input.seed}-warehouse-${input.tick}-${company.id}-starter`,
        companyId: company.id,
        cityId: city.id,
        name: `${company.name} ${acquisitionMode === "lease" ? "Leased" : "Owned"} ${premise.name}`,
        warehouseType: premise.premiseType === "farm" || premise.premiseType === "warehouse" ? "bulk" : "general",
        capacity: premise.premiseType === "factory" ? 120_000 : premise.premiseType === "warehouse" ? 100_000 : 50_000,
        handlingCostMinorPerUnit: premise.premiseType === "farm" ? 4 : 6
    };
    premise.companyId = company.id;
    premise.acquisitionMode = acquisitionMode;
    premise.status = "active";
    premise.warehouseId = starterWarehouse.id;
    premise.acquiredTick = input.tick;
    premise.leaseExpiresTick = acquisitionMode === "lease" ? input.tick + MONTHLY_TICK_INTERVAL * 12 : null;
    const wheatProduct = input.state.products.find((product) => product.name.toLocaleLowerCase() === "wheat") ?? null;
    const breadProduct = input.state.products.find((product) => product.name.toLocaleLowerCase() === "bread") ?? null;
    const starterProductionPlan = wheatProduct && breadProduct
        ? {
            id: `${input.seed}-production-${input.tick}-${company.id}-bread`,
            companyId: company.id,
            warehouseId: starterWarehouse.id,
            outputProductId: breadProduct.id,
            outputQuantityPerTick: 2_000,
            inputs: [{ productId: wheatProduct.id, quantityPerOutput: 0.4 }],
            active: false
        }
        : null;
    const starterRetailOffer = breadProduct && starterProductionPlan
        ? {
            id: `${input.seed}-offer-${input.tick}-${company.id}-bread`,
            companyId: company.id,
            warehouseId: starterWarehouse.id,
            productId: breadProduct.id,
            priceMinor: 340,
            quality: breadProduct.baseQuality,
            active: true
        }
        : null;
    const foodLicenseLaw = input.state.laws.find((law) => law.countryId === company.countryId && law.type === "industry_license" && law.status === "active" && law.parameters.industry === "food");
    input.warehouses.push(starterWarehouse);
    const defaultWheatOffer = wheatProduct
        ? input.state.resourceOffers.find((offer) => offer.productId === wheatProduct.id && offer.active) ?? null
        : null;
    const originWarehouse = defaultWheatOffer
        ? input.state.warehouses.find((warehouse) => warehouse.id === defaultWheatOffer.warehouseId) ?? null
        : null;
    const transportCompany = input.transportCompanies.find((candidate) => candidate.countryId === company.countryId && candidate.active) ??
        input.transportCompanies.find((candidate) => candidate.active) ??
        null;
    if (originWarehouse && transportCompany) {
        input.logisticsRoutes.push({
            id: `${input.seed}-route-${input.tick}-${originWarehouse.id}-${starterWarehouse.id}`,
            name: `${originWarehouse.name} -> ${starterWarehouse.name}`,
            originWarehouseId: originWarehouse.id,
            destinationWarehouseId: starterWarehouse.id,
            nodeIds: [],
            infrastructureLinkIds: [],
            transportCompanyId: transportCompany.id,
            mode: transportCompany.mode,
            active: true,
            blockedReason: null
        });
    }
    if (starterProductionPlan) {
        input.productionPlans.push(starterProductionPlan);
    }
    if (starterRetailOffer) {
        input.retailOffers.push(starterRetailOffer);
    }
    if (foodLicenseLaw && starterProductionPlan) {
        input.licenses.push({
            id: `${input.seed}-license-${input.tick}-${company.id}-food`,
            countryId: company.countryId,
            companyId: company.id,
            industry: "food",
            lawId: foodLicenseLaw.id,
            status: "active",
            issuedTick: input.tick,
            expiresTick: null
        });
    }
    input.financialTransactions.push({
        id: `${input.seed}-tx-${input.tick}-${command.commandId}-land-premise`,
        tick: input.tick,
        type: "LandPremiseTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: playerAccount.id,
                amountMinor: -initialCostMinor,
                currencyCode: company.currencyCode
            },
            {
                ownerType: "state",
                ownerId: acquisitionMode === "lease" ? city.id : company.countryId,
                amountMinor: initialCostMinor,
                currencyCode: company.currencyCode
            }
        ]
    });
    input.events.push({
        id: `${input.seed}-event-${input.tick}-${command.commandId}-premise-acquired`,
        tick: input.tick,
        type: "LandPremiseAcquiredEvent",
        message: `${company.name} ${acquisitionMode === "lease" ? "leased" : "bought"} ${premise.name} in ${city.name}.`,
        entityIds: [company.id, city.id, landParcel.id, premise.id, starterWarehouse.id],
        metadata: {
            commandId: command.commandId,
            companyId: company.id,
            cityId: city.id,
            landParcelId: landParcel.id,
            premiseId: premise.id,
            warehouseId: starterWarehouse.id,
            productionPlanId: starterProductionPlan?.id ?? "",
            retailOfferId: starterRetailOffer?.id ?? "",
            acquisitionMode,
            zoning: premise.zoning,
            costMinor: initialCostMinor,
            monthlyObligationMinor
        }
    });
    input.metrics.push({
        id: `${input.seed}-metric-${input.tick}-${command.commandId}-premise-cost`,
        tick: input.tick,
        name: "land.premise.initial_cost_minor",
        value: initialCostMinor,
        tags: {
            companyId: company.id,
            cityId: city.id,
            landParcelId: landParcel.id,
            premiseId: premise.id,
            mode: acquisitionMode,
            zoning: premise.zoning
        }
    });
    input.metrics.push({
        id: `${input.seed}-metric-${input.tick}-${command.commandId}-premise-monthly-obligation`,
        tick: input.tick,
        name: "land.premise.monthly_obligation_minor",
        value: monthlyObligationMinor,
        tags: {
            companyId: company.id,
            premiseId: premise.id,
            mode: acquisitionMode
        }
    });
    input.news.push({
        id: `${input.seed}-news-${input.tick}-${command.commandId}-premise-acquired`,
        tick: input.tick,
        category: "corporate",
        templateId: null,
        headline: `${company.name} opens ${premise.name}`,
        body: `A validated ${acquisitionMode} command acquired a ${premise.zoning} premise, created an operational warehouse, and attached starter production/sales assets where allowed.`,
        severity: "info",
        relatedEntityIds: [company.id, city.id, landParcel.id, premise.id, starterWarehouse.id],
        reliabilityId: null
    });
}
function createPremiseFromLandParcel(input, landParcel, mode) {
    const premise = {
        id: `${input.seed}-premise-${input.tick}-${slugify(landParcel.id)}`,
        landParcelId: landParcel.id,
        cityId: landParcel.cityId,
        companyId: null,
        name: `${landParcel.name} ${mode === "lease" ? "Lease Unit" : "Buildable Unit"}`,
        premiseType: landParcel.zoning === "agricultural" ? "farm" : landParcel.zoning === "industrial" ? "workshop" : "storefront",
        acquisitionMode: "state_owned",
        status: "available",
        zoning: landParcel.zoning,
        warehouseId: null,
        purchasePriceMinor: landParcel.marketPriceMinor,
        monthlyRentMinor: landParcel.monthlyRentMinor,
        maintenanceMinorPerMonth: landParcel.maintenanceMinorPerMonth,
        acquiredTick: null,
        leaseExpiresTick: null
    };
    input.premises.push(premise);
    return premise;
}
function isStarterBusinessZoningAllowed(zoning) {
    return zoning === "commercial" || zoning === "industrial" || zoning === "mixed";
}
function applyBuyResourceCommand(input, command) {
    const quantity = sanitizeQuantity(command.quantity);
    const maxUnitPriceMinor = sanitizeMoney(command.maxUnitPriceMinor);
    const deliveryMode = command.deliveryMode ?? "pickup";
    const offer = input.state.resourceOffers.find((candidate) => candidate.id === command.resourceOfferId);
    if (!offer || !offer.active) {
        throw new Error("UNKNOWN_OR_INACTIVE_RESOURCE_OFFER");
    }
    if (quantity <= 0 || maxUnitPriceMinor <= 0) {
        throw new Error("INVALID_RESOURCE_PURCHASE");
    }
    if (offer.unitPriceMinor > maxUnitPriceMinor) {
        throw new Error("RESOURCE_PRICE_EXCEEDS_LIMIT");
    }
    if (quantity > offer.maxQuantityPerTick) {
        throw new Error("RESOURCE_QUANTITY_EXCEEDS_OFFER_LIMIT");
    }
    if (deliveryMode !== "pickup" && deliveryMode !== "delivery") {
        throw new Error("INVALID_RESOURCE_DELIVERY_MODE");
    }
    const product = input.state.products.find((candidate) => candidate.id === offer.productId);
    const sellerWarehouse = input.warehouses.find((warehouse) => warehouse.id === offer.warehouseId);
    const sellerCompany = input.companies.find((company) => company.id === offer.companyId);
    const buyerCompany = input.companies.find((company) => company.id === command.buyerCompanyId);
    const buyerWarehouse = (command.buyerWarehouseId
        ? input.warehouses.find((warehouse) => warehouse.id === command.buyerWarehouseId && warehouse.companyId === command.buyerCompanyId)
        : input.warehouses.find((warehouse) => warehouse.companyId === command.buyerCompanyId)) ?? null;
    if (!product) {
        throw new Error("UNKNOWN_PRODUCT");
    }
    if (!sellerWarehouse || !sellerCompany || sellerCompany.legalStatus !== "registered") {
        throw new Error("UNKNOWN_OR_INACTIVE_RESOURCE_SELLER");
    }
    if (!buyerCompany || buyerCompany.ownerType !== "player" || buyerCompany.ownerId !== command.playerId || buyerCompany.legalStatus !== "registered") {
        throw new Error("PLAYER_COMPANY_REQUIRED");
    }
    if (!buyerWarehouse) {
        throw new Error("BUYER_WAREHOUSE_REQUIRED");
    }
    if (sellerCompany.currencyCode !== buyerCompany.currencyCode) {
        throw new Error("CURRENCY_MISMATCH");
    }
    const availableQuantity = getAvailableQuantity(input.inventoryLots, sellerWarehouse.id, product.id);
    if (availableQuantity < quantity) {
        throw new Error("INSUFFICIENT_RESOURCE_INVENTORY");
    }
    const goodsCostMinor = sanitizeMoney(offer.unitPriceMinor * quantity);
    const quote = deliveryMode === "delivery"
        ? resolveShipmentQuote(input.state, {
            originWarehouseId: sellerWarehouse.id,
            destinationWarehouseId: buyerWarehouse.id,
            productId: product.id,
            quantity,
            routeId: command.routeId,
            transportCompanyId: command.transportCompanyId
        })
        : null;
    if (deliveryMode === "delivery" && !quote) {
        throw new Error("LOGISTICS_ROUTE_REQUIRED");
    }
    if (quote?.blockedReason) {
        throw new Error(`LOGISTICS_ROUTE_BLOCKED:${quote.blockedReason}`);
    }
    const logisticsCostMinor = quote ? sanitizeMoney(quote.costMinor) : 0;
    const totalPriceMinor = sanitizeMoney(goodsCostMinor + logisticsCostMinor);
    const buyerAccount = getSettlementAccount(input.bankAccounts, "player", command.playerId, buyerCompany.currencyCode);
    if (!buyerAccount) {
        throw new Error("PLAYER_ACCOUNT_NOT_FOUND");
    }
    if (getAvailableCashMinor(buyerAccount) < totalPriceMinor) {
        throw new Error("INSUFFICIENT_PLAYER_BALANCE");
    }
    const consumedQuantity = consumeInventory(input.inventoryLots, sellerWarehouse.id, product.id, quantity);
    if (consumedQuantity < quantity) {
        throw new Error("INSUFFICIENT_RESOURCE_INVENTORY");
    }
    let shipment = null;
    if (deliveryMode === "pickup") {
        addInventory({
            inventoryLots: input.inventoryLots,
            warehouseId: buyerWarehouse.id,
            productId: product.id,
            quantity,
            quality: offer.quality,
            lotId: `${input.seed}-lot-${input.tick}-${command.commandId}-${product.id}-resource`,
            unitCostMinor: quantity > 0 ? sanitizeMoney(totalPriceMinor / quantity) : 0,
            totalCostMinor: totalPriceMinor,
            costSourceType: "resource_purchase",
            costSourceId: `${input.seed}-resource-purchase-${input.tick}-${command.commandId}`
        });
    }
    else if (quote) {
        shipment = {
            id: `${input.seed}-shipment-${input.tick}-${command.commandId}`,
            originWarehouseId: sellerWarehouse.id,
            destinationWarehouseId: buyerWarehouse.id,
            productId: product.id,
            quantity,
            routeId: quote.routeId,
            transportCompanyId: quote.transportCompanyId,
            costMinor: logisticsCostMinor,
            durationTicks: quote.durationTicks,
            remainingTicks: Math.max(1, quote.durationTicks + 1),
            risk: quote.risk,
            status: "in_transit",
            createdTick: input.tick,
            departedTick: input.tick,
            deliveredTick: null,
            blockedReason: null
        };
        input.shipments.push(shipment);
    }
    buyerAccount.balanceMinor = sanitizeMoney(buyerAccount.balanceMinor - totalPriceMinor);
    const sellerAccount = getSettlementAccount(input.bankAccounts, "company", sellerCompany.id, sellerCompany.currencyCode);
    if (sellerAccount) {
        sellerAccount.balanceMinor = sanitizeMoney(sellerAccount.balanceMinor + goodsCostMinor);
    }
    sellerCompany.cashBalanceMinor = sanitizeMoney(sellerCompany.cashBalanceMinor + goodsCostMinor);
    if (quote && logisticsCostMinor > 0) {
        const transportCompany = input.transportCompanies.find((candidate) => candidate.id === quote.transportCompanyId);
        const transportAccount = transportCompany ? getSettlementAccount(input.bankAccounts, "company", transportCompany.id, buyerCompany.currencyCode) : null;
        if (transportCompany) {
            transportCompany.cashBalanceMinor = sanitizeMoney(transportCompany.cashBalanceMinor + logisticsCostMinor);
        }
        if (transportAccount) {
            transportAccount.balanceMinor = sanitizeMoney(transportAccount.balanceMinor + logisticsCostMinor);
        }
    }
    const purchase = {
        id: `${input.seed}-resource-purchase-${input.tick}-${command.commandId}`,
        tick: input.tick,
        playerId: command.playerId,
        buyerCompanyId: buyerCompany.id,
        sellerCompanyId: sellerCompany.id,
        sellerWarehouseId: sellerWarehouse.id,
        buyerWarehouseId: buyerWarehouse.id,
        productId: product.id,
        quantity,
        unitPriceMinor: offer.unitPriceMinor,
        totalPriceMinor,
        goodsCostMinor,
        logisticsCostMinor,
        quality: offer.quality,
        deliveryMode,
        shipmentId: shipment?.id ?? null,
        status: deliveryMode === "delivery" ? "in_transit" : "completed"
    };
    input.financialTransactions.push({
        id: `${input.seed}-tx-${input.tick}-${command.commandId}-resource-purchase`,
        tick: input.tick,
        type: "ResourcePurchaseTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: buyerAccount.id,
                amountMinor: -totalPriceMinor,
                currencyCode: buyerCompany.currencyCode
            },
            {
                ownerType: "company",
                ownerId: sellerCompany.id,
                amountMinor: goodsCostMinor,
                currencyCode: sellerCompany.currencyCode
            },
            ...(quote && logisticsCostMinor > 0
                ? [
                    {
                        ownerType: "company",
                        ownerId: quote.transportCompanyId,
                        amountMinor: logisticsCostMinor,
                        currencyCode: buyerCompany.currencyCode
                    }
                ]
                : [])
        ]
    });
    input.events.push({
        id: `${input.seed}-event-${input.tick}-${command.commandId}-resource-purchased`,
        tick: input.tick,
        type: deliveryMode === "delivery" ? "ResourcePurchaseOrderedEvent" : "ResourcePurchasedEvent",
        message: deliveryMode === "delivery"
            ? `${buyerCompany.name} ordered ${quantity} units of ${product.name}; shipment ${shipment?.id ?? "pending"} is in transit.`
            : `${buyerCompany.name} bought ${quantity} units of ${product.name}.`,
        entityIds: [purchase.id, buyerCompany.id, sellerCompany.id, product.id, buyerWarehouse.id, ...(shipment ? [shipment.id] : [])],
        metadata: {
            commandId: command.commandId,
            purchaseId: purchase.id,
            shipmentId: shipment?.id ?? "",
            deliveryMode,
            buyerCompanyId: buyerCompany.id,
            sellerCompanyId: sellerCompany.id,
            productId: product.id,
            quantity,
            goodsCostMinor,
            logisticsCostMinor,
            totalPriceMinor,
            unitCostMinor: quantity > 0 ? sanitizeMoney(totalPriceMinor / quantity) : 0,
            status: purchase.status
        }
    });
    if (shipment) {
        input.events.push({
            id: `${input.seed}-event-${input.tick}-${command.commandId}-shipment-created`,
            tick: input.tick,
            type: "ShipmentCreatedEvent",
            message: `Shipment ${shipment.id} is moving ${quantity} units of ${product.name} to ${buyerWarehouse.name}.`,
            entityIds: [shipment.id, shipment.originWarehouseId, shipment.destinationWarehouseId, shipment.productId],
            metadata: {
                commandId: command.commandId,
                purchaseId: purchase.id,
                shipmentId: shipment.id,
                routeId: shipment.routeId,
                transportCompanyId: shipment.transportCompanyId,
                status: shipment.status,
                remainingTicks: shipment.remainingTicks
            }
        });
    }
    input.metrics.push({
        id: `${input.seed}-metric-${input.tick}-${command.commandId}-resource-purchase`,
        tick: input.tick,
        name: deliveryMode === "delivery" ? "resource.purchase.ordered.quantity" : "resource.purchase.quantity",
        value: quantity,
        tags: {
            productId: product.id,
            buyerCompanyId: buyerCompany.id,
            sellerCompanyId: sellerCompany.id,
            deliveryMode,
            status: purchase.status
        }
    });
    if (shipment) {
        input.metrics.push({
            id: `${input.seed}-metric-${input.tick}-${command.commandId}-shipment-created`,
            tick: input.tick,
            name: "logistics.shipment.created",
            value: quantity,
            tags: {
                shipmentId: shipment.id,
                routeId: shipment.routeId,
                productId: product.id,
                status: shipment.status
            }
        });
    }
    input.news.push({
        id: `${input.seed}-news-${input.tick}-${command.commandId}-resource-purchased`,
        tick: input.tick,
        category: "corporate",
        templateId: null,
        headline: deliveryMode === "delivery" ? `${buyerCompany.name} orders ${product.name} shipment` : `${buyerCompany.name} secures ${product.name}`,
        body: deliveryMode === "delivery"
            ? `${quantity} units are ordered from ${sellerWarehouse.name}; production can use them only after shipment delivery to ${buyerWarehouse.name}.`
            : `${quantity} units moved from ${sellerWarehouse.name} to ${buyerWarehouse.name} through a local pickup resource purchase.`,
        severity: deliveryMode === "delivery" ? "warning" : "info",
        relatedEntityIds: [buyerCompany.id, sellerCompany.id, product.id, ...(shipment ? [shipment.id] : [])],
        reliabilityId: null
    });
    return { purchase, shipment };
}
function applyRunManualProductionCommand(input, command) {
    const requestedQuantity = sanitizeQuantity(command.requestedQuantity);
    const company = input.companies.find((candidate) => candidate.id === command.companyId);
    const plan = input.productionPlans.find((candidate) => candidate.id === command.productionPlanId && candidate.companyId === command.companyId);
    if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
        throw new Error("PLAYER_COMPANY_REQUIRED");
    }
    if (!plan) {
        throw new Error("UNKNOWN_PRODUCTION_PLAN");
    }
    if (requestedQuantity <= 0) {
        throw new Error("INVALID_PRODUCTION_QUANTITY");
    }
    const warehouse = input.warehouses.find((candidate) => candidate.id === plan.warehouseId && candidate.companyId === company.id);
    const outputProduct = input.state.products.find((candidate) => candidate.id === plan.outputProductId);
    if (!warehouse) {
        throw new Error("PRODUCTION_WAREHOUSE_REQUIRED");
    }
    if (!outputProduct) {
        throw new Error("UNKNOWN_PRODUCT");
    }
    if (requiresIndustryLicense(input.state, company, outputProduct.category) && !hasActiveIndustryLicense(input.state, company, outputProduct.category)) {
        throw new Error("COMPANY_LICENSE_REQUIRED");
    }
    const inputEfficiency = getTechnologyEffectForCompany({
        technologies: input.state.technologies,
        technologyLevels: input.state.technologyLevels
    }, company, outputProduct, "inputEfficiency");
    const outputLimit = sanitizeQuantity(Math.min(requestedQuantity, plan.outputQuantityPerTick));
    const maxOutputByInputs = plan.inputs.reduce((maxOutput, productionInput) => {
        const available = getAvailableQuantity(input.inventoryLots, plan.warehouseId, productionInput.productId);
        const adjustedQuantityPerOutput = getAdjustedInputQuantityPerOutput(productionInput.quantityPerOutput, inputEfficiency);
        const inputLimitedOutput = adjustedQuantityPerOutput > 0 ? Math.floor(available / adjustedQuantityPerOutput) : maxOutput;
        return Math.min(maxOutput, inputLimitedOutput);
    }, outputLimit);
    const producedQuantity = sanitizeQuantity(maxOutputByInputs);
    if (producedQuantity <= 0) {
        throw new Error("INSUFFICIENT_PRODUCTION_INPUTS");
    }
    const inputConsumptions = [];
    let inputCostMinor = 0;
    for (const productionInput of plan.inputs) {
        const adjustedQuantityPerOutput = getAdjustedInputQuantityPerOutput(productionInput.quantityPerOutput, inputEfficiency);
        const requestedInputQuantity = Math.ceil(producedQuantity * adjustedQuantityPerOutput);
        const consumed = consumeInventoryWithCost(input.inventoryLots, plan.warehouseId, productionInput.productId, requestedInputQuantity);
        const unitCostMinor = consumed.quantity > 0 ? sanitizeMoney(consumed.totalCostMinor / consumed.quantity) : 0;
        inputCostMinor += consumed.totalCostMinor;
        inputConsumptions.push({
            productId: productionInput.productId,
            quantity: consumed.quantity,
            unitCostMinor,
            totalCostMinor: consumed.totalCostMinor
        });
    }
    const outputTotalCostMinor = sanitizeMoney(inputCostMinor);
    const outputUnitCostMinor = producedQuantity > 0 ? sanitizeMoney(outputTotalCostMinor / producedQuantity) : 0;
    addInventory({
        inventoryLots: input.inventoryLots,
        warehouseId: plan.warehouseId,
        productId: plan.outputProductId,
        quantity: producedQuantity,
        quality: outputProduct.baseQuality,
        lotId: `${input.seed}-lot-${input.tick}-${command.commandId}-manual-output`,
        unitCostMinor: outputUnitCostMinor,
        totalCostMinor: outputTotalCostMinor,
        costSourceType: "production",
        costSourceId: `${input.seed}-production-run-${input.tick}-${command.commandId}`
    });
    const productionRun = {
        id: `${input.seed}-production-run-${input.tick}-${command.commandId}`,
        tick: input.tick,
        playerId: command.playerId,
        companyId: company.id,
        productionPlanId: plan.id,
        warehouseId: warehouse.id,
        outputProductId: outputProduct.id,
        requestedQuantity,
        producedQuantity,
        inputConsumptions,
        inputCostMinor: outputTotalCostMinor,
        outputUnitCostMinor,
        outputTotalCostMinor,
        status: "completed"
    };
    input.events.push({
        id: `${input.seed}-event-${input.tick}-${command.commandId}-manual-production`,
        tick: input.tick,
        type: "ManualProductionRunEvent",
        message: `${company.name} produced ${producedQuantity} units of ${outputProduct.name}.`,
        entityIds: [productionRun.id, company.id, warehouse.id, outputProduct.id],
        metadata: {
            commandId: command.commandId,
            productionRunId: productionRun.id,
            companyId: company.id,
            productId: outputProduct.id,
            requestedQuantity,
            producedQuantity,
            inputCostMinor: outputTotalCostMinor,
            outputUnitCostMinor,
            outputTotalCostMinor
        }
    });
    input.metrics.push({
        id: `${input.seed}-metric-${input.tick}-${command.commandId}-manual-production`,
        tick: input.tick,
        name: "production.manual.output.quantity",
        value: producedQuantity,
        tags: {
            companyId: company.id,
            productId: outputProduct.id,
            planId: plan.id
        }
    }, {
        id: `${input.seed}-metric-${input.tick}-${command.commandId}-manual-production-input-cost`,
        tick: input.tick,
        name: "production.manual.input_cost_minor",
        value: outputTotalCostMinor,
        tags: {
            companyId: company.id,
            productId: outputProduct.id,
            planId: plan.id
        }
    }, {
        id: `${input.seed}-metric-${input.tick}-${command.commandId}-manual-production-unit-cost`,
        tick: input.tick,
        name: "production.manual.output_unit_cost_minor",
        value: outputUnitCostMinor,
        tags: {
            companyId: company.id,
            productId: outputProduct.id,
            planId: plan.id
        }
    });
    input.news.push({
        id: `${input.seed}-news-${input.tick}-${command.commandId}-manual-production`,
        tick: input.tick,
        category: "corporate",
        templateId: null,
        headline: `${company.name} starts production`,
        body: `${producedQuantity} units of ${outputProduct.name} were produced through a tick command from player-owned warehouse inventory at an allocated unit cost of ${outputUnitCostMinor} minor units.`,
        severity: "info",
        relatedEntityIds: [company.id, outputProduct.id, warehouse.id],
        reliabilityId: null
    });
    return { productionRun };
}
function applyRetailPriceUpdate(input) {
    const priceMinor = sanitizeMoney(input.input.priceMinor);
    const company = input.state.companies.find((candidate) => candidate.id === input.input.companyId);
    if (priceMinor <= 0 || priceMinor > 1_000_000_000) {
        throw new Error("INVALID_RETAIL_PRICE");
    }
    if (!company || company.ownerType !== "player" || company.ownerId !== input.input.playerId || company.legalStatus !== "registered") {
        throw new Error("PLAYER_COMPANY_REQUIRED");
    }
    if (input.input.currencyCode && input.input.currencyCode !== company.currencyCode) {
        throw new Error("PRICE_CURRENCY_MISMATCH");
    }
    const offer = input.input.retailOfferId
        ? input.retailOffers.find((candidate) => candidate.id === input.input.retailOfferId)
        : input.retailOffers.find((candidate) => candidate.companyId === company.id && candidate.productId === input.input.productId);
    if (!offer || !offer.active) {
        throw new Error("UNKNOWN_RETAIL_OFFER");
    }
    if (offer.companyId !== company.id || (input.input.productId && offer.productId !== input.input.productId)) {
        throw new Error("RETAIL_OFFER_OWNERSHIP_REQUIRED");
    }
    const product = input.state.products.find((candidate) => candidate.id === offer.productId);
    const warehouse = input.state.warehouses.find((candidate) => candidate.id === offer.warehouseId);
    if (!product) {
        throw new Error("UNKNOWN_PRODUCT");
    }
    if (!warehouse || warehouse.companyId !== company.id) {
        throw new Error("RETAIL_OFFER_WAREHOUSE_REQUIRED");
    }
    const oldPriceMinor = sanitizeMoney(offer.priceMinor);
    offer.priceMinor = priceMinor;
    const priceChange = {
        id: `${input.seed}-retail-price-change-${input.tick}-${input.retailPriceChanges.length + 1}`,
        tick: input.tick,
        playerId: input.input.playerId,
        companyId: company.id,
        retailOfferId: offer.id,
        productId: product.id,
        oldPriceMinor,
        newPriceMinor: priceMinor,
        currencyCode: company.currencyCode,
        status: "applied"
    };
    input.retailPriceChanges.push(priceChange);
    input.events.push({
        id: `${input.seed}-event-${input.tick}-${priceChange.id}`,
        tick: input.tick,
        type: "RetailPriceChangedEvent",
        message: `${company.name} changed ${product.name} retail price from ${oldPriceMinor} to ${priceMinor}.`,
        entityIds: [company.id, product.id, offer.id],
        metadata: {
            commandId: input.input.commandId ?? "",
            priceChangeId: priceChange.id,
            companyId: company.id,
            productId: product.id,
            oldPriceMinor,
            newPriceMinor: priceMinor
        }
    });
    input.metrics.push({
        id: `${input.seed}-metric-${input.tick}-${priceChange.id}`,
        tick: input.tick,
        name: "retail.price.changed_minor",
        value: priceMinor,
        tags: {
            companyId: company.id,
            productId: product.id,
            retailOfferId: offer.id
        }
    });
    input.news.push({
        id: `${input.seed}-news-${input.tick}-${priceChange.id}`,
        tick: input.tick,
        category: "corporate",
        templateId: null,
        headline: `${company.name} reprices ${product.name}`,
        body: `The retail offer moved from ${oldPriceMinor} to ${priceMinor} after backend validation.`,
        severity: priceMinor > oldPriceMinor * 1.25 ? "warning" : "info",
        relatedEntityIds: [company.id, product.id, offer.id],
        reliabilityId: null
    });
    return {
        retailOffer: { ...offer },
        priceChange
    };
}
function validateCommand(state, command) {
    if (command.type === "CreateCompanyCommand") {
        const countryExists = state.countries.some((country) => country.id === command.countryId);
        const normalizedName = command.name.trim();
        const nameExists = state.companies.some((company) => company.countryId === command.countryId && company.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase());
        if (!countryExists) {
            return {
                commandId: command.commandId,
                code: "UNKNOWN_COUNTRY",
                message: "Company cannot be registered in an unknown country."
            };
        }
        if (normalizedName.length < 2) {
            return {
                commandId: command.commandId,
                code: "INVALID_COMPANY_NAME",
                message: "Company name must contain at least two visible characters."
            };
        }
        return nameExists
            ? {
                commandId: command.commandId,
                code: "COMPANY_NAME_TAKEN",
                message: "Company name is already registered in this country."
            }
            : null;
    }
    if (command.type === "BuyLandCommand") {
        const city = state.cities.find((candidate) => candidate.id === command.cityId);
        const company = state.companies.find((candidate) => candidate.id === command.companyId);
        if (!city) {
            return {
                commandId: command.commandId,
                code: "UNKNOWN_CITY",
                message: "Land cannot be bought in an unknown city."
            };
        }
        if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
            return {
                commandId: command.commandId,
                code: "PLAYER_COMPANY_REQUIRED",
                message: "Land can only be acquired for a registered player company."
            };
        }
        if (city.countryId !== company.countryId) {
            return {
                commandId: command.commandId,
                code: "CITY_COMPANY_COUNTRY_MISMATCH",
                message: "Company premises must be acquired in the company's registration country for the prototype."
            };
        }
        if (state.warehouses.some((warehouse) => warehouse.companyId === company.id && warehouse.cityId === city.id)) {
            return {
                commandId: command.commandId,
                code: "COMPANY_PREMISE_ALREADY_EXISTS",
                message: "The company already has a premise in this city."
            };
        }
        const requestedPremise = state.premises.find((premise) => premise.id === (command.premiseId ?? command.lotId)) ?? null;
        const requestedParcelId = command.landParcelId ?? requestedPremise?.landParcelId ?? command.lotId;
        const requestedParcel = state.landParcels.find((parcel) => parcel.id === requestedParcelId) ?? null;
        const candidatePremise = requestedPremise ?? state.premises.find((premise) => premise.cityId === city.id && premise.status === "available") ?? null;
        const candidateParcel = requestedParcel ?? (candidatePremise ? state.landParcels.find((parcel) => parcel.id === candidatePremise.landParcelId) ?? null : null);
        if (!candidatePremise && !candidateParcel) {
            return {
                commandId: command.commandId,
                code: "LAND_OR_PREMISE_NOT_AVAILABLE",
                message: "No available land parcel or premise was found for this command."
            };
        }
        if (candidateParcel && (candidateParcel.cityId !== city.id || candidateParcel.countryId !== company.countryId)) {
            return {
                commandId: command.commandId,
                code: "LAND_CITY_COUNTRY_MISMATCH",
                message: "Selected land must be in the target city and company country."
            };
        }
        if (candidateParcel && candidateParcel.status !== "available") {
            return {
                commandId: command.commandId,
                code: "LAND_PARCEL_NOT_AVAILABLE",
                message: "Selected land parcel is not available."
            };
        }
        const zoning = candidatePremise?.zoning ?? candidateParcel?.zoning;
        if (zoning && !isStarterBusinessZoningAllowed(zoning)) {
            return {
                commandId: command.commandId,
                code: "ZONING_NOT_ALLOWED",
                message: "The selected zoning does not allow the starter retail/food business."
            };
        }
        return null;
    }
    if (command.type === "BuyResourceCommand") {
        const quantity = sanitizeQuantity(command.quantity);
        const maxUnitPriceMinor = sanitizeMoney(command.maxUnitPriceMinor);
        const offer = state.resourceOffers.find((candidate) => candidate.id === command.resourceOfferId);
        const buyerCompany = state.companies.find((candidate) => candidate.id === command.buyerCompanyId);
        if (!offer || !offer.active) {
            return {
                commandId: command.commandId,
                code: "UNKNOWN_OR_INACTIVE_RESOURCE_OFFER",
                message: "Resource purchase needs an active resource offer."
            };
        }
        if (quantity <= 0 || maxUnitPriceMinor <= 0) {
            return {
                commandId: command.commandId,
                code: "INVALID_RESOURCE_PURCHASE",
                message: "Resource purchase quantity and max price must be positive."
            };
        }
        if (!buyerCompany || buyerCompany.ownerType !== "player" || buyerCompany.ownerId !== command.playerId || buyerCompany.legalStatus !== "registered") {
            return {
                commandId: command.commandId,
                code: "PLAYER_COMPANY_REQUIRED",
                message: "Resource purchase requires a registered player company."
            };
        }
        if (command.buyerWarehouseId && !state.warehouses.some((warehouse) => warehouse.id === command.buyerWarehouseId && warehouse.companyId === buyerCompany.id)) {
            return {
                commandId: command.commandId,
                code: "BUYER_WAREHOUSE_REQUIRED",
                message: "Resource purchase needs a warehouse owned by the buyer company."
            };
        }
        if (command.deliveryMode && command.deliveryMode !== "pickup" && command.deliveryMode !== "delivery") {
            return {
                commandId: command.commandId,
                code: "INVALID_RESOURCE_DELIVERY_MODE",
                message: "Resource purchase deliveryMode must be pickup or delivery."
            };
        }
        if (command.deliveryMode === "delivery") {
            const buyerWarehouse = command.buyerWarehouseId
                ? state.warehouses.find((warehouse) => warehouse.id === command.buyerWarehouseId && warehouse.companyId === buyerCompany.id)
                : state.warehouses.find((warehouse) => warehouse.companyId === buyerCompany.id);
            const quote = buyerWarehouse
                ? resolveShipmentQuote(state, {
                    originWarehouseId: offer.warehouseId,
                    destinationWarehouseId: buyerWarehouse.id,
                    productId: offer.productId,
                    quantity,
                    routeId: command.routeId,
                    transportCompanyId: command.transportCompanyId
                })
                : null;
            if (!quote) {
                return {
                    commandId: command.commandId,
                    code: "LOGISTICS_ROUTE_REQUIRED",
                    message: "Delivery resource purchase requires an available logistics route."
                };
            }
            if (quote.blockedReason) {
                return {
                    commandId: command.commandId,
                    code: "LOGISTICS_ROUTE_BLOCKED",
                    message: `Delivery route is blocked: ${quote.blockedReason}`
                };
            }
        }
        return null;
    }
    if (command.type === "RunManualProductionCommand") {
        const requestedQuantity = sanitizeQuantity(command.requestedQuantity);
        const company = state.companies.find((candidate) => candidate.id === command.companyId);
        const plan = state.productionPlans.find((candidate) => candidate.id === command.productionPlanId && candidate.companyId === command.companyId);
        if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
            return {
                commandId: command.commandId,
                code: "PLAYER_COMPANY_REQUIRED",
                message: "Manual production requires a registered player company."
            };
        }
        if (!plan) {
            return {
                commandId: command.commandId,
                code: "UNKNOWN_PRODUCTION_PLAN",
                message: "Manual production requires an existing production plan."
            };
        }
        if (requestedQuantity <= 0) {
            return {
                commandId: command.commandId,
                code: "INVALID_PRODUCTION_QUANTITY",
                message: "Manual production quantity must be positive."
            };
        }
        const warehouse = state.warehouses.find((candidate) => candidate.id === plan.warehouseId && candidate.companyId === company.id);
        if (!warehouse) {
            return {
                commandId: command.commandId,
                code: "PRODUCTION_WAREHOUSE_REQUIRED",
                message: "Manual production requires the company's production warehouse."
            };
        }
        const inputProductIds = new Set(plan.inputs.map((productionInput) => productionInput.productId));
        const inboundInputShipments = state.shipments.filter((shipment) => shipment.status === "in_transit" &&
            shipment.destinationWarehouseId === plan.warehouseId &&
            inputProductIds.has(shipment.productId));
        if (inboundInputShipments.length > 0) {
            return {
                commandId: command.commandId,
                code: "INPUT_SHIPMENT_IN_TRANSIT",
                message: "Manual production is blocked until inbound input shipments are delivered."
            };
        }
        const outputLimit = sanitizeQuantity(Math.min(requestedQuantity, plan.outputQuantityPerTick));
        const maxOutputByInputs = plan.inputs.reduce((maxOutput, productionInput) => {
            const available = getAvailableQuantity(state.inventoryLots, plan.warehouseId, productionInput.productId);
            const inputLimitedOutput = productionInput.quantityPerOutput > 0 ? Math.floor(available / productionInput.quantityPerOutput) : maxOutput;
            return Math.min(maxOutput, inputLimitedOutput);
        }, outputLimit);
        return maxOutputByInputs > 0
            ? null
            : {
                commandId: command.commandId,
                code: "INSUFFICIENT_PRODUCTION_INPUTS",
                message: "Manual production requires delivered input inventory in the production warehouse."
            };
    }
    if (command.type === "SetRetailPriceCommand") {
        const priceMinor = sanitizeMoney(command.priceMinor);
        const company = state.companies.find((candidate) => candidate.id === command.companyId);
        const productExists = state.products.some((product) => product.id === command.productId);
        const offer = state.retailOffers.find((candidate) => candidate.companyId === command.companyId && candidate.productId === command.productId);
        if (priceMinor <= 0 || priceMinor > 1_000_000_000) {
            return {
                commandId: command.commandId,
                code: "INVALID_RETAIL_PRICE",
                message: "Retail price must be positive and finite."
            };
        }
        if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
            return {
                commandId: command.commandId,
                code: "PLAYER_COMPANY_REQUIRED",
                message: "Retail price can only be changed for a registered player company."
            };
        }
        if (company.currencyCode !== command.currencyCode) {
            return {
                commandId: command.commandId,
                code: "PRICE_CURRENCY_MISMATCH",
                message: "Retail price currency must match the company currency."
            };
        }
        if (!productExists) {
            return {
                commandId: command.commandId,
                code: "UNKNOWN_PRODUCT",
                message: "Retail price cannot be set for an unknown product."
            };
        }
        if (!offer || !offer.active) {
            return {
                commandId: command.commandId,
                code: "UNKNOWN_RETAIL_OFFER",
                message: "Retail price cannot be set without an active company offer."
            };
        }
        const warehouse = state.warehouses.find((candidate) => candidate.id === offer.warehouseId);
        return warehouse?.companyId === company.id
            ? null
            : {
                commandId: command.commandId,
                code: "RETAIL_OFFER_WAREHOUSE_REQUIRED",
                message: "Retail offer warehouse must belong to the player company."
            };
    }
    return null;
}
function addGameHours(isoDate, hours) {
    const date = new Date(isoDate);
    date.setUTCHours(date.getUTCHours() + hours);
    return date.toISOString();
}
function processProduction(context) {
    for (const plan of context.state.productionPlans) {
        if (!plan.active) {
            continue;
        }
        const company = context.companies.find((candidate) => candidate.id === plan.companyId);
        const warehouse = context.state.warehouses.find((candidate) => candidate.id === plan.warehouseId);
        const product = context.state.products.find((candidate) => candidate.id === plan.outputProductId);
        if (!company || !warehouse || !product || company.legalStatus !== "registered") {
            continue;
        }
        const inputEfficiency = getTechnologyEffectForCompany(context, company, product, "inputEfficiency");
        const maxOutputByInputs = plan.inputs.reduce((maxOutput, input) => {
            const available = getAvailableQuantity(context.inventoryLots, plan.warehouseId, input.productId);
            const adjustedQuantityPerOutput = getAdjustedInputQuantityPerOutput(input.quantityPerOutput, inputEfficiency);
            const inputLimitedOutput = adjustedQuantityPerOutput > 0 ? Math.floor(available / adjustedQuantityPerOutput) : maxOutput;
            return Math.min(maxOutput, inputLimitedOutput);
        }, sanitizeQuantity(plan.outputQuantityPerTick));
        const outputQuantity = sanitizeQuantity(maxOutputByInputs);
        if (outputQuantity <= 0) {
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${plan.id}-production-stalled`,
                tick: context.nextTick,
                type: "ProductionStalledEvent",
                message: `${company.name} could not produce ${product.name} because inputs were unavailable.`,
                entityIds: [company.id, product.id],
                metadata: {
                    companyId: company.id,
                    productId: product.id,
                    planId: plan.id
                }
            });
            continue;
        }
        let inputCostMinor = 0;
        for (const input of plan.inputs) {
            const adjustedQuantityPerOutput = getAdjustedInputQuantityPerOutput(input.quantityPerOutput, inputEfficiency);
            const requestedQuantity = Math.ceil(outputQuantity * adjustedQuantityPerOutput);
            const consumed = consumeInventoryWithCost(context.inventoryLots, plan.warehouseId, input.productId, requestedQuantity);
            inputCostMinor += consumed.totalCostMinor;
            if (consumed.quantity > 0) {
                context.metrics.push({
                    id: `${context.seed}-metric-${context.nextTick}-${plan.id}-${input.productId}-input-consumed`,
                    tick: context.nextTick,
                    name: "production.input.consumed.quantity",
                    value: consumed.quantity,
                    tags: {
                        companyId: company.id,
                        productId: input.productId,
                        outputProductId: product.id,
                        planId: plan.id
                    }
                }, {
                    id: `${context.seed}-metric-${context.nextTick}-${plan.id}-${input.productId}-input-cost`,
                    tick: context.nextTick,
                    name: "production.input.consumed_cost_minor",
                    value: consumed.totalCostMinor,
                    tags: {
                        companyId: company.id,
                        productId: input.productId,
                        outputProductId: product.id,
                        planId: plan.id
                    }
                });
            }
        }
        const outputTotalCostMinor = sanitizeMoney(inputCostMinor);
        const outputUnitCostMinor = outputQuantity > 0 ? sanitizeMoney(outputTotalCostMinor / outputQuantity) : 0;
        addInventory({
            inventoryLots: context.inventoryLots,
            warehouseId: plan.warehouseId,
            productId: plan.outputProductId,
            quantity: outputQuantity,
            quality: product.baseQuality,
            lotId: `${context.seed}-lot-${context.nextTick}-${plan.id}-output`,
            unitCostMinor: outputUnitCostMinor,
            totalCostMinor: outputTotalCostMinor,
            costSourceType: "production",
            costSourceId: plan.id
        });
        context.events.push({
            id: `${context.seed}-event-${context.nextTick}-${plan.id}-product-produced`,
            tick: context.nextTick,
            type: "ProductProducedEvent",
            message: `${company.name} produced ${outputQuantity} units of ${product.name}.`,
            entityIds: [company.id, product.id, warehouse.id],
            metadata: {
                companyId: company.id,
                productId: product.id,
                warehouseId: warehouse.id,
                quantity: outputQuantity,
                inputCostMinor: outputTotalCostMinor,
                outputUnitCostMinor,
                outputTotalCostMinor
            }
        });
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${plan.id}-production-output`,
            tick: context.nextTick,
            name: "production.output.quantity",
            value: outputQuantity,
            tags: {
                companyId: company.id,
                productId: product.id
            }
        });
        if (inputEfficiency > 0) {
            context.metrics.push({
                id: `${context.seed}-metric-${context.nextTick}-${plan.id}-technology-input-efficiency`,
                tick: context.nextTick,
                name: "technology.production.input_efficiency",
                value: inputEfficiency,
                tags: {
                    companyId: company.id,
                    productId: product.id
                }
            });
        }
    }
}
function getAdjustedInputQuantityPerOutput(quantityPerOutput, inputEfficiency) {
    const baseQuantity = Math.max(0, quantityPerOutput);
    if (baseQuantity <= 0) {
        return 0;
    }
    return Math.max(0.000001, baseQuantity * (1 - clamp(inputEfficiency, 0, 0.55)));
}
function getTechnologyEffectForCompany(context, company, product, effectKey) {
    const levels = context.technologyLevels.filter((level) => {
        if (!level.unlocked) {
            return false;
        }
        if (level.scopeType === "company") {
            return level.scopeId === company.id;
        }
        if (level.scopeType === "country") {
            return level.scopeId === company.countryId;
        }
        return level.scopeId === product.category || level.scopeId === product.needCategory || level.scopeId === "all";
    });
    return clamp(levels.reduce((total, level) => {
        const technology = context.technologies.find((candidate) => candidate.id === level.technologyId);
        if (!technology || !technologyMatchesProduct(technology, product)) {
            return total;
        }
        return total + Math.max(0, technology.effects[effectKey]) * clamp(level.level, 0, 5);
    }, 0), 0, effectKey === "inputEfficiency" || effectKey === "pollutionReduction" ? 0.55 : 1);
}
function technologyMatchesProduct(technology, product) {
    return (technology.industry === "all" ||
        technology.industry === product.category ||
        technology.industry === product.needCategory ||
        (technology.domain === "production" && technology.industry === product.category) ||
        (technology.domain === "energy" && product.category === "energy") ||
        (technology.domain === "medicine" && product.needCategory === "medicine") ||
        (technology.domain === "logistics" && product.needCategory === "transport") ||
        (technology.domain === "weapons" && product.id.toLocaleLowerCase().includes("ammunition")));
}
function processTechnologyAndEcology(context) {
    processResearchProjects(context);
    applyTechnologyLicenses(context);
    processResourceDeposits(context);
    processIndustrialPollution(context);
    applyEnvironmentalPressure(context);
}
function processResearchProjects(context) {
    for (const project of context.researchProjects) {
        if (project.status !== "active") {
            continue;
        }
        const technology = context.technologies.find((candidate) => candidate.id === project.technologyId);
        const company = project.companyId ? context.companies.find((candidate) => candidate.id === project.companyId) : null;
        if (!technology || (project.companyId && !company)) {
            continue;
        }
        const availableMinor = company ? Math.min(company.cashBalanceMinor, project.fundingPerTickMinor) : project.fundingPerTickMinor;
        const spendMinor = sanitizeMoney(availableMinor);
        if (spendMinor <= 0) {
            context.metrics.push({
                id: `${context.seed}-metric-${context.nextTick}-${project.id}-research-stalled`,
                tick: context.nextTick,
                name: "technology.research.stalled",
                value: 1,
                tags: {
                    projectId: project.id,
                    technologyId: project.technologyId
                }
            });
            continue;
        }
        if (company) {
            company.cashBalanceMinor = sanitizeMoney(company.cashBalanceMinor - spendMinor);
            const companyAccount = context.bankAccounts.find((account) => account.ownerType === "company" && account.ownerId === company.id && account.status === "active");
            if (companyAccount) {
                companyAccount.balanceMinor = sanitizeMoney(companyAccount.balanceMinor - spendMinor);
            }
            context.financialTransactions.push({
                id: `${context.seed}-tx-${context.nextTick}-research-${context.financialTransactions.length + 1}`,
                tick: context.nextTick,
                type: "ResearchInvestmentTransaction",
                entries: [
                    {
                        ownerType: "company",
                        ownerId: company.id,
                        amountMinor: -spendMinor,
                        currencyCode: company.currencyCode
                    },
                    {
                        ownerType: "market_sink",
                        ownerId: `${project.countryId}-research-labs`,
                        amountMinor: spendMinor,
                        currencyCode: company.currencyCode
                    }
                ]
            });
        }
        const researchMultiplier = 1 + getCountryTechnologyEffect(context, project.countryId, "educationBonus");
        project.accumulatedResearch = sanitizeMoney(project.accumulatedResearch + spendMinor * researchMultiplier);
        project.requiredResearch = sanitizeMoney(project.requiredResearch);
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${project.id}-research-spend`,
            tick: context.nextTick,
            name: "technology.research.spend_minor",
            value: spendMinor,
            tags: {
                projectId: project.id,
                technologyId: project.technologyId
            }
        }, {
            id: `${context.seed}-metric-${context.nextTick}-${project.id}-research-progress`,
            tick: context.nextTick,
            name: "technology.research.progress",
            value: project.requiredResearch > 0 ? clamp(project.accumulatedResearch / project.requiredResearch, 0, 1) : 1,
            tags: {
                projectId: project.id,
                technologyId: project.technologyId
            }
        });
        if (project.accumulatedResearch >= project.requiredResearch) {
            project.status = "completed";
            project.completedTick = context.nextTick;
            upsertTechnologyLevel({
                levels: context.technologyLevels,
                seed: context.seed,
                nextTick: context.nextTick,
                technologyId: project.technologyId,
                scopeType: project.targetScopeType,
                scopeId: project.targetScopeId,
                level: 1,
                progress: 1
            });
            if (technology.accessModel === "patent" && !context.patents.some((patent) => patent.technologyId === technology.id && patent.active)) {
                context.patents.push({
                    id: `${context.seed}-patent-${context.nextTick}-${slugify(technology.name)}`,
                    technologyId: technology.id,
                    ownerType: project.ownerType,
                    ownerId: project.ownerId,
                    countryId: project.countryId,
                    filedTick: context.nextTick,
                    expiresTick: context.nextTick + 8_760,
                    active: true
                });
            }
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${project.id}-completed`,
                tick: context.nextTick,
                type: "TechnologyUnlockedEvent",
                message: `${project.name} unlocked ${technology.name}.`,
                entityIds: [project.id, technology.id, project.targetScopeId],
                metadata: {
                    projectId: project.id,
                    technologyId: technology.id,
                    scopeType: project.targetScopeType,
                    scopeId: project.targetScopeId
                }
            });
            context.metrics.push({
                id: `${context.seed}-metric-${context.nextTick}-${project.id}-research-completed`,
                tick: context.nextTick,
                name: "technology.research.completed",
                value: 1,
                tags: {
                    projectId: project.id,
                    technologyId: technology.id,
                    scopeType: project.targetScopeType
                }
            });
        }
    }
}
function applyTechnologyLicenses(context) {
    for (const agreement of context.licenseAgreements) {
        if (agreement.status !== "active" || (agreement.expiresTick !== null && agreement.expiresTick < context.nextTick)) {
            continue;
        }
        const technology = context.technologies.find((candidate) => candidate.id === agreement.technologyId);
        if (!technology) {
            continue;
        }
        const existing = context.technologyLevels.find((level) => level.technologyId === agreement.technologyId && level.scopeType === agreement.scopeType && level.scopeId === agreement.scopeId);
        if (!existing || !existing.unlocked) {
            upsertTechnologyLevel({
                levels: context.technologyLevels,
                seed: context.seed,
                nextTick: context.nextTick,
                technologyId: agreement.technologyId,
                scopeType: agreement.scopeType,
                scopeId: agreement.scopeId,
                level: 0.25,
                progress: 1
            });
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${agreement.id}-license-diffused`,
                tick: context.nextTick,
                type: "TechnologyLicenseDiffusedEvent",
                message: `${technology.name} diffused through a license agreement.`,
                entityIds: [agreement.id, technology.id, agreement.scopeId],
                metadata: {
                    agreementId: agreement.id,
                    technologyId: technology.id,
                    scopeId: agreement.scopeId
                }
            });
        }
    }
}
function processResourceDeposits(context) {
    const consumedByProduct = new Map();
    for (const metric of context.metrics) {
        if (metric.tick !== context.nextTick || metric.name !== "production.input.consumed.quantity") {
            continue;
        }
        const productId = metric.tags.productId;
        if (!productId) {
            continue;
        }
        consumedByProduct.set(productId, (consumedByProduct.get(productId) ?? 0) + metric.value);
    }
    for (const deposit of context.resourceDeposits) {
        if (deposit.status === "active" && deposit.productId) {
            const consumedQuantity = consumedByProduct.get(deposit.productId) ?? 0;
            const extractedQuantity = sanitizeQuantity(Math.min(deposit.quantity, deposit.extractionPerTick, consumedQuantity));
            if (extractedQuantity > 0) {
                deposit.quantity = sanitizeQuantity(deposit.quantity - extractedQuantity);
                context.metrics.push({
                    id: `${context.seed}-metric-${context.nextTick}-${deposit.id}-resource-depleted`,
                    tick: context.nextTick,
                    name: "ecology.resource.depleted.quantity",
                    value: extractedQuantity,
                    tags: {
                        depositId: deposit.id,
                        productId: deposit.productId
                    }
                });
                if (deposit.quantity <= 0) {
                    deposit.status = "depleted";
                    context.events.push({
                        id: `${context.seed}-event-${context.nextTick}-${deposit.id}-depleted`,
                        tick: context.nextTick,
                        type: "ResourceDepositDepletedEvent",
                        message: `${deposit.name} has been depleted.`,
                        entityIds: [deposit.id, deposit.countryId],
                        metadata: {
                            depositId: deposit.id,
                            countryId: deposit.countryId
                        }
                    });
                }
            }
        }
        if (deposit.status === "undiscovered") {
            const discoveryBonus = getCountryTechnologyEffect(context, deposit.countryId, "discoveryBonus");
            const chance = clamp(deposit.discoveryChance + discoveryBonus, 0, 0.95);
            const roll = deterministicFraction(`${context.seed}:${context.nextTick}:${deposit.id}`);
            if (roll < chance) {
                deposit.status = "active";
                const discovery = {
                    id: `${context.seed}-discovery-${context.nextTick}-${slugify(deposit.name)}`,
                    depositId: deposit.id,
                    countryId: deposit.countryId,
                    tick: context.nextTick,
                    discoveredBy: discoveryBonus > 0 ? "company_rd" : "state_survey",
                    quantity: deposit.quantity
                };
                context.resourceDiscoveries.push(discovery);
                context.events.push({
                    id: `${context.seed}-event-${context.nextTick}-${deposit.id}-discovered`,
                    tick: context.nextTick,
                    type: "ResourceDepositDiscoveredEvent",
                    message: `${deposit.name} was discovered.`,
                    entityIds: [deposit.id, deposit.countryId],
                    metadata: {
                        depositId: deposit.id,
                        countryId: deposit.countryId,
                        quantity: deposit.quantity
                    }
                });
                context.metrics.push({
                    id: `${context.seed}-metric-${context.nextTick}-${deposit.id}-resource-discovered`,
                    tick: context.nextTick,
                    name: "ecology.resource.discovered.quantity",
                    value: deposit.quantity,
                    tags: {
                        depositId: deposit.id,
                        countryId: deposit.countryId
                    }
                });
            }
        }
    }
}
function processIndustrialPollution(context) {
    for (const metric of context.metrics) {
        if (metric.tick !== context.nextTick || metric.name !== "production.output.quantity") {
            continue;
        }
        const companyId = metric.tags.companyId;
        const productId = metric.tags.productId;
        const company = context.companies.find((candidate) => candidate.id === companyId);
        const product = context.state.products.find((candidate) => candidate.id === productId);
        const warehouse = context.state.warehouses.find((candidate) => candidate.companyId === companyId);
        const city = context.cities.find((candidate) => candidate.id === warehouse?.cityId);
        if (!company || !product || !city) {
            continue;
        }
        const baseFactor = getPollutionFactor(product);
        const technologyReduction = getTechnologyEffectForCompany(context, company, product, "pollutionReduction");
        const policyReduction = context.cleanEnergyPolicies
            .filter((policy) => policy.countryId === company.countryId && policy.status === "active")
            .reduce((total, policy) => total + policy.pollutionReduction, 0);
        const amount = Math.round(metric.value * baseFactor * (1 - clamp(technologyReduction + policyReduction, 0, 0.8)) * 100) / 100;
        if (amount <= 0) {
            continue;
        }
        const pollutionRecord = {
            id: `${context.seed}-pollution-${context.nextTick}-${company.id}-${context.pollution.length + 1}`,
            cityId: city.id,
            countryId: city.countryId,
            sourceType: "production",
            sourceId: company.id,
            type: product.category === "energy" ? "carbon" : "air",
            amount,
            tick: context.nextTick
        };
        context.pollution.push(pollutionRecord);
        updateEnvironmentalIndex(context, city, amount, product.category === "energy" ? "carbon" : "air");
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${pollutionRecord.id}`,
            tick: context.nextTick,
            name: "ecology.pollution.amount",
            value: amount,
            tags: {
                cityId: city.id,
                companyId: company.id,
                productId: product.id,
                pollutionType: pollutionRecord.type
            }
        });
    }
}
function applyEnvironmentalPressure(context) {
    for (const index of context.environmentalIndexes) {
        const city = context.cities.find((candidate) => candidate.id === index.cityId);
        if (!city) {
            continue;
        }
        const cleanerDestination = context.cities
            .filter((candidate) => candidate.countryId === city.countryId && candidate.id !== city.id)
            .sort((left, right) => {
            const leftIndex = context.environmentalIndexes.find((candidate) => candidate.cityId === left.id);
            const rightIndex = context.environmentalIndexes.find((candidate) => candidate.cityId === right.id);
            return (rightIndex?.airQuality ?? 0.5) - (leftIndex?.airQuality ?? 0.5);
        })[0];
        const destinationCohort = cleanerDestination
            ? context.populationCohorts.find((cohort) => cohort.cityId === cleanerDestination.id)
            : null;
        for (const cohort of context.populationCohorts.filter((candidate) => candidate.cityId === city.id)) {
            const healthLossPeople = sanitizeQuantity(cohort.size * clamp(index.healthImpact, 0, 1) * 0.0002);
            const migratingPeople = sanitizeQuantity(cohort.size * clamp(index.migrationPressure, 0, 1) * 0.00035);
            const totalOutflow = Math.min(cohort.size, healthLossPeople + migratingPeople);
            if (totalOutflow <= 0 && index.healthImpact <= 0) {
                continue;
            }
            cohort.satisfaction = clamp(cohort.satisfaction - index.healthImpact * 0.015, 0, 1);
            if (totalOutflow > 0) {
                cohort.size = sanitizeQuantity(cohort.size - totalOutflow);
                city.populationTotal = sanitizeQuantity(city.populationTotal - totalOutflow);
                if (destinationCohort && cleanerDestination && migratingPeople > 0) {
                    const actualMigrants = Math.min(migratingPeople, totalOutflow);
                    destinationCohort.size = sanitizeQuantity(destinationCohort.size + actualMigrants);
                    cleanerDestination.populationTotal = sanitizeQuantity(cleanerDestination.populationTotal + actualMigrants);
                    context.metrics.push({
                        id: `${context.seed}-metric-${context.nextTick}-${cohort.id}-eco-migration`,
                        tick: context.nextTick,
                        name: "ecology.migration.people",
                        value: actualMigrants,
                        tags: {
                            originCityId: city.id,
                            destinationCityId: cleanerDestination.id
                        }
                    });
                }
                if (healthLossPeople > 0) {
                    context.metrics.push({
                        id: `${context.seed}-metric-${context.nextTick}-${cohort.id}-eco-health-loss`,
                        tick: context.nextTick,
                        name: "ecology.population.health_loss",
                        value: Math.min(healthLossPeople, totalOutflow),
                        tags: {
                            cityId: city.id,
                            cohortId: cohort.id
                        }
                    });
                }
            }
        }
        index.updatedTick = context.nextTick;
    }
}
function updateEnvironmentalIndex(context, city, amount, pollutionType) {
    let index = context.environmentalIndexes.find((candidate) => candidate.cityId === city.id);
    if (!index) {
        index = {
            id: `${context.seed}-environment-${city.id}`,
            cityId: city.id,
            countryId: city.countryId,
            airQuality: 0.75,
            waterQuality: 0.75,
            soilQuality: 0.75,
            carbonIntensity: 0.25,
            biodiversity: 0.7,
            healthImpact: 0.03,
            migrationPressure: 0.02,
            updatedTick: context.nextTick
        };
        context.environmentalIndexes.push(index);
    }
    const pressure = clamp(amount / 200_000, 0, 0.08);
    if (pollutionType === "air" || pollutionType === "carbon") {
        index.airQuality = clamp(index.airQuality - pressure, 0, 1);
    }
    if (pollutionType === "water") {
        index.waterQuality = clamp(index.waterQuality - pressure, 0, 1);
    }
    if (pollutionType === "soil") {
        index.soilQuality = clamp(index.soilQuality - pressure, 0, 1);
    }
    index.carbonIntensity = clamp(index.carbonIntensity + pressure * 0.8, 0, 1);
    index.biodiversity = clamp(index.biodiversity - pressure * 0.25, 0, 1);
    index.healthImpact = clamp(index.healthImpact + pressure * 0.6, 0, 1);
    index.migrationPressure = clamp(index.migrationPressure + pressure * 0.45, 0, 1);
    index.updatedTick = context.nextTick;
}
function getPollutionFactor(product) {
    if (product.category === "energy") {
        return 0.012;
    }
    if (product.category === "industrial") {
        return 0.009;
    }
    if (product.category === "food") {
        return 0.002;
    }
    return 0.001;
}
function getCountryTechnologyEffect(context, countryId, effectKey) {
    return clamp(context.technologyLevels
        .filter((level) => level.unlocked && level.scopeType === "country" && level.scopeId === countryId)
        .reduce((total, level) => {
        const technology = context.technologies.find((candidate) => candidate.id === level.technologyId);
        return total + (technology ? Math.max(0, technology.effects[effectKey]) * clamp(level.level, 0, 5) : 0);
    }, 0), 0, effectKey === "pollutionReduction" ? 0.7 : 1);
}
function upsertTechnologyLevel(input) {
    const existing = input.levels.find((level) => level.technologyId === input.technologyId && level.scopeType === input.scopeType && level.scopeId === input.scopeId);
    if (existing) {
        existing.level = Math.max(existing.level, clamp(input.level, 0, 5));
        existing.unlocked = true;
        existing.progress = Math.max(existing.progress, clamp(input.progress, 0, 1));
        existing.updatedTick = input.nextTick;
        return;
    }
    input.levels.push({
        id: `${input.seed}-tech-level-${input.nextTick}-${input.scopeType}-${slugify(input.scopeId)}-${slugify(input.technologyId)}`,
        technologyId: input.technologyId,
        scopeType: input.scopeType,
        scopeId: input.scopeId,
        level: clamp(input.level, 0, 5),
        unlocked: true,
        progress: clamp(input.progress, 0, 1),
        updatedTick: input.nextTick
    });
}
function processPopulationDemand(context) {
    for (const cohort of context.populationCohorts) {
        const city = context.state.cities.find((candidate) => candidate.id === cohort.cityId);
        if (!city) {
            continue;
        }
        let desiredTotal = 0;
        let purchasedTotal = 0;
        for (const needCategory of NEED_CATEGORIES) {
            const desiredQuantity = calculateNeedQuantity(cohort, needCategory);
            const maxCategorySpendMinor = Math.floor(cohort.cashBalanceMinor * NEED_PROFILE[needCategory].budgetShare);
            const purchase = buyForNeed({
                state: context.state,
                companies: context.companies,
                cohort,
                inventoryLots: context.inventoryLots,
                cityId: city.id,
                needCategory,
                desiredQuantity,
                maxCategorySpendMinor,
                nextTick: context.nextTick,
                seed: context.seed,
                financialTransactions: context.financialTransactions,
                events: context.events,
                metrics: context.metrics
            });
            desiredTotal += desiredQuantity;
            purchasedTotal += purchase.purchasedQuantity;
            const unmetQuantity = sanitizeQuantity(desiredQuantity - purchase.purchasedQuantity);
            const demandRecord = {
                id: `${context.seed}-demand-${context.nextTick}-${cohort.id}-${needCategory}`,
                tick: context.nextTick,
                cohortId: cohort.id,
                cityId: city.id,
                needCategory,
                desiredQuantity,
                purchasedQuantity: purchase.purchasedQuantity,
                unmetQuantity,
                spendingMinor: purchase.spendingMinor,
                averagePriceMinor: purchase.purchasedQuantity > 0 ? Math.round(purchase.spendingMinor / purchase.purchasedQuantity) : 0
            };
            context.demandRecords.push(demandRecord);
            context.metrics.push({
                id: `${context.seed}-metric-${context.nextTick}-${cohort.id}-${needCategory}-demand-desired`,
                tick: context.nextTick,
                name: "market.demand.desired.quantity",
                value: desiredQuantity,
                tags: { cohortId: cohort.id, needCategory }
            }, {
                id: `${context.seed}-metric-${context.nextTick}-${cohort.id}-${needCategory}-demand-unmet`,
                tick: context.nextTick,
                name: "market.demand.unmet.quantity",
                value: unmetQuantity,
                tags: { cohortId: cohort.id, needCategory }
            });
            if (unmetQuantity > 0) {
                context.events.push({
                    id: `${context.seed}-event-${context.nextTick}-${cohort.id}-${needCategory}-shortage`,
                    tick: context.nextTick,
                    type: "ShortageDetectedEvent",
                    message: `${cohort.id} has ${unmetQuantity} units of unmet ${needCategory} demand.`,
                    entityIds: [cohort.id, city.id],
                    metadata: {
                        cohortId: cohort.id,
                        cityId: city.id,
                        needCategory,
                        unmetQuantity
                    }
                });
            }
        }
        const fulfillmentRatio = desiredTotal > 0 ? purchasedTotal / desiredTotal : 1;
        cohort.satisfaction = clamp(cohort.satisfaction * 0.85 + fulfillmentRatio * 0.15, 0, 1);
    }
}
function buyForNeed(input) {
    let remainingDemand = sanitizeQuantity(input.desiredQuantity);
    let remainingBudgetMinor = Math.max(0, Math.min(sanitizeMoney(input.maxCategorySpendMinor), input.cohort.cashBalanceMinor));
    let purchasedQuantity = 0;
    let spendingMinor = 0;
    const offers = input.state.retailOffers
        .filter((offer) => {
        const product = input.state.products.find((candidate) => candidate.id === offer.productId);
        const warehouse = input.state.warehouses.find((candidate) => candidate.id === offer.warehouseId);
        return (offer.active &&
            product?.needCategory === input.needCategory &&
            warehouse?.cityId === input.cityId &&
            sanitizeMoney(offer.priceMinor) > 0 &&
            getAvailableQuantity(input.inventoryLots, offer.warehouseId, offer.productId) > 0);
    })
        .sort((left, right) => {
        const leftAvailability = getAvailableQuantity(input.inventoryLots, left.warehouseId, left.productId);
        const rightAvailability = getAvailableQuantity(input.inventoryLots, right.warehouseId, right.productId);
        const leftScore = left.priceMinor / Math.max(0.1, left.quality) - Math.min(leftAvailability, remainingDemand) * 0.0001;
        const rightScore = right.priceMinor / Math.max(0.1, right.quality) - Math.min(rightAvailability, remainingDemand) * 0.0001;
        return leftScore - rightScore;
    });
    for (const offer of offers) {
        if (remainingDemand <= 0 || remainingBudgetMinor <= 0) {
            break;
        }
        const company = input.companies.find((candidate) => candidate.id === offer.companyId);
        const product = input.state.products.find((candidate) => candidate.id === offer.productId);
        if (!company || !product || company.legalStatus !== "registered") {
            continue;
        }
        const priceMinor = sanitizeMoney(offer.priceMinor);
        const availableQuantity = getAvailableQuantity(input.inventoryLots, offer.warehouseId, offer.productId);
        const affordableQuantity = Math.floor(remainingBudgetMinor / priceMinor);
        const quantity = sanitizeQuantity(Math.min(remainingDemand, availableQuantity, affordableQuantity));
        if (quantity <= 0) {
            continue;
        }
        const consumed = consumeInventoryWithCost(input.inventoryLots, offer.warehouseId, offer.productId, quantity);
        const actualQuantity = consumed.quantity;
        const saleAmountMinor = sanitizeMoney(actualQuantity * priceMinor);
        const costOfGoodsSoldMinor = sanitizeMoney(consumed.totalCostMinor);
        const grossMarginMinor = sanitizeMoney(saleAmountMinor - costOfGoodsSoldMinor);
        const grossMarginRate = saleAmountMinor > 0 ? grossMarginMinor / saleAmountMinor : 0;
        if (actualQuantity <= 0 || saleAmountMinor <= 0) {
            continue;
        }
        company.cashBalanceMinor = sanitizeMoney(company.cashBalanceMinor + saleAmountMinor);
        input.cohort.cashBalanceMinor = sanitizeMoney(input.cohort.cashBalanceMinor - saleAmountMinor);
        remainingDemand = sanitizeQuantity(remainingDemand - actualQuantity);
        remainingBudgetMinor = sanitizeMoney(remainingBudgetMinor - saleAmountMinor);
        purchasedQuantity += actualQuantity;
        spendingMinor += saleAmountMinor;
        input.financialTransactions.push({
            id: `${input.seed}-tx-${input.nextTick}-${input.financialTransactions.length + 1}`,
            tick: input.nextTick,
            type: "RetailSaleTransaction",
            entries: [
                {
                    ownerType: "population_cohort",
                    ownerId: input.cohort.id,
                    amountMinor: -saleAmountMinor,
                    currencyCode: company.currencyCode
                },
                {
                    ownerType: "company",
                    ownerId: company.id,
                    amountMinor: saleAmountMinor,
                    currencyCode: company.currencyCode
                }
            ]
        });
        input.events.push({
            id: `${input.seed}-event-${input.nextTick}-${input.cohort.id}-${offer.id}-sold`,
            tick: input.nextTick,
            type: "ProductSoldEvent",
            message: `${company.name} sold ${actualQuantity} units of ${product.name}.`,
            entityIds: [input.cohort.id, company.id, product.id],
            metadata: {
                cohortId: input.cohort.id,
                companyId: company.id,
                productId: product.id,
                quantity: actualQuantity,
                revenueMinor: saleAmountMinor,
                costOfGoodsSoldMinor,
                grossMarginMinor,
                grossMarginRate
            }
        });
        input.metrics.push({
            id: `${input.seed}-metric-${input.nextTick}-${input.cohort.id}-${offer.id}-sales-quantity`,
            tick: input.nextTick,
            name: "market.sales.quantity",
            value: actualQuantity,
            tags: {
                cohortId: input.cohort.id,
                companyId: company.id,
                productId: product.id,
                needCategory: input.needCategory
            }
        }, {
            id: `${input.seed}-metric-${input.nextTick}-${input.cohort.id}-${offer.id}-sales-revenue`,
            tick: input.nextTick,
            name: "market.sales.revenue_minor",
            value: saleAmountMinor,
            tags: {
                cohortId: input.cohort.id,
                companyId: company.id,
                productId: product.id,
                needCategory: input.needCategory
            }
        }, {
            id: `${input.seed}-metric-${input.nextTick}-${input.cohort.id}-${offer.id}-sales-cogs`,
            tick: input.nextTick,
            name: "market.sales.cogs_minor",
            value: costOfGoodsSoldMinor,
            tags: {
                cohortId: input.cohort.id,
                companyId: company.id,
                productId: product.id,
                needCategory: input.needCategory
            }
        }, {
            id: `${input.seed}-metric-${input.nextTick}-${input.cohort.id}-${offer.id}-gross-margin`,
            tick: input.nextTick,
            name: "market.sales.gross_margin_minor",
            value: grossMarginMinor,
            tags: {
                cohortId: input.cohort.id,
                companyId: company.id,
                productId: product.id,
                needCategory: input.needCategory
            }
        }, {
            id: `${input.seed}-metric-${input.nextTick}-${input.cohort.id}-${offer.id}-gross-margin-rate`,
            tick: input.nextTick,
            name: "market.sales.gross_margin_rate",
            value: grossMarginRate,
            tags: {
                cohortId: input.cohort.id,
                companyId: company.id,
                productId: product.id,
                needCategory: input.needCategory
            }
        });
    }
    return {
        purchasedQuantity: sanitizeQuantity(purchasedQuantity),
        spendingMinor: sanitizeMoney(spendingMinor)
    };
}
function processLogistics(context) {
    for (const shipment of context.shipments) {
        if (shipment.status !== "in_transit") {
            continue;
        }
        const route = context.state.logisticsRoutes.find((candidate) => candidate.id === shipment.routeId);
        const quote = route ? quoteShipment(context.state, route, shipment.quantity, shipment.transportCompanyId) : null;
        if (!route || quote?.blockedReason) {
            const linkedPurchase = context.resourcePurchases.find((purchase) => purchase.shipmentId === shipment.id) ?? null;
            shipment.status = "blocked";
            shipment.blockedReason = quote?.blockedReason ?? "Route no longer exists.";
            if (linkedPurchase) {
                linkedPurchase.status = "failed";
            }
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${shipment.id}-blocked`,
                tick: context.nextTick,
                type: "ShipmentBlockedEvent",
                message: `Shipment ${shipment.id} is blocked: ${shipment.blockedReason}`,
                entityIds: [shipment.id, shipment.routeId],
                metadata: {
                    shipmentId: shipment.id,
                    purchaseId: linkedPurchase?.id ?? "",
                    routeId: shipment.routeId,
                    reason: shipment.blockedReason
                }
            });
            continue;
        }
        shipment.remainingTicks = sanitizeQuantity(shipment.remainingTicks - 1);
        if (shipment.remainingTicks > 0) {
            context.metrics.push({
                id: `${context.seed}-metric-${context.nextTick}-${shipment.id}-remaining`,
                tick: context.nextTick,
                name: "logistics.shipment.remaining_ticks",
                value: shipment.remainingTicks,
                tags: {
                    shipmentId: shipment.id,
                    routeId: shipment.routeId,
                    status: shipment.status
                }
            });
            continue;
        }
        const product = context.state.products.find((candidate) => candidate.id === shipment.productId);
        const linkedPurchase = context.resourcePurchases.find((purchase) => purchase.shipmentId === shipment.id) ?? null;
        shipment.status = "delivered";
        shipment.remainingTicks = 0;
        shipment.deliveredTick = context.nextTick;
        if (linkedPurchase) {
            linkedPurchase.status = "delivered";
        }
        const deliveredCostMinor = sanitizeMoney(linkedPurchase?.totalPriceMinor ?? shipment.costMinor);
        addInventory({
            inventoryLots: context.inventoryLots,
            warehouseId: shipment.destinationWarehouseId,
            productId: shipment.productId,
            quantity: shipment.quantity,
            quality: linkedPurchase?.quality ?? product?.baseQuality ?? 0.5,
            lotId: `${context.seed}-lot-${context.nextTick}-${shipment.id}-delivered`,
            unitCostMinor: shipment.quantity > 0 ? sanitizeMoney(deliveredCostMinor / shipment.quantity) : 0,
            totalCostMinor: deliveredCostMinor,
            costSourceType: "shipment_delivery",
            costSourceId: linkedPurchase?.id ?? shipment.id
        });
        context.events.push({
            id: `${context.seed}-event-${context.nextTick}-${shipment.id}-delivered`,
            tick: context.nextTick,
            type: "ShipmentDeliveredEvent",
            message: `Shipment ${shipment.id} delivered ${shipment.quantity} units.`,
            entityIds: [shipment.id, shipment.destinationWarehouseId, shipment.productId],
            metadata: {
                shipmentId: shipment.id,
                purchaseId: linkedPurchase?.id ?? "",
                destinationWarehouseId: shipment.destinationWarehouseId,
                productId: shipment.productId,
                quantity: shipment.quantity
            }
        });
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${shipment.id}-delivered`,
            tick: context.nextTick,
            name: "logistics.shipment.delivered",
            value: shipment.quantity,
            tags: {
                shipmentId: shipment.id,
                routeId: shipment.routeId,
                status: shipment.status
            }
        });
    }
}
function processFinance(context) {
    processCentralBankBondPurchases(context);
    processLoanInterestAndPayments(context);
    processCreditRisk(context);
    processCompanyBankruptcies(context);
    processBankBankruptcies(context);
    processAssetAuctions(context);
    for (const book of context.orderBooks) {
        matchOrderBook({
            book,
            bankAccounts: context.bankAccounts,
            portfolioPositions: context.portfolioPositions,
            trades: context.trades,
            financialTransactions: context.financialTransactions,
            events: context.events,
            metrics: context.metrics,
            tick: context.nextTick,
            seed: context.seed
        });
    }
}
function processCentralBankBondPurchases(context) {
    for (const centralBank of context.centralBanks) {
        const eligibleBond = context.state.bonds.find((bond) => bond.currencyCode === centralBank.currencyCode && bond.centralBankEligible && !bond.defaulted);
        const commercialBank = context.banks.find((bank) => bank.countryId === centralBank.countryId && bank.currencyCode === centralBank.currencyCode);
        if (!eligibleBond || !commercialBank || !commercialBank.solvent) {
            continue;
        }
        const purchaseMinor = sanitizeMoney(Math.min(eligibleBond.faceValueMinor, 25_000_00));
        if (purchaseMinor <= 0) {
            continue;
        }
        centralBank.baseMoneyMinor = sanitizeMoney(centralBank.baseMoneyMinor + purchaseMinor);
        centralBank.bondHoldingsMinor = sanitizeMoney(centralBank.bondHoldingsMinor + purchaseMinor);
        commercialBank.reservesMinor = sanitizeMoney(commercialBank.reservesMinor + purchaseMinor);
        const reserveAccount = context.bankAccounts.find((account) => account.ownerType === "bank" && account.ownerId === commercialBank.id && account.accountType === "reserve");
        if (reserveAccount) {
            reserveAccount.balanceMinor = sanitizeMoney(reserveAccount.balanceMinor + purchaseMinor);
        }
        context.financialTransactions.push({
            id: `${context.seed}-tx-${context.nextTick}-${centralBank.id}-bond-purchase`,
            tick: context.nextTick,
            type: "CentralBankBondPurchaseTransaction",
            entries: [
                {
                    ownerType: "central_bank",
                    ownerId: centralBank.id,
                    amountMinor: -purchaseMinor,
                    currencyCode: centralBank.currencyCode
                },
                {
                    ownerType: "bank",
                    ownerId: commercialBank.id,
                    amountMinor: purchaseMinor,
                    currencyCode: commercialBank.currencyCode
                }
            ]
        });
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${centralBank.id}-base-money`,
            tick: context.nextTick,
            name: "finance.central_bank.base_money_minor",
            value: centralBank.baseMoneyMinor,
            tags: {
                centralBankId: centralBank.id,
                currencyCode: centralBank.currencyCode
            }
        });
    }
}
function processLoanInterestAndPayments(context) {
    for (const loan of context.loans) {
        if (loan.status !== "active" && loan.status !== "restructured") {
            continue;
        }
        const interestMinor = sanitizeMoney(Math.max(1, Math.floor((loan.outstandingPrincipalMinor * loan.annualInterestRate) / 365)));
        loan.accruedInterestMinor = sanitizeMoney(loan.accruedInterestMinor + interestMinor);
        loan.remainingTicks = sanitizeQuantity(loan.remainingTicks - 1);
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${loan.id}-interest`,
            tick: context.nextTick,
            name: "finance.loan.interest_accrued_minor",
            value: interestMinor,
            tags: {
                loanId: loan.id,
                borrowerId: loan.borrowerId
            }
        });
        if (loan.nextPaymentTick > context.nextTick) {
            continue;
        }
        const dueMinor = sanitizeMoney(Math.min(loan.paymentPerTickMinor, loan.outstandingPrincipalMinor + loan.accruedInterestMinor));
        const account = getBorrowerAccount(context.bankAccounts, loan);
        if (!account || getAvailableCashMinor(account) < dueMinor) {
            loan.missedPayments = sanitizeQuantity(loan.missedPayments + 1);
            loan.nextPaymentTick = context.nextTick + 1;
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${loan.id}-payment-missed`,
                tick: context.nextTick,
                type: "LoanPaymentMissedEvent",
                message: `Loan ${loan.id} missed a scheduled payment.`,
                entityIds: [loan.id, loan.borrowerId, loan.lenderBankId],
                metadata: {
                    loanId: loan.id,
                    borrowerId: loan.borrowerId,
                    missedPayments: loan.missedPayments
                }
            });
            if (loan.missedPayments >= 2) {
                markLoanDefaulted(context, loan, "Missed scheduled loan payments.");
            }
            continue;
        }
        applyLoanPaymentMutable({
            loan,
            amountMinor: dueMinor,
            banks: context.banks,
            bankAccounts: context.bankAccounts,
            companies: context.companies,
            tick: context.nextTick,
            seed: context.seed,
            financialTransactions: context.financialTransactions,
            events: context.events,
            metrics: context.metrics,
            allowPartial: true
        });
    }
}
function processCreditRisk(context) {
    for (const score of context.creditScores) {
        const borrowerLoans = context.loans.filter((loan) => loan.borrowerType === score.borrowerType && loan.borrowerId === score.borrowerId);
        const defaulted = borrowerLoans.some((loan) => loan.status === "defaulted");
        const missedPayments = borrowerLoans.reduce((total, loan) => total + loan.missedPayments, 0);
        score.probabilityOfDefault = clamp(score.probabilityOfDefault + missedPayments * 0.015 + (defaulted ? 0.25 : -0.005), 0.01, 0.95);
        score.score = clamp(score.score - missedPayments * 0.02 - (defaulted ? 0.25 : -0.005), 0.05, 0.95);
        score.lastUpdatedTick = context.nextTick;
    }
}
function processCompanyBankruptcies(context) {
    for (const loan of context.loans) {
        if (loan.borrowerType !== "company" || loan.status !== "defaulted") {
            continue;
        }
        const company = context.companies.find((candidate) => candidate.id === loan.borrowerId);
        if (!company || context.bankruptcies.some((bankruptcy) => bankruptcy.debtorType === "company" && bankruptcy.debtorId === company.id)) {
            continue;
        }
        company.legalStatus = "bankrupt";
        company.bankruptcyStatus = "auction";
        const account = context.bankAccounts.find((candidate) => candidate.ownerType === "company" && candidate.ownerId === company.id);
        const estimatedAssetsMinor = sanitizeMoney((account?.balanceMinor ?? 0) + company.cashBalanceMinor);
        const claimsMinor = sanitizeMoney(loan.outstandingPrincipalMinor + loan.accruedInterestMinor);
        const bankruptcy = {
            id: `${context.seed}-bankruptcy-company-${context.nextTick}-${company.id}`,
            debtorType: "company",
            debtorId: company.id,
            status: "auction",
            openedTick: context.nextTick,
            resolvedTick: null,
            reason: "Credit default triggered bankruptcy proceedings.",
            estimatedAssetsMinor,
            claimsMinor,
            recoveryRate: claimsMinor > 0 ? clamp(estimatedAssetsMinor / claimsMinor, 0, 1) : 1
        };
        const auction = {
            id: `${context.seed}-auction-${context.nextTick}-${company.id}`,
            bankruptcyCaseId: bankruptcy.id,
            assetType: "inventory",
            assetId: company.id,
            reservePriceMinor: Math.max(1, Math.floor(estimatedAssetsMinor * 0.5)),
            highestBidMinor: Math.max(1, Math.floor(estimatedAssetsMinor * 0.65)),
            highestBidderId: `${context.seed}-market-maker`,
            status: "open",
            createdTick: context.nextTick,
            settledTick: null
        };
        context.bankruptcies.push(bankruptcy);
        context.assetAuctions.push(auction);
        context.events.push({
            id: `${context.seed}-event-${context.nextTick}-${company.id}-bankrupt`,
            tick: context.nextTick,
            type: "CompanyBankruptcyOpenedEvent",
            message: `${company.name} entered bankruptcy after a loan default.`,
            entityIds: [company.id, loan.id, bankruptcy.id],
            metadata: {
                companyId: company.id,
                loanId: loan.id,
                bankruptcyCaseId: bankruptcy.id,
                claimsMinor
            }
        });
    }
}
function processBankBankruptcies(context) {
    for (const bank of context.banks) {
        const insolvencyGapMinor = sanitizeMoney(bank.nonPerformingLoanMinor - (bank.capitalMinor + bank.reservesMinor));
        if (bank.solvent && insolvencyGapMinor <= 0) {
            continue;
        }
        bank.solvent = false;
        if (context.bankruptcies.some((bankruptcy) => bankruptcy.debtorType === "bank" && bankruptcy.debtorId === bank.id)) {
            continue;
        }
        const centralBank = context.centralBanks.find((candidate) => candidate.countryId === bank.countryId);
        const protectedDeposits = centralBank?.depositInsuranceEnabled ?? false;
        let burnedDepositsMinor = 0;
        if (!protectedDeposits) {
            for (const account of context.bankAccounts) {
                if (account.bankId !== bank.id || account.ownerType === "bank" || account.status !== "active") {
                    continue;
                }
                const lossMinor = sanitizeMoney(Math.floor(account.balanceMinor * 0.6));
                account.balanceMinor = sanitizeMoney(account.balanceMinor - lossMinor);
                burnedDepositsMinor = sanitizeMoney(burnedDepositsMinor + lossMinor);
                context.financialTransactions.push({
                    id: `${context.seed}-tx-${context.nextTick}-${account.id}-deposit-loss`,
                    tick: context.nextTick,
                    type: "DepositLossTransaction",
                    entries: [
                        {
                            ownerType: "bank_account",
                            ownerId: account.id,
                            amountMinor: -lossMinor,
                            currencyCode: account.currencyCode
                        },
                        {
                            ownerType: "bank",
                            ownerId: bank.id,
                            amountMinor: lossMinor,
                            currencyCode: bank.currencyCode
                        }
                    ]
                });
            }
        }
        const bankruptcy = {
            id: `${context.seed}-bankruptcy-bank-${context.nextTick}-${bank.id}`,
            debtorType: "bank",
            debtorId: bank.id,
            status: "open",
            openedTick: context.nextTick,
            resolvedTick: null,
            reason: "Bank capital and reserves no longer cover losses.",
            estimatedAssetsMinor: sanitizeMoney(bank.reservesMinor + bank.loanBookMinor - bank.nonPerformingLoanMinor),
            claimsMinor: bank.depositsMinor,
            recoveryRate: bank.depositsMinor > 0 ? clamp((bank.reservesMinor + bank.loanBookMinor - bank.nonPerformingLoanMinor) / bank.depositsMinor, 0, 1) : 1
        };
        context.bankruptcies.push(bankruptcy);
        context.events.push({
            id: `${context.seed}-event-${context.nextTick}-${bank.id}-bankrupt`,
            tick: context.nextTick,
            type: "BankBankruptcyOpenedEvent",
            message: `${bank.name} entered bankruptcy. Depositor losses: ${burnedDepositsMinor}.`,
            entityIds: [bank.id, bankruptcy.id],
            metadata: {
                bankId: bank.id,
                bankruptcyCaseId: bankruptcy.id,
                burnedDepositsMinor,
                depositInsuranceEnabled: protectedDeposits
            }
        });
    }
}
function processAssetAuctions(context) {
    for (const auction of context.assetAuctions) {
        if (auction.status !== "open" || !auction.highestBidderId || auction.highestBidMinor <= 0) {
            continue;
        }
        auction.status = "settled";
        auction.settledTick = context.nextTick;
        const bankruptcy = context.bankruptcies.find((candidate) => candidate.id === auction.bankruptcyCaseId);
        if (bankruptcy) {
            bankruptcy.status = "resolved";
            bankruptcy.resolvedTick = context.nextTick;
            bankruptcy.recoveryRate = bankruptcy.claimsMinor > 0 ? clamp(auction.highestBidMinor / bankruptcy.claimsMinor, 0, 1) : 1;
        }
        context.financialTransactions.push({
            id: `${context.seed}-tx-${context.nextTick}-${auction.id}-settled`,
            tick: context.nextTick,
            type: "BankruptcyRecoveryTransaction",
            entries: [
                {
                    ownerType: "exchange",
                    ownerId: auction.highestBidderId,
                    amountMinor: -auction.highestBidMinor,
                    currencyCode: "NCR"
                },
                {
                    ownerType: "market_sink",
                    ownerId: auction.bankruptcyCaseId,
                    amountMinor: auction.highestBidMinor,
                    currencyCode: "NCR"
                }
            ]
        });
        context.events.push({
            id: `${context.seed}-event-${context.nextTick}-${auction.id}-settled`,
            tick: context.nextTick,
            type: "AssetAuctionSettledEvent",
            message: `Auction ${auction.id} recovered ${auction.highestBidMinor} minor currency units.`,
            entityIds: [auction.id, auction.bankruptcyCaseId],
            metadata: {
                auctionId: auction.id,
                bankruptcyCaseId: auction.bankruptcyCaseId,
                recoveryMinor: auction.highestBidMinor
            }
        });
    }
}
function processGovernment(context) {
    for (const government of context.governments) {
        const country = context.countries.find((candidate) => candidate.id === government.countryId);
        if (!country) {
            continue;
        }
        const countryLaws = context.laws.filter((law) => law.countryId === government.countryId);
        const activeLaws = countryLaws.filter((law) => law.status === "active");
        const taxPolicy = getOrCreateTaxPolicy(context, government.countryId);
        syncTaxPolicyFromLaws(taxPolicy, activeLaws, context.nextTick);
        syncDepositInsurance(context, government, activeLaws);
        const latestBudget = getLatestBudget(context.governmentBudgets, government.countryId);
        const budget = {
            id: `${context.seed}-budget-${government.countryId}-${context.nextTick}`,
            countryId: government.countryId,
            tick: context.nextTick,
            revenueMinor: 0,
            spendingMinor: 0,
            deficitMinor: 0,
            treasuryMinor: sanitizeMoney(latestBudget?.treasuryMinor ?? 0),
            welfareSpendingMinor: 0,
            infrastructureSpendingMinor: 0,
            bailoutSpendingMinor: 0
        };
        collectGovernmentTaxes(context, government, taxPolicy, budget);
        applyGovernmentSubsidies(context, government, budget);
        applyGovernmentSpending(context, government, budget);
        applyBankBailouts(context, government, activeLaws, budget);
        applyNationalization(context, government, activeLaws, budget);
        enforceIndustryLicenses(context, government, activeLaws);
        updateSanctionMetrics(context, government);
        updateLawAdoption(context, government);
        budget.deficitMinor = sanitizeMoney(Math.max(0, budget.spendingMinor - budget.revenueMinor));
        updateGovernmentStability(context, government, country, budget);
        updatePublicDebt(context, government, budget);
        budget.deficitMinor = sanitizeMoney(Math.max(0, budget.spendingMinor - budget.revenueMinor));
        context.governmentBudgets.push(budget);
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${government.id}-revenue`,
            tick: context.nextTick,
            name: "government.budget.revenue_minor",
            value: budget.revenueMinor,
            tags: {
                countryId: government.countryId,
                governmentId: government.id
            }
        }, {
            id: `${context.seed}-metric-${context.nextTick}-${government.id}-stability`,
            tick: context.nextTick,
            name: "government.stability.rating",
            value: government.stabilityRating,
            tags: {
                countryId: government.countryId,
                governmentId: government.id
            }
        });
    }
}
function syncTaxPolicyFromLaws(policy, activeLaws, tick) {
    const profitLaw = activeLaws.find((law) => law.type === "profit_tax");
    const salesLaw = activeLaws.find((law) => law.type === "sales_tax");
    const tariffLaw = activeLaws.find((law) => law.type === "import_tariff");
    const fineLaw = activeLaws.find((law) => law.type === "environmental_fine");
    policy.profitTaxRate = clamp(getNumberParam(profitLaw, "rate", policy.profitTaxRate), 0, 0.9);
    policy.salesTaxRate = clamp(getNumberParam(salesLaw, "rate", policy.salesTaxRate), 0, 0.9);
    policy.importTariffRate = clamp(getNumberParam(tariffLaw, "rate", policy.importTariffRate), 0, 2);
    policy.environmentalFineMinor = sanitizeMoney(getNumberParam(fineLaw, "fineMinor", policy.environmentalFineMinor));
    policy.updatedTick = tick;
}
function syncDepositInsurance(context, government, activeLaws) {
    const depositLaw = activeLaws.find((law) => law.type === "deposit_insurance");
    const enabled = Boolean(depositLaw);
    const limitMinor = sanitizeMoney(getNumberParam(depositLaw, "limitMinor", 0));
    government.depositInsuranceEnabled = enabled;
    for (const centralBank of context.centralBanks) {
        if (centralBank.countryId !== government.countryId) {
            continue;
        }
        centralBank.depositInsuranceEnabled = enabled;
        centralBank.depositInsuranceLimitMinor = enabled ? Math.max(centralBank.depositInsuranceLimitMinor, limitMinor) : centralBank.depositInsuranceLimitMinor;
    }
}
function collectGovernmentTaxes(context, government, policy, budget) {
    const salesRevenueByCompany = new Map();
    for (const transaction of context.financialTransactions) {
        if (transaction.tick !== context.nextTick || transaction.type !== "RetailSaleTransaction") {
            continue;
        }
        for (const entry of transaction.entries) {
            if (entry.ownerType === "company" && entry.amountMinor > 0) {
                salesRevenueByCompany.set(entry.ownerId, sanitizeMoney((salesRevenueByCompany.get(entry.ownerId) ?? 0) + entry.amountMinor));
            }
        }
    }
    for (const company of context.companies) {
        if (company.countryId !== government.countryId || company.legalStatus !== "registered") {
            continue;
        }
        const revenueMinor = salesRevenueByCompany.get(company.id) ?? 0;
        const profitBaseMinor = sanitizeMoney(Math.max(revenueMinor, Math.floor(company.cashBalanceMinor * 0.001)));
        const taxMinor = sanitizeMoney(Math.floor((revenueMinor * policy.salesTaxRate + profitBaseMinor * policy.profitTaxRate) * clamp(government.taxEfficiency, 0, 1)));
        if (taxMinor > 0) {
            transferCompanyToGovernment({
                context,
                company,
                government,
                budget,
                amountMinor: taxMinor,
                transactionType: "TaxCollectionTransaction",
                eventType: "TaxCollectedEvent",
                message: `${government.name} collected taxes from ${company.name}.`
            });
        }
        const environmentalFineMinor = getEnvironmentalFineMinor(context, company, policy);
        if (environmentalFineMinor > 0) {
            transferCompanyToGovernment({
                context,
                company,
                government,
                budget,
                amountMinor: environmentalFineMinor,
                transactionType: "TaxCollectionTransaction",
                eventType: "EnvironmentalFineCollectedEvent",
                message: `${company.name} paid an environmental compliance fine.`
            });
        }
    }
}
function applyGovernmentSubsidies(context, government, budget) {
    for (const subsidy of context.subsidies) {
        if (!subsidy.active || subsidy.countryId !== government.countryId || subsidy.amountMinorPerTick <= 0) {
            continue;
        }
        const companies = context.companies.filter((company) => company.countryId === government.countryId &&
            company.legalStatus === "registered" &&
            subsidyMatchesCompany(context, subsidy, company));
        if (companies.length === 0) {
            continue;
        }
        const perCompanyMinor = sanitizeMoney(Math.floor(subsidy.amountMinorPerTick / companies.length));
        for (const company of companies) {
            const paymentMinor = sanitizeMoney(Math.min(perCompanyMinor, budget.treasuryMinor));
            if (paymentMinor <= 0) {
                break;
            }
            budget.treasuryMinor = sanitizeMoney(budget.treasuryMinor - paymentMinor);
            budget.spendingMinor = sanitizeMoney(budget.spendingMinor + paymentMinor);
            company.cashBalanceMinor = sanitizeMoney(company.cashBalanceMinor + paymentMinor);
            const account = context.bankAccounts.find((candidate) => candidate.ownerType === "company" && candidate.ownerId === company.id);
            if (account) {
                account.balanceMinor = sanitizeMoney(account.balanceMinor + paymentMinor);
            }
            context.financialTransactions.push({
                id: `${context.seed}-tx-${context.nextTick}-${subsidy.id}-${company.id}`,
                tick: context.nextTick,
                type: "SubsidyPaymentTransaction",
                entries: [
                    {
                        ownerType: "state",
                        ownerId: government.countryId,
                        amountMinor: -paymentMinor,
                        currencyCode: company.currencyCode
                    },
                    {
                        ownerType: "company",
                        ownerId: company.id,
                        amountMinor: paymentMinor,
                        currencyCode: company.currencyCode
                    }
                ]
            });
        }
    }
}
function applyGovernmentSpending(context, government, budget) {
    const populationSize = context.populationCohorts
        .filter((cohort) => {
        const city = context.state.cities.find((candidate) => candidate.id === cohort.cityId);
        return city?.countryId === government.countryId;
    })
        .reduce((total, cohort) => total + cohort.size, 0);
    const welfareMinor = sanitizeMoney(Math.min(budget.treasuryMinor, Math.floor(populationSize * 0.08)));
    const infrastructureMinor = sanitizeMoney(Math.min(sanitizeMoney(budget.treasuryMinor - welfareMinor), 35_000));
    const totalSpendingMinor = sanitizeMoney(welfareMinor + infrastructureMinor);
    if (totalSpendingMinor <= 0) {
        return;
    }
    budget.treasuryMinor = sanitizeMoney(budget.treasuryMinor - totalSpendingMinor);
    budget.spendingMinor = sanitizeMoney(budget.spendingMinor + totalSpendingMinor);
    budget.welfareSpendingMinor = welfareMinor;
    budget.infrastructureSpendingMinor = infrastructureMinor;
    for (const cohort of context.populationCohorts) {
        const city = context.state.cities.find((candidate) => candidate.id === cohort.cityId);
        if (city?.countryId === government.countryId) {
            cohort.satisfaction = clamp(cohort.satisfaction + welfareMinor / Math.max(1, populationSize) / 50, 0, 1);
        }
    }
    context.financialTransactions.push({
        id: `${context.seed}-tx-${context.nextTick}-${government.id}-spending`,
        tick: context.nextTick,
        type: "GovernmentSpendingTransaction",
        entries: [
            {
                ownerType: "state",
                ownerId: government.countryId,
                amountMinor: -totalSpendingMinor,
                currencyCode: context.state.countries.find((country) => country.id === government.countryId)?.currencyCode ?? "NCR"
            },
            {
                ownerType: "market_sink",
                ownerId: `${government.countryId}-public-services`,
                amountMinor: totalSpendingMinor,
                currencyCode: context.state.countries.find((country) => country.id === government.countryId)?.currencyCode ?? "NCR"
            }
        ]
    });
}
function applyBankBailouts(context, government, activeLaws, budget) {
    const bailoutAllowed = activeLaws.some((law) => law.type === "bank_bailout") || government.stabilityRating < 0.45;
    if (!bailoutAllowed) {
        return;
    }
    for (const bank of context.banks) {
        if (bank.countryId !== government.countryId || bank.solvent || budget.treasuryMinor <= 0) {
            continue;
        }
        const bailoutMinor = sanitizeMoney(Math.min(budget.treasuryMinor, Math.max(50_000, Math.floor(bank.depositsMinor * 0.08))));
        if (bailoutMinor <= 0) {
            continue;
        }
        bank.capitalMinor = sanitizeMoney(bank.capitalMinor + bailoutMinor);
        bank.reservesMinor = sanitizeMoney(bank.reservesMinor + bailoutMinor);
        bank.solvent = bank.capitalMinor + bank.reservesMinor >= bank.nonPerformingLoanMinor;
        budget.treasuryMinor = sanitizeMoney(budget.treasuryMinor - bailoutMinor);
        budget.spendingMinor = sanitizeMoney(budget.spendingMinor + bailoutMinor);
        budget.bailoutSpendingMinor = sanitizeMoney(budget.bailoutSpendingMinor + bailoutMinor);
        context.events.push({
            id: `${context.seed}-event-${context.nextTick}-${bank.id}-bailed-out`,
            tick: context.nextTick,
            type: "BankBailedOutEvent",
            message: `${government.name} provided emergency bank support.`,
            entityIds: [government.id, bank.id],
            metadata: {
                governmentId: government.id,
                bankId: bank.id,
                bailoutMinor
            }
        });
    }
}
function applyNationalization(context, government, activeLaws, budget) {
    if (!government.canNationalize) {
        return;
    }
    for (const law of activeLaws.filter((candidate) => candidate.type === "nationalization")) {
        const targetCompanyId = getStringParam(law, "targetCompanyId", "");
        const targetIndustry = getStringParam(law, "targetIndustry", "");
        for (const company of context.companies) {
            if (company.countryId !== government.countryId || company.ownerType === "state") {
                continue;
            }
            if (targetCompanyId && company.id !== targetCompanyId) {
                continue;
            }
            if (!targetCompanyId && targetIndustry && !companyMatchesIndustry(context, company, targetIndustry)) {
                continue;
            }
            const compensationMinor = sanitizeMoney(Math.min(budget.treasuryMinor, Math.floor(company.cashBalanceMinor * 0.05)));
            const previousOwnerId = company.ownerId;
            company.ownerType = "state";
            company.ownerId = government.countryId;
            if (compensationMinor > 0) {
                budget.treasuryMinor = sanitizeMoney(budget.treasuryMinor - compensationMinor);
                budget.spendingMinor = sanitizeMoney(budget.spendingMinor + compensationMinor);
                company.cashBalanceMinor = sanitizeMoney(company.cashBalanceMinor + compensationMinor);
            }
            context.financialTransactions.push({
                id: `${context.seed}-tx-${context.nextTick}-${company.id}-nationalized`,
                tick: context.nextTick,
                type: "NationalizationTransaction",
                entries: [
                    {
                        ownerType: "state",
                        ownerId: government.countryId,
                        amountMinor: -compensationMinor,
                        currencyCode: company.currencyCode
                    },
                    {
                        ownerType: "company",
                        ownerId: company.id,
                        amountMinor: compensationMinor,
                        currencyCode: company.currencyCode
                    }
                ]
            });
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${company.id}-nationalized`,
                tick: context.nextTick,
                type: "CompanyNationalizedEvent",
                message: `${government.name} nationalized ${company.name}.`,
                entityIds: [government.id, company.id, law.id],
                metadata: {
                    governmentId: government.id,
                    companyId: company.id,
                    lawId: law.id,
                    previousOwnerId,
                    compensationMinor
                }
            });
        }
    }
}
function enforceIndustryLicenses(context, government, activeLaws) {
    for (const law of activeLaws.filter((candidate) => candidate.type === "industry_license")) {
        const industry = getStringParam(law, "industry", "");
        if (!industry) {
            continue;
        }
        for (const company of context.companies) {
            if (company.countryId !== government.countryId || company.legalStatus !== "registered" || !companyMatchesIndustry(context, company, industry)) {
                continue;
            }
            const hasLicense = context.licenses.some((license) => license.countryId === government.countryId &&
                license.companyId === company.id &&
                license.industry === industry &&
                license.status === "active" &&
                (license.expiresTick === null || license.expiresTick >= context.nextTick));
            if (hasLicense) {
                continue;
            }
            company.legalStatus = "suspended";
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${company.id}-license-blocked`,
                tick: context.nextTick,
                type: "CompanyLicenseBlockedEvent",
                message: `${company.name} was suspended because it lacks a required ${industry} license.`,
                entityIds: [company.id, law.id, government.id],
                metadata: {
                    companyId: company.id,
                    lawId: law.id,
                    industry
                }
            });
        }
    }
}
function updateSanctionMetrics(context, government) {
    for (const sanction of context.sanctionPolicies) {
        if (!sanction.active || sanction.countryId !== government.countryId) {
            continue;
        }
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${sanction.id}-sanction`,
            tick: context.nextTick,
            name: "government.sanction.active",
            value: sanction.importBlocked || sanction.exportBlocked ? 1 : 0,
            tags: {
                countryId: sanction.countryId,
                targetCountryId: sanction.targetCountryId
            }
        });
    }
}
function updateLawAdoption(context, government) {
    const parties = context.politicalParties.filter((party) => party.countryId === government.countryId);
    const lobbyingByLaw = context.lobbyingActions
        .filter((action) => action.countryId === government.countryId)
        .reduce((accumulator, action) => accumulator + (action.status === "accepted" ? action.influence : 0), 0);
    const mediaInfluence = context.mediaInfluences
        .filter((influence) => influence.countryId === government.countryId)
        .reduce((accumulator, influence) => accumulator + influence.influence, 0);
    const corruption = context.corruptionIndexes.find((index) => index.countryId === government.countryId)?.value ?? government.corruptionLevel;
    for (const law of context.laws) {
        if (law.countryId !== government.countryId || law.status !== "draft") {
            continue;
        }
        const partySupport = parties
            .filter((party) => party.policyBias.includes(law.type))
            .reduce((total, party) => total + party.popularity * 0.18 + party.mediaReach * 0.08, 0);
        law.support = clamp(law.support + partySupport + lobbyingByLaw * 0.03 + mediaInfluence * 0.02 - corruption * 0.04, 0, 1);
        if (law.support >= 0.65) {
            law.status = "active";
            law.enactedTick = context.nextTick;
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${law.id}-enacted`,
                tick: context.nextTick,
                type: "LawEnactedEvent",
                message: `${law.name} was enacted after political review.`,
                entityIds: [government.id, law.id],
                metadata: {
                    lawId: law.id,
                    lawType: law.type,
                    support: law.support
                }
            });
        }
        else if (law.support <= 0.12) {
            law.status = "rejected";
            context.events.push({
                id: `${context.seed}-event-${context.nextTick}-${law.id}-rejected`,
                tick: context.nextTick,
                type: "LawRejectedEvent",
                message: `${law.name} was rejected due to insufficient support.`,
                entityIds: [government.id, law.id],
                metadata: {
                    lawId: law.id,
                    lawType: law.type,
                    support: law.support
                }
            });
        }
    }
}
function updateGovernmentStability(context, government, country, budget) {
    const unmetDemand = context.state.demandRecords
        .filter((record) => {
        const city = context.state.cities.find((candidate) => candidate.id === record.cityId);
        return city?.countryId === government.countryId;
    })
        .slice(-20)
        .reduce((total, record) => total + record.unmetQuantity, 0);
    const corruption = context.corruptionIndexes.find((index) => index.countryId === government.countryId);
    const deficitPressure = budget.deficitMinor > 0 ? 0.01 : -0.003;
    const shortagePressure = clamp(unmetDemand / 1_000_000, 0, 0.06);
    const corruptionPressure = (corruption?.value ?? government.corruptionLevel) * 0.01;
    government.corruptionLevel = clamp((corruption?.value ?? government.corruptionLevel) + (corruption?.trend ?? 0), 0, 1);
    government.stabilityRating = clamp(government.stabilityRating - shortagePressure - corruptionPressure - deficitPressure + budget.welfareSpendingMinor / 30_000_000, 0, 1);
    government.legitimacy = clamp(government.legitimacy + (budget.revenueMinor > budget.spendingMinor ? 0.004 : -0.004) - corruptionPressure, 0, 1);
    country.stability = government.stabilityRating;
    if (government.stabilityRating < 0.5) {
        const existing = context.protests.find((protest) => protest.countryId === government.countryId && protest.status === "active");
        if (!existing) {
            context.protests.push({
                id: `${context.seed}-protest-${context.nextTick}-${government.countryId}`,
                countryId: government.countryId,
                cityId: context.state.cities.find((city) => city.countryId === government.countryId)?.id ?? null,
                reason: "Low stability and unmet public needs",
                intensity: clamp(0.5 - government.stabilityRating + shortagePressure, 0.05, 1),
                status: "active",
                startedTick: context.nextTick,
                resolvedTick: null
            });
        }
    }
    else if (government.stabilityRating > 0.62) {
        for (const protest of context.protests) {
            if (protest.countryId === government.countryId && protest.status === "active") {
                protest.status = "resolved";
                protest.resolvedTick = context.nextTick;
            }
        }
    }
}
function updatePublicDebt(context, government, budget) {
    const debt = context.publicDebt.find((candidate) => candidate.countryId === government.countryId);
    if (!debt || !government.canIssueBonds || budget.deficitMinor <= 0) {
        return;
    }
    debt.outstandingDebtMinor = sanitizeMoney(debt.outstandingDebtMinor + budget.deficitMinor);
    debt.debtServiceMinor = sanitizeMoney(debt.debtServiceMinor + Math.floor(budget.deficitMinor * 0.04));
    context.financialTransactions.push({
        id: `${context.seed}-tx-${context.nextTick}-${debt.id}-issued`,
        tick: context.nextTick,
        type: "GovernmentBondIssuanceTransaction",
        entries: [
            {
                ownerType: "state",
                ownerId: government.countryId,
                amountMinor: budget.deficitMinor,
                currencyCode: context.state.countries.find((country) => country.id === government.countryId)?.currencyCode ?? "NCR"
            },
            {
                ownerType: "market_sink",
                ownerId: `${government.countryId}-bond-market`,
                amountMinor: -budget.deficitMinor,
                currencyCode: context.state.countries.find((country) => country.id === government.countryId)?.currencyCode ?? "NCR"
            }
        ]
    });
}
function getOrCreateTaxPolicy(context, countryId) {
    const existing = context.taxPolicies.find((policy) => policy.countryId === countryId);
    if (existing) {
        return existing;
    }
    const policy = {
        id: `${context.seed}-tax-${countryId}`,
        countryId,
        profitTaxRate: 0.08,
        salesTaxRate: 0.03,
        importTariffRate: 0,
        environmentalFineMinor: 0,
        updatedTick: context.nextTick
    };
    context.taxPolicies.push(policy);
    return policy;
}
function getNumberParam(law, key, fallback) {
    const value = law?.parameters[key];
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
function getStringParam(law, key, fallback) {
    const value = law?.parameters[key];
    return typeof value === "string" ? value : fallback;
}
function transferCompanyToGovernment(input) {
    const amountMinor = sanitizeMoney(Math.min(input.amountMinor, input.company.cashBalanceMinor));
    if (amountMinor <= 0) {
        return;
    }
    input.company.cashBalanceMinor = sanitizeMoney(input.company.cashBalanceMinor - amountMinor);
    input.budget.revenueMinor = sanitizeMoney(input.budget.revenueMinor + amountMinor);
    input.budget.treasuryMinor = sanitizeMoney(input.budget.treasuryMinor + amountMinor);
    const account = input.context.bankAccounts.find((candidate) => candidate.ownerType === "company" && candidate.ownerId === input.company.id);
    if (account) {
        account.balanceMinor = sanitizeMoney(account.balanceMinor - Math.min(account.balanceMinor, amountMinor));
    }
    input.context.financialTransactions.push({
        id: `${input.context.seed}-tx-${input.context.nextTick}-${input.company.id}-${input.eventType}-${input.context.financialTransactions.length + 1}`,
        tick: input.context.nextTick,
        type: input.transactionType,
        entries: [
            {
                ownerType: "company",
                ownerId: input.company.id,
                amountMinor: -amountMinor,
                currencyCode: input.company.currencyCode
            },
            {
                ownerType: "state",
                ownerId: input.government.countryId,
                amountMinor,
                currencyCode: input.company.currencyCode
            }
        ]
    });
    input.context.events.push({
        id: `${input.context.seed}-event-${input.context.nextTick}-${input.company.id}-${input.eventType}`,
        tick: input.context.nextTick,
        type: input.eventType,
        message: input.message,
        entityIds: [input.company.id, input.government.id],
        metadata: {
            companyId: input.company.id,
            governmentId: input.government.id,
            amountMinor
        }
    });
}
function getEnvironmentalFineMinor(context, company, policy) {
    if (policy.environmentalFineMinor <= 0) {
        return 0;
    }
    const activeFine = context.laws.find((law) => law.countryId === company.countryId && law.type === "environmental_fine" && law.status === "active");
    const category = getStringParam(activeFine, "productCategory", "industrial");
    return companyMatchesIndustry(context, company, category) ? policy.environmentalFineMinor : 0;
}
function subsidyMatchesCompany(context, subsidy, company) {
    if (subsidy.targetType === "company") {
        return subsidy.targetId === company.id;
    }
    if (subsidy.targetType === "industry") {
        return companyMatchesIndustry(context, company, subsidy.targetId);
    }
    return false;
}
function companyMatchesIndustry(context, company, industry) {
    const productIds = new Set();
    for (const plan of context.state.productionPlans) {
        if (plan.companyId === company.id) {
            productIds.add(plan.outputProductId);
        }
    }
    for (const offer of context.state.retailOffers) {
        if (offer.companyId === company.id) {
            productIds.add(offer.productId);
        }
    }
    for (const productId of productIds) {
        const product = context.state.products.find((candidate) => candidate.id === productId);
        if (product?.category === industry || product?.needCategory === industry) {
            return true;
        }
    }
    return false;
}
function processWarAndGeopolitics(context) {
    for (const war of context.wars) {
        if (war.status !== "active") {
            continue;
        }
        if (context.nextTick <= 1) {
            context.metrics.push({
                id: `${context.seed}-metric-${context.nextTick}-${war.id}-intensity`,
                tick: context.nextTick,
                name: "war.intensity",
                value: clamp(war.intensity, 0, 1),
                tags: {
                    warId: war.id,
                    status: "stabilizing_start"
                }
            });
            continue;
        }
        applyWarBlockades(context, war);
        applyWarSanctions(context, war);
        for (const army of context.armies.filter((candidate) => candidate.warId === war.id)) {
            processArmySupply(context, war, army);
        }
        for (const front of context.fronts.filter((candidate) => candidate.warId === war.id && candidate.active)) {
            processFrontMovement(context, war, front);
        }
        applyMilitaryLogisticsCompetition(context, war);
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${war.id}-intensity`,
            tick: context.nextTick,
            name: "war.intensity",
            value: clamp(war.intensity, 0, 1),
            tags: {
                warId: war.id,
                status: war.status
            }
        });
    }
}
function processArmySupply(context, war, army) {
    const units = context.militaryUnits.filter((unit) => unit.armyId === army.id);
    const requested = {
        food: sanitizeQuantity(units.reduce((total, unit) => total + unit.strength * unit.supplyNeedPerTick.food, 0)),
        fuel: sanitizeQuantity(units.reduce((total, unit) => total + unit.strength * unit.supplyNeedPerTick.fuel, 0)),
        ammunition: sanitizeQuantity(units.reduce((total, unit) => total + unit.strength * unit.supplyNeedPerTick.ammunition, 0))
    };
    const consumed = {
        food: Math.min(army.foodStock, requested.food),
        fuel: Math.min(army.fuelStock, requested.fuel),
        ammunition: Math.min(army.ammunitionStock, requested.ammunition)
    };
    army.foodStock = sanitizeQuantity(army.foodStock - consumed.food);
    army.fuelStock = sanitizeQuantity(army.fuelStock - consumed.fuel);
    army.ammunitionStock = sanitizeQuantity(army.ammunitionStock - consumed.ammunition);
    const shortages = {
        food: sanitizeQuantity(requested.food - consumed.food),
        fuel: sanitizeQuantity(requested.fuel - consumed.fuel),
        ammunition: sanitizeQuantity(requested.ammunition - consumed.ammunition)
    };
    const totalRequested = requested.food + requested.fuel + requested.ammunition;
    const totalShortage = shortages.food + shortages.fuel + shortages.ammunition;
    const shortageRatio = totalRequested > 0 ? totalShortage / totalRequested : 0;
    army.readiness = clamp(army.readiness + 0.01 - shortageRatio * 0.16, 0, 1);
    army.morale = clamp(army.morale + (totalShortage > 0 ? -0.025 : 0.006), 0, 1);
    for (const unit of units) {
        unit.readiness = clamp(unit.readiness + 0.008 - shortageRatio * 0.12, 0, 1);
    }
    recordMilitarySupply(context, war, army, "food", requested.food, consumed.food, shortages.food);
    recordMilitarySupply(context, war, army, "fuel", requested.fuel, consumed.fuel, shortages.fuel);
    recordMilitarySupply(context, war, army, "ammunition", requested.ammunition, consumed.ammunition, shortages.ammunition);
}
function recordMilitarySupply(context, war, army, supplyType, requestedQuantity, consumedQuantity, shortageQuantity) {
    const productId = findMilitarySupplyProductId(context.state, supplyType);
    const replenishmentQuantity = sanitizeQuantity(Math.ceil(requestedQuantity * clamp(war.intensity, 0.1, 1) * 0.25));
    const orderQuantity = sanitizeQuantity(shortageQuantity + replenishmentQuantity);
    context.militarySupplies.push({
        id: `${context.seed}-military-supply-${context.nextTick}-${army.id}-${supplyType}`,
        armyId: army.id,
        productId,
        supplyType,
        requestedQuantity,
        deliveredQuantity: 0,
        consumedQuantity,
        shortageQuantity,
        tick: context.nextTick
    });
    if (orderQuantity > 0) {
        context.militaryOrders.push({
            id: `${context.seed}-military-order-${context.nextTick}-${army.id}-${supplyType}`,
            warId: war.id,
            countryId: army.countryId,
            productId,
            supplyType,
            quantity: orderQuantity,
            fulfilledQuantity: 0,
            maxPriceMinor: getMilitarySupplyMaxPriceMinor(supplyType),
            status: shortageQuantity > 0 ? "partially_filled" : "open",
            tick: context.nextTick
        });
    }
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${army.id}-${supplyType}-demand`,
        tick: context.nextTick,
        name: "war.military_demand.quantity",
        value: requestedQuantity + orderQuantity,
        tags: {
            warId: war.id,
            armyId: army.id,
            supplyType
        }
    });
}
function processFrontMovement(context, war, front) {
    const attacker = context.armies.find((army) => army.id === front.attackerArmyId);
    const defender = context.armies.find((army) => army.id === front.defenderArmyId);
    if (!attacker || !defender) {
        return;
    }
    const attackerPower = calculateArmyPower(context, attacker, front.cellIds);
    const defenderPower = calculateArmyPower(context, defender, front.cellIds);
    const totalPower = attackerPower + defenderPower;
    front.pressure = totalPower > 0 ? clamp(attackerPower / totalPower, 0, 1) : front.pressure;
    if (attackerPower > defenderPower * 1.02) {
        const target = chooseCaptureTarget(context, front, attacker.countryId, defender.countryId);
        front.movementDirection = "attacker";
        if (target) {
            captureStrategicCell(context, war, target, attacker.countryId, defender.countryId);
        }
    }
    else if (defenderPower > attackerPower * 1.2) {
        front.movementDirection = "defender";
    }
    else {
        front.movementDirection = "static";
    }
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${front.id}-pressure`,
        tick: context.nextTick,
        name: "war.front.pressure",
        value: front.pressure,
        tags: {
            warId: war.id,
            frontId: front.id,
            direction: front.movementDirection
        }
    });
}
function calculateArmyPower(context, army, cellIds) {
    const doctrineMultiplier = army.doctrine === "offensive" ? 1.08 : army.doctrine === "defensive" ? 1.04 : 1;
    return context.militaryUnits
        .filter((unit) => unit.armyId === army.id && cellIds.includes(unit.cellId))
        .reduce((total, unit) => total + unit.strength * unit.combatPower * unit.readiness * army.readiness * army.morale * doctrineMultiplier, 0);
}
function chooseCaptureTarget(context, front, attackerCountryId, defenderCountryId) {
    const candidates = context.strategicCells
        .filter((cell) => front.cellIds.includes(cell.id) &&
        cell.factualControllerCountryId !== attackerCountryId &&
        (cell.legalControllerCountryId === defenderCountryId || cell.contested))
        .sort((left, right) => Number(right.contested) - Number(left.contested) || left.population - right.population);
    return candidates[0] ?? null;
}
function captureStrategicCell(context, war, cell, occupierCountryId, previousControllerCountryId) {
    if (cell.factualControllerCountryId === occupierCountryId) {
        return;
    }
    const previousController = cell.factualControllerCountryId;
    cell.factualControllerCountryId = occupierCountryId;
    cell.contested = false;
    cell.recognitionStatus = cell.legalControllerCountryId === occupierCountryId ? "recognized" : "occupied";
    const occupation = context.occupations.find((candidate) => candidate.cellId === cell.id && candidate.warId === war.id);
    if (occupation) {
        occupation.occupierCountryId = occupierCountryId;
        occupation.recognition = clamp(war.recognitionScore, 0, 1);
        occupation.taxCaptureRate = clamp(0.2 + war.intensity * 0.35, 0, 0.85);
        occupation.infrastructureControl = clamp(cell.infrastructureScore, 0, 1);
    }
    else {
        context.occupations.push({
            id: `${context.seed}-occupation-${war.id}-${cell.id}`,
            warId: war.id,
            cellId: cell.id,
            occupierCountryId,
            legalOwnerCountryId: cell.legalControllerCountryId,
            startedTick: context.nextTick,
            recognition: clamp(war.recognitionScore, 0, 1),
            taxCaptureRate: clamp(0.2 + war.intensity * 0.35, 0, 0.85),
            infrastructureControl: clamp(cell.infrastructureScore, 0, 1)
        });
    }
    createWarDamage(context, war, cell);
    moveRefugees(context, war, cell);
    context.events.push({
        id: `${context.seed}-event-${context.nextTick}-${cell.id}-captured`,
        tick: context.nextTick,
        type: "StrategicCellCapturedEvent",
        message: `${cell.name} factual control changed during ${war.name}.`,
        entityIds: [war.id, cell.id, occupierCountryId, previousController],
        metadata: {
            warId: war.id,
            cellId: cell.id,
            occupierCountryId,
            previousControllerCountryId,
            legalControllerCountryId: cell.legalControllerCountryId
        }
    });
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${cell.id}-captured`,
        tick: context.nextTick,
        name: "war.front.cell_captured",
        value: 1,
        tags: {
            warId: war.id,
            cellId: cell.id,
            occupierCountryId
        }
    });
}
function createWarDamage(context, war, cell) {
    const severity = clamp(0.18 + war.intensity * 0.48 + (cell.infrastructureScore < 0.5 ? 0.06 : 0), 0.05, 0.85);
    const link = context.infrastructureLinks
        .filter((candidate) => candidate.warDisruptionRisk > 0 || candidate.quality < 0.7)
        .sort((left, right) => right.warDisruptionRisk - left.warDisruptionRisk || left.quality - right.quality)[0];
    if (link) {
        link.quality = clamp(link.quality - severity * 0.16, 0, 1);
        link.warDisruptionRisk = clamp(Math.max(link.warDisruptionRisk, severity), 0, 1);
        if (severity >= 0.45) {
            link.blocked = true;
        }
        context.warDamage.push({
            id: `${context.seed}-damage-${context.nextTick}-${war.id}-${link.id}`,
            warId: war.id,
            cellId: cell.id,
            targetType: "infrastructure_link",
            targetId: link.id,
            severity,
            damageMinor: sanitizeMoney(Math.floor(severity * 1_000_000)),
            tick: context.nextTick,
            repaired: false
        });
    }
    const damagedWarehouse = context.warehouses.find((warehouse) => {
        const city = context.cities.find((candidate) => candidate.id === warehouse.cityId);
        return city?.countryId === cell.legalControllerCountryId;
    });
    if (damagedWarehouse) {
        const lostCapacity = sanitizeQuantity(damagedWarehouse.capacity * severity * 0.03);
        damagedWarehouse.capacity = sanitizeQuantity(damagedWarehouse.capacity - lostCapacity);
        context.warDamage.push({
            id: `${context.seed}-damage-${context.nextTick}-${war.id}-${damagedWarehouse.id}`,
            warId: war.id,
            cellId: cell.id,
            targetType: "warehouse",
            targetId: damagedWarehouse.id,
            severity: clamp(severity * 0.65, 0, 1),
            damageMinor: sanitizeMoney(lostCapacity * damagedWarehouse.handlingCostMinorPerUnit),
            tick: context.nextTick,
            repaired: false
        });
    }
    context.events.push({
        id: `${context.seed}-event-${context.nextTick}-${cell.id}-war-damage`,
        tick: context.nextTick,
        type: "WarDamageEvent",
        message: `Infrastructure around ${cell.name} took war damage.`,
        entityIds: [war.id, cell.id, link?.id ?? damagedWarehouse?.id ?? cell.id],
        metadata: {
            warId: war.id,
            cellId: cell.id,
            severity
        }
    });
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${cell.id}-damage`,
        tick: context.nextTick,
        name: "war.damage.severity",
        value: severity,
        tags: {
            warId: war.id,
            cellId: cell.id
        }
    });
}
function moveRefugees(context, war, cell) {
    const originCity = findNearestCity(context.cities, cell.center, cell.legalControllerCountryId);
    const destinationCity = context.cities
        .filter((city) => city.countryId === cell.legalControllerCountryId && city.id !== originCity?.id)
        .sort((left, right) => geoDistance(left.location, cell.center) - geoDistance(right.location, cell.center))[0] ?? null;
    if (!originCity || !destinationCity || originCity.populationTotal <= 0 || cell.population <= 0) {
        return;
    }
    const people = sanitizeQuantity(Math.min(cell.population, Math.max(100, Math.floor(cell.population * war.intensity * 0.015))));
    if (people <= 0) {
        return;
    }
    cell.population = sanitizeQuantity(cell.population - people);
    originCity.populationTotal = sanitizeQuantity(originCity.populationTotal - people);
    destinationCity.populationTotal = sanitizeQuantity(destinationCity.populationTotal + people);
    transferCohortPopulation(context.populationCohorts, originCity.id, destinationCity.id, people);
    context.refugeeFlows.push({
        id: `${context.seed}-refugees-${context.nextTick}-${war.id}-${cell.id}`,
        warId: war.id,
        originCityId: originCity.id,
        destinationCityId: destinationCity.id,
        originCellId: cell.id,
        people,
        tick: context.nextTick,
        status: "moving"
    });
    context.events.push({
        id: `${context.seed}-event-${context.nextTick}-${cell.id}-refugees`,
        tick: context.nextTick,
        type: "RefugeeFlowCreatedEvent",
        message: `${people} people left ${originCity.name} for ${destinationCity.name}.`,
        entityIds: [war.id, originCity.id, destinationCity.id, cell.id],
        metadata: {
            warId: war.id,
            originCityId: originCity.id,
            destinationCityId: destinationCity.id,
            people
        }
    });
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${cell.id}-refugees`,
        tick: context.nextTick,
        name: "war.refugees.people",
        value: people,
        tags: {
            warId: war.id,
            originCityId: originCity.id,
            destinationCityId: destinationCity.id
        }
    });
}
function transferCohortPopulation(cohorts, originCityId, destinationCityId, people) {
    let remaining = sanitizeQuantity(people);
    let moved = 0;
    for (const cohort of cohorts.filter((candidate) => candidate.cityId === originCityId)) {
        if (remaining <= 0) {
            break;
        }
        const transfer = sanitizeQuantity(Math.min(cohort.size, remaining));
        cohort.size = sanitizeQuantity(cohort.size - transfer);
        moved += transfer;
        remaining = sanitizeQuantity(remaining - transfer);
    }
    const destinationCohort = cohorts.find((cohort) => cohort.cityId === destinationCityId);
    if (destinationCohort && moved > 0) {
        destinationCohort.size = sanitizeQuantity(destinationCohort.size + moved);
        destinationCohort.satisfaction = clamp(destinationCohort.satisfaction - moved / Math.max(1, destinationCohort.size) * 0.015, 0, 1);
    }
}
function applyWarBlockades(context, war) {
    for (const blockade of context.blockades.filter((candidate) => candidate.warId === war.id && candidate.active)) {
        if (blockade.routeId) {
            const route = context.logisticsRoutes.find((candidate) => candidate.id === blockade.routeId);
            if (route) {
                const reason = `War blockade severity ${Math.round(blockade.severity * 100)}%.`;
                const wasActive = route.active;
                route.active = false;
                route.blockedReason = reason;
                for (const linkId of route.infrastructureLinkIds) {
                    const link = context.infrastructureLinks.find((candidate) => candidate.id === linkId);
                    if (link) {
                        link.warDisruptionRisk = clamp(Math.max(link.warDisruptionRisk, blockade.severity), 0, 1);
                        link.blocked = blockade.severity >= 0.75 || link.blocked;
                    }
                }
                if (wasActive) {
                    context.events.push({
                        id: `${context.seed}-event-${context.nextTick}-${blockade.id}-route-blocked`,
                        tick: context.nextTick,
                        type: "LogisticsRouteBlockedByWarEvent",
                        message: `${route.name} was blocked by wartime controls.`,
                        entityIds: [war.id, blockade.id, route.id],
                        metadata: {
                            warId: war.id,
                            blockadeId: blockade.id,
                            routeId: route.id,
                            severity: blockade.severity
                        }
                    });
                }
            }
        }
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${blockade.id}-blockade`,
            tick: context.nextTick,
            name: "war.blockade.severity",
            value: clamp(blockade.severity, 0, 1),
            tags: {
                warId: war.id,
                blockadeId: blockade.id,
                target: blockade.routeId ?? blockade.portId ?? blockade.countryId
            }
        });
    }
}
function applyWarSanctions(context, war) {
    const recognitionPenalty = clamp(1 - war.recognitionScore, 0, 1);
    for (const sanction of context.sanctions.filter((candidate) => candidate.warId === war.id && candidate.active)) {
        sanction.severity = clamp(Math.max(sanction.severity, recognitionPenalty * 0.65), 0, 1);
        context.metrics.push({
            id: `${context.seed}-metric-${context.nextTick}-${sanction.id}-sanction`,
            tick: context.nextTick,
            name: "war.sanction.severity",
            value: sanction.severity,
            tags: {
                warId: war.id,
                sanctionId: sanction.id,
                type: sanction.type
            }
        });
    }
}
function applyMilitaryLogisticsCompetition(context, war) {
    const militaryDemand = context.militaryOrders
        .filter((order) => order.warId === war.id && order.tick === context.nextTick)
        .reduce((total, order) => total + order.quantity, 0);
    if (militaryDemand <= 0) {
        return;
    }
    const competitionRatio = clamp(militaryDemand / 100_000, 0.05, 0.85);
    for (const company of context.transportCompanies) {
        if (!company.active) {
            continue;
        }
        company.reliability = clamp(company.reliability - competitionRatio * 0.02, 0, 1);
    }
    for (const shipment of context.shipments) {
        if (shipment.status !== "in_transit") {
            continue;
        }
        const route = context.logisticsRoutes.find((candidate) => candidate.id === shipment.routeId);
        const riskyRoute = route?.infrastructureLinkIds.some((linkId) => {
            const link = context.infrastructureLinks.find((candidate) => candidate.id === linkId);
            return Boolean(link && (link.warDisruptionRisk > 0.25 || link.blocked));
        });
        if (riskyRoute) {
            shipment.remainingTicks = sanitizeQuantity(shipment.remainingTicks + 1);
            shipment.risk = clamp(shipment.risk + competitionRatio * 0.08, 0, 1);
        }
    }
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${war.id}-logistics-competition`,
        tick: context.nextTick,
        name: "war.logistics.military_competition_ratio",
        value: competitionRatio,
        tags: {
            warId: war.id
        }
    });
}
function findMilitarySupplyProductId(state, supplyType) {
    const suffixByType = {
        food: "product-field-rations",
        fuel: "product-diesel",
        ammunition: "product-ammunition"
    };
    const product = state.products.find((candidate) => candidate.id.endsWith(suffixByType[supplyType])) ??
        state.products.find((candidate) => candidate.needCategory === "food") ??
        state.products[0];
    return product?.id ?? "unknown-product";
}
function getMilitarySupplyMaxPriceMinor(supplyType) {
    const priceByType = {
        food: 900,
        fuel: 1_400,
        ammunition: 2_600
    };
    return priceByType[supplyType];
}
function findNearestCity(cities, point, countryId) {
    return (cities
        .filter((city) => city.countryId === countryId)
        .sort((left, right) => geoDistance(left.location, point) - geoDistance(right.location, point))[0] ?? null);
}
function geoDistance(left, right) {
    const lat = left.lat - right.lat;
    const lon = left.lon - right.lon;
    return Math.sqrt(lat * lat + lon * lon);
}
function processCrimeAndBlackMarket(context) {
    generateBlackMarkets(context);
    processIllegalTrades(context);
    const activeMarkets = context.blackMarkets.filter((market) => market.active);
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-black-markets-active`,
        tick: context.nextTick,
        name: "crime.black_market.active",
        value: activeMarkets.length,
        tags: { scope: "world" }
    });
}
function generateBlackMarkets(context) {
    if (context.nextTick <= 1) {
        return;
    }
    for (const city of context.cities) {
        const country = context.countries.find((candidate) => candidate.id === city.countryId);
        if (!country) {
            continue;
        }
        for (const product of context.products) {
            const trigger = getBlackMarketTrigger(context, country.id, city.id, product);
            if (!trigger) {
                continue;
            }
            const demandQuantity = calculateBlackMarketDemand(context, city.id, product, trigger);
            const supplyQuantity = getCityInventoryQuantity(context.warehouses, context.inventoryLots, city.id, product.id);
            const corruption = context.corruptionIndexes.find((index) => index.countryId === country.id)?.value ?? 0.2;
            const policy = context.taxPolicies.find((candidate) => candidate.countryId === country.id);
            const taxPressure = clamp((policy?.salesTaxRate ?? 0) + (policy?.importTariffRate ?? 0) * 0.5, 0, 1);
            const pressure = clamp(demandQuantity / Math.max(1, supplyQuantity + demandQuantity) + taxPressure * 0.35 + corruption * 0.18, 0, 1);
            const existing = context.blackMarkets.find((market) => market.countryId === country.id && market.cityId === city.id && market.productId === product.id);
            if (existing) {
                existing.trigger = trigger;
                existing.demandQuantity = demandQuantity;
                existing.supplyQuantity = supplyQuantity;
                existing.priceMultiplier = clamp(1.2 + pressure * 1.25 + corruption * 0.25, 1.1, 4);
                existing.riskLevel = calculateMarketRisk(context, country.id, pressure);
                existing.corruptionInfluence = corruption;
                existing.active = true;
                existing.lastUpdatedTick = context.nextTick;
            }
            else {
                context.blackMarkets.push({
                    id: `${context.seed}-black-market-${country.id}-${city.id}-${product.id}`,
                    countryId: country.id,
                    cityId: city.id,
                    productId: product.id,
                    trigger,
                    demandQuantity,
                    supplyQuantity,
                    priceMultiplier: clamp(1.2 + pressure * 1.25 + corruption * 0.25, 1.1, 4),
                    riskLevel: calculateMarketRisk(context, country.id, pressure),
                    corruptionInfluence: corruption,
                    active: true,
                    createdTick: context.nextTick,
                    lastUpdatedTick: context.nextTick
                });
                context.events.push({
                    id: `${context.seed}-event-${context.nextTick}-${country.id}-${city.id}-${product.id}-black-market`,
                    tick: context.nextTick,
                    type: "BlackMarketCreatedEvent",
                    message: `A black market for ${product.name} emerged in ${city.name}.`,
                    entityIds: [country.id, city.id, product.id],
                    metadata: {
                        countryId: country.id,
                        cityId: city.id,
                        productId: product.id,
                        trigger,
                        demandQuantity
                    }
                });
            }
            context.metrics.push({
                id: `${context.seed}-metric-${context.nextTick}-${city.id}-${product.id}-black-market-demand`,
                tick: context.nextTick,
                name: "crime.black_market.demand",
                value: demandQuantity,
                tags: {
                    countryId: country.id,
                    cityId: city.id,
                    productId: product.id,
                    trigger
                }
            });
        }
    }
}
function processIllegalTrades(context) {
    for (const trade of context.illegalTrades) {
        if (trade.status !== "pending") {
            continue;
        }
        const blackMarket = context.blackMarkets.find((market) => market.id === trade.blackMarketId);
        const seller = context.companies.find((company) => company.id === trade.sellerCompanyId);
        const product = context.products.find((candidate) => candidate.id === trade.productId);
        const route = trade.smugglingRouteId ? context.smugglingRoutes.find((candidate) => candidate.id === trade.smugglingRouteId) ?? null : null;
        if (!blackMarket || !seller || !product) {
            trade.status = "cancelled";
            trade.resolvedTick = context.nextTick;
            continue;
        }
        trade.detectionRisk = calculateIllegalTradeDetectionRisk({
            state: context.state,
            blackMarket,
            route,
            seller,
            quantity: trade.quantity,
            priceMinor: trade.priceMinor,
            bribeMinor: trade.bribeMinor
        });
        const roll = deterministicFraction(`${context.seed}:${context.nextTick}:${trade.id}:detection`);
        if (roll < trade.detectionRisk) {
            resolveDetectedIllegalTrade(context, trade, blackMarket, seller, product);
        }
        else {
            resolveCompletedIllegalTrade(context, trade, blackMarket, seller, product);
        }
    }
}
function resolveCompletedIllegalTrade(context, trade, blackMarket, seller, product) {
    const consumedQuantity = consumeCompanyInventory(context.warehouses, context.inventoryLots, seller.id, product.id, trade.quantity);
    if (consumedQuantity <= 0) {
        trade.status = "cancelled";
        trade.resolvedTick = context.nextTick;
        return;
    }
    const settledPriceMinor = sanitizeMoney(Math.floor(trade.priceMinor * (consumedQuantity / Math.max(1, trade.quantity))));
    const buyerAccount = getSettlementAccount(context.bankAccounts, trade.buyerOwnerType, trade.buyerOwnerId, seller.currencyCode);
    const sellerAccount = getSettlementAccount(context.bankAccounts, "company", seller.id, seller.currencyCode);
    if (!buyerAccount || getAvailableCashMinor(buyerAccount) < settledPriceMinor) {
        trade.status = "cancelled";
        trade.resolvedTick = context.nextTick;
        addInventory({
            inventoryLots: context.inventoryLots,
            warehouseId: context.warehouses.find((warehouse) => warehouse.companyId === seller.id)?.id ?? "",
            productId: product.id,
            quantity: consumedQuantity,
            quality: product.baseQuality,
            lotId: `${context.seed}-lot-${context.nextTick}-${trade.id}-returned`
        });
        return;
    }
    buyerAccount.balanceMinor = sanitizeMoney(buyerAccount.balanceMinor - settledPriceMinor);
    if (sellerAccount) {
        sellerAccount.balanceMinor = sanitizeMoney(sellerAccount.balanceMinor + settledPriceMinor);
    }
    seller.cashBalanceMinor = sanitizeMoney(seller.cashBalanceMinor + settledPriceMinor);
    trade.status = "completed";
    trade.resolvedTick = context.nextTick;
    context.financialTransactions.push({
        id: `${context.seed}-tx-${context.nextTick}-${trade.id}-settlement`,
        tick: context.nextTick,
        type: "IllegalTradeTransaction",
        entries: [
            {
                ownerType: "bank_account",
                ownerId: buyerAccount.id,
                amountMinor: -settledPriceMinor,
                currencyCode: buyerAccount.currencyCode
            },
            {
                ownerType: "company",
                ownerId: seller.id,
                amountMinor: settledPriceMinor,
                currencyCode: seller.currencyCode
            }
        ]
    });
    if (trade.bribeMinor > 0) {
        const bribePaidMinor = payCompanyCash(seller, sellerAccount, trade.bribeMinor);
        if (bribePaidMinor > 0) {
            context.corruptionCases.push({
                id: `${context.seed}-corruption-${context.nextTick}-${trade.id}`,
                countryId: blackMarket.countryId,
                companyId: seller.id,
                agencyId: null,
                illegalTradeId: trade.id,
                amountMinor: bribePaidMinor,
                severity: clamp(bribePaidMinor / Math.max(1, trade.priceMinor), 0.01, 1),
                status: "suspected",
                tick: context.nextTick
            });
            context.financialTransactions.push({
                id: `${context.seed}-tx-${context.nextTick}-${trade.id}-bribe`,
                tick: context.nextTick,
                type: "CorruptionPaymentTransaction",
                entries: [
                    {
                        ownerType: "company",
                        ownerId: seller.id,
                        amountMinor: -bribePaidMinor,
                        currencyCode: seller.currencyCode
                    },
                    {
                        ownerType: "market_sink",
                        ownerId: `${blackMarket.countryId}-corruption-network`,
                        amountMinor: bribePaidMinor,
                        currencyCode: seller.currencyCode
                    }
                ]
            });
        }
    }
    context.events.push({
        id: `${context.seed}-event-${context.nextTick}-${trade.id}-completed`,
        tick: context.nextTick,
        type: "IllegalTradeCompletedEvent",
        message: `${seller.name} completed a risky shadow trade for ${product.name}.`,
        entityIds: [trade.id, seller.id, product.id, blackMarket.id],
        metadata: {
            tradeId: trade.id,
            sellerCompanyId: seller.id,
            productId: product.id,
            quantity: consumedQuantity,
            priceMinor: settledPriceMinor,
            detectionRisk: trade.detectionRisk
        }
    });
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${trade.id}-completed`,
        tick: context.nextTick,
        name: "crime.illegal_trade.completed",
        value: consumedQuantity,
        tags: { productId: product.id, countryId: blackMarket.countryId }
    }, {
        id: `${context.seed}-metric-${context.nextTick}-${trade.id}-revenue`,
        tick: context.nextTick,
        name: "crime.illegal_trade.revenue_minor",
        value: settledPriceMinor,
        tags: { sellerCompanyId: seller.id, productId: product.id }
    });
}
function resolveDetectedIllegalTrade(context, trade, blackMarket, seller, product) {
    const agency = getEnforcementAgency(context, blackMarket.countryId);
    const confiscatedQuantity = consumeCompanyInventory(context.warehouses, context.inventoryLots, seller.id, product.id, trade.quantity);
    const confiscatedValueMinor = sanitizeMoney(Math.floor(trade.priceMinor * (confiscatedQuantity / Math.max(1, trade.quantity))));
    const fineAmountMinor = sanitizeMoney(Math.max(10_000, Math.floor(trade.priceMinor * (1.25 + trade.detectionRisk))));
    const sellerAccount = getSettlementAccount(context.bankAccounts, "company", seller.id, seller.currencyCode);
    const paidFineMinor = payCompanyCash(seller, sellerAccount, fineAmountMinor);
    const reputationPenaltyAmount = clamp(0.08 + trade.detectionRisk * 0.18 + trade.quantity / Math.max(1, blackMarket.demandQuantity) * 0.08, 0.04, 0.4);
    const fine = {
        id: `${context.seed}-fine-${context.nextTick}-${trade.id}`,
        targetType: "company",
        targetId: seller.id,
        amountMinor: fineAmountMinor,
        reason: "Illegal trade detected",
        status: paidFineMinor >= fineAmountMinor ? "paid" : "issued",
        tick: context.nextTick,
        paidTick: paidFineMinor > 0 ? context.nextTick : null
    };
    const investigation = {
        id: `${context.seed}-investigation-${context.nextTick}-${trade.id}`,
        agencyId: agency.id,
        countryId: blackMarket.countryId,
        targetType: "illegal_trade",
        targetId: trade.id,
        status: "closed",
        suspicion: clamp(trade.detectionRisk + trade.quantity / Math.max(1, blackMarket.demandQuantity), 0, 1),
        detectionChance: trade.detectionRisk,
        openedTick: context.nextTick,
        closedTick: context.nextTick,
        outcome: confiscatedQuantity > 0 ? "confiscation" : "fine"
    };
    trade.status = confiscatedQuantity > 0 ? "confiscated" : "detected";
    trade.resolvedTick = context.nextTick;
    seller.reputation = clamp(seller.reputation - reputationPenaltyAmount, 0, 1);
    context.fines.push(fine);
    context.investigations.push(investigation);
    context.reputationPenalties.push({
        id: `${context.seed}-reputation-penalty-${context.nextTick}-${trade.id}`,
        targetType: "company",
        targetId: seller.id,
        amount: reputationPenaltyAmount,
        reason: "Detected black market trade",
        tick: context.nextTick
    });
    if (confiscatedQuantity > 0) {
        context.confiscations.push({
            id: `${context.seed}-confiscation-${context.nextTick}-${trade.id}`,
            illegalTradeId: trade.id,
            agencyId: agency.id,
            targetType: "inventory",
            targetId: seller.id,
            productId: product.id,
            quantity: confiscatedQuantity,
            valueMinor: confiscatedValueMinor,
            tick: context.nextTick
        });
    }
    if (paidFineMinor > 0) {
        context.financialTransactions.push({
            id: `${context.seed}-tx-${context.nextTick}-${trade.id}-fine`,
            tick: context.nextTick,
            type: "FinePaymentTransaction",
            entries: [
                {
                    ownerType: "company",
                    ownerId: seller.id,
                    amountMinor: -paidFineMinor,
                    currencyCode: seller.currencyCode
                },
                {
                    ownerType: "state",
                    ownerId: blackMarket.countryId,
                    amountMinor: paidFineMinor,
                    currencyCode: seller.currencyCode
                }
            ]
        });
    }
    if (confiscatedValueMinor > 0) {
        context.financialTransactions.push({
            id: `${context.seed}-tx-${context.nextTick}-${trade.id}-confiscation`,
            tick: context.nextTick,
            type: "ConfiscationTransaction",
            entries: [
                {
                    ownerType: "company",
                    ownerId: seller.id,
                    amountMinor: -confiscatedValueMinor,
                    currencyCode: seller.currencyCode
                },
                {
                    ownerType: "state",
                    ownerId: blackMarket.countryId,
                    amountMinor: confiscatedValueMinor,
                    currencyCode: seller.currencyCode
                }
            ]
        });
    }
    context.events.push({
        id: `${context.seed}-event-${context.nextTick}-${trade.id}-detected`,
        tick: context.nextTick,
        type: "IllegalTradeDetectedEvent",
        message: `${agency.name} detected a black market trade by ${seller.name}.`,
        entityIds: [trade.id, seller.id, product.id, agency.id, blackMarket.id],
        metadata: {
            tradeId: trade.id,
            sellerCompanyId: seller.id,
            agencyId: agency.id,
            fineAmountMinor,
            paidFineMinor,
            confiscatedQuantity,
            reputationPenaltyAmount
        }
    });
    context.metrics.push({
        id: `${context.seed}-metric-${context.nextTick}-${trade.id}-detected`,
        tick: context.nextTick,
        name: "crime.illegal_trade.detected",
        value: confiscatedQuantity,
        tags: { productId: product.id, countryId: blackMarket.countryId }
    }, {
        id: `${context.seed}-metric-${context.nextTick}-${trade.id}-fine`,
        tick: context.nextTick,
        name: "crime.fine.amount_minor",
        value: paidFineMinor,
        tags: { companyId: seller.id, countryId: blackMarket.countryId }
    }, {
        id: `${context.seed}-metric-${context.nextTick}-${trade.id}-reputation-penalty`,
        tick: context.nextTick,
        name: "crime.reputation.penalty",
        value: reputationPenaltyAmount,
        tags: { companyId: seller.id }
    });
}
function getBlackMarketTrigger(context, countryId, cityId, product) {
    if (isProductBanned(context.laws, countryId, product)) {
        return "ban";
    }
    const recentUnmet = context.demandRecords
        .filter((record) => record.cityId === cityId && record.needCategory === product.needCategory)
        .reduce((total, record) => total + record.unmetQuantity, 0);
    if (recentUnmet > 0) {
        return "shortage";
    }
    const tax = context.taxPolicies.find((policy) => policy.countryId === countryId);
    if ((tax?.profitTaxRate ?? 0) + (tax?.salesTaxRate ?? 0) + (tax?.importTariffRate ?? 0) > 0.45) {
        return "high_tax";
    }
    if (context.wars.some((war) => war.status === "active" && (war.attackerCountryId === countryId || war.defenderCountryId === countryId))) {
        return "war";
    }
    if (context.sanctions.some((sanction) => sanction.active && (sanction.sourceCountryId === countryId || sanction.targetCountryId === countryId))) {
        return "sanction";
    }
    if ((context.corruptionIndexes.find((index) => index.countryId === countryId)?.value ?? 0) >= 0.45) {
        return "corruption";
    }
    return null;
}
function isProductBanned(laws, countryId, product) {
    return laws.some((law) => {
        if (law.countryId !== countryId || law.status !== "active") {
            return false;
        }
        if (law.type !== "export_restriction" && law.type !== "industry_license" && law.type !== "martial_law") {
            return false;
        }
        const productId = law.parameters.productId;
        const category = law.parameters.productCategory ?? law.parameters.category ?? law.parameters.industry;
        if (typeof productId === "string") {
            return productId === product.id;
        }
        if (typeof category === "string") {
            return category === product.category || category === product.needCategory;
        }
        return law.type === "martial_law";
    });
}
function calculateBlackMarketDemand(context, cityId, product, trigger) {
    const unmet = context.demandRecords
        .filter((record) => record.cityId === cityId && record.needCategory === product.needCategory)
        .reduce((total, record) => total + record.unmetQuantity, 0);
    const population = context.populationCohorts.filter((cohort) => cohort.cityId === cityId).reduce((total, cohort) => total + cohort.size, 0);
    const baseDemand = trigger === "ban" ? population * 0.004 : trigger === "shortage" ? unmet : population * 0.0015;
    const warMultiplier = trigger === "war" || trigger === "sanction" ? 1.4 : 1;
    return sanitizeQuantity(Math.max(unmet, baseDemand * warMultiplier));
}
function calculateMarketRisk(context, countryId, pressure) {
    const agency = getEnforcementAgency(context, countryId);
    const corruption = context.corruptionIndexes.find((index) => index.countryId === countryId)?.value ?? 0.2;
    return clamp(0.08 + agency.controlScore * 0.32 + pressure * 0.16 - corruption * 0.18, 0.02, 0.95);
}
function calculateIllegalTradePriceMinor(state, blackMarket, quantity) {
    const offerPrices = state.retailOffers
        .filter((offer) => offer.productId === blackMarket.productId && offer.active)
        .map((offer) => offer.priceMinor);
    const averagePrice = offerPrices.length > 0 ? offerPrices.reduce((total, price) => total + price, 0) / offerPrices.length : 500;
    return sanitizeMoney(Math.ceil(averagePrice * blackMarket.priceMultiplier * sanitizeQuantity(quantity)));
}
function calculateIllegalTradeDetectionRisk(input) {
    const agency = input.state.enforcementAgencies.find((candidate) => candidate.countryId === input.blackMarket.countryId && candidate.active) ??
        input.state.enforcementAgencies.find((candidate) => candidate.active) ??
        null;
    const government = input.state.governments.find((candidate) => candidate.countryId === input.blackMarket.countryId) ?? null;
    const corruption = input.state.corruptionIndexes.find((index) => index.countryId === input.blackMarket.countryId)?.value ?? government?.corruptionLevel ?? 0.2;
    const latestMediaReach = input.state.mediaInfluences
        .filter((influence) => influence.countryId === input.blackMarket.countryId)
        .slice(-5)
        .reduce((total, influence) => total + influence.reach, 0);
    const activeWar = input.state.wars.some((war) => war.status === "active" && (war.attackerCountryId === input.blackMarket.countryId || war.defenderCountryId === input.blackMarket.countryId));
    const sanctionPressure = input.state.sanctions.some((sanction) => sanction.active && (sanction.sourceCountryId === input.blackMarket.countryId || sanction.targetCountryId === input.blackMarket.countryId))
        ? 0.08
        : 0;
    const sizeFactor = clamp(input.quantity / Math.max(1, input.blackMarket.demandQuantity), 0, 1);
    const bribeShield = clamp(input.bribeMinor / Math.max(1, input.priceMinor), 0, 0.6);
    const regimeModifier = input.state.countries.find((country) => country.id === input.blackMarket.countryId)?.politicalSystem === "authoritarian_republic" ? 0.08 : 0.02;
    const routeRisk = input.route?.baseDetectionRisk ?? input.blackMarket.riskLevel;
    const routeShield = input.route?.corruptionShield ?? 0;
    const agencyPressure = agency ? agency.controlScore * 0.32 + agency.corruptionResistance * 0.1 + agency.mediaSensitivity * clamp(latestMediaReach, 0, 0.15) : 0.12;
    const reputationPressure = clamp((1 - input.seller.reputation) * 0.08, 0, 0.08);
    return clamp(routeRisk +
        agencyPressure +
        sizeFactor * 0.24 +
        regimeModifier +
        sanctionPressure +
        (activeWar ? 0.05 : 0) +
        reputationPressure -
        corruption * 0.24 -
        routeShield -
        bribeShield * 0.26, 0.02, 0.98);
}
function getEnforcementAgency(context, countryId) {
    const existing = context.enforcementAgencies.find((agency) => agency.countryId === countryId && agency.active) ??
        context.enforcementAgencies.find((agency) => agency.active);
    if (existing) {
        return existing;
    }
    const agency = {
        id: `${context.seed}-agency-${countryId}-default`,
        countryId,
        name: "Economic Enforcement Office",
        controlScore: 0.45,
        capacityPerTick: 2,
        corruptionResistance: 0.45,
        mediaSensitivity: 0.35,
        budgetMinor: 1_000_000,
        active: true
    };
    context.enforcementAgencies.push(agency);
    return agency;
}
function getCompanyInventoryQuantity(warehouses, inventoryLots, companyId, productId) {
    const warehouseIds = new Set(warehouses.filter((warehouse) => warehouse.companyId === companyId).map((warehouse) => warehouse.id));
    return sanitizeQuantity(inventoryLots
        .filter((lot) => warehouseIds.has(lot.warehouseId) && lot.productId === productId)
        .reduce((total, lot) => total + lot.quantity, 0));
}
function getCityInventoryQuantity(warehouses, inventoryLots, cityId, productId) {
    const warehouseIds = new Set(warehouses.filter((warehouse) => warehouse.cityId === cityId).map((warehouse) => warehouse.id));
    return sanitizeQuantity(inventoryLots
        .filter((lot) => warehouseIds.has(lot.warehouseId) && lot.productId === productId)
        .reduce((total, lot) => total + lot.quantity, 0));
}
function consumeCompanyInventory(warehouses, inventoryLots, companyId, productId, requestedQuantity) {
    let remainingQuantity = sanitizeQuantity(requestedQuantity);
    let consumedQuantity = 0;
    const companyWarehouseIds = new Set(warehouses.filter((warehouse) => warehouse.companyId === companyId).map((warehouse) => warehouse.id));
    for (const lot of inventoryLots) {
        if (remainingQuantity <= 0) {
            break;
        }
        if (!companyWarehouseIds.has(lot.warehouseId) || lot.productId !== productId || lot.quantity <= 0) {
            continue;
        }
        const quantity = sanitizeQuantity(Math.min(lot.quantity, remainingQuantity));
        lot.quantity = sanitizeQuantity(lot.quantity - quantity);
        remainingQuantity = sanitizeQuantity(remainingQuantity - quantity);
        consumedQuantity = sanitizeQuantity(consumedQuantity + quantity);
    }
    return consumedQuantity;
}
function payCompanyCash(company, account, requestedAmountMinor) {
    const amountMinor = sanitizeMoney(Math.min(requestedAmountMinor, company.cashBalanceMinor));
    if (amountMinor <= 0) {
        return 0;
    }
    company.cashBalanceMinor = sanitizeMoney(company.cashBalanceMinor - amountMinor);
    if (account) {
        account.balanceMinor = sanitizeMoney(account.balanceMinor - Math.min(account.balanceMinor, amountMinor));
    }
    return amountMinor;
}
function updateDataReliability(input) {
    const byCountry = new Map();
    for (const reliability of input.existing) {
        byCountry.set(reliability.countryId, reliability);
    }
    return input.countries.map((country) => {
        const existing = byCountry.get(country.id);
        const government = input.governments.find((candidate) => candidate.countryId === country.id);
        const corruption = input.corruptionIndexes.find((candidate) => candidate.countryId === country.id)?.value ?? government?.corruptionLevel ?? 0.25;
        const authoritarian = country.politicalSystem === "authoritarian_republic" || government?.regime === "authoritarian_republic";
        const inheritedRisk = existing?.manipulationRisk ?? 0;
        const manipulationRisk = clamp(Math.max(inheritedRisk * 0.65, corruption * 0.55 + (authoritarian ? 0.42 : 0) + (1 - country.stability) * 0.16), 0, 1);
        const score = clamp((existing?.score ?? 0.72) * 0.45 +
            (1 - corruption * 0.42 - manipulationRisk * 0.28 + country.stability * 0.16 + (government?.taxEfficiency ?? 0.65) * 0.12) * 0.55, 0.05, 1);
        const grade = authoritarian || manipulationRisk > 0.55 ? "manipulated" : score >= 0.75 ? "high" : score >= 0.5 ? "medium" : "low";
        return {
            id: existing?.id ?? `${input.seed}-reliability-${slugify(country.id)}-state`,
            countryId: country.id,
            source: existing?.source ?? "state",
            grade,
            score,
            manipulationRisk,
            method: grade === "manipulated"
                ? "state-published statistics with modelled manipulation risk"
                : "public statistics blended from market, budget, and logistics observations",
            updatedTick: input.nextTick
        };
    });
}
function createMetricChanges(input) {
    const previousByKey = new Map();
    for (const metric of input.previousMetrics) {
        const key = metricKey(metric);
        const current = previousByKey.get(key);
        if (!current || metric.tick > current.tick) {
            previousByKey.set(key, metric);
        }
    }
    return input.currentMetrics.map((metric, index) => {
        const previous = previousByKey.get(metricKey(metric));
        const previousValue = sanitizeNonNegativeNumber(previous?.value ?? 0);
        const currentValue = sanitizeNonNegativeNumber(metric.value);
        const delta = Number.isFinite(currentValue - previousValue) ? currentValue - previousValue : 0;
        const percentChange = previousValue > 0 ? delta / Math.abs(previousValue) : currentValue > 0 ? 1 : 0;
        const entity = metricEntity(metric);
        return {
            id: `${input.seed}-metric-change-${input.nextTick}-${index + 1}`,
            tick: input.nextTick,
            metricName: metric.name,
            entityType: entity.entityType,
            entityId: entity.entityId,
            previousValue,
            currentValue,
            delta,
            percentChange: Number.isFinite(percentChange) ? percentChange : 0
        };
    });
}
function metricKey(metric) {
    const tags = Object.keys(metric.tags)
        .sort()
        .map((key) => `${key}:${metric.tags[key]}`)
        .join("|");
    return `${metric.name}|${tags}`;
}
function metricEntity(metric) {
    const tags = metric.tags;
    if (tags.productId) {
        return { entityType: "product", entityId: tags.productId };
    }
    if (tags.companyId || tags.sellerCompanyId) {
        return { entityType: "company", entityId: tags.companyId ?? tags.sellerCompanyId ?? null };
    }
    if (tags.countryId || tags.occupierCountryId) {
        return { entityType: "country", entityId: tags.countryId ?? tags.occupierCountryId ?? null };
    }
    if (tags.cityId || tags.originCityId || tags.destinationCityId) {
        return { entityType: "city", entityId: tags.cityId ?? tags.originCityId ?? tags.destinationCityId ?? null };
    }
    if (tags.shipmentId) {
        return { entityType: "shipment", entityId: tags.shipmentId };
    }
    if (tags.routeId) {
        return { entityType: "route", entityId: tags.routeId };
    }
    if (tags.warId) {
        return { entityType: "war", entityId: tags.warId };
    }
    if (tags.cohortId) {
        return { entityType: "population_cohort", entityId: tags.cohortId };
    }
    if (tags.needCategory) {
        return { entityType: "market", entityId: tags.needCategory };
    }
    return { entityType: "world", entityId: null };
}
function createEventCauses(input) {
    const causes = [];
    for (const event of input.events) {
        const classified = classifyEventCause(event);
        if (!classified) {
            continue;
        }
        causes.push({
            id: `${input.seed}-event-cause-${input.nextTick}-${causes.length + 1}`,
            eventId: event.id,
            tick: input.nextTick,
            causeType: classified.causeType,
            sourceType: classified.sourceType,
            sourceId: classified.sourceId,
            description: classified.description,
            weight: classified.weight
        });
    }
    const unmet = input.demandRecords.reduce((total, record) => total + record.unmetQuantity, 0);
    if (unmet > 0 && !causes.some((cause) => cause.causeType === "shortage")) {
        causes.push({
            id: `${input.seed}-event-cause-${input.nextTick}-aggregate-shortage`,
            eventId: input.events.find((event) => event.type === "NewsCreatedEvent")?.id ?? `${input.seed}-event-${input.nextTick}-aggregate-shortage`,
            tick: input.nextTick,
            causeType: "shortage",
            sourceType: "market",
            sourceId: null,
            description: "Aggregate unmet demand generated a shortage signal.",
            weight: clamp(unmet / Math.max(1, unmet + totalMetricValue(input.metrics, "market.sales.quantity")), 0.05, 1)
        });
    }
    return causes;
}
function classifyEventCause(event) {
    if (event.type === "WorldTickedEvent" || event.type === "CommandAcceptedEvent" || event.type === "NewsCreatedEvent") {
        return null;
    }
    if (event.type === "ShortageDetectedEvent") {
        return {
            causeType: "shortage",
            sourceType: "population_cohort",
            sourceId: metadataString(event, "cohortId"),
            description: "Household desired quantity exceeded available affordable supply.",
            weight: clamp(metadataNumber(event, "unmetQuantity") / 50_000, 0.1, 1)
        };
    }
    if (event.type === "ProductSoldEvent") {
        return {
            causeType: "demand",
            sourceType: "retail_market",
            sourceId: metadataString(event, "productId"),
            description: "Consumers selected available retail offers by price, availability, and quality.",
            weight: clamp(metadataNumber(event, "quantity") / 40_000, 0.05, 1)
        };
    }
    if (event.type.includes("Shipment") || event.type.includes("LogisticsRoute")) {
        return {
            causeType: "logistics",
            sourceType: "route",
            sourceId: metadataString(event, "routeId") ?? event.entityIds[1] ?? null,
            description: "Delivery timing or route availability changed supply at warehouses.",
            weight: event.type.includes("Blocked") ? 0.9 : 0.45
        };
    }
    if (event.type.includes("Bankruptcy") || event.type.includes("LoanDefaulted")) {
        return {
            causeType: "credit",
            sourceType: "finance",
            sourceId: metadataString(event, "companyId") ?? metadataString(event, "bankId") ?? metadataString(event, "loanId"),
            description: "Credit stress changed borrower solvency and asset recovery expectations.",
            weight: 0.9
        };
    }
    if (event.type.includes("StrategicCell") || event.type.includes("War") || event.type.includes("Refugee")) {
        return {
            causeType: "war",
            sourceType: "war",
            sourceId: metadataString(event, "warId") ?? event.entityIds[0] ?? null,
            description: "War activity changed control, population flows, infrastructure, or supply demand.",
            weight: 0.85
        };
    }
    if (event.type.includes("Protest") || event.type.includes("Law") || event.type.includes("Government")) {
        return {
            causeType: "policy",
            sourceType: "government",
            sourceId: event.entityIds[0] ?? null,
            description: "Policy, legitimacy, or civic pressure changed government behavior.",
            weight: 0.65
        };
    }
    if (event.type.includes("Illegal") || event.type.includes("Confiscation") || event.type.includes("Fine")) {
        return {
            causeType: "corruption",
            sourceType: "black_market",
            sourceId: metadataString(event, "illegalTradeId") ?? event.entityIds[0] ?? null,
            description: "Grey-market activity and enforcement changed legal risk and reputation.",
            weight: 0.75
        };
    }
    if (event.type.includes("Technology") || event.type.includes("Pollution") || event.type.includes("Resource")) {
        return {
            causeType: "ecology",
            sourceType: "technology_ecology",
            sourceId: event.entityIds[0] ?? null,
            description: "Technology, resources, or pollution changed production and population conditions.",
            weight: 0.55
        };
    }
    if (event.type.includes("Produced")) {
        return {
            causeType: "supply",
            sourceType: "production",
            sourceId: metadataString(event, "productId"),
            description: "Company production changed market supply.",
            weight: clamp(metadataNumber(event, "quantity") / 40_000, 0.05, 1)
        };
    }
    return {
        causeType: "policy",
        sourceType: "simulation",
        sourceId: event.entityIds[0] ?? null,
        description: event.message,
        weight: 0.25
    };
}
function createEventImpacts(input) {
    const impacts = [];
    for (const event of input.events) {
        if (event.type === "WorldTickedEvent" || event.type === "CommandAcceptedEvent") {
            continue;
        }
        const directEntityId = event.entityIds[0] ?? null;
        const relatedChange = input.metricChanges.find((change) => Boolean(change.entityId && event.entityIds.includes(change.entityId))) ??
            input.metricChanges.find((change) => event.type.toLocaleLowerCase().includes(change.metricName.split(".")[0] ?? ""));
        const delta = relatedChange?.delta ?? inferEventDelta(event);
        const afterValue = relatedChange?.currentValue ?? (delta >= 0 ? delta : 0);
        const beforeValue = relatedChange?.previousValue ?? null;
        impacts.push({
            id: `${input.seed}-event-impact-${input.nextTick}-${impacts.length + 1}`,
            eventId: event.id,
            tick: input.nextTick,
            targetType: relatedChange?.entityType ?? inferEventTargetType(event),
            targetId: relatedChange?.entityId ?? directEntityId,
            metricName: relatedChange?.metricName ?? inferEventMetricName(event),
            beforeValue,
            afterValue,
            delta,
            severity: clamp(Math.abs(delta) / Math.max(1, Math.abs(beforeValue ?? 0), Math.abs(afterValue ?? 0)), 0.05, 1)
        });
    }
    return impacts;
}
function inferEventDelta(event) {
    return (metadataNumber(event, "quantity") ||
        metadataNumber(event, "grossMarginMinor") ||
        metadataNumber(event, "revenueMinor") ||
        metadataNumber(event, "unmetQuantity") ||
        metadataNumber(event, "claimsMinor") ||
        metadataNumber(event, "severity") ||
        metadataNumber(event, "people") ||
        metadataNumber(event, "fineMinor") ||
        1);
}
function inferEventTargetType(event) {
    if (event.type.includes("Shipment") || event.type.includes("LogisticsRoute")) {
        return "logistics";
    }
    if (event.type.includes("War") || event.type.includes("Refugee") || event.type.includes("StrategicCell")) {
        return "war";
    }
    if (event.type.includes("Bankruptcy") || event.type.includes("Loan")) {
        return "finance";
    }
    if (event.type.includes("Shortage") || event.type.includes("Sold") || event.type.includes("Produced")) {
        return "market";
    }
    return "world";
}
function inferEventMetricName(event) {
    if (event.type === "ShortageDetectedEvent") {
        return "market.demand.unmet.quantity";
    }
    if (event.type === "ProductSoldEvent") {
        return "market.sales.quantity";
    }
    if (event.type.includes("Bankruptcy")) {
        return "finance.bankruptcy.cases";
    }
    if (event.type.includes("WarDamage")) {
        return "war.damage.severity";
    }
    if (event.type.includes("Refugee")) {
        return "war.refugees.people";
    }
    return "simulation.event.count";
}
function createExplanations(input) {
    return [
        ...createPriceExplanations(input),
        ...createShortageExplanations(input),
        ...createEventExplanations(input),
        ...createDemandChangeExplanations(input),
        ...createLogisticsDelayExplanations(input),
        ...createProfitabilityExplanations(input)
    ].slice(0, 120);
}
function createProfitabilityExplanations(input) {
    const explanations = [];
    const salesEvents = input.events.filter((event) => event.type === "ProductSoldEvent" && metadataNumber(event, "revenueMinor") > 0);
    for (const event of salesEvents) {
        const companyId = metadataString(event, "companyId");
        const productId = metadataString(event, "productId");
        if (!companyId || !productId) {
            continue;
        }
        const revenueMinor = metadataNumber(event, "revenueMinor");
        const costOfGoodsSoldMinor = metadataNumber(event, "costOfGoodsSoldMinor");
        const grossMarginMinor = metadataNumber(event, "grossMarginMinor");
        const grossMarginRate = revenueMinor > 0 ? grossMarginMinor / revenueMinor : 0;
        const product = input.products.find((candidate) => candidate.id === productId);
        const company = input.companies.find((candidate) => candidate.id === companyId);
        const marginMetricIds = input.metrics
            .filter((metric) => metric.tags.companyId === companyId && metric.tags.productId === productId && metric.name.includes("gross_margin"))
            .map((metric) => metric.id);
        const impactIds = input.eventImpacts.filter((impact) => impact.eventId === event.id).map((impact) => impact.id);
        explanations.push({
            id: `${input.seed}-explanation-${input.nextTick}-${event.id}-gross-margin`,
            tick: input.nextTick,
            targetType: "profitability",
            targetId: companyId,
            eventId: event.id,
            title: `${company?.name ?? "Company"} gross margin on ${product?.name ?? productId}`,
            summary: grossMarginMinor >= 0
                ? `Retail revenue exceeded lot-level cost basis by ${grossMarginMinor} minor units. Revenue was ${revenueMinor}, cost of goods sold was ${costOfGoodsSoldMinor}.`
                : `Retail revenue did not cover lot-level cost basis. Revenue was ${revenueMinor}, cost of goods sold was ${costOfGoodsSoldMinor}.`,
            confidence: 0.88,
            reliabilityId: input.dataReliability[0]?.id ?? null,
            causes: [
                {
                    label: "Retail revenue",
                    causeType: "demand",
                    value: revenueMinor,
                    weight: 0.45
                },
                {
                    label: "Lot cost basis / COGS",
                    causeType: "supply",
                    value: costOfGoodsSoldMinor,
                    weight: 0.4
                },
                {
                    label: "Gross margin rate",
                    causeType: grossMarginMinor >= 0 ? "demand" : "shortage",
                    value: grossMarginRate,
                    weight: 0.15
                }
            ],
            impactIds,
            relatedMetricIds: marginMetricIds,
            relatedEntityIds: [companyId, productId]
        });
    }
    return explanations.slice(0, 24);
}
function createPriceExplanations(input) {
    const explanations = [];
    const products = input.products.filter((product) => {
        return (isPopulationNeedCategory(product.needCategory) ||
            input.state.retailOffers.some((offer) => offer.productId === product.id) ||
            input.metrics.some((metric) => metric.tags.productId === product.id));
    });
    for (const product of products) {
        const needCategory = isPopulationNeedCategory(product.needCategory) ? product.needCategory : null;
        const productDemand = needCategory ? input.demandRecords.filter((record) => record.needCategory === needCategory) : [];
        const desiredQuantity = productDemand.reduce((total, record) => total + record.desiredQuantity, 0);
        const purchasedQuantity = productDemand.reduce((total, record) => total + record.purchasedQuantity, 0);
        const unmetQuantity = productDemand.reduce((total, record) => total + record.unmetQuantity, 0);
        const cityIds = new Set(productDemand.map((record) => record.cityId));
        const countryIds = new Set(input.cities.filter((city) => cityIds.has(city.id)).map((city) => city.countryId));
        const countryId = [...countryIds][0] ?? input.countries[0]?.id ?? null;
        const reliability = countryId ? getReliabilityForCountry(input.dataReliability, countryId) : null;
        const supplyQuantity = input.inventoryLots
            .filter((lot) => lot.productId === product.id)
            .reduce((total, lot) => total + lot.quantity, 0);
        const averagePriceMinor = getProductAveragePriceMinor(input.state, input.demandRecords, product);
        const previousAveragePriceMinor = getPreviousProductAveragePriceMinor(input.state, product);
        const priceDelta = averagePriceMinor - previousAveragePriceMinor;
        const activeShipments = input.shipments.filter((shipment) => shipment.productId === product.id && shipment.status === "in_transit");
        const logisticsRisk = average(activeShipments.map((shipment) => shipment.risk));
        const averageRouteRisk = average(input.logisticsRoutes.map((route) => route.active && !route.blockedReason ? 0.12 : 0.85));
        const activeCountrySanctions = input.sanctions.filter((sanction) => sanction.active && (!countryId || sanction.targetCountryId === countryId || sanction.sourceCountryId === countryId));
        const warPressure = input.wars.filter((war) => war.status === "active").reduce((total, war) => total + war.intensity, 0);
        const taxPressure = countryId
            ? input.taxPolicies
                .filter((policy) => policy.countryId === countryId)
                .reduce((total, policy) => total + policy.salesTaxRate + policy.importTariffRate * 0.5, 0)
            : 0;
        const productCompanies = input.companies.filter((company) => input.state.retailOffers.some((offer) => offer.companyId === company.id && offer.productId === product.id));
        const marketingPressure = average(productCompanies.map((company) => company.reputation)) * 0.35;
        const shortageRatio = desiredQuantity > 0 ? unmetQuantity / desiredQuantity : 0;
        const demandPressure = desiredQuantity > 0 ? desiredQuantity / Math.max(1, purchasedQuantity + supplyQuantity) : 0;
        const supplyPressure = desiredQuantity > 0 ? Math.max(0, 1 - supplyQuantity / Math.max(1, desiredQuantity)) : 0;
        const costPressure = averagePriceMinor > 0 ? clamp(averagePriceMinor / 10_000, 0, 1) : 0;
        const sanctionPressure = activeCountrySanctions.reduce((total, sanction) => total + sanction.severity, 0);
        const logisticsPressure = clamp(Math.max(logisticsRisk, averageRouteRisk), 0, 1);
        const causes = normalizeContributions([
            ["Demand", "demand", demandPressure],
            ["Supply", "supply", supplyPressure],
            ["Cost", "cost", costPressure],
            ["Logistics", "logistics", logisticsPressure],
            ["Taxes", "tax", taxPressure],
            ["Shortage", "shortage", shortageRatio],
            ["Sanctions", "sanction", sanctionPressure],
            ["War", "war", warPressure],
            ["Marketing", "marketing", marketingPressure]
        ]);
        const metricIds = input.metrics
            .filter((metric) => metric.tags.productId === product.id || (needCategory && metric.tags.needCategory === needCategory))
            .map((metric) => metric.id);
        const relatedEvents = input.events.filter((event) => event.entityIds.includes(product.id));
        const trend = priceDelta > 0 ? "upward" : priceDelta < 0 ? "downward" : "stable";
        if (averagePriceMinor <= 0 && desiredQuantity <= 0 && supplyQuantity <= 0) {
            continue;
        }
        explanations.push({
            id: `${input.seed}-explanation-${input.nextTick}-price-${slugify(product.id)}`,
            tick: input.nextTick,
            targetType: "price",
            targetId: product.id,
            eventId: relatedEvents[0]?.id ?? null,
            title: `Price pressure for ${product.name}`,
            summary: `${product.name} price pressure is ${trend}; demand ${Math.round(desiredQuantity)} units, supply ${Math.round(supplyQuantity)} units, unmet demand ${Math.round(unmetQuantity)} units.`,
            confidence: clamp((reliability?.score ?? 0.65) * (productDemand.length > 0 ? 0.95 : 0.75), 0.05, 1),
            reliabilityId: reliability?.id ?? null,
            causes,
            impactIds: input.eventImpacts.filter((impact) => relatedEvents.some((event) => event.id === impact.eventId)).map((impact) => impact.id),
            relatedMetricIds: metricIds.slice(0, 12),
            relatedEntityIds: [product.id, ...[...countryIds]].slice(0, 8)
        });
    }
    return explanations;
}
function createShortageExplanations(input) {
    return input.demandRecords
        .filter((record) => record.unmetQuantity > 0)
        .slice(0, 25)
        .map((record, index) => {
        const city = input.cities.find((candidate) => candidate.id === record.cityId);
        const reliability = getReliabilityForCountry(input.dataReliability, city?.countryId ?? null);
        const shortageEvent = input.events.find((event) => event.type === "ShortageDetectedEvent" && metadataString(event, "cohortId") === record.cohortId);
        return {
            id: `${input.seed}-explanation-${input.nextTick}-shortage-${index + 1}`,
            tick: input.nextTick,
            targetType: "shortage",
            targetId: record.id,
            eventId: shortageEvent?.id ?? null,
            title: `${record.needCategory} shortage in ${city?.name ?? "unknown city"}`,
            summary: `${Math.round(record.unmetQuantity)} of ${Math.round(record.desiredQuantity)} requested units were not filled.`,
            confidence: clamp(reliability?.score ?? 0.6, 0.05, 1),
            reliabilityId: reliability?.id ?? null,
            causes: normalizeContributions([
                ["Demand", "demand", record.desiredQuantity],
                ["Supply", "supply", Math.max(0, record.purchasedQuantity)],
                ["Shortage", "shortage", record.unmetQuantity]
            ]),
            impactIds: input.eventImpacts.filter((impact) => shortageEvent && impact.eventId === shortageEvent.id).map((impact) => impact.id),
            relatedMetricIds: input.metrics
                .filter((metric) => metric.tags.cohortId === record.cohortId && metric.tags.needCategory === record.needCategory)
                .map((metric) => metric.id),
            relatedEntityIds: [record.cohortId, record.cityId]
        };
    });
}
function createEventExplanations(input) {
    const explanations = [];
    for (const event of input.events) {
        if (event.type.includes("Bankruptcy")) {
            const targetId = metadataString(event, "companyId") ?? metadataString(event, "bankId") ?? event.entityIds[0] ?? event.id;
            explanations.push({
                id: `${input.seed}-explanation-${input.nextTick}-bankruptcy-${slugify(targetId)}`,
                tick: input.nextTick,
                targetType: "bankruptcy",
                targetId,
                eventId: event.id,
                title: "Bankruptcy case opened",
                summary: event.message,
                confidence: 0.82,
                reliabilityId: null,
                causes: normalizeContributions([
                    ["Credit", "credit", metadataNumber(event, "claimsMinor") || 1],
                    ["Cost", "cost", metadataNumber(event, "burnedDepositsMinor") || 0.4]
                ]),
                impactIds: input.eventImpacts.filter((impact) => impact.eventId === event.id).map((impact) => impact.id),
                relatedMetricIds: input.metrics.filter((metric) => metric.name.includes("finance")).map((metric) => metric.id).slice(0, 8),
                relatedEntityIds: event.entityIds
            });
        }
        if (event.type === "RefugeeFlowCreatedEvent" || event.type === "WarDamageEvent" || event.type === "StrategicCellCapturedEvent") {
            const targetType = event.type === "RefugeeFlowCreatedEvent" ? "migration" : "war";
            const targetId = metadataString(event, "warId") ?? event.entityIds[0] ?? event.id;
            explanations.push({
                id: `${input.seed}-explanation-${input.nextTick}-${targetType}-${slugify(event.id)}`,
                tick: input.nextTick,
                targetType,
                targetId,
                eventId: event.id,
                title: targetType === "migration" ? "Population moved because of conflict" : "War changed territory or infrastructure",
                summary: event.message,
                confidence: 0.7,
                reliabilityId: null,
                causes: normalizeContributions([
                    ["War", "war", metadataNumber(event, "severity") || metadataNumber(event, "people") || 1],
                    ["Logistics", "logistics", event.type === "WarDamageEvent" ? 0.7 : 0.2]
                ]),
                impactIds: input.eventImpacts.filter((impact) => impact.eventId === event.id).map((impact) => impact.id),
                relatedMetricIds: input.metrics.filter((metric) => metric.tags.warId === targetId).map((metric) => metric.id),
                relatedEntityIds: event.entityIds
            });
        }
    }
    for (const protest of input.protests.filter((candidate) => candidate.startedTick === input.nextTick || candidate.resolvedTick === null)) {
        const reliability = getReliabilityForCountry(input.dataReliability, protest.countryId);
        explanations.push({
            id: `${input.seed}-explanation-${input.nextTick}-protest-${slugify(protest.id)}`,
            tick: input.nextTick,
            targetType: "protest",
            targetId: protest.id,
            eventId: null,
            title: `Protest pressure in ${protest.countryId}`,
            summary: `${protest.reason} with ${(protest.intensity * 100).toFixed(0)}% intensity.`,
            confidence: clamp(reliability?.score ?? 0.55, 0.05, 1),
            reliabilityId: reliability?.id ?? null,
            causes: normalizeContributions([
                ["Policy", "policy", protest.intensity],
                ["Corruption", "corruption", 0.25],
                ["Demand", "demand", 0.15]
            ]),
            impactIds: [],
            relatedMetricIds: input.metrics.filter((metric) => metric.tags.countryId === protest.countryId).map((metric) => metric.id).slice(0, 8),
            relatedEntityIds: [protest.countryId]
        });
    }
    for (const metric of input.metrics.filter((candidate) => candidate.name === "ecology.migration.people")) {
        const targetId = metric.tags.originCityId ?? metric.id;
        const city = input.cities.find((candidate) => candidate.id === metric.tags.originCityId);
        const reliability = getReliabilityForCountry(input.dataReliability, city?.countryId ?? null);
        explanations.push({
            id: `${input.seed}-explanation-${input.nextTick}-eco-migration-${slugify(metric.id)}`,
            tick: input.nextTick,
            targetType: "migration",
            targetId,
            eventId: null,
            title: "Ecology pushed migration",
            summary: `${Math.round(metric.value)} people moved because environmental health worsened.`,
            confidence: clamp(reliability?.score ?? 0.6, 0.05, 1),
            reliabilityId: reliability?.id ?? null,
            causes: normalizeContributions([
                ["Ecology", "ecology", metric.value],
                ["Demand", "demand", 0.2]
            ]),
            impactIds: [],
            relatedMetricIds: [metric.id],
            relatedEntityIds: [metric.tags.originCityId ?? "", metric.tags.destinationCityId ?? ""].filter(Boolean)
        });
    }
    return explanations;
}
function createDemandChangeExplanations(input) {
    return input.metricChanges
        .filter((change) => change.metricName === "market.demand.desired.quantity" && Math.abs(change.delta) > 0)
        .slice(0, 20)
        .map((change) => ({
        id: `${input.seed}-explanation-${input.nextTick}-demand-${slugify(change.id)}`,
        tick: input.nextTick,
        targetType: "demand",
        targetId: change.entityId ?? change.id,
        eventId: null,
        title: "Demand changed",
        summary: `Desired quantity changed by ${Math.round(change.delta)} units from the previous comparable metric.`,
        confidence: 0.62,
        reliabilityId: null,
        causes: normalizeContributions([
            ["Demand", "demand", Math.abs(change.delta)],
            ["Marketing", "marketing", 0.2],
            ["Policy", "policy", 0.15]
        ]),
        impactIds: [],
        relatedMetricIds: [change.id],
        relatedEntityIds: [change.entityId ?? ""].filter(Boolean)
    }));
}
function createLogisticsDelayExplanations(input) {
    const delayMetrics = input.metrics.filter((metric) => metric.name === "logistics.shipment.remaining_ticks" && metric.value > 0);
    const blockedEvents = input.events.filter((event) => event.type === "ShipmentBlockedEvent" || event.type === "LogisticsRouteBlockedByWarEvent");
    return [
        ...delayMetrics.map((metric) => ({
            id: `${input.seed}-explanation-${input.nextTick}-logistics-delay-${slugify(metric.id)}`,
            tick: input.nextTick,
            targetType: "logistics",
            targetId: metric.tags.shipmentId ?? metric.id,
            eventId: null,
            title: "Shipment is still in transit",
            summary: `${Math.round(metric.value)} ticks remain on this shipment; route quality, capacity, and war pressure can add delays.`,
            confidence: 0.75,
            reliabilityId: null,
            causes: normalizeContributions([
                ["Logistics", "logistics", metric.value],
                ["War", "war", totalMetricValue(input.metrics, "war.logistics.military_competition_ratio")],
                ["Sanctions", "sanction", totalMetricValue(input.metrics, "war.sanction.severity")]
            ]),
            impactIds: [],
            relatedMetricIds: [metric.id],
            relatedEntityIds: [metric.tags.shipmentId ?? "", metric.tags.routeId ?? ""].filter(Boolean)
        })),
        ...blockedEvents.map((event) => ({
            id: `${input.seed}-explanation-${input.nextTick}-logistics-blocked-${slugify(event.id)}`,
            tick: input.nextTick,
            targetType: "logistics",
            targetId: metadataString(event, "shipmentId") ?? metadataString(event, "routeId") ?? event.id,
            eventId: event.id,
            title: "Route is blocked",
            summary: event.message,
            confidence: 0.8,
            reliabilityId: null,
            causes: normalizeContributions([
                ["Logistics", "logistics", 1],
                ["War", "war", event.type.includes("War") ? 1 : 0],
                ["Sanctions", "sanction", metadataString(event, "reason")?.toLocaleLowerCase().includes("sanction") ? 1 : 0]
            ]),
            impactIds: input.eventImpacts.filter((impact) => impact.eventId === event.id).map((impact) => impact.id),
            relatedMetricIds: [],
            relatedEntityIds: event.entityIds
        }))
    ];
}
function createPublicStatistics(input) {
    const statistics = [];
    for (const country of input.countries) {
        const reliability = getReliabilityForCountry(input.dataReliability, country.id) ?? input.dataReliability[0];
        const countryCities = input.cities.filter((city) => city.countryId === country.id);
        const cityIds = new Set(countryCities.map((city) => city.id));
        const countryCohorts = input.populationCohorts.filter((cohort) => cityIds.has(cohort.cityId));
        const countryDemand = input.demandRecords.filter((record) => cityIds.has(record.cityId));
        const countryCompanies = input.companies.filter((company) => company.countryId === country.id);
        const populationTotal = countryCities.reduce((total, city) => total + city.populationTotal, 0);
        const currentAveragePrice = weightedAverage(countryDemand.filter((record) => record.purchasedQuantity > 0).map((record) => ({
            value: record.averagePriceMinor,
            weight: record.purchasedQuantity
        })));
        const previousAveragePrice = getPreviousCountryAveragePriceMinor(input.state, country.id);
        const inflationRate = previousAveragePrice > 0 ? Math.max(0, (currentAveragePrice - previousAveragePrice) / previousAveragePrice) : 0;
        const desired = countryDemand.reduce((total, record) => total + record.desiredQuantity, 0);
        const unmet = countryDemand.reduce((total, record) => total + record.unmetQuantity, 0);
        const unmetRatio = desired > 0 ? unmet / desired : 0;
        const satisfaction = average(countryCohorts.map((cohort) => cohort.satisfaction));
        const unemploymentRate = clamp(0.08 + (1 - satisfaction) * 0.18 + unmetRatio * 0.12, 0, 0.65);
        const salesByCategory = new Map();
        for (const metric of input.metrics.filter((metric) => metric.tick === input.nextTick && metric.name === "market.sales.revenue_minor")) {
            const product = input.state.products.find((candidate) => candidate.id === metric.tags.productId);
            if (product) {
                salesByCategory.set(product.category, sanitizeMoney((salesByCategory.get(product.category) ?? 0) + metric.value));
            }
        }
        const latestBudget = input.governmentBudgets
            .filter((budget) => budget.countryId === country.id)
            .sort((left, right) => right.tick - left.tick)[0];
        const logisticsRisk = clamp(average([
            ...input.shipments
                .filter((shipment) => {
                const warehouse = input.state.warehouses.find((candidate) => candidate.id === shipment.originWarehouseId);
                const city = input.state.cities.find((candidate) => candidate.id === warehouse?.cityId);
                return city?.countryId === country.id;
            })
                .map((shipment) => shipment.risk),
            ...input.logisticsRoutes
                .filter((route) => {
                const warehouse = input.state.warehouses.find((candidate) => candidate.id === route.originWarehouseId);
                const city = input.state.cities.find((candidate) => candidate.id === warehouse?.cityId);
                return city?.countryId === country.id;
            })
                .map((route) => (route.active && !route.blockedReason ? 0.12 : 0.85))
        ]), 0, 1);
        const baseStats = [
            ["population.total", populationTotal, "count"],
            ["inflation.rate", inflationRate, "ratio"],
            ["unemployment.rate", unemploymentRate, "ratio"],
            ["logistics.risk", logisticsRisk, "index"],
            ["government.treasury_minor", latestBudget?.treasuryMinor ?? 0, "minor"]
        ];
        for (const [metricName, value, unit] of baseStats) {
            statistics.push(makePublicStatistic(input, country, reliability, metricName, value, unit));
        }
        for (const [category, value] of salesByCategory) {
            const companyCount = countryCompanies.length;
            statistics.push(makePublicStatistic(input, country, reliability, `industry.profit.${category}`, companyCount > 0 ? value : 0, "minor"));
        }
    }
    return statistics;
}
function makePublicStatistic(input, country, reliability, metricName, value, unit) {
    const distorted = Boolean(reliability && (reliability.grade === "manipulated" || reliability.manipulationRisk > 0.55));
    const publicValue = distorted ? distortPublicStatistic(metricName, value) : value;
    return {
        id: `${input.seed}-public-stat-${input.nextTick}-${slugify(country.id)}-${slugify(metricName)}`,
        tick: input.nextTick,
        countryId: country.id,
        metricName,
        value: sanitizeNonNegativeNumber(publicValue),
        unit,
        reliabilityId: reliability?.id ?? `${input.seed}-reliability-${slugify(country.id)}-state`,
        source: reliability?.source ?? "state",
        distorted
    };
}
function distortPublicStatistic(metricName, value) {
    if (metricName === "inflation.rate" || metricName === "unemployment.rate" || metricName === "logistics.risk") {
        return value * 0.68;
    }
    if (metricName === "government.treasury_minor") {
        return value * 1.08;
    }
    return value * 0.92;
}
function createHiddenStatistics(input) {
    const publicCompanyIds = new Set(input.stocks.map((stock) => stock.companyId));
    const hidden = [];
    for (const company of input.companies) {
        if (company.ownerType === "state" || publicCompanyIds.has(company.id)) {
            continue;
        }
        hidden.push({
            id: `${input.seed}-hidden-stat-${input.nextTick}-${slugify(company.id)}-cash`,
            tick: input.nextTick,
            ownerType: "company",
            ownerId: company.id,
            metricName: "company.cash.private",
            value: company.cashBalanceMinor,
            unit: "minor",
            visibilityReason: "private company financials are hidden from public analytics"
        });
    }
    for (const bank of input.banks) {
        hidden.push({
            id: `${input.seed}-hidden-stat-${input.nextTick}-${slugify(bank.id)}-risk`,
            tick: input.nextTick,
            ownerType: "bank",
            ownerId: bank.id,
            metricName: "bank.solvency.private",
            value: clamp(1 - bank.riskRating, 0, 1),
            unit: "ratio",
            visibilityReason: "bank solvency details are not public until disclosure or bankruptcy"
        });
    }
    for (const account of input.bankAccounts.filter((account) => account.ownerType === "company")) {
        hidden.push({
            id: `${input.seed}-hidden-stat-${input.nextTick}-${slugify(account.id)}-balance`,
            tick: input.nextTick,
            ownerType: "company",
            ownerId: account.ownerId,
            metricName: "bank_account.balance.private",
            value: account.balanceMinor,
            unit: "minor",
            visibilityReason: "private bank account balances are never exposed through public analytics"
        });
    }
    return hidden;
}
function createForecasts(input) {
    const forecasts = [];
    for (const explanation of input.explanations.filter((candidate) => candidate.targetType === "price").slice(0, 20)) {
        const product = input.products.find((candidate) => candidate.id === explanation.targetId);
        if (!product) {
            continue;
        }
        const currentValue = getProductAveragePriceMinor(input.state, input.demandRecords, product);
        const shortage = explanation.causes.find((cause) => cause.causeType === "shortage")?.weight ?? 0;
        const demand = explanation.causes.find((cause) => cause.causeType === "demand")?.weight ?? 0;
        const supply = explanation.causes.find((cause) => cause.causeType === "supply")?.weight ?? 0;
        const pressure = clamp(demand + shortage - supply * 0.25, 0, 1.5);
        forecasts.push({
            id: `${input.seed}-forecast-${input.nextTick}-price-${slugify(product.id)}`,
            tick: input.nextTick,
            targetType: "product",
            targetId: product.id,
            metricName: "price.average_minor",
            currentValue,
            predictedValue: sanitizeMoney(currentValue * (1 + pressure * 0.12)),
            horizonTicks: 24,
            confidence: clamp(explanation.confidence * (1 - Math.min(0.45, shortage * 0.35)), 0.05, 1),
            scenario: shortage > 0.35 ? "stress" : "baseline",
            driverExplanationIds: [explanation.id]
        });
    }
    for (const country of input.countries) {
        const inflation = latestStatistic(input.publicStatistics, country.id, "inflation.rate");
        const unemployment = latestStatistic(input.publicStatistics, country.id, "unemployment.rate");
        const logistics = latestStatistic(input.publicStatistics, country.id, "logistics.risk");
        const countryExplanationIds = input.explanations
            .filter((explanation) => explanation.relatedEntityIds.includes(country.id))
            .map((explanation) => explanation.id)
            .slice(0, 5);
        if (inflation) {
            forecasts.push({
                id: `${input.seed}-forecast-${input.nextTick}-inflation-${slugify(country.id)}`,
                tick: input.nextTick,
                targetType: "country",
                targetId: country.id,
                metricName: "inflation.rate",
                currentValue: inflation.value,
                predictedValue: clamp(inflation.value + (unemployment?.value ?? 0) * 0.02 + (logistics?.value ?? 0) * 0.03, 0, 1),
                horizonTicks: 24,
                confidence: inflation.distorted ? 0.35 : 0.68,
                scenario: logistics && logistics.value > 0.45 ? "stress" : "baseline",
                driverExplanationIds: countryExplanationIds
            });
        }
        if (logistics) {
            forecasts.push({
                id: `${input.seed}-forecast-${input.nextTick}-logistics-${slugify(country.id)}`,
                tick: input.nextTick,
                targetType: "logistics",
                targetId: country.id,
                metricName: "logistics.risk",
                currentValue: logistics.value,
                predictedValue: clamp(logistics.value + totalMetricValue(input.metrics, "war.logistics.military_competition_ratio") * 0.12, 0, 1),
                horizonTicks: 12,
                confidence: logistics.distorted ? 0.4 : 0.74,
                scenario: logistics.value > 0.5 ? "stress" : "baseline",
                driverExplanationIds: countryExplanationIds
            });
        }
    }
    return forecasts;
}
function normalizeContributions(raw) {
    const sanitized = raw.map(([label, causeType, value]) => ({
        label,
        causeType,
        value: sanitizeNonNegativeNumber(value),
        weight: 0
    }));
    const total = sanitized.reduce((sum, cause) => sum + cause.value, 0);
    return sanitized.map((cause) => ({
        ...cause,
        weight: total > 0 ? clamp(cause.value / total, 0, 1) : 0
    }));
}
function getReliabilityForCountry(reliability, countryId) {
    if (!countryId) {
        return null;
    }
    return reliability.find((candidate) => candidate.countryId === countryId) ?? null;
}
function getProductAveragePriceMinor(state, demandRecords, product) {
    const currentDemandPrice = weightedAverage(demandRecords
        .filter((record) => record.needCategory === product.needCategory && record.purchasedQuantity > 0 && record.averagePriceMinor > 0)
        .map((record) => ({ value: record.averagePriceMinor, weight: record.purchasedQuantity })));
    if (currentDemandPrice > 0) {
        return sanitizeMoney(currentDemandPrice);
    }
    const offerPrices = state.retailOffers
        .filter((offer) => offer.productId === product.id && offer.active)
        .map((offer) => offer.priceMinor);
    return sanitizeMoney(average(offerPrices));
}
function getPreviousProductAveragePriceMinor(state, product) {
    const previousDemand = state.demandRecords.filter((record) => record.needCategory === product.needCategory && record.purchasedQuantity > 0 && record.averagePriceMinor > 0);
    if (previousDemand.length === 0) {
        return getProductAveragePriceMinor(state, [], product);
    }
    const latestTick = Math.max(...previousDemand.map((record) => record.tick));
    return sanitizeMoney(weightedAverage(previousDemand
        .filter((record) => record.tick === latestTick)
        .map((record) => ({ value: record.averagePriceMinor, weight: record.purchasedQuantity }))));
}
function getPreviousCountryAveragePriceMinor(state, countryId) {
    const cityIds = new Set(state.cities.filter((city) => city.countryId === countryId).map((city) => city.id));
    const previousDemand = state.demandRecords.filter((record) => cityIds.has(record.cityId) && record.purchasedQuantity > 0 && record.averagePriceMinor > 0);
    if (previousDemand.length === 0) {
        return 0;
    }
    const latestTick = Math.max(...previousDemand.map((record) => record.tick));
    return sanitizeMoney(weightedAverage(previousDemand
        .filter((record) => record.tick === latestTick)
        .map((record) => ({ value: record.averagePriceMinor, weight: record.purchasedQuantity }))));
}
function latestStatistic(statistics, countryId, metricName) {
    return (statistics
        .filter((statistic) => statistic.countryId === countryId && statistic.metricName === metricName)
        .sort((left, right) => right.tick - left.tick)[0] ?? null);
}
function metadataNumber(event, key) {
    const value = event.metadata[key];
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function metadataString(event, key) {
    const value = event.metadata[key];
    return typeof value === "string" && value.length > 0 ? value : null;
}
function totalMetricValue(metrics, name) {
    return metrics.filter((metric) => metric.name === name).reduce((total, metric) => total + sanitizeNonNegativeNumber(metric.value), 0);
}
function weightedAverage(values) {
    const valid = values.filter((item) => Number.isFinite(item.value) && Number.isFinite(item.weight) && item.weight > 0);
    const totalWeight = valid.reduce((total, item) => total + item.weight, 0);
    if (totalWeight <= 0) {
        return 0;
    }
    return valid.reduce((total, item) => total + item.value * item.weight, 0) / totalWeight;
}
function isPopulationNeedCategory(value) {
    return NEED_CATEGORIES.includes(value);
}
function createNews(input) {
    const news = [];
    const revenueMinor = input.financialTransactions.reduce((total, transaction) => total + transaction.entries.filter((entry) => entry.ownerType === "company").reduce((sum, entry) => sum + entry.amountMinor, 0), 0);
    const foodUnmet = input.demandRecords
        .filter((record) => record.needCategory === "food")
        .reduce((total, record) => total + record.unmetQuantity, 0);
    const totalUnmet = input.demandRecords.reduce((total, record) => total + record.unmetQuantity, 0);
    const producedQuantity = input.metrics
        .filter((metric) => metric.name === "production.output.quantity")
        .reduce((total, metric) => total + metric.value, 0);
    const deliveredQuantity = input.metrics
        .filter((metric) => metric.name === "logistics.shipment.delivered")
        .reduce((total, metric) => total + metric.value, 0);
    const financeTradeValueMinor = input.metrics
        .filter((metric) => metric.name === "finance.exchange.trade_value_minor")
        .reduce((total, metric) => total + metric.value, 0);
    const interestAccruedMinor = input.metrics
        .filter((metric) => metric.name === "finance.loan.interest_accrued_minor")
        .reduce((total, metric) => total + metric.value, 0);
    const governmentRevenueMinor = input.metrics
        .filter((metric) => metric.name === "government.budget.revenue_minor")
        .reduce((total, metric) => total + metric.value, 0);
    const lowestStability = input.metrics
        .filter((metric) => metric.name === "government.stability.rating")
        .reduce((minimum, metric) => (minimum === null ? metric.value : Math.min(minimum, metric.value)), null);
    const capturedCells = input.metrics
        .filter((metric) => metric.name === "war.front.cell_captured")
        .reduce((total, metric) => total + metric.value, 0);
    const refugeePeople = input.metrics
        .filter((metric) => metric.name === "war.refugees.people")
        .reduce((total, metric) => total + metric.value, 0);
    const warDamageSeverity = input.metrics
        .filter((metric) => metric.name === "war.damage.severity")
        .reduce((total, metric) => total + metric.value, 0);
    const militaryDemand = input.metrics
        .filter((metric) => metric.name === "war.military_demand.quantity")
        .reduce((total, metric) => total + metric.value, 0);
    const completedResearch = input.metrics
        .filter((metric) => metric.name === "technology.research.completed")
        .reduce((total, metric) => total + metric.value, 0);
    const pollutionAmount = input.metrics
        .filter((metric) => metric.name === "ecology.pollution.amount")
        .reduce((total, metric) => total + metric.value, 0);
    const depletedResources = input.metrics
        .filter((metric) => metric.name === "ecology.resource.depleted.quantity")
        .reduce((total, metric) => total + metric.value, 0);
    const discoveredResources = input.metrics
        .filter((metric) => metric.name === "ecology.resource.discovered.quantity")
        .reduce((total, metric) => total + metric.value, 0);
    const blackMarketDemand = input.metrics
        .filter((metric) => metric.name === "crime.black_market.demand")
        .reduce((total, metric) => total + metric.value, 0);
    const completedIllegalTrades = input.metrics
        .filter((metric) => metric.name === "crime.illegal_trade.completed")
        .reduce((total, metric) => total + metric.value, 0);
    const detectedIllegalTrades = input.metrics
        .filter((metric) => metric.name === "crime.illegal_trade.detected")
        .reduce((total, metric) => total + metric.value, 0);
    const finePayments = input.metrics
        .filter((metric) => metric.name === "crime.fine.amount_minor")
        .reduce((total, metric) => total + metric.value, 0);
    if (producedQuantity > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-production`,
            tick: input.nextTick,
            headline: "Factories expand local supply",
            body: `Companies produced ${producedQuantity} units before retail trade opened.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (revenueMinor > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-retail-sales`,
            tick: input.nextTick,
            headline: "Retail trade clears household demand",
            body: `Retail companies earned ${revenueMinor} minor currency units from household purchases.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (deliveredQuantity > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-logistics-delivered`,
            tick: input.nextTick,
            headline: "Freight deliveries reach warehouses",
            body: `${deliveredQuantity} units arrived through logistics routes this tick.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (financeTradeValueMinor > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-exchange-trading`,
            tick: input.nextTick,
            headline: "Exchange order books matched trades",
            body: `Financial markets cleared ${financeTradeValueMinor} minor currency units in matched orders.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (interestAccruedMinor > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-credit-cycle`,
            tick: input.nextTick,
            headline: "Banks accrue loan interest",
            body: `Credit portfolios accrued ${interestAccruedMinor} minor currency units of interest this tick.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (governmentRevenueMinor > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-government-budget`,
            tick: input.nextTick,
            headline: "Government budgets update after tax collection",
            body: `Governments collected ${governmentRevenueMinor} minor currency units and funded public programs this tick.`,
            severity: lowestStability !== null && lowestStability < 0.5 ? "warning" : "info",
            relatedEntityIds: []
        });
    }
    if (capturedCells > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-war-front`,
            tick: input.nextTick,
            headline: "Front line shifts after strategic cell capture",
            body: `${capturedCells} strategic cell changed factual control. Legal recognition remains disputed.`,
            severity: "critical",
            relatedEntityIds: []
        });
    }
    if (warDamageSeverity > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-war-damage`,
            tick: input.nextTick,
            headline: "War damage disrupts infrastructure",
            body: `Combat damage raised route risk by ${warDamageSeverity.toFixed(2)} severity points across affected assets.`,
            severity: "warning",
            relatedEntityIds: []
        });
    }
    if (refugeePeople > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-refugees`,
            tick: input.nextTick,
            headline: "Refugee flows reshape regional population",
            body: `${refugeePeople} people moved away from the front toward safer cities.`,
            severity: "warning",
            relatedEntityIds: []
        });
    }
    if (militaryDemand > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-military-orders`,
            tick: input.nextTick,
            headline: "Military demand competes with civilian logistics",
            body: `Armies requested ${militaryDemand} units of fuel, food, and ammunition this tick.`,
            severity: "warning",
            relatedEntityIds: []
        });
    }
    if (completedResearch > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-technology-unlocked`,
            tick: input.nextTick,
            headline: "R&D unlocks new technology",
            body: `${completedResearch} research project completed and updated technology levels.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (pollutionAmount > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-pollution`,
            tick: input.nextTick,
            headline: "Industrial pollution changes environmental pressure",
            body: `Production emitted ${pollutionAmount.toFixed(1)} pollution units, affecting local health and migration pressure.`,
            severity: pollutionAmount > 100 ? "warning" : "info",
            relatedEntityIds: []
        });
    }
    if (depletedResources > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-resources-depleted`,
            tick: input.nextTick,
            headline: "Resource deposits decline after extraction",
            body: `${depletedResources} units were extracted from local deposits this tick.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (discoveredResources > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-resources-discovered`,
            tick: input.nextTick,
            headline: "New resource deposit discovered",
            body: `Survey and R&D activity revealed ${discoveredResources} units of new resource potential.`,
            severity: "info",
            relatedEntityIds: []
        });
    }
    if (blackMarketDemand > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-black-markets`,
            tick: input.nextTick,
            headline: "Grey markets expand under pressure",
            body: `Shadow demand reached ${blackMarketDemand} units as bans, shortages, taxes, war, sanctions, or corruption pressured legal trade.`,
            severity: "warning",
            relatedEntityIds: []
        });
    }
    if (completedIllegalTrades > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-illegal-trade-completed`,
            tick: input.nextTick,
            headline: "Risky grey-market trades moved goods",
            body: `${completedIllegalTrades} units cleared through illegal trade routes this tick.`,
            severity: "warning",
            relatedEntityIds: []
        });
    }
    if (detectedIllegalTrades > 0 || finePayments > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-illegal-trade-detected`,
            tick: input.nextTick,
            headline: "Enforcement agencies expose shadow activity",
            body: `Detected illegal trades triggered confiscations and ${finePayments} minor currency units in fines.`,
            severity: "critical",
            relatedEntityIds: []
        });
    }
    if (foodUnmet > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-food-shortage`,
            tick: input.nextTick,
            headline: "Food shortage detected",
            body: `Households still need ${foodUnmet} units of food after retail purchases.`,
            severity: "warning",
            relatedEntityIds: []
        });
    }
    else if (totalUnmet > 0) {
        news.push({
            id: `${input.seed}-news-${input.nextTick}-service-shortage`,
            tick: input.nextTick,
            headline: "Service demand exceeds supply",
            body: `Households still need ${totalUnmet} units across non-food needs.`,
            severity: "warning",
            relatedEntityIds: []
        });
    }
    return news.map((item) => decorateNewsItem(item, input));
}
function decorateNewsItem(item, input) {
    const category = item.category ?? inferNewsCategory(item);
    const template = input.newsTemplates.find((candidate) => candidate.active && candidate.category === category && item.id.includes(candidate.eventType.toLocaleLowerCase().split("event")[0] ?? ""));
    const reliability = input.dataReliability
        .filter((candidate) => candidate.countryId !== null)
        .sort((left, right) => right.score - left.score)[0];
    return {
        ...item,
        category,
        templateId: item.templateId ?? template?.id ?? null,
        reliabilityId: item.reliabilityId ?? reliability?.id ?? null
    };
}
function inferNewsCategory(item) {
    const text = `${item.id} ${item.headline}`.toLocaleLowerCase();
    if (text.includes("government") || text.includes("protest") || text.includes("law")) {
        return "political";
    }
    if (text.includes("war") || text.includes("refugee") || text.includes("military")) {
        return "military";
    }
    if (text.includes("exchange") || text.includes("trading") || text.includes("credit") || text.includes("bank")) {
        return "exchange";
    }
    if (text.includes("illegal") || text.includes("black-market") || text.includes("grey") || text.includes("enforcement")) {
        return "criminal";
    }
    if (text.includes("pollution") || text.includes("resource") || text.includes("technology")) {
        return "ecological";
    }
    if (text.includes("production") || text.includes("company") || text.includes("retail")) {
        return "corporate";
    }
    return "economic";
}
function calculateNeedQuantity(cohort, needCategory) {
    const profile = NEED_PROFILE[needCategory];
    const incomeMultiplier = INCOME_NEED_MULTIPLIER[cohort.incomeLevel][needCategory];
    const satisfactionMultiplier = clamp(1 + (0.65 - cohort.satisfaction) * 0.12, 0.85, 1.15);
    return sanitizeQuantity(cohort.size * profile.unitsPerPersonPerTick * incomeMultiplier * satisfactionMultiplier);
}
function getAvailableQuantity(inventoryLots, warehouseId, productId) {
    return sanitizeQuantity(inventoryLots
        .filter((lot) => lot.warehouseId === warehouseId && lot.productId === productId)
        .reduce((total, lot) => total + lot.quantity, 0));
}
function consumeInventory(inventoryLots, warehouseId, productId, requestedQuantity) {
    return consumeInventoryWithCost(inventoryLots, warehouseId, productId, requestedQuantity).quantity;
}
function consumeInventoryWithCost(inventoryLots, warehouseId, productId, requestedQuantity) {
    let remainingQuantity = sanitizeQuantity(requestedQuantity);
    let consumedQuantity = 0;
    let totalCostMinor = 0;
    for (const lot of inventoryLots) {
        if (remainingQuantity <= 0) {
            break;
        }
        if (lot.warehouseId !== warehouseId || lot.productId !== productId || lot.quantity <= 0) {
            continue;
        }
        const quantity = sanitizeQuantity(Math.min(lot.quantity, remainingQuantity));
        const unitCostMinor = sanitizeMoney(lot.unitCostMinor ?? ((lot.totalCostMinor ?? 0) / Math.max(1, lot.quantity)));
        const consumedCostMinor = sanitizeMoney(unitCostMinor * quantity);
        lot.quantity = sanitizeQuantity(lot.quantity - quantity);
        lot.totalCostMinor = sanitizeMoney(Math.max(0, (lot.totalCostMinor ?? unitCostMinor * (lot.quantity + quantity)) - consumedCostMinor));
        lot.unitCostMinor = lot.quantity > 0 ? sanitizeMoney(lot.totalCostMinor / lot.quantity) : unitCostMinor;
        remainingQuantity = sanitizeQuantity(remainingQuantity - quantity);
        consumedQuantity += quantity;
        totalCostMinor += consumedCostMinor;
    }
    return {
        quantity: sanitizeQuantity(consumedQuantity),
        totalCostMinor: sanitizeMoney(totalCostMinor)
    };
}
function addInventory(input) {
    const quantity = sanitizeQuantity(input.quantity);
    if (quantity <= 0) {
        return;
    }
    const totalCostMinor = sanitizeMoney(input.totalCostMinor ?? sanitizeMoney((input.unitCostMinor ?? 0) * quantity));
    const unitCostMinor = quantity > 0 ? sanitizeMoney(input.unitCostMinor ?? totalCostMinor / quantity) : sanitizeMoney(input.unitCostMinor ?? 0);
    const costSourceType = input.costSourceType ?? "system";
    const costSourceId = input.costSourceId ?? null;
    const existingLot = input.inventoryLots.find((lot) => lot.warehouseId === input.warehouseId &&
        lot.productId === input.productId &&
        (lot.costSourceType ?? "system") === costSourceType &&
        (lot.costSourceId ?? null) === costSourceId);
    if (existingLot) {
        const existingQuantity = existingLot.quantity;
        const existingCostMinor = sanitizeMoney(existingLot.totalCostMinor ?? sanitizeMoney((existingLot.unitCostMinor ?? 0) * existingQuantity));
        const nextQuantity = sanitizeQuantity(existingQuantity + quantity);
        const nextTotalCostMinor = sanitizeMoney(existingCostMinor + totalCostMinor);
        existingLot.quality =
            nextQuantity > 0 ? clamp((existingLot.quality * existingQuantity + clamp(input.quality, 0, 1) * quantity) / nextQuantity, 0, 1) : 0;
        existingLot.quantity = nextQuantity;
        existingLot.totalCostMinor = nextTotalCostMinor;
        existingLot.unitCostMinor = nextQuantity > 0 ? sanitizeMoney(nextTotalCostMinor / nextQuantity) : unitCostMinor;
        existingLot.costSourceType = costSourceType;
        existingLot.costSourceId = costSourceId;
        return;
    }
    input.inventoryLots.push({
        id: input.lotId,
        warehouseId: input.warehouseId,
        productId: input.productId,
        quantity,
        quality: clamp(input.quality, 0, 1),
        unitCostMinor,
        totalCostMinor,
        costSourceType,
        costSourceId
    });
}
function normalizeWorldState(state) {
    return {
        ...state,
        centralBanks: (state.centralBanks ?? []).map((bank) => ({
            ...bank,
            policyRate: clamp(bank.policyRate, 0, 1),
            reserveRequirement: clamp(bank.reserveRequirement, 0.01, 1),
            baseMoneyMinor: sanitizeMoney(bank.baseMoneyMinor),
            bondHoldingsMinor: sanitizeMoney(bank.bondHoldingsMinor),
            depositInsuranceLimitMinor: sanitizeMoney(bank.depositInsuranceLimitMinor)
        })),
        banks: (state.banks ?? []).map((bank) => ({
            ...bank,
            reserveRatio: clamp(bank.reserveRatio, 0.01, 1),
            riskRating: clamp(bank.riskRating, 0, 1),
            capitalMinor: sanitizeMoney(bank.capitalMinor ?? 0),
            reservesMinor: sanitizeMoney(bank.reservesMinor ?? 0),
            depositsMinor: sanitizeMoney(bank.depositsMinor ?? 0),
            loanBookMinor: sanitizeMoney(bank.loanBookMinor ?? 0),
            nonPerformingLoanMinor: sanitizeMoney(bank.nonPerformingLoanMinor ?? 0),
            currencyCode: bank.currencyCode ?? "NCR",
            solvent: bank.solvent ?? true
        })),
        bankAccounts: (state.bankAccounts ?? []).map((account) => ({
            ...account,
            balanceMinor: sanitizeMoney(account.balanceMinor),
            reservedMinor: Math.min(sanitizeMoney(account.reservedMinor), sanitizeMoney(account.balanceMinor))
        })),
        loans: (state.loans ?? []).map((loan) => ({
            ...loan,
            principalMinor: sanitizeMoney(loan.principalMinor),
            outstandingPrincipalMinor: sanitizeMoney(loan.outstandingPrincipalMinor),
            accruedInterestMinor: sanitizeMoney(loan.accruedInterestMinor),
            annualInterestRate: clamp(loan.annualInterestRate, 0, 1),
            termTicks: sanitizeQuantity(loan.termTicks),
            remainingTicks: sanitizeQuantity(loan.remainingTicks),
            paymentPerTickMinor: sanitizeMoney(loan.paymentPerTickMinor),
            missedPayments: sanitizeQuantity(loan.missedPayments)
        })),
        creditScores: (state.creditScores ?? []).map((score) => ({
            ...score,
            score: clamp(score.score, 0, 1),
            probabilityOfDefault: clamp(score.probabilityOfDefault, 0, 1),
            lastUpdatedTick: sanitizeQuantity(score.lastUpdatedTick)
        })),
        interestRates: (state.interestRates ?? []).map((rate) => ({
            ...rate,
            policyRate: clamp(rate.policyRate, 0, 1),
            reserveRequirement: clamp(rate.reserveRequirement, 0.01, 1),
            primeRate: clamp(rate.primeRate, 0, 1),
            updatedTick: sanitizeQuantity(rate.updatedTick)
        })),
        bonds: (state.bonds ?? []).map((bond) => ({
            ...bond,
            faceValueMinor: sanitizeMoney(bond.faceValueMinor),
            couponRate: clamp(bond.couponRate, 0, 1),
            maturityTick: sanitizeQuantity(bond.maturityTick),
            outstandingQuantity: sanitizeQuantity(bond.outstandingQuantity)
        })),
        stocks: (state.stocks ?? []).map((stock) => ({
            ...stock,
            sharesOutstanding: sanitizeQuantity(stock.sharesOutstanding),
            lastPriceMinor: sanitizeMoney(stock.lastPriceMinor)
        })),
        exchanges: state.exchanges ?? [],
        orderBooks: (state.orderBooks ?? []).map((book) => ({
            ...book,
            lastPriceMinor: sanitizeMoney(book.lastPriceMinor),
            bids: book.bids.map((order) => normalizeOrder(order)),
            asks: book.asks.map((order) => normalizeOrder(order))
        })),
        trades: (state.trades ?? []).map((trade) => ({
            ...trade,
            priceMinor: sanitizeMoney(trade.priceMinor),
            quantity: sanitizeQuantity(trade.quantity),
            tick: sanitizeQuantity(trade.tick)
        })),
        portfolioPositions: (state.portfolioPositions ?? []).map((position) => ({
            ...position,
            quantity: sanitizeQuantity(position.quantity),
            averageCostMinor: sanitizeMoney(position.averageCostMinor)
        })),
        bankruptcies: (state.bankruptcies ?? []).map((bankruptcy) => ({
            ...bankruptcy,
            openedTick: sanitizeQuantity(bankruptcy.openedTick),
            resolvedTick: bankruptcy.resolvedTick === null ? null : sanitizeQuantity(bankruptcy.resolvedTick),
            estimatedAssetsMinor: sanitizeMoney(bankruptcy.estimatedAssetsMinor),
            claimsMinor: sanitizeMoney(bankruptcy.claimsMinor),
            recoveryRate: clamp(bankruptcy.recoveryRate, 0, 1)
        })),
        assetAuctions: (state.assetAuctions ?? []).map((auction) => ({
            ...auction,
            reservePriceMinor: sanitizeMoney(auction.reservePriceMinor),
            highestBidMinor: sanitizeMoney(auction.highestBidMinor),
            createdTick: sanitizeQuantity(auction.createdTick),
            settledTick: auction.settledTick === null ? null : sanitizeQuantity(auction.settledTick)
        })),
        governments: (state.governments ?? []).map((government) => ({
            ...government,
            stabilityRating: clamp(government.stabilityRating, 0, 1),
            bureaucracyScore: clamp(government.bureaucracyScore, 0, 1),
            legitimacy: clamp(government.legitimacy, 0, 1),
            corruptionLevel: clamp(government.corruptionLevel, 0, 1),
            taxEfficiency: clamp(government.taxEfficiency, 0, 1)
        })),
        politicalParties: (state.politicalParties ?? []).map((party) => ({
            ...party,
            popularity: clamp(party.popularity, 0, 1),
            fundingMinor: sanitizeMoney(party.fundingMinor),
            mediaReach: clamp(party.mediaReach, 0, 1),
            corruptionTolerance: clamp(party.corruptionTolerance, 0, 1),
            policyBias: party.policyBias ?? []
        })),
        elections: (state.elections ?? []).map((election) => ({
            ...election,
            scheduledTick: sanitizeQuantity(election.scheduledTick),
            lastTick: sanitizeQuantity(election.lastTick),
            npcVoteWeight: sanitizeQuantity(election.npcVoteWeight),
            playerVoteWeight: sanitizeQuantity(election.playerVoteWeight),
            turnout: clamp(election.turnout, 0, 1),
            results: election.results.map((result) => ({
                ...result,
                npcVotes: sanitizeQuantity(result.npcVotes),
                playerVotes: sanitizeQuantity(result.playerVotes),
                totalVotes: sanitizeQuantity(result.totalVotes)
            }))
        })),
        laws: (state.laws ?? []).map((law) => ({
            ...law,
            support: clamp(law.support, 0, 1),
            economicImpact: clamp(law.economicImpact, -1, 1),
            stabilityImpact: clamp(law.stabilityImpact, -1, 1),
            enactedTick: law.enactedTick === null ? null : sanitizeQuantity(law.enactedTick)
        })),
        taxPolicies: (state.taxPolicies ?? []).map((policy) => ({
            ...policy,
            profitTaxRate: clamp(policy.profitTaxRate, 0, 1),
            salesTaxRate: clamp(policy.salesTaxRate, 0, 1),
            importTariffRate: clamp(policy.importTariffRate, 0, 2),
            environmentalFineMinor: sanitizeMoney(policy.environmentalFineMinor),
            updatedTick: sanitizeQuantity(policy.updatedTick)
        })),
        governmentBudgets: (state.governmentBudgets ?? []).map((budget) => ({
            ...budget,
            tick: sanitizeQuantity(budget.tick),
            revenueMinor: sanitizeMoney(budget.revenueMinor),
            spendingMinor: sanitizeMoney(budget.spendingMinor),
            deficitMinor: sanitizeMoney(budget.deficitMinor),
            treasuryMinor: sanitizeMoney(budget.treasuryMinor),
            welfareSpendingMinor: sanitizeMoney(budget.welfareSpendingMinor),
            infrastructureSpendingMinor: sanitizeMoney(budget.infrastructureSpendingMinor),
            bailoutSpendingMinor: sanitizeMoney(budget.bailoutSpendingMinor)
        })),
        publicDebt: (state.publicDebt ?? []).map((debt) => ({
            ...debt,
            outstandingDebtMinor: sanitizeMoney(debt.outstandingDebtMinor),
            debtServiceMinor: sanitizeMoney(debt.debtServiceMinor),
            bondIds: debt.bondIds ?? []
        })),
        subsidies: (state.subsidies ?? []).map((subsidy) => ({
            ...subsidy,
            amountMinorPerTick: sanitizeMoney(subsidy.amountMinorPerTick)
        })),
        licenses: (state.licenses ?? []).map((license) => ({
            ...license,
            issuedTick: sanitizeQuantity(license.issuedTick),
            expiresTick: license.expiresTick === null ? null : sanitizeQuantity(license.expiresTick)
        })),
        sanctionPolicies: (state.sanctionPolicies ?? []).map((policy) => ({
            ...policy,
            tariffRate: clamp(policy.tariffRate, 0, 2)
        })),
        corruptionIndexes: (state.corruptionIndexes ?? []).map((index) => ({
            ...index,
            value: clamp(index.value, 0, 1),
            trend: clamp(index.trend, -1, 1),
            updatedTick: sanitizeQuantity(index.updatedTick)
        })),
        protests: (state.protests ?? []).map((protest) => ({
            ...protest,
            intensity: clamp(protest.intensity, 0, 1),
            startedTick: sanitizeQuantity(protest.startedTick),
            resolvedTick: protest.resolvedTick === null ? null : sanitizeQuantity(protest.resolvedTick)
        })),
        lobbyingActions: (state.lobbyingActions ?? []).map((action) => ({
            ...action,
            amountMinor: sanitizeMoney(action.amountMinor),
            influence: clamp(action.influence, 0, 1),
            tick: sanitizeQuantity(action.tick)
        })),
        mediaInfluences: (state.mediaInfluences ?? []).map((influence) => ({
            ...influence,
            spendMinor: sanitizeMoney(influence.spendMinor),
            reach: clamp(influence.reach, 0, 1),
            influence: clamp(influence.influence, 0, 1),
            tick: sanitizeQuantity(influence.tick)
        })),
        wars: (state.wars ?? []).map((war) => ({
            ...war,
            startedTick: sanitizeQuantity(war.startedTick),
            endedTick: war.endedTick === null ? null : sanitizeQuantity(war.endedTick),
            intensity: clamp(war.intensity, 0, 1),
            recognitionScore: clamp(war.recognitionScore, 0, 1)
        })),
        fronts: (state.fronts ?? []).map((front) => ({
            ...front,
            cellIds: front.cellIds ?? [],
            pressure: clamp(front.pressure, 0, 1)
        })),
        strategicCells: (state.strategicCells ?? []).map((cell) => ({
            ...cell,
            sizeKm: sanitizeQuantity(cell.sizeKm),
            infrastructureScore: clamp(cell.infrastructureScore, 0, 1),
            population: sanitizeQuantity(cell.population)
        })),
        armies: (state.armies ?? []).map((army) => ({
            ...army,
            morale: clamp(army.morale, 0, 1),
            readiness: clamp(army.readiness, 0, 1),
            manpower: sanitizeQuantity(army.manpower),
            fuelStock: sanitizeQuantity(army.fuelStock),
            foodStock: sanitizeQuantity(army.foodStock),
            ammunitionStock: sanitizeQuantity(army.ammunitionStock)
        })),
        militaryUnits: (state.militaryUnits ?? []).map((unit) => ({
            ...unit,
            strength: sanitizeQuantity(unit.strength),
            mobility: clamp(unit.mobility, 0, 1),
            supplyNeedPerTick: {
                food: clamp(unit.supplyNeedPerTick.food, 0, 100),
                fuel: clamp(unit.supplyNeedPerTick.fuel, 0, 100),
                ammunition: clamp(unit.supplyNeedPerTick.ammunition, 0, 100)
            },
            combatPower: clamp(unit.combatPower, 0, 1),
            readiness: clamp(unit.readiness, 0, 1)
        })),
        militarySupplies: (state.militarySupplies ?? []).map((supply) => ({
            ...supply,
            requestedQuantity: sanitizeQuantity(supply.requestedQuantity),
            deliveredQuantity: sanitizeQuantity(supply.deliveredQuantity),
            consumedQuantity: sanitizeQuantity(supply.consumedQuantity),
            shortageQuantity: sanitizeQuantity(supply.shortageQuantity),
            tick: sanitizeQuantity(supply.tick)
        })),
        occupations: (state.occupations ?? []).map((occupation) => ({
            ...occupation,
            startedTick: sanitizeQuantity(occupation.startedTick),
            recognition: clamp(occupation.recognition, 0, 1),
            taxCaptureRate: clamp(occupation.taxCaptureRate, 0, 1),
            infrastructureControl: clamp(occupation.infrastructureControl, 0, 1)
        })),
        treaties: (state.treaties ?? []).map((treaty) => ({
            ...treaty,
            countryIds: treaty.countryIds ?? [],
            signedTick: treaty.signedTick === null ? null : sanitizeQuantity(treaty.signedTick),
            expiresTick: treaty.expiresTick === null ? null : sanitizeQuantity(treaty.expiresTick)
        })),
        sanctions: (state.sanctions ?? []).map((sanction) => ({
            ...sanction,
            severity: clamp(sanction.severity, 0, 1),
            startedTick: sanitizeQuantity(sanction.startedTick)
        })),
        alliances: (state.alliances ?? []).map((alliance) => ({
            ...alliance,
            countryIds: alliance.countryIds ?? []
        })),
        blockades: (state.blockades ?? []).map((blockade) => ({
            ...blockade,
            severity: clamp(blockade.severity, 0, 1),
            startedTick: sanitizeQuantity(blockade.startedTick)
        })),
        refugeeFlows: (state.refugeeFlows ?? []).map((flow) => ({
            ...flow,
            people: sanitizeQuantity(flow.people),
            tick: sanitizeQuantity(flow.tick)
        })),
        warDamage: (state.warDamage ?? []).map((damage) => ({
            ...damage,
            severity: clamp(damage.severity, 0, 1),
            damageMinor: sanitizeMoney(damage.damageMinor),
            tick: sanitizeQuantity(damage.tick)
        })),
        militaryOrders: (state.militaryOrders ?? []).map((order) => ({
            ...order,
            quantity: sanitizeQuantity(order.quantity),
            fulfilledQuantity: Math.min(sanitizeQuantity(order.quantity), sanitizeQuantity(order.fulfilledQuantity)),
            maxPriceMinor: sanitizeMoney(order.maxPriceMinor),
            tick: sanitizeQuantity(order.tick)
        })),
        technologies: (state.technologies ?? []).map((technology) => ({
            ...technology,
            researchCostMinor: sanitizeMoney(technology.researchCostMinor),
            effects: {
                productionEfficiency: clamp(technology.effects.productionEfficiency, 0, 1),
                inputEfficiency: clamp(technology.effects.inputEfficiency, 0, 1),
                logisticsEfficiency: clamp(technology.effects.logisticsEfficiency, 0, 1),
                pollutionReduction: clamp(technology.effects.pollutionReduction, 0, 1),
                healthBonus: clamp(technology.effects.healthBonus, 0, 1),
                discoveryBonus: clamp(technology.effects.discoveryBonus, 0, 1),
                militaryEfficiency: clamp(technology.effects.militaryEfficiency, 0, 1),
                educationBonus: clamp(technology.effects.educationBonus, 0, 1),
                energyEfficiency: clamp(technology.effects.energyEfficiency, 0, 1)
            },
            prerequisites: technology.prerequisites ?? []
        })),
        technologyLevels: (state.technologyLevels ?? []).map((level) => ({
            ...level,
            level: clamp(level.level, 0, 5),
            progress: clamp(level.progress, 0, 1),
            updatedTick: sanitizeQuantity(level.updatedTick)
        })),
        researchProjects: (state.researchProjects ?? []).map((project) => ({
            ...project,
            fundingPerTickMinor: sanitizeMoney(project.fundingPerTickMinor),
            accumulatedResearch: sanitizeMoney(project.accumulatedResearch),
            requiredResearch: sanitizeMoney(project.requiredResearch),
            startedTick: sanitizeQuantity(project.startedTick),
            completedTick: project.completedTick === null ? null : sanitizeQuantity(project.completedTick)
        })),
        patents: (state.patents ?? []).map((patent) => ({
            ...patent,
            filedTick: sanitizeQuantity(patent.filedTick),
            expiresTick: patent.expiresTick === null ? null : sanitizeQuantity(patent.expiresTick)
        })),
        licenseAgreements: (state.licenseAgreements ?? []).map((agreement) => ({
            ...agreement,
            royaltyRate: clamp(agreement.royaltyRate, 0, 1),
            upfrontFeeMinor: sanitizeMoney(agreement.upfrontFeeMinor),
            startedTick: sanitizeQuantity(agreement.startedTick),
            expiresTick: agreement.expiresTick === null ? null : sanitizeQuantity(agreement.expiresTick)
        })),
        pollution: (state.pollution ?? []).map((record) => ({
            ...record,
            amount: Math.max(0, Number.isFinite(record.amount) ? record.amount : 0),
            tick: sanitizeQuantity(record.tick)
        })),
        environmentalIndexes: (state.environmentalIndexes ?? []).map((index) => ({
            ...index,
            airQuality: clamp(index.airQuality, 0, 1),
            waterQuality: clamp(index.waterQuality, 0, 1),
            soilQuality: clamp(index.soilQuality, 0, 1),
            carbonIntensity: clamp(index.carbonIntensity, 0, 1),
            biodiversity: clamp(index.biodiversity, 0, 1),
            healthImpact: clamp(index.healthImpact, 0, 1),
            migrationPressure: clamp(index.migrationPressure, 0, 1),
            updatedTick: sanitizeQuantity(index.updatedTick)
        })),
        resourceDeposits: (state.resourceDeposits ?? []).map((deposit) => ({
            ...deposit,
            quantity: sanitizeQuantity(deposit.quantity),
            initialQuantity: sanitizeQuantity(deposit.initialQuantity),
            extractionPerTick: sanitizeQuantity(deposit.extractionPerTick),
            discoveryChance: clamp(deposit.discoveryChance, 0, 1),
            quality: clamp(deposit.quality, 0, 1)
        })),
        resourceDiscoveries: (state.resourceDiscoveries ?? []).map((discovery) => ({
            ...discovery,
            tick: sanitizeQuantity(discovery.tick),
            quantity: sanitizeQuantity(discovery.quantity)
        })),
        cleanEnergyPolicies: (state.cleanEnergyPolicies ?? []).map((policy) => ({
            ...policy,
            subsidyMinorPerTick: sanitizeMoney(policy.subsidyMinorPerTick),
            pollutionReduction: clamp(policy.pollutionReduction, 0, 1),
            enactedTick: policy.enactedTick === null ? null : sanitizeQuantity(policy.enactedTick)
        })),
        blackMarkets: (state.blackMarkets ?? []).map((market) => ({
            ...market,
            demandQuantity: sanitizeQuantity(market.demandQuantity),
            supplyQuantity: sanitizeQuantity(market.supplyQuantity),
            priceMultiplier: clamp(market.priceMultiplier, 0.1, 20),
            riskLevel: clamp(market.riskLevel, 0, 1),
            corruptionInfluence: clamp(market.corruptionInfluence, 0, 1),
            createdTick: sanitizeQuantity(market.createdTick),
            lastUpdatedTick: sanitizeQuantity(market.lastUpdatedTick)
        })),
        illegalTrades: (state.illegalTrades ?? []).map((trade) => ({
            ...trade,
            quantity: sanitizeQuantity(trade.quantity),
            priceMinor: sanitizeMoney(trade.priceMinor),
            bribeMinor: sanitizeMoney(trade.bribeMinor),
            detectionRisk: clamp(trade.detectionRisk, 0, 1),
            createdTick: sanitizeQuantity(trade.createdTick),
            resolvedTick: trade.resolvedTick === null ? null : sanitizeQuantity(trade.resolvedTick)
        })),
        smugglingRoutes: (state.smugglingRoutes ?? []).map((route) => ({
            ...route,
            capacityPerTick: sanitizeQuantity(route.capacityPerTick),
            costMinorPerUnit: sanitizeMoney(route.costMinorPerUnit),
            baseDetectionRisk: clamp(route.baseDetectionRisk, 0, 1),
            corruptionShield: clamp(route.corruptionShield, 0, 1)
        })),
        corruptionCases: (state.corruptionCases ?? []).map((item) => ({
            ...item,
            amountMinor: sanitizeMoney(item.amountMinor),
            severity: clamp(item.severity, 0, 1),
            tick: sanitizeQuantity(item.tick)
        })),
        investigations: (state.investigations ?? []).map((item) => ({
            ...item,
            suspicion: clamp(item.suspicion, 0, 1),
            detectionChance: clamp(item.detectionChance, 0, 1),
            openedTick: sanitizeQuantity(item.openedTick),
            closedTick: item.closedTick === null ? null : sanitizeQuantity(item.closedTick)
        })),
        enforcementAgencies: (state.enforcementAgencies ?? []).map((agency) => ({
            ...agency,
            controlScore: clamp(agency.controlScore, 0, 1),
            capacityPerTick: sanitizeQuantity(agency.capacityPerTick),
            corruptionResistance: clamp(agency.corruptionResistance, 0, 1),
            mediaSensitivity: clamp(agency.mediaSensitivity, 0, 1),
            budgetMinor: sanitizeMoney(agency.budgetMinor)
        })),
        fines: (state.fines ?? []).map((fine) => ({
            ...fine,
            amountMinor: sanitizeMoney(fine.amountMinor),
            tick: sanitizeQuantity(fine.tick),
            paidTick: fine.paidTick === null ? null : sanitizeQuantity(fine.paidTick)
        })),
        confiscations: (state.confiscations ?? []).map((confiscation) => ({
            ...confiscation,
            quantity: sanitizeQuantity(confiscation.quantity),
            valueMinor: sanitizeMoney(confiscation.valueMinor),
            tick: sanitizeQuantity(confiscation.tick)
        })),
        reputationPenalties: (state.reputationPenalties ?? []).map((penalty) => ({
            ...penalty,
            amount: clamp(penalty.amount, 0, 1),
            tick: sanitizeQuantity(penalty.tick)
        })),
        illegalContracts: (state.illegalContracts ?? []).map((contract) => ({
            ...contract,
            quantity: sanitizeQuantity(contract.quantity),
            priceMinor: sanitizeMoney(contract.priceMinor),
            riskLevel: clamp(contract.riskLevel, 0, 1),
            createdTick: sanitizeQuantity(contract.createdTick),
            resolvedTick: contract.resolvedTick === null ? null : sanitizeQuantity(contract.resolvedTick)
        })),
        eventCauses: (state.eventCauses ?? []).map((cause) => ({
            ...cause,
            tick: sanitizeQuantity(cause.tick),
            weight: clamp(cause.weight, 0, 1)
        })),
        eventImpacts: (state.eventImpacts ?? []).map((impact) => ({
            ...impact,
            tick: sanitizeQuantity(impact.tick),
            beforeValue: impact.beforeValue === null ? null : sanitizeNonNegativeNumber(impact.beforeValue),
            afterValue: impact.afterValue === null ? null : sanitizeNonNegativeNumber(impact.afterValue),
            delta: Number.isFinite(impact.delta) && !Number.isNaN(impact.delta) ? impact.delta : 0,
            severity: clamp(impact.severity, 0, 1)
        })),
        metricChanges: (state.metricChanges ?? []).map((change) => ({
            ...change,
            tick: sanitizeQuantity(change.tick),
            previousValue: sanitizeNonNegativeNumber(change.previousValue),
            currentValue: sanitizeNonNegativeNumber(change.currentValue),
            delta: Number.isFinite(change.delta) && !Number.isNaN(change.delta) ? change.delta : 0,
            percentChange: Number.isFinite(change.percentChange) && !Number.isNaN(change.percentChange) ? change.percentChange : 0
        })),
        explanations: (state.explanations ?? []).map((explanation) => ({
            ...explanation,
            tick: sanitizeQuantity(explanation.tick),
            confidence: clamp(explanation.confidence, 0, 1),
            causes: explanation.causes.map((cause) => ({
                ...cause,
                value: sanitizeNonNegativeNumber(cause.value),
                weight: clamp(cause.weight, 0, 1)
            })),
            impactIds: explanation.impactIds ?? [],
            relatedMetricIds: explanation.relatedMetricIds ?? [],
            relatedEntityIds: explanation.relatedEntityIds ?? []
        })),
        newsTemplates: state.newsTemplates ?? [],
        forecasts: (state.forecasts ?? []).map((forecast) => ({
            ...forecast,
            tick: sanitizeQuantity(forecast.tick),
            currentValue: sanitizeNonNegativeNumber(forecast.currentValue),
            predictedValue: sanitizeNonNegativeNumber(forecast.predictedValue),
            horizonTicks: sanitizeQuantity(forecast.horizonTicks),
            confidence: clamp(forecast.confidence, 0, 1),
            driverExplanationIds: forecast.driverExplanationIds ?? []
        })),
        publicStatistics: (state.publicStatistics ?? []).map((statistic) => ({
            ...statistic,
            tick: sanitizeQuantity(statistic.tick),
            value: sanitizeNonNegativeNumber(statistic.value)
        })),
        hiddenStatistics: (state.hiddenStatistics ?? []).map((statistic) => ({
            ...statistic,
            tick: sanitizeQuantity(statistic.tick),
            value: sanitizeNonNegativeNumber(statistic.value)
        })),
        dataReliability: (state.dataReliability ?? []).map((reliability) => ({
            ...reliability,
            score: clamp(reliability.score, 0, 1),
            manipulationRisk: clamp(reliability.manipulationRisk, 0, 1),
            updatedTick: sanitizeQuantity(reliability.updatedTick)
        })),
        playerCommands: (state.playerCommands ?? []).map((record) => ({
            ...record,
            tickReceived: sanitizeQuantity(record.tickReceived),
            tickScheduled: sanitizeQuantity(record.tickScheduled),
            tickApplied: record.tickApplied === null ? null : sanitizeQuantity(record.tickApplied),
            resultEventIds: record.resultEventIds ?? [],
            resultMetricIds: record.resultMetricIds ?? [],
            resultFinancialTransactionIds: record.resultFinancialTransactionIds ?? [],
            affectedEntityIds: record.affectedEntityIds ?? []
        })),
        auditLogs: (state.auditLogs ?? []).map((record) => ({
            ...record,
            eventIds: record.eventIds ?? [],
            metricIds: record.metricIds ?? [],
            financialTransactionIds: record.financialTransactionIds ?? [],
            affectedEntityIds: record.affectedEntityIds ?? []
        })),
        cities: state.cities.map((city) => ({
            ...city,
            populationTotal: sanitizeQuantity(city.populationTotal),
            infrastructureScore: clamp(city.infrastructureScore, 0, 1)
        })),
        landParcels: (state.landParcels ?? []).map((parcel) => ({
            ...parcel,
            marketPriceMinor: sanitizeMoney(parcel.marketPriceMinor ?? 0),
            monthlyRentMinor: sanitizeMoney(parcel.monthlyRentMinor ?? 0),
            maintenanceMinorPerMonth: sanitizeMoney(parcel.maintenanceMinorPerMonth ?? 0),
            infrastructureScore: clamp(parcel.infrastructureScore ?? 0, 0, 1),
            allowedBusinessTypes: parcel.allowedBusinessTypes ?? []
        })),
        premises: (state.premises ?? []).map((premise) => ({
            ...premise,
            purchasePriceMinor: sanitizeMoney(premise.purchasePriceMinor ?? 0),
            monthlyRentMinor: sanitizeMoney(premise.monthlyRentMinor ?? 0),
            maintenanceMinorPerMonth: sanitizeMoney(premise.maintenanceMinorPerMonth ?? 0),
            acquiredTick: premise.acquiredTick === null || premise.acquiredTick === undefined ? null : sanitizeQuantity(premise.acquiredTick),
            leaseExpiresTick: premise.leaseExpiresTick === null || premise.leaseExpiresTick === undefined ? null : sanitizeQuantity(premise.leaseExpiresTick)
        })),
        warehouses: (state.warehouses ?? []).map((warehouse) => ({
            ...warehouse,
            capacity: sanitizeQuantity(warehouse.capacity ?? 0),
            handlingCostMinorPerUnit: sanitizeMoney(warehouse.handlingCostMinorPerUnit ?? 0),
            warehouseType: warehouse.warehouseType ?? "general"
        })),
        companies: state.companies.map((company) => ({
            ...company,
            cashBalanceMinor: sanitizeMoney(company.cashBalanceMinor),
            reputation: clamp(company.reputation, 0, 1)
        })),
        populationCohorts: state.populationCohorts.map((cohort) => ({
            ...cohort,
            size: sanitizeQuantity(cohort.size),
            cashBalanceMinor: sanitizeMoney(cohort.cashBalanceMinor),
            satisfaction: clamp(cohort.satisfaction, 0, 1)
        })),
        inventoryLots: state.inventoryLots.map((lot) => {
            const quantity = sanitizeQuantity(lot.quantity);
            const totalCostMinor = sanitizeMoney(lot.totalCostMinor ?? sanitizeMoney((lot.unitCostMinor ?? 0) * quantity));
            return {
                ...lot,
                quantity,
                quality: clamp(lot.quality, 0, 1),
                unitCostMinor: quantity > 0 ? sanitizeMoney(lot.unitCostMinor ?? totalCostMinor / quantity) : sanitizeMoney(lot.unitCostMinor ?? 0),
                totalCostMinor,
                costSourceType: lot.costSourceType ?? "seed",
                costSourceId: lot.costSourceId ?? lot.id
            };
        }),
        shipments: (state.shipments ?? []).map((shipment) => ({
            ...shipment,
            quantity: sanitizeQuantity(shipment.quantity),
            costMinor: sanitizeMoney(shipment.costMinor),
            durationTicks: sanitizeQuantity(shipment.durationTicks),
            remainingTicks: sanitizeQuantity(shipment.remainingTicks),
            risk: clamp(shipment.risk, 0, 1)
        })),
        logisticsRoutes: state.logisticsRoutes ?? [],
        transportCompanies: (state.transportCompanies ?? []).map((company) => ({
            ...company,
            reliability: clamp(company.reliability, 0, 1),
            capacityPerTick: sanitizeQuantity(company.capacityPerTick),
            costMultiplier: clamp(company.costMultiplier, 0.1, 10),
            cashBalanceMinor: sanitizeMoney(company.cashBalanceMinor)
        })),
        routeNodes: state.routeNodes ?? [],
        infrastructureLinks: (state.infrastructureLinks ?? []).map((link) => ({
            ...link,
            distanceKm: sanitizeQuantity(link.distanceKm),
            quality: clamp(link.quality, 0, 1),
            capacityPerTick: sanitizeQuantity(link.capacityPerTick),
            baseCostMinorPerUnit: sanitizeMoney(link.baseCostMinorPerUnit),
            baseDurationTicks: sanitizeQuantity(link.baseDurationTicks),
            warDisruptionRisk: clamp(link.warDisruptionRisk, 0, 1)
        })),
        borderCrossings: (state.borderCrossings ?? []).map((border) => ({
            ...border,
            sanctionLevel: clamp(border.sanctionLevel, 0, 1),
            delayTicks: sanitizeQuantity(border.delayTicks)
        })),
        ports: (state.ports ?? []).map((port) => ({
            ...port,
            capacityPerTick: sanitizeQuantity(port.capacityPerTick),
            quality: clamp(port.quality, 0, 1)
        })),
        roads: (state.roads ?? []).map((road) => ({
            ...road,
            lanes: sanitizeQuantity(road.lanes),
            speedLimitKph: sanitizeQuantity(road.speedLimitKph)
        })),
        railLines: (state.railLines ?? []).map((railLine) => ({
            ...railLine,
            trackCount: sanitizeQuantity(railLine.trackCount)
        })),
        productionPlans: state.productionPlans.map((plan) => ({
            ...plan,
            outputQuantityPerTick: sanitizeQuantity(plan.outputQuantityPerTick),
            inputs: plan.inputs.map((input) => ({
                ...input,
                quantityPerOutput: sanitizeNonNegativeNumber(input.quantityPerOutput)
            }))
        })),
        retailOffers: (state.retailOffers ?? []).map((offer) => ({
            ...offer,
            priceMinor: sanitizeMoney(offer.priceMinor),
            quality: clamp(offer.quality, 0, 1)
        })),
        retailPriceChanges: (state.retailPriceChanges ?? []).map((change) => ({
            ...change,
            tick: sanitizeQuantity(change.tick),
            oldPriceMinor: sanitizeMoney(change.oldPriceMinor),
            newPriceMinor: sanitizeMoney(change.newPriceMinor)
        })),
        resourceOffers: (state.resourceOffers ?? []).map((offer) => ({
            ...offer,
            unitPriceMinor: sanitizeMoney(offer.unitPriceMinor),
            quality: clamp(offer.quality, 0, 1),
            maxQuantityPerTick: sanitizeQuantity(offer.maxQuantityPerTick)
        })),
        resourcePurchases: (state.resourcePurchases ?? []).map((purchase) => ({
            ...purchase,
            tick: sanitizeQuantity(purchase.tick),
            quantity: sanitizeQuantity(purchase.quantity),
            unitPriceMinor: sanitizeMoney(purchase.unitPriceMinor),
            totalPriceMinor: sanitizeMoney(purchase.totalPriceMinor),
            goodsCostMinor: sanitizeMoney(purchase.goodsCostMinor ?? purchase.totalPriceMinor),
            logisticsCostMinor: sanitizeMoney(purchase.logisticsCostMinor ?? 0),
            quality: clamp(purchase.quality, 0, 1),
            deliveryMode: purchase.deliveryMode ?? "pickup",
            shipmentId: purchase.shipmentId ?? null,
            status: purchase.status ?? "completed"
        })),
        manualProductionRuns: (state.manualProductionRuns ?? []).map((run) => {
            const inputConsumptions = run.inputConsumptions.map((consumption) => {
                const quantity = sanitizeQuantity(consumption.quantity);
                const totalCostMinor = sanitizeMoney(consumption.totalCostMinor ?? sanitizeMoney((consumption.unitCostMinor ?? 0) * quantity));
                return {
                    ...consumption,
                    quantity,
                    unitCostMinor: quantity > 0 ? sanitizeMoney(consumption.unitCostMinor ?? totalCostMinor / quantity) : sanitizeMoney(consumption.unitCostMinor ?? 0),
                    totalCostMinor
                };
            });
            const inputCostMinor = sanitizeMoney(run.inputCostMinor ?? inputConsumptions.reduce((total, consumption) => total + consumption.totalCostMinor, 0));
            const producedQuantity = sanitizeQuantity(run.producedQuantity);
            const outputTotalCostMinor = sanitizeMoney(run.outputTotalCostMinor ?? inputCostMinor);
            return {
                ...run,
                tick: sanitizeQuantity(run.tick),
                requestedQuantity: sanitizeQuantity(run.requestedQuantity),
                producedQuantity,
                inputConsumptions,
                inputCostMinor,
                outputUnitCostMinor: producedQuantity > 0 ? sanitizeMoney(run.outputUnitCostMinor ?? outputTotalCostMinor / producedQuantity) : sanitizeMoney(run.outputUnitCostMinor ?? 0),
                outputTotalCostMinor
            };
        })
    };
}
function assertNoInvalidEconomyValues(state) {
    const invalids = [];
    const check = (path, value) => {
        if (!Number.isFinite(value) || Number.isNaN(value) || value < 0) {
            invalids.push(`${path}=${value}`);
        }
    };
    for (const company of state.companies) {
        check(`company.${company.id}.cashBalanceMinor`, company.cashBalanceMinor);
        check(`company.${company.id}.reputation`, company.reputation);
    }
    for (const centralBank of state.centralBanks) {
        check(`centralBank.${centralBank.id}.policyRate`, centralBank.policyRate);
        check(`centralBank.${centralBank.id}.reserveRequirement`, centralBank.reserveRequirement);
        check(`centralBank.${centralBank.id}.baseMoneyMinor`, centralBank.baseMoneyMinor);
        check(`centralBank.${centralBank.id}.bondHoldingsMinor`, centralBank.bondHoldingsMinor);
        check(`centralBank.${centralBank.id}.depositInsuranceLimitMinor`, centralBank.depositInsuranceLimitMinor);
    }
    for (const bank of state.banks) {
        check(`bank.${bank.id}.reserveRatio`, bank.reserveRatio);
        check(`bank.${bank.id}.riskRating`, bank.riskRating);
        check(`bank.${bank.id}.capitalMinor`, bank.capitalMinor);
        check(`bank.${bank.id}.reservesMinor`, bank.reservesMinor);
        check(`bank.${bank.id}.depositsMinor`, bank.depositsMinor);
        check(`bank.${bank.id}.loanBookMinor`, bank.loanBookMinor);
        check(`bank.${bank.id}.nonPerformingLoanMinor`, bank.nonPerformingLoanMinor);
    }
    for (const account of state.bankAccounts) {
        check(`bankAccount.${account.id}.balanceMinor`, account.balanceMinor);
        check(`bankAccount.${account.id}.reservedMinor`, account.reservedMinor);
    }
    for (const loan of state.loans) {
        check(`loan.${loan.id}.principalMinor`, loan.principalMinor);
        check(`loan.${loan.id}.outstandingPrincipalMinor`, loan.outstandingPrincipalMinor);
        check(`loan.${loan.id}.accruedInterestMinor`, loan.accruedInterestMinor);
        check(`loan.${loan.id}.annualInterestRate`, loan.annualInterestRate);
        check(`loan.${loan.id}.termTicks`, loan.termTicks);
        check(`loan.${loan.id}.remainingTicks`, loan.remainingTicks);
        check(`loan.${loan.id}.paymentPerTickMinor`, loan.paymentPerTickMinor);
        check(`loan.${loan.id}.missedPayments`, loan.missedPayments);
    }
    for (const score of state.creditScores) {
        check(`creditScore.${score.id}.score`, score.score);
        check(`creditScore.${score.id}.probabilityOfDefault`, score.probabilityOfDefault);
    }
    for (const bond of state.bonds) {
        check(`bond.${bond.id}.faceValueMinor`, bond.faceValueMinor);
        check(`bond.${bond.id}.couponRate`, bond.couponRate);
        check(`bond.${bond.id}.maturityTick`, bond.maturityTick);
        check(`bond.${bond.id}.outstandingQuantity`, bond.outstandingQuantity);
    }
    for (const stock of state.stocks) {
        check(`stock.${stock.id}.sharesOutstanding`, stock.sharesOutstanding);
        check(`stock.${stock.id}.lastPriceMinor`, stock.lastPriceMinor);
    }
    for (const book of state.orderBooks) {
        check(`orderBook.${book.id}.lastPriceMinor`, book.lastPriceMinor);
        for (const order of [...book.bids, ...book.asks]) {
            check(`order.${order.id}.priceMinor`, order.priceMinor);
            check(`order.${order.id}.quantity`, order.quantity);
            check(`order.${order.id}.remainingQuantity`, order.remainingQuantity);
        }
    }
    for (const trade of state.trades) {
        check(`trade.${trade.id}.priceMinor`, trade.priceMinor);
        check(`trade.${trade.id}.quantity`, trade.quantity);
    }
    for (const position of state.portfolioPositions) {
        check(`portfolio.${position.id}.quantity`, position.quantity);
        check(`portfolio.${position.id}.averageCostMinor`, position.averageCostMinor);
    }
    for (const bankruptcy of state.bankruptcies) {
        check(`bankruptcy.${bankruptcy.id}.estimatedAssetsMinor`, bankruptcy.estimatedAssetsMinor);
        check(`bankruptcy.${bankruptcy.id}.claimsMinor`, bankruptcy.claimsMinor);
        check(`bankruptcy.${bankruptcy.id}.recoveryRate`, bankruptcy.recoveryRate);
    }
    for (const auction of state.assetAuctions) {
        check(`auction.${auction.id}.reservePriceMinor`, auction.reservePriceMinor);
        check(`auction.${auction.id}.highestBidMinor`, auction.highestBidMinor);
    }
    for (const government of state.governments) {
        check(`government.${government.id}.stabilityRating`, government.stabilityRating);
        check(`government.${government.id}.bureaucracyScore`, government.bureaucracyScore);
        check(`government.${government.id}.legitimacy`, government.legitimacy);
        check(`government.${government.id}.corruptionLevel`, government.corruptionLevel);
        check(`government.${government.id}.taxEfficiency`, government.taxEfficiency);
    }
    for (const party of state.politicalParties) {
        check(`politicalParty.${party.id}.popularity`, party.popularity);
        check(`politicalParty.${party.id}.fundingMinor`, party.fundingMinor);
        check(`politicalParty.${party.id}.mediaReach`, party.mediaReach);
        check(`politicalParty.${party.id}.corruptionTolerance`, party.corruptionTolerance);
    }
    for (const election of state.elections) {
        check(`election.${election.id}.npcVoteWeight`, election.npcVoteWeight);
        check(`election.${election.id}.playerVoteWeight`, election.playerVoteWeight);
        check(`election.${election.id}.turnout`, election.turnout);
        for (const result of election.results) {
            check(`election.${election.id}.${result.partyId}.npcVotes`, result.npcVotes);
            check(`election.${election.id}.${result.partyId}.playerVotes`, result.playerVotes);
            check(`election.${election.id}.${result.partyId}.totalVotes`, result.totalVotes);
        }
    }
    for (const law of state.laws) {
        check(`law.${law.id}.support`, law.support);
    }
    for (const policy of state.taxPolicies) {
        check(`taxPolicy.${policy.id}.profitTaxRate`, policy.profitTaxRate);
        check(`taxPolicy.${policy.id}.salesTaxRate`, policy.salesTaxRate);
        check(`taxPolicy.${policy.id}.importTariffRate`, policy.importTariffRate);
        check(`taxPolicy.${policy.id}.environmentalFineMinor`, policy.environmentalFineMinor);
    }
    for (const budget of state.governmentBudgets) {
        check(`governmentBudget.${budget.id}.revenueMinor`, budget.revenueMinor);
        check(`governmentBudget.${budget.id}.spendingMinor`, budget.spendingMinor);
        check(`governmentBudget.${budget.id}.deficitMinor`, budget.deficitMinor);
        check(`governmentBudget.${budget.id}.treasuryMinor`, budget.treasuryMinor);
        check(`governmentBudget.${budget.id}.welfareSpendingMinor`, budget.welfareSpendingMinor);
        check(`governmentBudget.${budget.id}.infrastructureSpendingMinor`, budget.infrastructureSpendingMinor);
        check(`governmentBudget.${budget.id}.bailoutSpendingMinor`, budget.bailoutSpendingMinor);
    }
    for (const debt of state.publicDebt) {
        check(`publicDebt.${debt.id}.outstandingDebtMinor`, debt.outstandingDebtMinor);
        check(`publicDebt.${debt.id}.debtServiceMinor`, debt.debtServiceMinor);
    }
    for (const subsidy of state.subsidies) {
        check(`subsidy.${subsidy.id}.amountMinorPerTick`, subsidy.amountMinorPerTick);
    }
    for (const corruption of state.corruptionIndexes) {
        check(`corruption.${corruption.id}.value`, corruption.value);
    }
    for (const protest of state.protests) {
        check(`protest.${protest.id}.intensity`, protest.intensity);
    }
    for (const action of state.lobbyingActions) {
        check(`lobbying.${action.id}.amountMinor`, action.amountMinor);
        check(`lobbying.${action.id}.influence`, action.influence);
    }
    for (const influence of state.mediaInfluences) {
        check(`media.${influence.id}.spendMinor`, influence.spendMinor);
        check(`media.${influence.id}.reach`, influence.reach);
        check(`media.${influence.id}.influence`, influence.influence);
    }
    for (const city of state.cities) {
        check(`city.${city.id}.populationTotal`, city.populationTotal);
        check(`city.${city.id}.infrastructureScore`, city.infrastructureScore);
    }
    for (const war of state.wars) {
        check(`war.${war.id}.startedTick`, war.startedTick);
        if (war.endedTick !== null) {
            check(`war.${war.id}.endedTick`, war.endedTick);
        }
        check(`war.${war.id}.intensity`, war.intensity);
        check(`war.${war.id}.recognitionScore`, war.recognitionScore);
    }
    for (const front of state.fronts) {
        check(`front.${front.id}.pressure`, front.pressure);
    }
    for (const cell of state.strategicCells) {
        check(`strategicCell.${cell.id}.sizeKm`, cell.sizeKm);
        check(`strategicCell.${cell.id}.infrastructureScore`, cell.infrastructureScore);
        check(`strategicCell.${cell.id}.population`, cell.population);
    }
    for (const army of state.armies) {
        check(`army.${army.id}.morale`, army.morale);
        check(`army.${army.id}.readiness`, army.readiness);
        check(`army.${army.id}.manpower`, army.manpower);
        check(`army.${army.id}.fuelStock`, army.fuelStock);
        check(`army.${army.id}.foodStock`, army.foodStock);
        check(`army.${army.id}.ammunitionStock`, army.ammunitionStock);
    }
    for (const unit of state.militaryUnits) {
        check(`militaryUnit.${unit.id}.strength`, unit.strength);
        check(`militaryUnit.${unit.id}.mobility`, unit.mobility);
        check(`militaryUnit.${unit.id}.foodNeed`, unit.supplyNeedPerTick.food);
        check(`militaryUnit.${unit.id}.fuelNeed`, unit.supplyNeedPerTick.fuel);
        check(`militaryUnit.${unit.id}.ammunitionNeed`, unit.supplyNeedPerTick.ammunition);
        check(`militaryUnit.${unit.id}.combatPower`, unit.combatPower);
        check(`militaryUnit.${unit.id}.readiness`, unit.readiness);
    }
    for (const supply of state.militarySupplies) {
        check(`militarySupply.${supply.id}.requestedQuantity`, supply.requestedQuantity);
        check(`militarySupply.${supply.id}.deliveredQuantity`, supply.deliveredQuantity);
        check(`militarySupply.${supply.id}.consumedQuantity`, supply.consumedQuantity);
        check(`militarySupply.${supply.id}.shortageQuantity`, supply.shortageQuantity);
    }
    for (const occupation of state.occupations) {
        check(`occupation.${occupation.id}.startedTick`, occupation.startedTick);
        check(`occupation.${occupation.id}.recognition`, occupation.recognition);
        check(`occupation.${occupation.id}.taxCaptureRate`, occupation.taxCaptureRate);
        check(`occupation.${occupation.id}.infrastructureControl`, occupation.infrastructureControl);
    }
    for (const sanction of state.sanctions) {
        check(`sanction.${sanction.id}.severity`, sanction.severity);
        check(`sanction.${sanction.id}.startedTick`, sanction.startedTick);
    }
    for (const blockade of state.blockades) {
        check(`blockade.${blockade.id}.severity`, blockade.severity);
        check(`blockade.${blockade.id}.startedTick`, blockade.startedTick);
    }
    for (const flow of state.refugeeFlows) {
        check(`refugeeFlow.${flow.id}.people`, flow.people);
    }
    for (const damage of state.warDamage) {
        check(`warDamage.${damage.id}.severity`, damage.severity);
        check(`warDamage.${damage.id}.damageMinor`, damage.damageMinor);
    }
    for (const order of state.militaryOrders) {
        check(`militaryOrder.${order.id}.quantity`, order.quantity);
        check(`militaryOrder.${order.id}.fulfilledQuantity`, order.fulfilledQuantity);
        check(`militaryOrder.${order.id}.maxPriceMinor`, order.maxPriceMinor);
    }
    for (const technology of state.technologies) {
        check(`technology.${technology.id}.researchCostMinor`, technology.researchCostMinor);
        check(`technology.${technology.id}.productionEfficiency`, technology.effects.productionEfficiency);
        check(`technology.${technology.id}.inputEfficiency`, technology.effects.inputEfficiency);
        check(`technology.${technology.id}.logisticsEfficiency`, technology.effects.logisticsEfficiency);
        check(`technology.${technology.id}.pollutionReduction`, technology.effects.pollutionReduction);
        check(`technology.${technology.id}.healthBonus`, technology.effects.healthBonus);
        check(`technology.${technology.id}.discoveryBonus`, technology.effects.discoveryBonus);
        check(`technology.${technology.id}.militaryEfficiency`, technology.effects.militaryEfficiency);
        check(`technology.${technology.id}.educationBonus`, technology.effects.educationBonus);
        check(`technology.${technology.id}.energyEfficiency`, technology.effects.energyEfficiency);
    }
    for (const level of state.technologyLevels) {
        check(`technologyLevel.${level.id}.level`, level.level);
        check(`technologyLevel.${level.id}.progress`, level.progress);
        check(`technologyLevel.${level.id}.updatedTick`, level.updatedTick);
    }
    for (const project of state.researchProjects) {
        check(`researchProject.${project.id}.fundingPerTickMinor`, project.fundingPerTickMinor);
        check(`researchProject.${project.id}.accumulatedResearch`, project.accumulatedResearch);
        check(`researchProject.${project.id}.requiredResearch`, project.requiredResearch);
        check(`researchProject.${project.id}.startedTick`, project.startedTick);
        if (project.completedTick !== null) {
            check(`researchProject.${project.id}.completedTick`, project.completedTick);
        }
    }
    for (const patent of state.patents) {
        check(`patent.${patent.id}.filedTick`, patent.filedTick);
        if (patent.expiresTick !== null) {
            check(`patent.${patent.id}.expiresTick`, patent.expiresTick);
        }
    }
    for (const agreement of state.licenseAgreements) {
        check(`licenseAgreement.${agreement.id}.royaltyRate`, agreement.royaltyRate);
        check(`licenseAgreement.${agreement.id}.upfrontFeeMinor`, agreement.upfrontFeeMinor);
        check(`licenseAgreement.${agreement.id}.startedTick`, agreement.startedTick);
        if (agreement.expiresTick !== null) {
            check(`licenseAgreement.${agreement.id}.expiresTick`, agreement.expiresTick);
        }
    }
    for (const record of state.pollution) {
        check(`pollution.${record.id}.amount`, record.amount);
        check(`pollution.${record.id}.tick`, record.tick);
    }
    for (const index of state.environmentalIndexes) {
        check(`environmentalIndex.${index.id}.airQuality`, index.airQuality);
        check(`environmentalIndex.${index.id}.waterQuality`, index.waterQuality);
        check(`environmentalIndex.${index.id}.soilQuality`, index.soilQuality);
        check(`environmentalIndex.${index.id}.carbonIntensity`, index.carbonIntensity);
        check(`environmentalIndex.${index.id}.biodiversity`, index.biodiversity);
        check(`environmentalIndex.${index.id}.healthImpact`, index.healthImpact);
        check(`environmentalIndex.${index.id}.migrationPressure`, index.migrationPressure);
    }
    for (const deposit of state.resourceDeposits) {
        check(`resourceDeposit.${deposit.id}.quantity`, deposit.quantity);
        check(`resourceDeposit.${deposit.id}.initialQuantity`, deposit.initialQuantity);
        check(`resourceDeposit.${deposit.id}.extractionPerTick`, deposit.extractionPerTick);
        check(`resourceDeposit.${deposit.id}.discoveryChance`, deposit.discoveryChance);
        check(`resourceDeposit.${deposit.id}.quality`, deposit.quality);
    }
    for (const discovery of state.resourceDiscoveries) {
        check(`resourceDiscovery.${discovery.id}.tick`, discovery.tick);
        check(`resourceDiscovery.${discovery.id}.quantity`, discovery.quantity);
    }
    for (const policy of state.cleanEnergyPolicies) {
        check(`cleanEnergyPolicy.${policy.id}.subsidyMinorPerTick`, policy.subsidyMinorPerTick);
        check(`cleanEnergyPolicy.${policy.id}.pollutionReduction`, policy.pollutionReduction);
        if (policy.enactedTick !== null) {
            check(`cleanEnergyPolicy.${policy.id}.enactedTick`, policy.enactedTick);
        }
    }
    for (const market of state.blackMarkets) {
        check(`blackMarket.${market.id}.demandQuantity`, market.demandQuantity);
        check(`blackMarket.${market.id}.supplyQuantity`, market.supplyQuantity);
        check(`blackMarket.${market.id}.priceMultiplier`, market.priceMultiplier);
        check(`blackMarket.${market.id}.riskLevel`, market.riskLevel);
        check(`blackMarket.${market.id}.corruptionInfluence`, market.corruptionInfluence);
    }
    for (const illegalTrade of state.illegalTrades) {
        check(`illegalTrade.${illegalTrade.id}.quantity`, illegalTrade.quantity);
        check(`illegalTrade.${illegalTrade.id}.priceMinor`, illegalTrade.priceMinor);
        check(`illegalTrade.${illegalTrade.id}.bribeMinor`, illegalTrade.bribeMinor);
        check(`illegalTrade.${illegalTrade.id}.detectionRisk`, illegalTrade.detectionRisk);
    }
    for (const route of state.smugglingRoutes) {
        check(`smugglingRoute.${route.id}.capacityPerTick`, route.capacityPerTick);
        check(`smugglingRoute.${route.id}.costMinorPerUnit`, route.costMinorPerUnit);
        check(`smugglingRoute.${route.id}.baseDetectionRisk`, route.baseDetectionRisk);
        check(`smugglingRoute.${route.id}.corruptionShield`, route.corruptionShield);
    }
    for (const agency of state.enforcementAgencies) {
        check(`enforcementAgency.${agency.id}.controlScore`, agency.controlScore);
        check(`enforcementAgency.${agency.id}.capacityPerTick`, agency.capacityPerTick);
        check(`enforcementAgency.${agency.id}.corruptionResistance`, agency.corruptionResistance);
        check(`enforcementAgency.${agency.id}.mediaSensitivity`, agency.mediaSensitivity);
        check(`enforcementAgency.${agency.id}.budgetMinor`, agency.budgetMinor);
    }
    for (const investigation of state.investigations) {
        check(`investigation.${investigation.id}.suspicion`, investigation.suspicion);
        check(`investigation.${investigation.id}.detectionChance`, investigation.detectionChance);
    }
    for (const fine of state.fines) {
        check(`fine.${fine.id}.amountMinor`, fine.amountMinor);
    }
    for (const confiscation of state.confiscations) {
        check(`confiscation.${confiscation.id}.quantity`, confiscation.quantity);
        check(`confiscation.${confiscation.id}.valueMinor`, confiscation.valueMinor);
    }
    for (const penalty of state.reputationPenalties) {
        check(`reputationPenalty.${penalty.id}.amount`, penalty.amount);
    }
    for (const contract of state.illegalContracts) {
        check(`illegalContract.${contract.id}.quantity`, contract.quantity);
        check(`illegalContract.${contract.id}.priceMinor`, contract.priceMinor);
        check(`illegalContract.${contract.id}.riskLevel`, contract.riskLevel);
    }
    for (const cohort of state.populationCohorts) {
        check(`cohort.${cohort.id}.size`, cohort.size);
        check(`cohort.${cohort.id}.cashBalanceMinor`, cohort.cashBalanceMinor);
        check(`cohort.${cohort.id}.satisfaction`, cohort.satisfaction);
    }
    for (const lot of state.inventoryLots) {
        check(`inventory.${lot.id}.quantity`, lot.quantity);
        check(`inventory.${lot.id}.quality`, lot.quality);
        check(`inventory.${lot.id}.unitCostMinor`, lot.unitCostMinor ?? 0);
        check(`inventory.${lot.id}.totalCostMinor`, lot.totalCostMinor ?? 0);
    }
    for (const warehouse of state.warehouses) {
        check(`warehouse.${warehouse.id}.capacity`, warehouse.capacity);
        check(`warehouse.${warehouse.id}.handlingCostMinorPerUnit`, warehouse.handlingCostMinorPerUnit);
    }
    for (const offer of state.retailOffers) {
        check(`retailOffer.${offer.id}.priceMinor`, offer.priceMinor);
        check(`retailOffer.${offer.id}.quality`, offer.quality);
    }
    for (const change of state.retailPriceChanges) {
        check(`retailPriceChange.${change.id}.tick`, change.tick);
        check(`retailPriceChange.${change.id}.oldPriceMinor`, change.oldPriceMinor);
        check(`retailPriceChange.${change.id}.newPriceMinor`, change.newPriceMinor);
    }
    for (const offer of state.resourceOffers) {
        check(`resourceOffer.${offer.id}.unitPriceMinor`, offer.unitPriceMinor);
        check(`resourceOffer.${offer.id}.quality`, offer.quality);
        check(`resourceOffer.${offer.id}.maxQuantityPerTick`, offer.maxQuantityPerTick);
    }
    for (const purchase of state.resourcePurchases) {
        check(`resourcePurchase.${purchase.id}.tick`, purchase.tick);
        check(`resourcePurchase.${purchase.id}.quantity`, purchase.quantity);
        check(`resourcePurchase.${purchase.id}.unitPriceMinor`, purchase.unitPriceMinor);
        check(`resourcePurchase.${purchase.id}.totalPriceMinor`, purchase.totalPriceMinor);
        check(`resourcePurchase.${purchase.id}.goodsCostMinor`, purchase.goodsCostMinor);
        check(`resourcePurchase.${purchase.id}.logisticsCostMinor`, purchase.logisticsCostMinor);
        check(`resourcePurchase.${purchase.id}.quality`, purchase.quality);
    }
    for (const run of state.manualProductionRuns) {
        check(`manualProductionRun.${run.id}.tick`, run.tick);
        check(`manualProductionRun.${run.id}.requestedQuantity`, run.requestedQuantity);
        check(`manualProductionRun.${run.id}.producedQuantity`, run.producedQuantity);
        check(`manualProductionRun.${run.id}.inputCostMinor`, run.inputCostMinor ?? 0);
        check(`manualProductionRun.${run.id}.outputUnitCostMinor`, run.outputUnitCostMinor ?? 0);
        check(`manualProductionRun.${run.id}.outputTotalCostMinor`, run.outputTotalCostMinor ?? 0);
        for (const input of run.inputConsumptions) {
            check(`manualProductionRun.${run.id}.${input.productId}.quantity`, input.quantity);
            check(`manualProductionRun.${run.id}.${input.productId}.unitCostMinor`, input.unitCostMinor ?? 0);
            check(`manualProductionRun.${run.id}.${input.productId}.totalCostMinor`, input.totalCostMinor ?? 0);
        }
    }
    for (const shipment of state.shipments) {
        check(`shipment.${shipment.id}.quantity`, shipment.quantity);
        check(`shipment.${shipment.id}.costMinor`, shipment.costMinor);
        check(`shipment.${shipment.id}.durationTicks`, shipment.durationTicks);
        check(`shipment.${shipment.id}.remainingTicks`, shipment.remainingTicks);
        check(`shipment.${shipment.id}.risk`, shipment.risk);
    }
    for (const transportCompany of state.transportCompanies) {
        check(`transportCompany.${transportCompany.id}.reliability`, transportCompany.reliability);
        check(`transportCompany.${transportCompany.id}.capacityPerTick`, transportCompany.capacityPerTick);
        check(`transportCompany.${transportCompany.id}.costMultiplier`, transportCompany.costMultiplier);
        check(`transportCompany.${transportCompany.id}.cashBalanceMinor`, transportCompany.cashBalanceMinor);
    }
    for (const link of state.infrastructureLinks) {
        check(`infrastructureLink.${link.id}.distanceKm`, link.distanceKm);
        check(`infrastructureLink.${link.id}.quality`, link.quality);
        check(`infrastructureLink.${link.id}.capacityPerTick`, link.capacityPerTick);
        check(`infrastructureLink.${link.id}.baseCostMinorPerUnit`, link.baseCostMinorPerUnit);
        check(`infrastructureLink.${link.id}.baseDurationTicks`, link.baseDurationTicks);
        check(`infrastructureLink.${link.id}.warDisruptionRisk`, link.warDisruptionRisk);
    }
    for (const demand of state.demandRecords) {
        check(`demand.${demand.id}.desiredQuantity`, demand.desiredQuantity);
        check(`demand.${demand.id}.purchasedQuantity`, demand.purchasedQuantity);
        check(`demand.${demand.id}.unmetQuantity`, demand.unmetQuantity);
        check(`demand.${demand.id}.spendingMinor`, demand.spendingMinor);
        check(`demand.${demand.id}.averagePriceMinor`, demand.averagePriceMinor);
    }
    for (const metric of state.metrics) {
        check(`metric.${metric.id}.value`, metric.value);
    }
    for (const cause of state.eventCauses) {
        check(`eventCause.${cause.id}.tick`, cause.tick);
        check(`eventCause.${cause.id}.weight`, cause.weight);
    }
    for (const impact of state.eventImpacts) {
        check(`eventImpact.${impact.id}.tick`, impact.tick);
        if (impact.beforeValue !== null) {
            check(`eventImpact.${impact.id}.beforeValue`, impact.beforeValue);
        }
        if (impact.afterValue !== null) {
            check(`eventImpact.${impact.id}.afterValue`, impact.afterValue);
        }
        if (!Number.isFinite(impact.delta) || Number.isNaN(impact.delta)) {
            invalids.push(`eventImpact.${impact.id}.delta=${impact.delta}`);
        }
        check(`eventImpact.${impact.id}.severity`, impact.severity);
    }
    for (const change of state.metricChanges) {
        check(`metricChange.${change.id}.tick`, change.tick);
        check(`metricChange.${change.id}.previousValue`, change.previousValue);
        check(`metricChange.${change.id}.currentValue`, change.currentValue);
        if (!Number.isFinite(change.delta) || Number.isNaN(change.delta)) {
            invalids.push(`metricChange.${change.id}.delta=${change.delta}`);
        }
        if (!Number.isFinite(change.percentChange) || Number.isNaN(change.percentChange)) {
            invalids.push(`metricChange.${change.id}.percentChange=${change.percentChange}`);
        }
    }
    for (const explanation of state.explanations) {
        check(`explanation.${explanation.id}.tick`, explanation.tick);
        check(`explanation.${explanation.id}.confidence`, explanation.confidence);
        for (const cause of explanation.causes) {
            check(`explanation.${explanation.id}.${cause.label}.value`, cause.value);
            check(`explanation.${explanation.id}.${cause.label}.weight`, cause.weight);
        }
    }
    for (const forecast of state.forecasts) {
        check(`forecast.${forecast.id}.tick`, forecast.tick);
        check(`forecast.${forecast.id}.currentValue`, forecast.currentValue);
        check(`forecast.${forecast.id}.predictedValue`, forecast.predictedValue);
        check(`forecast.${forecast.id}.horizonTicks`, forecast.horizonTicks);
        check(`forecast.${forecast.id}.confidence`, forecast.confidence);
    }
    for (const statistic of state.publicStatistics) {
        check(`publicStatistic.${statistic.id}.tick`, statistic.tick);
        check(`publicStatistic.${statistic.id}.value`, statistic.value);
    }
    for (const statistic of state.hiddenStatistics) {
        check(`hiddenStatistic.${statistic.id}.tick`, statistic.tick);
        check(`hiddenStatistic.${statistic.id}.value`, statistic.value);
    }
    for (const reliability of state.dataReliability) {
        check(`dataReliability.${reliability.id}.score`, reliability.score);
        check(`dataReliability.${reliability.id}.manipulationRisk`, reliability.manipulationRisk);
        check(`dataReliability.${reliability.id}.updatedTick`, reliability.updatedTick);
    }
    for (const transaction of state.financialTransactions) {
        for (const entry of transaction.entries) {
            if (!Number.isFinite(entry.amountMinor) || Number.isNaN(entry.amountMinor)) {
                invalids.push(`financial.${transaction.id}.${entry.ownerId}.amountMinor=${entry.amountMinor}`);
            }
        }
    }
    if (invalids.length > 0) {
        throw new Error(`Tick produced invalid economy values: ${invalids.join(", ")}`);
    }
}
function sanitizeQuantity(value) {
    if (!Number.isFinite(value) || Number.isNaN(value) || value <= 0) {
        return 0;
    }
    return Math.floor(value);
}
function sanitizeMoney(value) {
    if (!Number.isFinite(value) || Number.isNaN(value) || value <= 0) {
        return 0;
    }
    return Math.floor(value);
}
function sanitizeNonNegativeNumber(value) {
    if (!Number.isFinite(value) || Number.isNaN(value) || value <= 0) {
        return 0;
    }
    return value;
}
function deterministicFraction(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4_294_967_295;
}
function slugify(value) {
    const slug = value
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug.length > 0 ? slug : "item";
}
function normalizeOrder(order) {
    const quantity = sanitizeQuantity(order.quantity);
    const remainingQuantity = Math.min(quantity, sanitizeQuantity(order.remainingQuantity));
    return {
        ...order,
        priceMinor: sanitizeMoney(order.priceMinor),
        quantity,
        remainingQuantity,
        status: remainingQuantity <= 0 && order.status !== "cancelled" && order.status !== "rejected" ? "filled" : order.status,
        createdTick: sanitizeQuantity(order.createdTick)
    };
}
function clamp(value, min, max) {
    if (!Number.isFinite(value) || Number.isNaN(value)) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
}
function average(values) {
    if (values.length === 0) {
        return 0;
    }
    return values.reduce((total, value) => total + value, 0) / values.length;
}
//# sourceMappingURL=index.js.map