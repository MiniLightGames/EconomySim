"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const domain_1 = require("@economysim/domain");
const simulation_core_1 = require("@economysim/simulation-core");
const market_1 = require("./market");
const errors_1 = require("./errors");
const schemas_1 = require("./schemas");
const store_1 = require("./store");
const validation_1 = require("./validation");
async function registerRoutes(app, dependencies) {
    const { store, seed } = dependencies;
    app.get("/health", async () => {
        const storeHealth = await store.health();
        return {
            status: "ok",
            service: "economysim-api",
            store: storeHealth,
            checks: {
                api: "up",
                database: storeHealth.kind === "prisma" ? storeHealth.status : "not-required-memory-store"
            }
        };
    });
    app.get("/world", async () => toPublicWorldState(await store.loadWorld()));
    app.get("/world/summary", async () => {
        const state = await store.loadWorld();
        return {
            ...(0, domain_1.summarizeWorld)(state),
            invariants: domain_1.ECONOMY_INVARIANTS,
            lastEvent: state.events.at(-1) ?? null,
            lastNews: state.news.at(-1) ?? null
        };
    });
    app.get("/countries", async () => {
        const state = await store.loadWorld();
        return state.countries;
    });
    app.get("/countries/:id", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const country = state.countries.find((candidate) => candidate.id === id);
        if (!country) {
            throw (0, errors_1.notFound)("COUNTRY_NOT_FOUND", "Country not found.", { id });
        }
        return country;
    });
    app.get("/governments", async () => {
        const state = await store.loadWorld();
        return {
            governments: state.governments,
            parties: state.politicalParties,
            elections: state.elections,
            laws: state.laws,
            protests: state.protests
        };
    });
    app.get("/countries/:id/government", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const government = state.governments.find((candidate) => candidate.countryId === id);
        if (!government) {
            throw (0, errors_1.notFound)("GOVERNMENT_NOT_FOUND", "Government not found for country.", { countryId: id });
        }
        return {
            government,
            parties: state.politicalParties.filter((party) => party.countryId === id),
            election: state.elections.find((election) => election.countryId === id && election.status === "active") ?? null,
            corruption: state.corruptionIndexes.find((index) => index.countryId === id) ?? null
        };
    });
    app.get("/countries/:id/laws", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const country = state.countries.find((candidate) => candidate.id === id);
        if (!country) {
            throw (0, errors_1.notFound)("COUNTRY_NOT_FOUND", "Country not found.", { id });
        }
        return state.laws.filter((law) => law.countryId === id);
    });
    app.get("/countries/:id/budget", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const country = state.countries.find((candidate) => candidate.id === id);
        if (!country) {
            throw (0, errors_1.notFound)("COUNTRY_NOT_FOUND", "Country not found.", { id });
        }
        return {
            budget: state.governmentBudgets
                .filter((budget) => budget.countryId === id)
                .sort((left, right) => right.tick - left.tick)[0] ?? null,
            history: state.governmentBudgets.filter((budget) => budget.countryId === id),
            debt: state.publicDebt.find((debt) => debt.countryId === id) ?? null,
            taxPolicy: state.taxPolicies.find((policy) => policy.countryId === id) ?? null,
            subsidies: state.subsidies.filter((subsidy) => subsidy.countryId === id)
        };
    });
    app.get("/cities/:id", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const city = state.cities.find((candidate) => candidate.id === id);
        if (!city) {
            throw (0, errors_1.notFound)("CITY_NOT_FOUND", "City not found.", { id });
        }
        return city;
    });
    app.get("/companies", async () => {
        const state = await store.loadWorld();
        return state.companies.map((company) => toPublicCompany(company, state));
    });
    app.get("/companies/:id", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const company = state.companies.find((candidate) => candidate.id === id);
        if (!company) {
            throw (0, errors_1.notFound)("COMPANY_NOT_FOUND", "Company not found.", { id });
        }
        return toPublicCompany(company, state);
    });
    app.post("/companies", async (request, reply) => {
        const body = schemas_1.createCompanyBodySchema.parse(request.body);
        const state = await store.loadWorld();
        const result = (0, store_1.addCompanyToWorld)(state, body);
        await store.saveWorld(result.state);
        return reply.status(201).send(result.company);
    });
    app.get("/markets", async () => {
        const state = await store.loadWorld();
        return (0, market_1.buildMarkets)(state);
    });
    app.get("/markets/:id", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const markets = (0, market_1.buildMarkets)(state);
        const market = markets.find((candidate) => candidate.id === id || candidate.productIds.includes(id));
        if (!market) {
            throw (0, errors_1.notFound)("MARKET_NOT_FOUND", "Market not found.", { id });
        }
        return market;
    });
    app.get("/retail/offers", async () => {
        const state = await store.loadWorld();
        return state.retailOffers.map((offer) => toRetailOfferDto(offer, state));
    });
    app.get("/retail/price-changes", async () => {
        const state = await store.loadWorld();
        return state.retailPriceChanges ?? [];
    });
    app.post("/retail/offers/:id/price", async (request, reply) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const body = schemas_1.retailPriceBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.setRetailOfferPrice)(state, {
                ...body,
                retailOfferId: id
            }, seed);
            await store.saveWorld(result.state);
            return reply.status(200).send({
                offer: toRetailOfferDto(result.retailOffer, result.state),
                priceChange: result.priceChange
            });
        }
        catch (error) {
            throw mapOperationsError(error);
        }
    });
    app.get("/resources/offers", async () => {
        const state = await store.loadWorld();
        return (state.resourceOffers ?? []).map((offer) => {
            const company = state.companies.find((candidate) => candidate.id === offer.companyId);
            const product = state.products.find((candidate) => candidate.id === offer.productId);
            const warehouse = state.warehouses.find((candidate) => candidate.id === offer.warehouseId);
            const availableQuantity = state.inventoryLots
                .filter((lot) => lot.warehouseId === offer.warehouseId && lot.productId === offer.productId)
                .reduce((total, lot) => total + lot.quantity, 0);
            return {
                ...offer,
                companyName: company?.name ?? offer.companyId,
                productName: product?.name ?? offer.productId,
                warehouseName: warehouse?.name ?? offer.warehouseId,
                cityId: warehouse?.cityId ?? null,
                availableQuantity
            };
        });
    });
    app.get("/resources/purchases", async () => {
        const state = await store.loadWorld();
        return state.resourcePurchases ?? [];
    });
    app.post("/resources/purchase", async (request, reply) => {
        const body = schemas_1.resourcePurchaseBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.buyResource)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send(result.purchase);
        }
        catch (error) {
            throw mapOperationsError(error);
        }
    });
    app.get("/production/plans", async () => {
        const state = await store.loadWorld();
        return state.productionPlans;
    });
    app.get("/production/runs", async () => {
        const state = await store.loadWorld();
        return state.manualProductionRuns ?? [];
    });
    app.post("/production/run", async (request, reply) => {
        const body = schemas_1.manualProductionBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.runManualProduction)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send(result.productionRun);
        }
        catch (error) {
            throw mapOperationsError(error);
        }
    });
    app.get("/warehouses", async () => {
        const state = await store.loadWorld();
        return state.warehouses;
    });
    app.get("/shipments", async () => {
        const state = await store.loadWorld();
        return state.shipments;
    });
    app.post("/shipments", async (request, reply) => {
        const body = schemas_1.createShipmentBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.createShipment)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send({
                shipment: result.shipment,
                quote: result.quote
            });
        }
        catch (error) {
            throw mapShipmentError(error);
        }
    });
    app.get("/logistics/routes", async () => {
        const state = await store.loadWorld();
        return state.logisticsRoutes;
    });
    app.get("/transport-companies", async () => {
        const state = await store.loadWorld();
        return state.transportCompanies;
    });
    app.get("/technologies", async () => {
        const state = await store.loadWorld();
        return {
            technologies: state.technologies,
            levels: state.technologyLevels,
            patents: state.patents,
            licenses: state.licenseAgreements,
            cleanEnergyPolicies: state.cleanEnergyPolicies
        };
    });
    app.post("/research-projects", async (request, reply) => {
        const body = schemas_1.researchProjectBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.startResearchProject)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send(result.project);
        }
        catch (error) {
            throw mapResearchError(error);
        }
    });
    app.get("/research-projects", async () => {
        const state = await store.loadWorld();
        return state.researchProjects;
    });
    app.get("/environment", async () => {
        const state = await store.loadWorld();
        return {
            pollution: state.pollution,
            indexes: state.environmentalIndexes,
            cleanEnergyPolicies: state.cleanEnergyPolicies
        };
    });
    app.get("/resources/deposits", async () => {
        const state = await store.loadWorld();
        return {
            deposits: state.resourceDeposits,
            discoveries: state.resourceDiscoveries
        };
    });
    app.get("/wars", async () => {
        const state = await store.loadWorld();
        return {
            wars: state.wars,
            fronts: state.fronts,
            armies: state.armies,
            militaryUnits: state.militaryUnits,
            occupations: state.occupations,
            refugeeFlows: state.refugeeFlows,
            warDamage: state.warDamage
        };
    });
    app.get("/wars/:id", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const war = state.wars.find((candidate) => candidate.id === id);
        if (!war) {
            throw (0, errors_1.notFound)("WAR_NOT_FOUND", "War not found.", { id });
        }
        return {
            war,
            fronts: state.fronts.filter((front) => front.warId === war.id),
            armies: state.armies.filter((army) => army.warId === war.id),
            militaryUnits: state.militaryUnits.filter((unit) => state.armies.some((army) => army.warId === war.id && army.id === unit.armyId)),
            supplies: state.militarySupplies.filter((supply) => state.armies.some((army) => army.warId === war.id && army.id === supply.armyId)),
            occupations: state.occupations.filter((occupation) => occupation.warId === war.id),
            blockades: state.blockades.filter((blockade) => blockade.warId === war.id),
            refugeeFlows: state.refugeeFlows.filter((flow) => flow.warId === war.id),
            warDamage: state.warDamage.filter((damage) => damage.warId === war.id),
            militaryOrders: state.militaryOrders.filter((order) => order.warId === war.id)
        };
    });
    app.get("/strategic-cells", async () => {
        const state = await store.loadWorld();
        return state.strategicCells;
    });
    app.get("/sanctions", async () => {
        const state = await store.loadWorld();
        return {
            sanctions: state.sanctions,
            policies: state.sanctionPolicies
        };
    });
    app.get("/military-orders", async () => {
        const state = await store.loadWorld();
        return state.militaryOrders;
    });
    app.get("/banks", async () => {
        const state = await store.loadWorld();
        return {
            centralBanks: state.centralBanks,
            commercialBanks: state.banks
        };
    });
    app.get("/accounts", async () => {
        const state = await store.loadWorld();
        return state.bankAccounts.map((account) => toPublicBankAccount(account, state));
    });
    app.post("/loans/apply", async (request, reply) => {
        const body = schemas_1.loanApplicationBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.applyForLoan)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send({
                loan: result.loan,
                account: result.account
            });
        }
        catch (error) {
            throw mapFinanceError(error);
        }
    });
    app.get("/loans", async () => {
        const state = await store.loadWorld();
        return state.loans;
    });
    app.post("/loans/:id/pay", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const body = schemas_1.loanPaymentBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.payLoan)(state, { loanId: id, amountMinor: body.amountMinor }, seed);
            await store.saveWorld(result.state);
            return {
                loan: result.loan,
                paidPrincipalMinor: result.paidPrincipalMinor,
                paidInterestMinor: result.paidInterestMinor
            };
        }
        catch (error) {
            throw mapFinanceError(error);
        }
    });
    app.get("/exchanges", async () => {
        const state = await store.loadWorld();
        return {
            exchanges: state.exchanges,
            orderBooks: state.orderBooks,
            trades: state.trades
        };
    });
    app.post("/orders", async (request, reply) => {
        const body = schemas_1.createOrderBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.placeOrder)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send({
                order: result.order,
                trades: result.trades
            });
        }
        catch (error) {
            throw mapFinanceError(error);
        }
    });
    app.get("/portfolio", async (request) => {
        const query = schemas_1.portfolioQuerySchema.parse(request.query);
        const state = await store.loadWorld();
        return {
            ownerType: query.ownerType,
            ownerId: query.ownerId,
            accounts: state.bankAccounts.filter((account) => account.ownerType === query.ownerType && account.ownerId === query.ownerId),
            positions: state.portfolioPositions.filter((position) => position.ownerType === query.ownerType && position.ownerId === query.ownerId),
            openOrders: state.orderBooks.flatMap((book) => [...book.bids, ...book.asks].filter((order) => order.ownerType === query.ownerType && order.ownerId === query.ownerId && order.status !== "filled" && order.status !== "cancelled")),
            trades: state.trades.filter((trade) => (trade.buyerOwnerType === query.ownerType && trade.buyerOwnerId === query.ownerId) ||
                (trade.sellerOwnerType === query.ownerType && trade.sellerOwnerId === query.ownerId))
        };
    });
    app.get("/bankruptcies", async () => {
        const state = await store.loadWorld();
        return {
            cases: state.bankruptcies,
            auctions: state.assetAuctions
        };
    });
    app.get("/black-markets", async () => {
        const state = await store.loadWorld();
        return {
            markets: state.blackMarkets,
            routes: state.smugglingRoutes,
            illegalTrades: state.illegalTrades
        };
    });
    app.post("/illegal-trades", async (request, reply) => {
        const body = schemas_1.illegalTradeBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.createIllegalTrade)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send(result.illegalTrade);
        }
        catch (error) {
            throw mapCrimeError(error);
        }
    });
    app.get("/investigations", async () => {
        const state = await store.loadWorld();
        return {
            investigations: state.investigations,
            corruptionCases: state.corruptionCases,
            enforcementAgencies: state.enforcementAgencies,
            fines: state.fines,
            confiscations: state.confiscations
        };
    });
    app.get("/reputation", async () => {
        const state = await store.loadWorld();
        return {
            companies: state.companies.map((company) => ({
                id: company.id,
                name: company.name,
                reputation: company.reputation,
                legalStatus: company.legalStatus,
                penaltyCount: state.reputationPenalties.filter((penalty) => penalty.targetType === "company" && penalty.targetId === company.id).length,
                finesMinor: state.fines
                    .filter((fine) => fine.targetType === "company" && fine.targetId === company.id)
                    .reduce((total, fine) => total + fine.amountMinor, 0)
            })),
            penalties: state.reputationPenalties
        };
    });
    app.get("/analytics/countries/:id", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const country = state.countries.find((candidate) => candidate.id === id);
        if (!country) {
            throw (0, errors_1.notFound)("COUNTRY_NOT_FOUND", "Country not found.", { id });
        }
        const publicStatistics = state.publicStatistics.filter((statistic) => statistic.countryId === id);
        const forecasts = state.forecasts.filter((forecast) => (forecast.targetType === "country" || forecast.targetType === "logistics") && forecast.targetId === id);
        return {
            country,
            reliability: state.dataReliability.filter((reliability) => reliability.countryId === id),
            publicStatistics,
            inflation: latestPublicStatistic(publicStatistics, "inflation.rate"),
            unemployment: latestPublicStatistic(publicStatistics, "unemployment.rate"),
            industryProfits: publicStatistics.filter((statistic) => statistic.metricName.startsWith("industry.profit.")),
            logisticsRisks: publicStatistics.filter((statistic) => statistic.metricName === "logistics.risk"),
            priceSeries: buildCountryPriceSeries(state, id),
            forecasts,
            explanations: state.explanations.filter((explanation) => explanation.relatedEntityIds.includes(id)),
            privacy: {
                privateCompanyFinanceHidden: true,
                publicCompaniesDisclose: true,
                hiddenStatisticsIncluded: false
            }
        };
    });
    app.get("/analytics/products/:id", async (request) => {
        const { id } = schemas_1.idParamsSchema.parse(request.params);
        const state = await store.loadWorld();
        const product = state.products.find((candidate) => candidate.id === id);
        if (!product) {
            throw (0, errors_1.notFound)("PRODUCT_NOT_FOUND", "Product not found.", { id });
        }
        return {
            product,
            priceSeries: buildProductPriceSeries(state, product),
            explanations: state.explanations.filter((explanation) => explanation.targetId === product.id || explanation.relatedEntityIds.includes(product.id)),
            forecasts: state.forecasts.filter((forecast) => forecast.targetType === "product" && forecast.targetId === product.id),
            reliability: state.dataReliability
        };
    });
    app.get("/explanations", async () => {
        const state = await store.loadWorld();
        return state.explanations;
    });
    app.get("/forecasts", async () => {
        const state = await store.loadWorld();
        return state.forecasts;
    });
    app.post("/lobbying", async (request, reply) => {
        const body = schemas_1.lobbyingBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.fundLobbying)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send(result.action);
        }
        catch (error) {
            throw mapGovernmentError(error);
        }
    });
    app.post("/media-campaigns", async (request, reply) => {
        const body = schemas_1.mediaCampaignBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.runMediaCampaign)(state, body, seed);
            await store.saveWorld(result.state);
            return reply.status(201).send(result.influence);
        }
        catch (error) {
            throw mapGovernmentError(error);
        }
    });
    app.post("/vote", async (request) => {
        const body = schemas_1.voteBodySchema.parse(request.body);
        const state = await store.loadWorld();
        try {
            const result = (0, simulation_core_1.castVote)(state, body, seed);
            await store.saveWorld(result.state);
            return result.election;
        }
        catch (error) {
            throw mapGovernmentError(error);
        }
    });
    app.post("/simulation/tick", async (request) => {
        const body = schemas_1.simulationTickBodySchema.parse(request.body ?? {});
        const state = await store.loadWorld();
        (0, validation_1.validatePlayerCommandsAgainstWorld)(state, body.commands);
        const result = (0, simulation_core_1.runTick)({
            state,
            commands: body.commands,
            seed
        });
        if (result.rejectedCommands.length > 0) {
            throw (0, errors_1.badRequest)("COMMAND_REJECTED", "One or more commands were rejected by simulation validation.", {
                rejectedCommands: result.rejectedCommands
            });
        }
        await store.saveWorld(result.state);
        return {
            summary: (0, domain_1.summarizeWorld)(result.state),
            acceptedCommands: result.acceptedCommands,
            events: result.events,
            metrics: result.metrics,
            news: result.state.news.filter((item) => item.tick === result.state.currentTick)
        };
    });
    app.get("/news", async () => {
        const state = await store.loadWorld();
        return state.news;
    });
    app.get("/metrics", async () => {
        const state = await store.loadWorld();
        return state.metrics;
    });
}
function toPublicWorldState(state) {
    return {
        ...state,
        companies: state.companies.map((company) => toPublicCompany(company, state)),
        hiddenStatistics: []
    };
}
function toPublicCompany(company, state) {
    if (company.ownerType === "player" || company.ownerType === "state" || isPublicCompany(company, state)) {
        return company;
    }
    return {
        ...company,
        cashBalanceMinor: 0
    };
}
function isPublicCompany(company, state) {
    return state.stocks.some((stock) => stock.companyId === company.id);
}
function toRetailOfferDto(offer, state) {
    const company = state.companies.find((candidate) => candidate.id === offer.companyId);
    const product = state.products.find((candidate) => candidate.id === offer.productId);
    const warehouse = state.warehouses.find((candidate) => candidate.id === offer.warehouseId);
    const availableQuantity = state.inventoryLots
        .filter((lot) => lot.warehouseId === offer.warehouseId && lot.productId === offer.productId)
        .reduce((total, lot) => total + lot.quantity, 0);
    return {
        ...offer,
        companyName: company?.name ?? offer.companyId,
        productName: product?.name ?? offer.productId,
        warehouseName: warehouse?.name ?? offer.warehouseId,
        cityId: warehouse?.cityId ?? null,
        currencyCode: company?.currencyCode ?? "ECO",
        availableQuantity
    };
}
function toPublicBankAccount(account, state) {
    if (account.ownerType === "company") {
        const company = state.companies.find((candidate) => candidate.id === account.ownerId);
        if (company && (company.ownerType === "player" || company.ownerType === "state" || isPublicCompany(company, state))) {
            return account;
        }
        return {
            ...account,
            balanceMinor: 0,
            reservedMinor: 0
        };
    }
    if (account.ownerType === "population_cohort") {
        return {
            ...account,
            balanceMinor: 0,
            reservedMinor: 0
        };
    }
    return account;
}
function latestPublicStatistic(statistics, metricName) {
    return (statistics
        .filter((statistic) => statistic.metricName === metricName)
        .sort((left, right) => right.tick - left.tick)[0] ?? null);
}
function buildCountryPriceSeries(state, countryId) {
    const cityIds = new Set(state.cities.filter((city) => city.countryId === countryId).map((city) => city.id));
    return aggregateDemandPriceSeries(state.demandRecords.filter((record) => cityIds.has(record.cityId)));
}
function buildProductPriceSeries(state, product) {
    return aggregateDemandPriceSeries(state.demandRecords.filter((record) => record.needCategory === product.needCategory));
}
function aggregateDemandPriceSeries(records) {
    const byTick = new Map();
    for (const record of records) {
        if (record.purchasedQuantity <= 0) {
            continue;
        }
        const current = byTick.get(record.tick) ?? { spendingMinor: 0, purchasedQuantity: 0 };
        current.spendingMinor += record.spendingMinor;
        current.purchasedQuantity += record.purchasedQuantity;
        byTick.set(record.tick, current);
    }
    return [...byTick.entries()]
        .sort((left, right) => left[0] - right[0])
        .map(([tick, value]) => ({
        tick,
        averagePriceMinor: value.purchasedQuantity > 0 ? Math.round(value.spendingMinor / value.purchasedQuantity) : 0,
        purchasedQuantity: value.purchasedQuantity
    }));
}
function mapOperationsError(error) {
    const message = error instanceof Error ? error.message : "OPERATIONS_COMMAND_REJECTED";
    const [rawCode, detail] = message.split(":", 2);
    const code = rawCode ?? "OPERATIONS_COMMAND_REJECTED";
    const knownBadRequestCodes = new Set([
        "UNKNOWN_OR_INACTIVE_RESOURCE_OFFER",
        "INVALID_RESOURCE_PURCHASE",
        "RESOURCE_PRICE_EXCEEDS_LIMIT",
        "RESOURCE_QUANTITY_EXCEEDS_OFFER_LIMIT",
        "UNKNOWN_PRODUCT",
        "UNKNOWN_OR_INACTIVE_RESOURCE_SELLER",
        "PLAYER_COMPANY_REQUIRED",
        "BUYER_WAREHOUSE_REQUIRED",
        "CURRENCY_MISMATCH",
        "INSUFFICIENT_RESOURCE_INVENTORY",
        "PLAYER_ACCOUNT_NOT_FOUND",
        "INSUFFICIENT_PLAYER_BALANCE",
        "UNKNOWN_PRODUCTION_PLAN",
        "INVALID_PRODUCTION_QUANTITY",
        "PRODUCTION_WAREHOUSE_REQUIRED",
        "COMPANY_LICENSE_REQUIRED",
        "INSUFFICIENT_PRODUCTION_INPUTS",
        "INVALID_RETAIL_PRICE",
        "UNKNOWN_RETAIL_OFFER",
        "PRICE_CURRENCY_MISMATCH",
        "RETAIL_OFFER_OWNERSHIP_REQUIRED",
        "RETAIL_OFFER_WAREHOUSE_REQUIRED"
    ]);
    if (knownBadRequestCodes.has(code)) {
        return (0, errors_1.badRequest)(code, detail ?? "Player operation failed backend validation.", {
            reason: detail ?? message
        });
    }
    return (0, errors_1.badRequest)("OPERATIONS_COMMAND_REJECTED", "Player operation failed backend validation.", {
        reason: message
    });
}
function mapShipmentError(error) {
    const message = error instanceof Error ? error.message : "SHIPMENT_REJECTED";
    const [code, detail] = message.split(":", 2);
    if (code === "UNKNOWN_ORIGIN_WAREHOUSE" ||
        code === "UNKNOWN_DESTINATION_WAREHOUSE" ||
        code === "UNKNOWN_PRODUCT" ||
        code === "NO_ROUTE_AVAILABLE" ||
        code === "INVALID_SHIPMENT_QUANTITY" ||
        code === "INSUFFICIENT_INVENTORY" ||
        code === "ROUTE_BLOCKED") {
        return (0, errors_1.badRequest)(code, detail ?? "Shipment request failed backend validation.", {
            reason: detail ?? message
        });
    }
    return (0, errors_1.badRequest)("SHIPMENT_REJECTED", "Shipment request failed backend validation.", {
        reason: message
    });
}
function mapFinanceError(error) {
    const message = error instanceof Error ? error.message : "FINANCE_COMMAND_REJECTED";
    const [rawCode, detail] = message.split(":", 2);
    const code = rawCode ?? "FINANCE_COMMAND_REJECTED";
    const knownBadRequestCodes = new Set([
        "UNKNOWN_OR_INACTIVE_BANK",
        "INVALID_LOAN_AMOUNT",
        "INVALID_BORROWER",
        "LOAN_CAPACITY_EXCEEDED",
        "UNKNOWN_LOAN",
        "INVALID_PAYMENT_AMOUNT",
        "LOAN_NOT_PAYABLE",
        "BORROWER_ACCOUNT_NOT_FOUND",
        "INSUFFICIENT_CASH",
        "UNKNOWN_OR_CLOSED_EXCHANGE",
        "ASSET_NOT_EXCHANGE_TRADEABLE",
        "INVALID_ORDER",
        "SETTLEMENT_ACCOUNT_REQUIRED",
        "INSUFFICIENT_ASSET_POSITION"
    ]);
    if (knownBadRequestCodes.has(code)) {
        return (0, errors_1.badRequest)(code, detail ?? "Finance command failed backend validation.", {
            reason: detail ?? message
        });
    }
    return (0, errors_1.badRequest)("FINANCE_COMMAND_REJECTED", "Finance command failed backend validation.", {
        reason: message
    });
}
function mapResearchError(error) {
    const message = error instanceof Error ? error.message : "RESEARCH_COMMAND_REJECTED";
    const [rawCode, detail] = message.split(":", 2);
    const code = rawCode ?? "RESEARCH_COMMAND_REJECTED";
    const knownBadRequestCodes = new Set([
        "UNKNOWN_COMPANY",
        "UNKNOWN_TECHNOLOGY",
        "INVALID_RESEARCH_FUNDING",
        "INSUFFICIENT_RESEARCH_FUNDS",
        "RESEARCH_ALREADY_ACTIVE"
    ]);
    if (knownBadRequestCodes.has(code)) {
        return (0, errors_1.badRequest)(code, detail ?? "Research command failed backend validation.", {
            reason: detail ?? message
        });
    }
    return (0, errors_1.badRequest)("RESEARCH_COMMAND_REJECTED", "Research command failed backend validation.", {
        reason: message
    });
}
function mapGovernmentError(error) {
    const message = error instanceof Error ? error.message : "GOVERNMENT_COMMAND_REJECTED";
    const [rawCode, detail] = message.split(":", 2);
    const code = rawCode ?? "GOVERNMENT_COMMAND_REJECTED";
    const knownBadRequestCodes = new Set([
        "UNKNOWN_COUNTRY",
        "UNKNOWN_PARTY",
        "INVALID_POLITICAL_SPEND",
        "PLAYER_ACCOUNT_NOT_FOUND",
        "INSUFFICIENT_PLAYER_BALANCE",
        "INVALID_MEDIA_CAMPAIGN",
        "VOTER_HAS_NO_ASSETS",
        "NO_ACTIVE_ELECTION"
    ]);
    if (knownBadRequestCodes.has(code)) {
        return (0, errors_1.badRequest)(code, detail ?? "Government command failed backend validation.", {
            reason: detail ?? message
        });
    }
    return (0, errors_1.badRequest)("GOVERNMENT_COMMAND_REJECTED", "Government command failed backend validation.", {
        reason: message
    });
}
function mapCrimeError(error) {
    const message = error instanceof Error ? error.message : "CRIME_COMMAND_REJECTED";
    const [rawCode, detail] = message.split(":", 2);
    const code = rawCode ?? "CRIME_COMMAND_REJECTED";
    const knownBadRequestCodes = new Set([
        "UNKNOWN_OR_INACTIVE_BLACK_MARKET",
        "INVALID_ILLEGAL_TRADE_QUANTITY",
        "UNKNOWN_PRODUCT",
        "UNKNOWN_OR_INACTIVE_SELLER",
        "SELLER_OUTSIDE_MARKET",
        "INSUFFICIENT_INVENTORY",
        "UNKNOWN_BUYER",
        "UNKNOWN_SMUGGLING_ROUTE",
        "SMUGGLING_ROUTE_BLOCKED",
        "ROUTE_PRODUCT_MISMATCH",
        "SMUGGLING_ROUTE_CAPACITY_EXCEEDED",
        "INSUFFICIENT_BUYER_BALANCE"
    ]);
    if (knownBadRequestCodes.has(code)) {
        return (0, errors_1.badRequest)(code, detail ?? "Illegal trade failed backend validation.", {
            reason: detail ?? message
        });
    }
    return (0, errors_1.badRequest)("CRIME_COMMAND_REJECTED", "Illegal trade failed backend validation.", {
        reason: message
    });
}
//# sourceMappingURL=routes.js.map