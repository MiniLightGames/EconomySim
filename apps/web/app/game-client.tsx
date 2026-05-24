"use client";

import type {
  City,
  Country,
  EnvironmentalIndex,
  Front,
  InfrastructureLink,
  LogisticsRoute,
  NewsItem,
  ResourceDeposit,
  RouteNode,
  Shipment,
  StrategicCell,
  WarDamage,
  Warehouse
} from "@economysim/domain";
import {
  AlertTriangle,
  Banknote,
  BadgeDollarSign,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  ChartCandlestick,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  ClipboardCheck,
  Cpu,
  Factory,
  FastForward,
  FlaskConical,
  Globe2,
  Landmark,
  Leaf,
  Loader2,
  Network,
  Newspaper,
  PackageSearch,
  Pickaxe,
  Plus,
  Radar,
  RefreshCw,
  Route,
  Scale,
  ScrollText,
  ShieldAlert,
  Siren,
  ShoppingBasket,
  Swords,
  TrendingDown,
  TrendingUp,
  Truck,
  Vote,
  Warehouse as WarehouseIcon,
  WalletCards,
  Megaphone,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  applyForLoan,
  castVote,
  createCompany,
  createIllegalTrade,
  createOrder,
  fetchGameData,
  formatApiError,
  fundLobbying,
  purchaseLand,
  purchaseResource,
  runMediaCampaign,
  runNextTick,
  runProduction,
  setRetailPrice,
  startResearchProject,
  type GameData,
  type MarketDto
} from "../lib/api";
import {
  MAP_LAYER_IDS,
  MAP_LAYER_LABELS,
  PLAYER_ID,
  buildOnboardingSteps,
  countEnabledMapLayers,
  countryToSvgPoints,
  createDefaultMapLayers,
  formatCompactNumber,
  formatMoneyMinor,
  formatPercent,
  getCountryCentroid,
  getCountryCities,
  getMapBounds,
  getMarketTone,
  getPlayerCompanies,
  getPlayerMoneyMinor,
  projectGeoPoint,
  type MapLayerId,
  type MapLayerState
} from "../lib/view-model";

export function GameClient() {
  const [data, setData] = useState<GameData | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>("food");
  const [selectedLoanCompanyId, setSelectedLoanCompanyId] = useState<string | null>(null);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedResearchCompanyId, setSelectedResearchCompanyId] = useState<string | null>(null);
  const [selectedTechnologyId, setSelectedTechnologyId] = useState<string | null>(null);
  const [selectedBlackMarketId, setSelectedBlackMarketId] = useState<string | null>(null);
  const [selectedOperationsCompanyId, setSelectedOperationsCompanyId] = useState<string | null>(null);
  const [selectedResourceOfferId, setSelectedResourceOfferId] = useState<string | null>(null);
  const [mapLayers, setMapLayers] = useState<MapLayerState>(() => createDefaultMapLayers());
  const [companyName, setCompanyName] = useState("");
  const [resourcePurchaseQuantity, setResourcePurchaseQuantity] = useState("1000");
  const [resourceMaxPriceMinor, setResourceMaxPriceMinor] = useState("100");
  const [productionQuantity, setProductionQuantity] = useState("500");
  const [retailPriceMinor, setRetailPriceMinor] = useState("250");
  const [loanAmountMinor, setLoanAmountMinor] = useState("5000000");
  const [orderQuantity, setOrderQuantity] = useState("10");
  const [orderPriceMinor, setOrderPriceMinor] = useState("1250");
  const [lobbyingAmountMinor, setLobbyingAmountMinor] = useState("50000");
  const [mediaSpendMinor, setMediaSpendMinor] = useState("40000");
  const [mediaMessage, setMediaMessage] = useState("Stable banks, stable households.");
  const [researchFundingMinor, setResearchFundingMinor] = useState("100000");
  const [illegalTradeQuantity, setIllegalTradeQuantity] = useState("250");
  const [illegalTradeBribeMinor, setIllegalTradeBribeMinor] = useState("10000");
  const [isLoading, setIsLoading] = useState(true);
  const [isTicking, setIsTicking] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isApplyingLoan, setIsApplyingLoan] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLobbying, setIsLobbying] = useState(false);
  const [isRunningMedia, setIsRunningMedia] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isStartingResearch, setIsStartingResearch] = useState(false);
  const [isCreatingIllegalTrade, setIsCreatingIllegalTrade] = useState(false);
  const [isPurchasingLand, setIsPurchasingLand] = useState(false);
  const [isPurchasingResource, setIsPurchasingResource] = useState(false);
  const [isRunningProduction, setIsRunningProduction] = useState(false);
  const [isUpdatingRetailPrice, setIsUpdatingRetailPrice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refreshWorld(showLoader = true) {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const nextData = await fetchGameData();
      setData(nextData);
      setError(null);

      setSelectedCountryId((current) => {
        if (current && nextData.world.countries.some((country) => country.id === current)) {
          return current;
        }

        return nextData.world.countries[0]?.id ?? null;
      });

      setSelectedCityId((current) => {
        if (current && nextData.world.cities.some((city) => city.id === current)) {
          return current;
        }

        return nextData.world.cities[0]?.id ?? null;
      });

      setSelectedMarketId((current) => {
        if (current && nextData.markets.some((market) => market.id === current)) {
          return current;
        }

        return nextData.markets[0]?.id ?? null;
      });

      setSelectedLoanCompanyId((current) => {
        if (current && nextData.world.companies.some((company) => company.id === current && company.legalStatus === "registered")) {
          return current;
        }

        return nextData.world.companies.find((company) => company.legalStatus === "registered")?.id ?? null;
      });

      setSelectedPartyId((current) => {
        if (current && nextData.governments.parties.some((party) => party.id === current)) {
          return current;
        }

        return nextData.governments.parties[0]?.id ?? null;
      });

      setSelectedResearchCompanyId((current) => {
        if (current && nextData.world.companies.some((company) => company.id === current && company.legalStatus === "registered")) {
          return current;
        }

        return nextData.world.companies.find((company) => company.legalStatus === "registered")?.id ?? null;
      });

      setSelectedTechnologyId((current) => {
        if (current && nextData.technologies.technologies.some((technology) => technology.id === current)) {
          return current;
        }

        return nextData.technologies.technologies[0]?.id ?? null;
      });

      setSelectedBlackMarketId((current) => {
        if (current && nextData.crime.markets.some((market) => market.id === current && market.active)) {
          return current;
        }

        return nextData.crime.markets.find((market) => market.active)?.id ?? null;
      });

      setSelectedOperationsCompanyId((current) => {
        if (
          current &&
          nextData.world.companies.some(
            (company) => company.id === current && company.ownerType === "player" && company.ownerId === PLAYER_ID && company.legalStatus === "registered"
          )
        ) {
          const currentOffer = nextData.retailOffers.find((offer) => offer.companyId === current && offer.active);

          if (currentOffer) {
            setRetailPriceMinor(currentOffer.priceMinor.toString());
          }

          return current;
        }

        const nextCompanyId =
          nextData.world.companies.find(
            (company) => company.ownerType === "player" && company.ownerId === PLAYER_ID && company.legalStatus === "registered"
          )?.id ?? null;
        const nextOffer = nextData.retailOffers.find((offer) => offer.companyId === nextCompanyId && offer.active);

        if (nextOffer) {
          setRetailPriceMinor(nextOffer.priceMinor.toString());
        }

        return nextCompanyId;
      });

      setSelectedResourceOfferId((current) => {
        if (current && nextData.resourceOffers.some((offer) => offer.id === current && offer.active && offer.availableQuantity > 0)) {
          return current;
        }

        const firstOffer = nextData.resourceOffers.find((offer) => offer.active && offer.availableQuantity > 0) ?? null;

        if (firstOffer) {
          setResourceMaxPriceMinor(firstOffer.unitPriceMinor.toString());
        }

        return firstOffer?.id ?? null;
      });
    } catch (refreshError) {
      setError(formatApiError(refreshError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshWorld();
  }, []);

  async function handleNextTick() {
    setIsTicking(true);
    setNotice(null);

    try {
      const result = await runNextTick();
      setNotice(`Тик ${result.summary.currentTick} рассчитан: новости ${result.news.length}, метрики ${result.metrics.length}.`);
      await refreshWorld(false);
    } catch (tickError) {
      setError(formatApiError(tickError));
    } finally {
      setIsTicking(false);
    }
  }

  async function handleCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = companyName.trim();

    if (!selectedCountryId) {
      setError("Выберите страну для регистрации компании.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Название компании должно быть не короче 2 символов.");
      return;
    }

    setIsCreatingCompany(true);
    setNotice(null);

    try {
      const company = await createCompany({
        countryId: selectedCountryId,
        name: trimmedName
      });
      setCompanyName("");
      setSelectedOperationsCompanyId(company.id);
      setNotice(`${trimmedName} зарегистрирована через command/tick. Теперь купите или арендуйте помещение.`);
      await refreshWorld(false);
    } catch (createError) {
      setError(formatApiError(createError));
    } finally {
      setIsCreatingCompany(false);
    }
  }

  async function handlePurchaseLand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const companyId = selectedOperationsCompanyId ?? data?.world.companies.find((company) => company.ownerType === "player")?.id ?? null;
    const company = data?.world.companies.find((candidate) => candidate.id === companyId) ?? null;
    const cityId =
      data?.world.cities.find((city) => city.countryId === company?.countryId && city.id === selectedCityId)?.id ??
      data?.world.cities.find((city) => city.countryId === company?.countryId)?.id ??
      null;

    if (!companyId || !cityId) {
      setError("Для покупки помещения нужна компания игрока и город в стране регистрации.");
      return;
    }

    setIsPurchasingLand(true);
    setNotice(null);

    try {
      const result = await purchaseLand({
        companyId,
        cityId,
        mode: "purchase"
      });
      setNotice(`Помещение готово: ${result.warehouse?.name ?? "warehouse"}. Можно покупать wheat и производить bread.`);
      await refreshWorld(false);
    } catch (landError) {
      setError(formatApiError(landError));
    } finally {
      setIsPurchasingLand(false);
    }
  }

  async function handlePurchaseResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const companyId = selectedOperationsCompanyId ?? data?.world.companies.find((company) => company.ownerType === "player")?.id ?? null;
    const offer = data?.resourceOffers.find((candidate) => candidate.id === selectedResourceOfferId) ?? data?.resourceOffers[0] ?? null;
    const quantity = Number.parseInt(resourcePurchaseQuantity, 10);
    const maxUnitPriceMinor = Number.parseInt(resourceMaxPriceMinor, 10);
    const buyerWarehouse = data?.warehouses.find((warehouse) => warehouse.companyId === companyId) ?? null;

    if (!companyId || !offer || !buyerWarehouse || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(maxUnitPriceMinor) || maxUnitPriceMinor <= 0) {
      setError("Resource purchase needs a player company, warehouse, resource offer, quantity, and max price.");
      return;
    }

    setIsPurchasingResource(true);
    setNotice(null);

    try {
      const purchase = await purchaseResource({
        buyerCompanyId: companyId,
        resourceOfferId: offer.id,
        quantity,
        maxUnitPriceMinor,
        buyerWarehouseId: buyerWarehouse.id
      });
      setNotice(`Bought ${formatCompactNumber(purchase.quantity)} units of ${offer.productName}.`);
      await refreshWorld(false);
    } catch (purchaseError) {
      setError(formatApiError(purchaseError));
    } finally {
      setIsPurchasingResource(false);
    }
  }

  async function handleRunProduction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const companyId = selectedOperationsCompanyId ?? data?.world.companies.find((company) => company.ownerType === "player")?.id ?? null;
    const plan = data?.world.productionPlans.find((candidate) => candidate.companyId === companyId) ?? null;
    const requestedQuantity = Number.parseInt(productionQuantity, 10);

    if (!companyId || !plan || !Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      setError("Production needs a player company, production plan, and positive quantity.");
      return;
    }

    setIsRunningProduction(true);
    setNotice(null);

    try {
      const run = await runProduction({
        companyId,
        productionPlanId: plan.id,
        requestedQuantity
      });
      setNotice(`Produced ${formatCompactNumber(run.producedQuantity)} units through simulation-core.`);
      await refreshWorld(false);
    } catch (productionError) {
      setError(formatApiError(productionError));
    } finally {
      setIsRunningProduction(false);
    }
  }

  function handleOperationsCompanyChange(companyId: string) {
    setSelectedOperationsCompanyId(companyId);
    const offer = data?.retailOffers.find((candidate) => candidate.companyId === companyId && candidate.active) ?? null;

    if (offer) {
      setRetailPriceMinor(offer.priceMinor.toString());
    }
  }

  async function handleSetRetailPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const companyId = selectedOperationsCompanyId ?? data?.world.companies.find((company) => company.ownerType === "player")?.id ?? null;
    const offer = data?.retailOffers.find((candidate) => candidate.companyId === companyId && candidate.active) ?? null;
    const priceMinor = Number.parseInt(retailPriceMinor, 10);

    if (!companyId || !offer || !Number.isFinite(priceMinor) || priceMinor <= 0) {
      setError("Retail price needs a player company, active retail offer, and positive price.");
      return;
    }

    setIsUpdatingRetailPrice(true);
    setNotice(null);

    try {
      const result = await setRetailPrice({
        companyId,
        retailOfferId: offer.id,
        priceMinor,
        currencyCode: offer.currencyCode
      });
      setNotice(`Retail price set to ${formatMoneyMinor(result.priceChange.newPriceMinor, result.priceChange.currencyCode)}.`);
      await refreshWorld(false);
    } catch (priceError) {
      setError(formatApiError(priceError));
    } finally {
      setIsUpdatingRetailPrice(false);
    }
  }

  async function handleApplyForLoan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const borrowerId = selectedLoanCompanyId ?? data?.world.companies[0]?.id ?? null;
    const lenderBankId = data?.banks.commercialBanks[0]?.id ?? null;
    const principalMinor = Number.parseInt(loanAmountMinor, 10);

    if (!borrowerId || !lenderBankId || !Number.isFinite(principalMinor) || principalMinor <= 0) {
      setError("Loan request needs a borrower, bank, and positive amount.");
      return;
    }

    setIsApplyingLoan(true);
    setNotice(null);

    try {
      await applyForLoan({
        borrowerType: "company",
        borrowerId,
        lenderBankId,
        principalMinor,
        termTicks: 48
      });
      setNotice("Loan application approved through simulation-core validation.");
      await refreshWorld(false);
    } catch (loanError) {
      setError(formatApiError(loanError));
    } finally {
      setIsApplyingLoan(false);
    }
  }

  async function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const book = data?.exchanges.orderBooks.find((candidate) => candidate.assetType === "stock") ?? data?.exchanges.orderBooks[0] ?? null;
    const exchangeId = data?.exchanges.exchanges[0]?.id ?? book?.exchangeId ?? null;
    const priceMinor = Number.parseInt(orderPriceMinor, 10);
    const quantity = Number.parseInt(orderQuantity, 10);

    if (!book || !exchangeId || !Number.isFinite(priceMinor) || !Number.isFinite(quantity) || priceMinor <= 0 || quantity <= 0) {
      setError("Order needs an open exchange, positive price, and positive quantity.");
      return;
    }

    setIsPlacingOrder(true);
    setNotice(null);

    try {
      await createOrder({
        exchangeId,
        ownerType: "player",
        ownerId: PLAYER_ID,
        assetType: book.assetType,
        assetId: book.assetId,
        side: "buy",
        priceMinor,
        quantity
      });
      setNotice("Exchange order submitted and matched when liquidity was available.");
      await refreshWorld(false);
    } catch (orderError) {
      setError(formatApiError(orderError));
    } finally {
      setIsPlacingOrder(false);
    }
  }

  async function handleLobbying(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const countryId = selectedCountryId ?? data?.world.countries[0]?.id ?? null;
    const amountMinor = Number.parseInt(lobbyingAmountMinor, 10);

    if (!countryId || !Number.isFinite(amountMinor) || amountMinor <= 0) {
      setError("Lobbying needs a selected country and positive budget.");
      return;
    }

    setIsLobbying(true);
    setNotice(null);

    try {
      await fundLobbying({
        countryId,
        targetPartyId: selectedPartyId ?? undefined,
        lawType: "deposit_insurance",
        amountMinor
      });
      setNotice("Lobbying action recorded through backend validation.");
      await refreshWorld(false);
    } catch (lobbyingError) {
      setError(formatApiError(lobbyingError));
    } finally {
      setIsLobbying(false);
    }
  }

  async function handleMediaCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const countryId = selectedCountryId ?? data?.world.countries[0]?.id ?? null;
    const spendMinor = Number.parseInt(mediaSpendMinor, 10);

    if (!countryId || !Number.isFinite(spendMinor) || spendMinor <= 0 || mediaMessage.trim().length < 2) {
      setError("Media campaign needs a country, message, and positive spend.");
      return;
    }

    setIsRunningMedia(true);
    setNotice(null);

    try {
      await runMediaCampaign({
        countryId,
        targetPartyId: selectedPartyId ?? undefined,
        message: mediaMessage,
        spendMinor
      });
      setNotice("Media campaign launched and public influence updated.");
      await refreshWorld(false);
    } catch (mediaError) {
      setError(formatApiError(mediaError));
    } finally {
      setIsRunningMedia(false);
    }
  }

  async function handleVote() {
    const countryId = selectedCountryId ?? data?.world.countries[0]?.id ?? null;
    const partyId = selectedPartyId ?? data?.governments.parties.find((party) => party.countryId === countryId)?.id ?? null;

    if (!countryId || !partyId) {
      setError("Vote needs an active country and party.");
      return;
    }

    setIsVoting(true);
    setNotice(null);

    try {
      await castVote({
        countryId,
        partyId,
        choice: "for"
      });
      setNotice("Vote recorded. NPC population weight remains dominant.");
      await refreshWorld(false);
    } catch (voteError) {
      setError(formatApiError(voteError));
    } finally {
      setIsVoting(false);
    }
  }

  async function handleStartResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const companyId = selectedResearchCompanyId ?? data?.world.companies.find((company) => company.legalStatus === "registered")?.id ?? null;
    const technologyId = selectedTechnologyId ?? data?.technologies.technologies[0]?.id ?? null;
    const fundingPerTickMinor = Number.parseInt(researchFundingMinor, 10);
    const technology = data?.technologies.technologies.find((candidate) => candidate.id === technologyId);

    if (!companyId || !technologyId || !Number.isFinite(fundingPerTickMinor) || fundingPerTickMinor <= 0) {
      setError("Research project needs a company, technology, and positive funding.");
      return;
    }

    setIsStartingResearch(true);
    setNotice(null);

    try {
      await startResearchProject({
        companyId,
        technologyId,
        fundingPerTickMinor,
        name: `${technology?.name ?? "Technology"} sprint`
      });
      setNotice("Research project started through backend validation.");
      await refreshWorld(false);
    } catch (researchError) {
      setError(formatApiError(researchError));
    } finally {
      setIsStartingResearch(false);
    }
  }

  async function handleCreateIllegalTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const market = data?.crime.markets.find((candidate) => candidate.id === selectedBlackMarketId) ?? data?.crime.markets.find((candidate) => candidate.active) ?? null;
    const quantity = Number.parseInt(illegalTradeQuantity, 10);
    const bribeMinor = Number.parseInt(illegalTradeBribeMinor, 10);

    if (!data || !market || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(bribeMinor) || bribeMinor < 0) {
      setError("Illegal trade needs an active black market, positive quantity, and non-negative bribe.");
      return;
    }

    const seller =
      data.world.companies.find(
        (company) =>
          company.legalStatus === "registered" &&
          company.countryId === market.countryId &&
          getCompanyInventoryForProduct(data, company.id, market.productId) >= quantity
      ) ?? null;
    const route =
      data.crime.routes.find(
        (candidate) =>
          candidate.active &&
          !candidate.blocked &&
          candidate.destinationCityId === market.cityId &&
          (candidate.productId === null || candidate.productId === market.productId)
      ) ?? null;

    if (!seller) {
      setError("No validated seller has enough inventory for this black market.");
      return;
    }

    setIsCreatingIllegalTrade(true);
    setNotice(null);

    try {
      await createIllegalTrade({
        blackMarketId: market.id,
        sellerCompanyId: seller.id,
        buyerOwnerType: "player",
        buyerOwnerId: PLAYER_ID,
        quantity,
        smugglingRouteId: route?.id,
        bribeMinor
      });
      setNotice("Illegal trade queued. The next tick will resolve delivery or enforcement.");
      await refreshWorld(false);
    } catch (crimeError) {
      setError(formatApiError(crimeError));
    } finally {
      setIsCreatingIllegalTrade(false);
    }
  }

  function handleToggleMapLayer(layerId: MapLayerId) {
    setMapLayers((current) => ({
      ...current,
      [layerId]: !current[layerId]
    }));
  }

  const world = data?.world ?? null;
  const selectedCountry = world?.countries.find((country) => country.id === selectedCountryId) ?? world?.countries[0] ?? null;
  const selectedCity = world?.cities.find((city) => city.id === selectedCityId) ?? world?.cities[0] ?? null;
  const selectedMarket = data?.markets.find((market) => market.id === selectedMarketId) ?? data?.markets[0] ?? null;
  const playerCompanies = world ? getPlayerCompanies(world.companies) : [];
  const playerMoneyMinor = world ? getPlayerMoneyMinor(world.companies, PLAYER_ID, world.bankAccounts) : 0;

  if (isLoading && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-stone-100">
        <div className="w-full max-w-md rounded-lg border border-economy-line bg-[#151914] p-5 shadow-2xl">
          <div className="flex items-center gap-3 text-economy-gold">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-wide">EconomySim запускает командный экран</span>
          </div>
          <p className="mt-3 text-sm text-stone-300">Загрузка мира из Fastify API...</p>
          {error ? <ApiErrorBanner message={error} onRetry={() => void refreshWorld()} /> : null}
        </div>
      </main>
    );
  }

  return (
    <main data-testid="game-shell" className="min-h-screen px-3 py-3 text-stone-100 sm:px-5 lg:px-6">
      <a className="skip-link" href="#world-map-section">
        Перейти к карте
      </a>
      <TopHud
        currentDate={data?.summary.currentDate ?? "-"}
        currentTick={data?.summary.currentTick ?? 0}
        isBusy={isTicking}
        onNextTick={() => void handleNextTick()}
        playerMoney={formatMoneyMinor(playerMoneyMinor, selectedCountry?.currencyCode ?? "ECO")}
      />
      <ResourceStrip data={data} playerMoney={playerMoneyMinor} selectedCountry={selectedCountry} />

      <div className="mt-3 grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <section className="grid content-start gap-3">
          <OnboardingPanel
            data={data}
            playerCompanyCount={playerCompanies.length}
            selectedCountryId={selectedCountry?.id ?? null}
          />
          <CountryCardsPanel
            cities={world?.cities ?? []}
            countries={world?.countries ?? []}
            selectedCountryId={selectedCountry?.id ?? null}
            onSelectCountry={(country) => {
              setSelectedCountryId(country.id);
              setSelectedCityId(getCountryCities(country, world?.cities ?? [])[0]?.id ?? null);
            }}
          />
          <CountryPanel country={selectedCountry} cities={world?.cities ?? []} companies={world?.companies.length ?? 0} />
          <CityPanel city={selectedCity} country={selectedCountry} world={world} />
          <PlayerCompaniesPanel companies={playerCompanies} countries={world?.countries ?? []} />
        </section>

        <section className="grid min-w-0 content-start gap-3">
          {error ? <ApiErrorBanner message={error} onRetry={() => void refreshWorld()} /> : null}
          {notice ? <NoticeBanner message={notice} onClose={() => setNotice(null)} /> : null}
          <FeedbackPanel data={data} selectedMarket={selectedMarket} />
          <WorldMap
            cities={world?.cities ?? []}
            countries={world?.countries ?? []}
            enabledLayers={mapLayers}
            environmentalIndexes={data?.environment.indexes ?? []}
            fronts={data?.wars.fronts ?? []}
            infrastructureLinks={world?.infrastructureLinks ?? []}
            logisticsRoutes={data?.logisticsRoutes ?? []}
            onToggleLayer={handleToggleMapLayer}
            resourceDeposits={data?.resourceDeposits.deposits ?? []}
            routeNodes={world?.routeNodes ?? []}
            selectedCityId={selectedCity?.id ?? null}
            selectedCountryId={selectedCountry?.id ?? null}
            shipments={data?.shipments ?? []}
            strategicCells={data?.strategicCells ?? []}
            warDamage={data?.wars.warDamage ?? []}
            warehouses={data?.warehouses ?? []}
            onSelectCity={(city) => {
              setSelectedCityId(city.id);
              setSelectedCountryId(city.countryId);
            }}
            onSelectCountry={(country) => {
              setSelectedCountryId(country.id);
              setSelectedCityId(getCountryCities(country, world?.cities ?? [])[0]?.id ?? null);
            }}
          />
          <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
            <CreateCompanyPanel
              countries={world?.countries ?? []}
              companyName={companyName}
              isBusy={isCreatingCompany}
              selectedCountryId={selectedCountry?.id ?? null}
              onCountryChange={setSelectedCountryId}
              onNameChange={setCompanyName}
              onSubmit={handleCreateCompany}
            />
            <MetricsPanel data={data} />
          </div>
          <OperationsPanel
            data={data}
            isPurchasingLand={isPurchasingLand}
            isPurchasingResource={isPurchasingResource}
            isRunningProduction={isRunningProduction}
            isUpdatingRetailPrice={isUpdatingRetailPrice}
            maxUnitPriceMinor={resourceMaxPriceMinor}
            productionQuantity={productionQuantity}
            retailPriceMinor={retailPriceMinor}
            resourceQuantity={resourcePurchaseQuantity}
            selectedCompanyId={selectedOperationsCompanyId}
            selectedResourceOfferId={selectedResourceOfferId}
            onCompanyChange={handleOperationsCompanyChange}
            onMaxUnitPriceChange={setResourceMaxPriceMinor}
            onProductionQuantityChange={setProductionQuantity}
            onRetailPriceChange={setRetailPriceMinor}
            onResourceQuantityChange={setResourcePurchaseQuantity}
            onResourceOfferChange={(offerId) => {
              const offer = data?.resourceOffers.find((candidate) => candidate.id === offerId) ?? null;
              setSelectedResourceOfferId(offerId);

              if (offer) {
                setResourceMaxPriceMinor(offer.unitPriceMinor.toString());
              }
            }}
            onPurchaseLand={handlePurchaseLand}
            onRunProduction={handleRunProduction}
            onSetRetailPrice={handleSetRetailPrice}
            onSubmitPurchase={handlePurchaseResource}
          />
        </section>

        <section className="grid content-start gap-3">
          <WarPanel data={data} />
          <ResearchEcologyPanel
            data={data}
            isStartingResearch={isStartingResearch}
            researchFundingMinor={researchFundingMinor}
            selectedCompanyId={selectedResearchCompanyId}
            selectedTechnologyId={selectedTechnologyId}
            onCompanyChange={setSelectedResearchCompanyId}
            onFundingChange={setResearchFundingMinor}
            onSubmitResearch={handleStartResearch}
            onTechnologyChange={setSelectedTechnologyId}
          />
          <CrimePanel
            data={data}
            bribeMinor={illegalTradeBribeMinor}
            isCreatingIllegalTrade={isCreatingIllegalTrade}
            quantity={illegalTradeQuantity}
            selectedBlackMarketId={selectedBlackMarketId}
            onBribeChange={setIllegalTradeBribeMinor}
            onMarketChange={setSelectedBlackMarketId}
            onQuantityChange={setIllegalTradeQuantity}
            onSubmit={handleCreateIllegalTrade}
          />
          <GovernmentPanel
            data={data}
            isLobbying={isLobbying}
            isRunningMedia={isRunningMedia}
            isVoting={isVoting}
            lobbyingAmountMinor={lobbyingAmountMinor}
            mediaMessage={mediaMessage}
            mediaSpendMinor={mediaSpendMinor}
            selectedCountryId={selectedCountry?.id ?? null}
            selectedPartyId={selectedPartyId}
            onLobbyingAmountChange={setLobbyingAmountMinor}
            onMediaMessageChange={setMediaMessage}
            onMediaSpendChange={setMediaSpendMinor}
            onRunMediaCampaign={handleMediaCampaign}
            onSelectParty={setSelectedPartyId}
            onSubmitLobbying={handleLobbying}
            onVote={() => void handleVote()}
          />
          <FinancePanel
            data={data}
            isApplyingLoan={isApplyingLoan}
            isPlacingOrder={isPlacingOrder}
            loanAmountMinor={loanAmountMinor}
            orderPriceMinor={orderPriceMinor}
            orderQuantity={orderQuantity}
            selectedLoanCompanyId={selectedLoanCompanyId}
            onApplyForLoan={handleApplyForLoan}
            onLoanAmountChange={setLoanAmountMinor}
            onOrderPriceChange={setOrderPriceMinor}
            onOrderQuantityChange={setOrderQuantity}
            onPlaceOrder={handlePlaceOrder}
            onSelectLoanCompany={setSelectedLoanCompanyId}
          />
          <LogisticsPanel data={data} />
          <MarketPanel market={selectedMarket} markets={data?.markets ?? []} onSelectMarket={setSelectedMarketId} />
          <AnalyticsPanel data={data} selectedCountryId={selectedCountry?.id ?? null} selectedMarket={selectedMarket} />
          <NewsFeed items={data?.news ?? []} />
        </section>
      </div>
    </main>
  );
}

function TopHud({
  currentDate,
  currentTick,
  isBusy,
  onNextTick,
  playerMoney
}: {
  readonly currentDate: string;
  readonly currentTick: number;
  readonly isBusy: boolean;
  readonly onNextTick: () => void;
  readonly playerMoney: string;
}) {
  return (
    <header className="grid gap-3 rounded-lg border border-economy-line bg-[#121812]/95 p-3 shadow-2xl md:grid-cols-[1fr_auto]">
      <div className="flex flex-wrap items-center gap-2">
        <HudStat icon={<WalletCards className="h-4 w-4" aria-hidden="true" />} label="Деньги игрока" value={playerMoney} />
        <HudStat icon={<Radar className="h-4 w-4" aria-hidden="true" />} label="Тик" value={currentTick.toString()} />
        <HudStat icon={<CalendarDays className="h-4 w-4" aria-hidden="true" />} label="Дата" value={formatDate(currentDate)} />
      </div>
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-economy-gold/70 bg-economy-gold px-4 py-2 text-sm font-bold text-[#17110a] shadow-[0_0_18px_rgba(215,168,79,0.22)] transition hover:bg-[#efc46c] disabled:cursor-not-allowed disabled:opacity-60"
        data-testid="next-tick-button"
        disabled={isBusy}
        onClick={onNextTick}
        type="button"
      >
        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FastForward className="h-4 w-4" aria-hidden="true" />}
        Следующий тик
      </button>
    </header>
  );
}

function ResourceStrip({
  data,
  playerMoney,
  selectedCountry
}: {
  readonly data: GameData | null;
  readonly playerMoney: number;
  readonly selectedCountry: Country | null;
}) {
  const currencyCode = selectedCountry?.currencyCode ?? "ECO";
  const activeShipments = data?.shipments.filter((shipment) => shipment.status === "in_transit").length ?? 0;
  const activeDeposits = data?.resourceDeposits.deposits.filter((deposit) => deposit.status === "active").length ?? 0;
  const activeWars = data?.wars.wars.filter((war) => war.status === "active").length ?? 0;
  const openInvestigations = data?.investigations.investigations.filter((investigation) => investigation.status === "open").length ?? 0;
  const averageAirQuality = average(data?.environment.indexes.map((index) => index.airQuality) ?? []);

  return (
    <section aria-label="Панель ресурсов игрока" className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6" data-testid="resource-strip">
      <ResourceTile
        icon={<CircleDollarSign className="h-4 w-4" aria-hidden="true" />}
        label="Капитал"
        tone="success"
        value={formatMoneyMinor(playerMoney, currencyCode)}
      />
      <ResourceTile icon={<Boxes className="h-4 w-4" aria-hidden="true" />} label="Склады" value={(data?.warehouses.length ?? 0).toString()} />
      <ResourceTile
        icon={<Truck className="h-4 w-4" aria-hidden="true" />}
        label="В пути"
        tone={activeShipments > 0 ? "warning" : "success"}
        value={activeShipments.toString()}
      />
      <ResourceTile icon={<Pickaxe className="h-4 w-4" aria-hidden="true" />} label="Ресурсы" value={activeDeposits.toString()} />
      <ResourceTile icon={<Leaf className="h-4 w-4" aria-hidden="true" />} label="Воздух" tone={averageAirQuality < 0.55 ? "warning" : "success"} value={formatPercent(averageAirQuality)} />
      <ResourceTile
        icon={<Swords className="h-4 w-4" aria-hidden="true" />}
        label="Риски"
        tone={activeWars + openInvestigations > 0 ? "danger" : "success"}
        value={(activeWars + openInvestigations).toString()}
      />
    </section>
  );
}

function ResourceTile({
  icon,
  label,
  tone = "neutral",
  value
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly tone?: "success" | "warning" | "danger" | "neutral";
  readonly value: string;
}) {
  const toneClass = {
    danger: "border-rose-400/45 bg-rose-950/25 text-rose-200",
    neutral: "border-[#344239] bg-black/25 text-stone-200",
    success: "border-economy-teal/40 bg-economy-teal/10 text-economy-teal",
    warning: "border-economy-gold/45 bg-economy-gold/10 text-economy-gold"
  }[tone];

  return (
    <div className={`flex min-h-14 items-center gap-2 rounded-md border px-3 py-2 shadow-xl ${toneClass}`}>
      <span className="flex-none">{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-[11px] font-bold uppercase tracking-wide text-stone-400">{label}</div>
        <div className="truncate text-sm font-black text-stone-50">{value}</div>
      </div>
    </div>
  );
}

function OnboardingPanel({
  data,
  playerCompanyCount,
  selectedCountryId
}: {
  readonly data: GameData | null;
  readonly playerCompanyCount: number;
  readonly selectedCountryId: string | null;
}) {
  const producedGoodsCount = data?.metrics
    .filter((metric) => metric.name === "production.output.quantity" || metric.name === "production.manual.output.quantity")
    .reduce((total, metric) => total + metric.value, 0) ?? 0;
  const resourceSignalCount = data?.resourcePurchases.length ?? 0;
  const steps = buildOnboardingSteps({
    currentTick: data?.summary.currentTick ?? 0,
    hasWorld: Boolean(data?.world),
    newsCount: data?.news.length ?? 0,
    playerCompanyCount,
    producedGoodsCount,
    resourceSignalCount,
    selectedCountryId
  });
  const completed = steps.filter((step) => step.complete).length;
  const progress = steps.length > 0 ? completed / steps.length : 0;

  return (
    <Panel icon={<ClipboardCheck className="h-4 w-4" aria-hidden="true" />} title="Первые шаги">
      <div className="grid gap-3" data-testid="onboarding-panel">
        <div className="flex items-center justify-between gap-2 text-xs text-stone-400">
          <span>Маршрут первого запуска</span>
          <span className="font-bold text-economy-gold">
            {completed}/{steps.length}
          </span>
        </div>
        <div aria-label={`Прогресс обучения ${Math.round(progress * 100)} процентов`} className="h-2 overflow-hidden rounded-full bg-[#243029]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <div className="h-full rounded-full bg-economy-gold transition-all" style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
        <div className="grid gap-2">
          {steps.map((step) => (
            <div
              className={`flex items-center gap-2 rounded-md border px-2 py-2 text-sm ${
                step.complete ? "border-economy-teal/40 bg-economy-teal/10 text-stone-100" : "border-[#344239] bg-black/20 text-stone-400"
              }`}
              key={step.id}
            >
              {step.complete ? (
                <CheckCircle2 className="h-4 w-4 flex-none text-economy-teal" aria-hidden="true" />
              ) : (
                <CircleAlert className="h-4 w-4 flex-none text-economy-gold" aria-hidden="true" />
              )}
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function CountryCardsPanel({
  cities,
  countries,
  selectedCountryId,
  onSelectCountry
}: {
  readonly cities: readonly City[];
  readonly countries: readonly Country[];
  readonly selectedCountryId: string | null;
  readonly onSelectCountry: (country: Country) => void;
}) {
  return (
    <Panel icon={<Globe2 className="h-4 w-4" aria-hidden="true" />} title="Карточки стран">
      {countries.length > 0 ? (
        <div className="grid gap-2" data-testid="country-cards">
          {countries.map((country) => {
            const cityCount = getCountryCities(country, cities).length;
            const tone = country.stability < 0.45 ? "danger" : country.stability < 0.7 ? "warning" : "success";

            return (
              <button
                aria-pressed={selectedCountryId === country.id}
                className={`rounded-md border p-3 text-left transition ${
                  selectedCountryId === country.id
                    ? "border-economy-gold bg-economy-gold/10 shadow-[0_0_18px_rgba(215,168,79,0.18)]"
                    : "border-[#344239] bg-black/25 hover:border-economy-teal/60"
                }`}
                key={country.id}
                onClick={() => onSelectCountry(country)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-stone-50">{country.name}</h3>
                    <p className="mt-1 text-xs text-stone-400">{country.currencyCode} / {country.politicalSystem}</p>
                  </div>
                  <StatusBadge label={formatPercent(country.stability)} tone={tone} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MiniStat label="Города" value={cityCount.toString()} />
                  <MiniStat label="Режим" value={country.politicalSystem.includes("authoritarian") ? "Риск" : "Ок"} tone={tone} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState>Страны загружаются.</EmptyState>
      )}
    </Panel>
  );
}

function FeedbackPanel({ data, selectedMarket }: { readonly data: GameData | null; readonly selectedMarket: MarketDto | null }) {
  if (!data) {
    return (
      <Panel icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />} title="Сигналы">
        <EmptyState>Игровые сигналы загружаются.</EmptyState>
      </Panel>
    );
  }

  const priceSeries = buildUiPriceSeries(data, selectedMarket?.needCategory ?? "food");
  const latestPrice = priceSeries.at(-1)?.value ?? selectedMarket?.averagePriceMinor ?? 0;
  const previousPrice = priceSeries.at(-2)?.value ?? latestPrice;
  const priceDelta = previousPrice > 0 ? (latestPrice - previousPrice) / previousPrice : 0;
  const latestDemandTick = Math.max(0, ...data.world.demandRecords.map((record) => record.tick));
  const unmetDemand = data.world.demandRecords
    .filter((record) => record.tick === latestDemandTick)
    .reduce((total, record) => total + record.unmetQuantity, 0);
  const playerCompanyIds = new Set(getPlayerCompanies(data.world.companies).map((company) => company.id));
  const latestTransactionTick = Math.max(0, ...data.world.financialTransactions.map((transaction) => transaction.tick));
  const profitMinor = data.world.financialTransactions
    .filter((transaction) => transaction.tick === latestTransactionTick)
    .flatMap((transaction) => transaction.entries)
    .filter((entry) => entry.ownerType === "company" && playerCompanyIds.has(entry.ownerId))
    .reduce((total, entry) => total + entry.amountMinor, 0);
  const highRiskShipments = data.shipments.filter((shipment) => shipment.status === "blocked" || shipment.risk >= 0.45);
  const latestWarning = [...data.news].sort((left, right) => right.tick - left.tick).find((item) => item.severity !== "info") ?? null;

  const signals = [
    {
      id: "price",
      icon: priceDelta >= 0 ? <TrendingUp className="h-4 w-4" aria-hidden="true" /> : <TrendingDown className="h-4 w-4" aria-hidden="true" />,
      label: "Цена рынка",
      value: `${formatMoneyMinor(latestPrice)} (${formatSignedPercent(priceDelta)})`,
      tone: Math.abs(priceDelta) > 0.08 ? "warning" : "success"
    },
    {
      id: "profit",
      icon: <BadgeDollarSign className="h-4 w-4" aria-hidden="true" />,
      label: profitMinor >= 0 ? "Прибыль" : "Убыток",
      value: formatSignedMoneyMinor(profitMinor),
      tone: profitMinor < 0 ? "danger" : profitMinor > 0 ? "success" : "neutral"
    },
    {
      id: "shortage",
      icon: <PackageSearch className="h-4 w-4" aria-hidden="true" />,
      label: "Дефицит",
      value: formatCompactNumber(unmetDemand),
      tone: unmetDemand > 0 ? "warning" : "success"
    },
    {
      id: "risk",
      icon: <Route className="h-4 w-4" aria-hidden="true" />,
      label: "Логистический риск",
      value: highRiskShipments.length.toString(),
      tone: highRiskShipments.length > 0 ? "danger" : "success"
    }
  ] satisfies readonly {
    readonly id: string;
    readonly icon: ReactNode;
    readonly label: string;
    readonly tone: "danger" | "neutral" | "success" | "warning";
    readonly value: string;
  }[];

  return (
    <Panel icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />} title="Обратная связь">
      <div className="grid gap-3" data-testid="feedback-panel">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => (
            <FeedbackTile icon={signal.icon} key={signal.id} label={signal.label} tone={signal.tone} value={signal.value} />
          ))}
        </div>
        {latestWarning ? (
          <div className="rounded-md border border-economy-gold/40 bg-economy-gold/10 p-3 text-sm text-stone-200" role="status">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-economy-gold" aria-hidden="true" />
              <div>
                <div className="font-semibold text-stone-50">{latestWarning.headline}</div>
                <p className="mt-1 text-xs leading-5 text-stone-400">{latestWarning.body}</p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState>Критических предупреждений нет. Следующий тик покажет новые изменения рынка.</EmptyState>
        )}
      </div>
    </Panel>
  );
}

function FeedbackTile({
  icon,
  label,
  tone,
  value
}: {
  readonly icon: ReactNode;
  readonly label: string;
  readonly tone: "danger" | "neutral" | "success" | "warning";
  readonly value: string;
}) {
  return (
    <div className={`rounded-md border p-3 ${statusSurfaceClass(tone)}`}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-400">
        <span className={statusTextClass(tone)}>{icon}</span>
        {label}
      </div>
      <div className="mt-2 truncate text-sm font-black text-stone-50">{value}</div>
    </div>
  );
}

function WorldMap({
  cities,
  countries,
  enabledLayers,
  environmentalIndexes,
  fronts,
  infrastructureLinks,
  logisticsRoutes,
  onToggleLayer,
  resourceDeposits,
  routeNodes,
  selectedCityId,
  selectedCountryId,
  shipments,
  strategicCells,
  warDamage,
  warehouses,
  onSelectCity,
  onSelectCountry
}: {
  readonly cities: readonly City[];
  readonly countries: readonly Country[];
  readonly enabledLayers: MapLayerState;
  readonly environmentalIndexes: readonly EnvironmentalIndex[];
  readonly fronts: readonly Front[];
  readonly infrastructureLinks: readonly InfrastructureLink[];
  readonly logisticsRoutes: readonly LogisticsRoute[];
  readonly onToggleLayer: (layerId: MapLayerId) => void;
  readonly resourceDeposits: readonly ResourceDeposit[];
  readonly routeNodes: readonly RouteNode[];
  readonly selectedCityId: string | null;
  readonly selectedCountryId: string | null;
  readonly shipments: readonly Shipment[];
  readonly strategicCells: readonly StrategicCell[];
  readonly warDamage: readonly WarDamage[];
  readonly warehouses: readonly Warehouse[];
  readonly onSelectCity: (city: City) => void;
  readonly onSelectCountry: (country: Country) => void;
}) {
  const bounds = useMemo(() => getMapBounds(countries, cities), [countries, cities]);
  const cityNodes = cities.map((city) => ({
    city,
    point: projectGeoPoint(city.location, bounds)
  }));
  const capitalNode = cityNodes[0] ?? null;
  const links = capitalNode ? cityNodes.slice(1).map((node) => ({ from: capitalNode.point, to: node.point, id: node.city.id })) : [];
  const activeLayerCount = countEnabledMapLayers(enabledLayers);
  const infrastructureLinkNodes = infrastructureLinks
    .map((link) => {
      const fromNode = routeNodes.find((node) => node.id === link.fromNodeId);
      const toNode = routeNodes.find((node) => node.id === link.toNodeId);

      if (!fromNode || !toNode) {
        return null;
      }

      return {
        id: link.id,
        blocked: link.blocked || link.sanctionsBlocked,
        quality: link.quality,
        mode: link.mode,
        from: projectGeoPoint(fromNode.location, bounds),
        to: projectGeoPoint(toNode.location, bounds)
      };
    })
    .filter((link): link is NonNullable<typeof link> => link !== null);
  const strategicCellNodes = strategicCells.map((cell) => ({
    cell,
    point: projectGeoPoint(cell.center, bounds),
    damageSeverity: warDamage.filter((damage) => damage.cellId === cell.id).reduce((total, damage) => total + damage.severity, 0)
  }));
  const environmentNodes = environmentalIndexes
    .map((index) => {
      const city = cities.find((candidate) => candidate.id === index.cityId);

      if (!city) {
        return null;
      }

      return {
        index,
        point: projectGeoPoint(city.location, bounds)
      };
    })
    .filter((node): node is NonNullable<typeof node> => node !== null);
  const depositNodes = resourceDeposits
    .map((deposit) => {
      const city = cities.find((candidate) => candidate.id === deposit.cityId);

      if (!city) {
        return null;
      }

      return {
        deposit,
        point: projectGeoPoint(city.location, bounds)
      };
    })
    .filter((node): node is NonNullable<typeof node> => node !== null);
  const frontLinks = fronts
    .flatMap((front) =>
      front.cellIds.slice(1).map((cellId, index) => {
        const previous = strategicCellNodes.find((node) => node.cell.id === front.cellIds[index]);
        const current = strategicCellNodes.find((node) => node.cell.id === cellId);

        if (!previous || !current) {
          return null;
        }

        return {
          id: `${front.id}-${index}`,
          from: previous.point,
          to: current.point,
          pressure: front.pressure
        };
      })
    )
    .filter((link): link is NonNullable<typeof link> => link !== null);
  const logisticsLinks = logisticsRoutes
    .map((route) => {
      const origin = warehouses.find((warehouse) => warehouse.id === route.originWarehouseId);
      const destination = warehouses.find((warehouse) => warehouse.id === route.destinationWarehouseId);
      const originCity = cities.find((city) => city.id === origin?.cityId);
      const destinationCity = cities.find((city) => city.id === destination?.cityId);

      if (!originCity || !destinationCity) {
        return null;
      }

      return {
        id: route.id,
        active: route.active,
        hasActiveShipment: shipments.some((shipment) => shipment.routeId === route.id && shipment.status === "in_transit"),
        from: projectGeoPoint(originCity.location, bounds),
        to: projectGeoPoint(destinationCity.location, bounds)
      };
    })
    .filter((link): link is NonNullable<typeof link> => link !== null);

  return (
    <section
      aria-label="Игровая карта мира EconomySim"
      className="rounded-lg border border-economy-line bg-[#101511] p-3 shadow-2xl"
      id="world-map-section"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-economy-teal" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold text-stone-50">EconomySim</h1>
            <p className="text-xs uppercase tracking-wide text-stone-400">2D world command map</p>
          </div>
        </div>
        <span className="rounded-md border border-economy-teal/40 bg-economy-teal/10 px-2 py-1 text-xs font-semibold text-economy-teal">
          Страны {countries.length} / города {cities.length} / слои {activeLayerCount}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6" data-testid="map-layer-controls">
        {MAP_LAYER_IDS.map((layerId) => (
          <button
            aria-label={`Слой карты: ${MAP_LAYER_LABELS[layerId]}`}
            aria-pressed={enabledLayers[layerId]}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-2 py-1 text-xs font-bold transition ${
              enabledLayers[layerId]
                ? "border-economy-gold/70 bg-economy-gold/15 text-economy-gold shadow-[0_0_14px_rgba(215,168,79,0.14)]"
                : "border-[#344239] bg-black/25 text-stone-400 hover:border-economy-teal/60 hover:text-stone-100"
            }`}
            data-testid={`map-layer-toggle-${layerId}`}
            key={layerId}
            onClick={() => onToggleLayer(layerId)}
            type="button"
          >
            <MapLayerIcon layerId={layerId} />
            {MAP_LAYER_LABELS[layerId]}
          </button>
        ))}
      </div>

      <div
        aria-label="Интерактивная карта стран, городов и стратегических слоев"
        className="relative min-h-[460px] overflow-hidden rounded-md border border-[#344239] bg-[#0c130f]"
        data-testid="world-map"
        role="region"
      >
        <div className="absolute inset-0 map-grid opacity-80" />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
          {enabledLayers.infrastructure ? (
            <>
              {links.map((link) => (
                <line
                  className="stroke-economy-gold/35"
                  key={link.id}
                  strokeDasharray="1.2 1.2"
                  strokeWidth="0.35"
                  x1={link.from.x}
                  x2={link.to.x}
                  y1={link.from.y}
                  y2={link.to.y}
                />
              ))}
              {infrastructureLinkNodes.map((link) => (
                <line
                  className={link.blocked ? "stroke-rose-300/75" : link.quality < 0.45 ? "stroke-economy-gold/70" : "stroke-stone-200/45"}
                  key={link.id}
                  strokeDasharray={link.mode === "rail" ? "0.7 0.55" : link.blocked ? "1.5 0.8" : "0"}
                  strokeLinecap="round"
                  strokeWidth={link.quality < 0.45 ? "0.75" : "0.55"}
                  x1={link.from.x}
                  x2={link.to.x}
                  y1={link.from.y}
                  y2={link.to.y}
                />
              ))}
            </>
          ) : null}
          {enabledLayers.logistics
            ? logisticsLinks.map((link) => (
                <line
                  className={link.active ? (link.hasActiveShipment ? "stroke-economy-gold" : "stroke-economy-teal/70") : "stroke-rose-400/55"}
                  key={link.id}
                  strokeDasharray={link.hasActiveShipment ? "0" : "1.8 1.4"}
                  strokeLinecap="round"
                  strokeWidth={link.hasActiveShipment ? "0.85" : "0.55"}
                  x1={link.from.x}
                  x2={link.to.x}
                  y1={link.from.y}
                  y2={link.to.y}
                />
              ))
            : null}
          {enabledLayers.war
            ? frontLinks.map((link) => (
                <line
                  className="stroke-rose-300"
                  key={link.id}
                  strokeDasharray="1.6 0.9"
                  strokeLinecap="round"
                  strokeWidth={link.pressure > 0.55 ? "1" : "0.65"}
                  x1={link.from.x}
                  x2={link.to.x}
                  y1={link.from.y}
                  y2={link.to.y}
                />
              ))
            : null}
          {countries.map((country) => (
            <polygon
              className={
                !enabledLayers.economy
                  ? "fill-[#18221d]/45 stroke-[#415148]/60"
                  : selectedCountryId === country.id
                  ? "fill-economy-teal/30 stroke-economy-gold"
                  : "fill-[#234335]/70 stroke-economy-teal/55"
              }
              key={country.id}
              points={countryToSvgPoints(country, bounds)}
              strokeLinejoin="round"
              strokeWidth="0.6"
            />
          ))}
          {enabledLayers.war
            ? strategicCellNodes.map(({ cell, damageSeverity, point }) => (
                <g key={cell.id}>
                  <circle
                    className={warCellClass(cell)}
                    cx={point.x}
                    cy={point.y}
                    r={cell.legalControllerCountryId !== cell.factualControllerCountryId ? "3.2" : cell.contested ? "2.7" : "2.1"}
                    strokeWidth="0.45"
                  />
                  {damageSeverity > 0 ? (
                    <circle
                      className="fill-transparent stroke-rose-200/70"
                      cx={point.x}
                      cy={point.y}
                      r={Math.min(6, 3 + damageSeverity * 2)}
                      strokeDasharray="0.8 0.7"
                      strokeWidth="0.35"
                    />
                  ) : null}
                </g>
              ))
            : null}
          {enabledLayers.pollution
            ? environmentNodes.map(({ index, point }) => (
                <circle
                  className={index.healthImpact > 0.12 ? "fill-rose-400/25 stroke-rose-300/70" : "fill-economy-teal/15 stroke-economy-teal/50"}
                  cx={point.x + 2.2}
                  cy={point.y - 2.2}
                  key={index.id}
                  r={Math.max(2.4, 6 - index.airQuality * 4)}
                  strokeDasharray="0.7 0.5"
                  strokeWidth="0.35"
                />
              ))
            : null}
          {enabledLayers.resources
            ? depositNodes.map(({ deposit, point }) => (
                <rect
                  className={
                    deposit.status === "active"
                      ? "fill-economy-gold/55 stroke-economy-gold"
                      : deposit.status === "depleted"
                        ? "fill-stone-500/30 stroke-stone-400"
                        : "fill-transparent stroke-economy-teal/60"
                  }
                  height="2.2"
                  key={deposit.id}
                  rx="0.3"
                  strokeWidth="0.35"
                  transform={`rotate(45 ${point.x - 3} ${point.y + 3})`}
                  width="2.2"
                  x={point.x - 4.1}
                  y={point.y + 1.9}
                />
              ))
            : null}
        </svg>

        {countries.map((country) => {
          const point = getCountryCentroid(country, bounds);

          return (
            <button
              aria-label={`Выбрать страну ${country.name}`}
              className={`absolute max-w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-1 text-left text-[11px] font-bold shadow-xl transition ${
                selectedCountryId === country.id
                  ? "border-economy-gold bg-[#221a0c] text-economy-gold"
                  : "border-economy-teal/40 bg-black/55 text-stone-100 hover:border-economy-gold"
              }`}
              data-testid="country-map-button"
              key={country.id}
              onClick={() => onSelectCountry(country)}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              type="button"
            >
              {country.name}
            </button>
          );
        })}

        {cityNodes.map(({ city, point }) => (
          <button
            aria-label={`Выбрать город ${city.name}`}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold shadow-[0_0_18px_rgba(79,183,165,0.25)] transition ${
              selectedCityId === city.id
                ? "border-stone-50 bg-economy-gold text-[#1b1205]"
                : "border-economy-teal/80 bg-[#06110f]/85 text-stone-50 hover:bg-economy-teal"
            }`}
            key={city.id}
            onClick={() => onSelectCity(city)}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            type="button"
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {city.name}
          </button>
        ))}

        <div className="absolute bottom-3 left-3 right-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <MapLegend icon={<Landmark className="h-4 w-4" aria-hidden="true" />} label="Экономика" value={countries.length.toString()} />
          <MapLegend icon={<Network className="h-4 w-4" aria-hidden="true" />} label="Инфра" value={infrastructureLinks.length.toString()} />
          <MapLegend icon={<Route className="h-4 w-4" aria-hidden="true" />} label="Логистика" value={logisticsRoutes.length.toString()} />
          <MapLegend icon={<Pickaxe className="h-4 w-4" aria-hidden="true" />} label="Ресурсы" value={resourceDeposits.length.toString()} />
          <MapLegend icon={<Swords className="h-4 w-4" aria-hidden="true" />} label="Война" value={strategicCells.length.toString()} />
          <MapLegend icon={<Leaf className="h-4 w-4" aria-hidden="true" />} label="Экология" value={environmentalIndexes.length.toString()} />
        </div>
      </div>
    </section>
  );
}

function CountryPanel({
  cities,
  companies,
  country
}: {
  readonly cities: readonly City[];
  readonly companies: number;
  readonly country: Country | null;
}) {
  const countryCities = getCountryCities(country, cities);

  return (
    <Panel icon={<Landmark className="h-4 w-4" aria-hidden="true" />} title="Панель страны">
      {country ? (
        <div className="grid gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-50">{country.name}</h2>
            <p className="text-sm text-stone-400">{country.currencyCode} / {country.politicalSystem}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Стабильность" value={formatPercent(country.stability)} />
            <MiniStat label="Города" value={countryCities.length.toString()} />
            <MiniStat label="Компании" value={companies.toString()} />
          </div>
        </div>
      ) : (
        <EmptyState>Страна не выбрана.</EmptyState>
      )}
    </Panel>
  );
}

function CityPanel({
  city,
  country,
  world
}: {
  readonly city: City | null;
  readonly country: Country | null;
  readonly world: GameData["world"] | null;
}) {
  const cohorts = world?.populationCohorts.filter((cohort) => cohort.cityId === city?.id) ?? [];
  const warehouses = world?.warehouses.filter((warehouse) => warehouse.cityId === city?.id) ?? [];

  return (
    <Panel icon={<Building2 className="h-4 w-4" aria-hidden="true" />} title="Панель города">
      {city ? (
        <div className="grid gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-50">{city.name}</h2>
            <p className="text-sm text-stone-400">{country?.name ?? "Unknown country"}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Население" value={formatCompactNumber(city.populationTotal)} />
            <MiniStat label="Инфра" value={formatPercent(city.infrastructureScore)} />
            <MiniStat label="Когорты" value={cohorts.length.toString()} />
            <MiniStat label="Склады" value={warehouses.length.toString()} />
          </div>
        </div>
      ) : (
        <EmptyState>Город не выбран.</EmptyState>
      )}
    </Panel>
  );
}

function PlayerCompaniesPanel({
  companies,
  countries
}: {
  readonly companies: ReturnType<typeof getPlayerCompanies>;
  readonly countries: readonly Country[];
}) {
  return (
    <Panel icon={<Factory className="h-4 w-4" aria-hidden="true" />} title="Компании игрока">
      {companies.length > 0 ? (
        <div className="grid gap-2" data-testid="player-companies">
          {companies.map((company) => {
            const country = countries.find((candidate) => candidate.id === company.countryId);
            const statusTone = getCompanyStatusTone(company);

            return (
              <article className={`rounded-md border p-3 ${statusSurfaceClass(statusTone)}`} key={company.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <Factory className={`mt-0.5 h-4 w-4 flex-none ${statusTextClass(statusTone)}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-stone-50">{company.name}</h3>
                      <p className="text-xs text-stone-400">{country?.name ?? company.countryId}</p>
                    </div>
                  </div>
                  <StatusBadge label={company.legalStatus} tone={statusTone} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MiniStat label="Баланс" value={formatMoneyMinor(company.cashBalanceMinor, company.currencyCode)} tone={statusTone} />
                  <MiniStat label="Рейтинг" value={formatPercent(company.reputation)} tone={company.reputation < 0.35 ? "danger" : company.reputation < 0.65 ? "warning" : "success"} />
                </div>
                {company.bankruptcyStatus !== "none" ? (
                  <p className="mt-2 rounded-md border border-rose-400/30 bg-rose-950/20 px-2 py-1 text-xs text-rose-100">
                    Финансовый статус: {company.bankruptcyStatus}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState>У игрока пока нет компаний.</EmptyState>
      )}
    </Panel>
  );
}

function WarPanel({ data }: { readonly data: GameData | null }) {
  const wars = data?.wars.wars ?? [];
  const fronts = data?.wars.fronts ?? [];
  const occupations = data?.wars.occupations ?? [];
  const damage = data?.wars.warDamage ?? [];
  const refugeeFlows = data?.wars.refugeeFlows ?? [];
  const orders = data?.militaryOrders ?? [];
  const sanctions = data?.sanctions.sanctions ?? [];
  const cells = data?.strategicCells ?? [];
  const countries = data?.world.countries ?? [];
  const products = data?.world.products ?? [];
  const activeWars = wars.filter((war) => war.status === "active");
  const occupiedCells = cells.filter((cell) => cell.legalControllerCountryId !== cell.factualControllerCountryId);
  const warNews = (data?.news ?? [])
    .filter((item) => {
      const headline = item.headline.toLowerCase();
      return headline.includes("war") || headline.includes("front") || headline.includes("refugee") || headline.includes("military");
    })
    .slice(-3)
    .reverse();

  return (
    <Panel icon={<Swords className="h-4 w-4" aria-hidden="true" />} title="War Room">
      <div className="grid gap-3" data-testid="war-panel">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Active" value={activeWars.length.toString()} tone={activeWars.length > 0 ? "danger" : "success"} />
          <MiniStat label="Occupied" value={occupiedCells.length.toString()} tone={occupiedCells.length > 0 ? "warning" : "success"} />
          <MiniStat label="Orders" value={orders.length.toString()} tone={orders.length > 0 ? "warning" : "success"} />
        </div>

        {activeWars.length > 0 ? (
          <div className="grid gap-2">
            {activeWars.map((war) => {
              const attacker = countries.find((country) => country.id === war.attackerCountryId);
              const defender = countries.find((country) => country.id === war.defenderCountryId);

              return (
                <article className="rounded-md border border-rose-400/30 bg-rose-950/20 p-2" key={war.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-stone-50">{war.name}</h3>
                      <p className="text-xs text-stone-400">{attacker?.name ?? war.attackerCountryId} {"->"} {defender?.name ?? war.defenderCountryId}</p>
                    </div>
                    <span className="rounded bg-rose-500/20 px-2 py-1 text-[11px] font-bold uppercase text-rose-200">{war.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <MiniStat label="Intensity" value={formatPercent(war.intensity)} tone="danger" />
                    <MiniStat label="Recognition" value={formatPercent(war.recognitionScore)} tone={war.recognitionScore < 0.4 ? "warning" : "success"} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState>No active wars.</EmptyState>
        )}

        <SubPanelTitle icon={<ShieldAlert className="h-4 w-4" aria-hidden="true" />} title="Fronts and control" />
        <div className="grid max-h-44 gap-2 overflow-auto pr-1">
          {fronts.slice(0, 4).map((front) => (
            <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={front.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-stone-50">{front.name}</span>
                <span className="text-xs font-bold text-rose-200">{front.movementDirection}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <MiniStat label="Pressure" value={formatPercent(front.pressure)} tone={front.pressure > 0.55 ? "danger" : "warning"} />
                <MiniStat label="Cells" value={front.cellIds.length.toString()} />
              </div>
            </article>
          ))}
          {fronts.length === 0 ? <EmptyState>No front data.</EmptyState> : null}
        </div>

        {occupations.length > 0 ? (
          <div className="grid gap-2">
            {occupations.slice(-3).reverse().map((occupation) => {
              const cell = cells.find((candidate) => candidate.id === occupation.cellId);
              const occupier = countries.find((country) => country.id === occupation.occupierCountryId);

              return (
                <div className="rounded-md border border-rose-400/25 bg-black/25 p-2 text-xs text-stone-300" key={occupation.id}>
                  <span className="font-semibold text-stone-50">{cell?.name ?? occupation.cellId}</span> controlled by {occupier?.name ?? occupation.occupierCountryId}
                </div>
              );
            })}
          </div>
        ) : null}

        <SubPanelTitle icon={<Truck className="h-4 w-4" aria-hidden="true" />} title="Military orders" />
        {orders.length > 0 ? (
          <div className="grid max-h-44 gap-2 overflow-auto pr-1">
            {[...orders].reverse().slice(0, 5).map((order) => {
              const product = products.find((candidate) => candidate.id === order.productId);

              return (
                <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={order.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-stone-50">{product?.name ?? order.productId}</h3>
                      <p className="text-xs text-stone-400">{order.supplyType} / tick {order.tick}</p>
                    </div>
                    <span className="text-xs font-bold text-economy-gold">{order.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <MiniStat label="Qty" value={formatCompactNumber(order.quantity)} />
                    <MiniStat label="Max" value={formatMoneyMinor(order.maxPriceMinor)} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState>No military orders yet.</EmptyState>
        )}

        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Sanctions" value={sanctions.filter((sanction) => sanction.active).length.toString()} tone={sanctions.length > 0 ? "warning" : "success"} />
          <MiniStat label="Damage" value={damage.length.toString()} tone={damage.length > 0 ? "danger" : "success"} />
          <MiniStat label="Refugees" value={formatCompactNumber(refugeeFlows.reduce((total, flow) => total + flow.people, 0))} tone={refugeeFlows.length > 0 ? "warning" : "success"} />
        </div>

        {warNews.length > 0 ? (
          <div className="grid gap-2">
            {warNews.map((item) => (
              <p className="rounded-md border border-[#344239] bg-black/20 p-2 text-xs text-stone-300" key={item.id}>
                {item.headline}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function ResearchEcologyPanel({
  data,
  isStartingResearch,
  onCompanyChange,
  onFundingChange,
  onSubmitResearch,
  onTechnologyChange,
  researchFundingMinor,
  selectedCompanyId,
  selectedTechnologyId
}: {
  readonly data: GameData | null;
  readonly isStartingResearch: boolean;
  readonly researchFundingMinor: string;
  readonly selectedCompanyId: string | null;
  readonly selectedTechnologyId: string | null;
  readonly onCompanyChange: (companyId: string) => void;
  readonly onFundingChange: (value: string) => void;
  readonly onSubmitResearch: (event: FormEvent<HTMLFormElement>) => void;
  readonly onTechnologyChange: (technologyId: string) => void;
}) {
  const technologies = data?.technologies.technologies ?? [];
  const levels = data?.technologies.levels ?? [];
  const projects = data?.researchProjects ?? [];
  const companies = data?.world.companies.filter((company) => company.legalStatus === "registered") ?? [];
  const countries = data?.world.countries ?? [];
  const patents = data?.technologies.patents ?? [];
  const licenses = data?.technologies.licenses ?? [];
  const indexes = data?.environment.indexes ?? [];
  const pollution = data?.environment.pollution ?? [];
  const deposits = data?.resourceDeposits.deposits ?? [];
  const discoveries = data?.resourceDeposits.discoveries ?? [];
  const selectedTechnology = technologies.find((technology) => technology.id === selectedTechnologyId) ?? technologies[0] ?? null;
  const activeProjects = projects.filter((project) => project.status === "active");
  const averageAirQuality = indexes.length > 0 ? indexes.reduce((total, index) => total + index.airQuality, 0) / indexes.length : 0;
  const totalPollution = pollution.reduce((total, item) => total + item.amount, 0);
  const activeDeposits = deposits.filter((deposit) => deposit.status === "active");

  return (
    <Panel icon={<Cpu className="h-4 w-4" aria-hidden="true" />} title="R&D / Ecology">
      <div className="grid gap-3" data-testid="rd-panel">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Tech" value={technologies.length.toString()} />
          <MiniStat label="R&D" value={activeProjects.length.toString()} tone={activeProjects.length > 0 ? "warning" : "success"} />
          <MiniStat label="Air" value={formatPercent(averageAirQuality)} tone={averageAirQuality < 0.65 ? "warning" : "success"} />
        </div>

        <form className="grid gap-2 rounded-md border border-[#344239] bg-black/20 p-2" onSubmit={onSubmitResearch}>
          <SubPanelTitle icon={<FlaskConical className="h-4 w-4" aria-hidden="true" />} title="Research investment" />
          <select
            className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
            onChange={(event) => onCompanyChange(event.target.value)}
            value={selectedCompanyId ?? companies[0]?.id ?? ""}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
            onChange={(event) => onTechnologyChange(event.target.value)}
            value={selectedTechnologyId ?? technologies[0]?.id ?? ""}
          >
            {technologies.map((technology) => (
              <option key={technology.id} value={technology.id}>
                {technology.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
              min={1}
              onChange={(event) => onFundingChange(event.target.value)}
              type="number"
              value={researchFundingMinor}
            />
            <button
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-economy-teal/70 bg-economy-teal px-3 text-sm font-bold text-[#06110f] transition hover:bg-[#6bcbbb] disabled:opacity-60"
              disabled={isStartingResearch || !selectedTechnology || companies.length === 0}
              type="submit"
            >
              {isStartingResearch ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FlaskConical className="h-4 w-4" aria-hidden="true" />}
              Fund
            </button>
          </div>
        </form>

        {selectedTechnology ? (
          <article className="rounded-md border border-[#344239] bg-black/25 p-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-stone-50">{selectedTechnology.name}</h3>
                <p className="text-xs text-stone-400">{selectedTechnology.domain} / {selectedTechnology.accessModel}</p>
              </div>
              <span className="text-xs font-bold text-economy-gold">{formatMoneyMinor(selectedTechnology.researchCostMinor)}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <MiniStat label="Input" value={formatPercent(selectedTechnology.effects.inputEfficiency)} />
              <MiniStat label="Clean" value={formatPercent(selectedTechnology.effects.pollutionReduction)} />
              <MiniStat label="Health" value={formatPercent(selectedTechnology.effects.healthBonus)} />
            </div>
          </article>
        ) : (
          <EmptyState>No technology catalog loaded.</EmptyState>
        )}

        <SubPanelTitle icon={<Cpu className="h-4 w-4" aria-hidden="true" />} title="Company and country tech" />
        <div className="grid max-h-40 gap-2 overflow-auto pr-1">
          {levels.slice(0, 5).map((level) => {
            const technology = technologies.find((candidate) => candidate.id === level.technologyId);
            const country = countries.find((candidate) => candidate.id === level.scopeId);
            const company = companies.find((candidate) => candidate.id === level.scopeId);

            return (
              <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={level.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-stone-50">{technology?.name ?? level.technologyId}</span>
                  <span className="text-xs font-bold text-economy-teal">{level.scopeType}</span>
                </div>
                <p className="mt-1 truncate text-xs text-stone-400">{company?.name ?? country?.name ?? level.scopeId}</p>
              </article>
            );
          })}
          {levels.length === 0 ? <EmptyState>No unlocked technology levels.</EmptyState> : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Patents" value={patents.length.toString()} />
          <MiniStat label="Licenses" value={licenses.length.toString()} />
          <MiniStat label="Pollution" value={formatCompactNumber(totalPollution)} tone={totalPollution > 100 ? "warning" : "success"} />
        </div>

        <SubPanelTitle icon={<Leaf className="h-4 w-4" aria-hidden="true" />} title="Environment and resources" />
        <div className="grid max-h-44 gap-2 overflow-auto pr-1">
          {indexes.slice(0, 3).map((index) => {
            const city = data?.world.cities.find((candidate) => candidate.id === index.cityId);

            return (
              <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={index.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-stone-50">{city?.name ?? index.cityId}</span>
                  <span className="text-xs font-bold text-economy-teal">{formatPercent(index.airQuality)}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <MiniStat label="Health" value={formatPercent(index.healthImpact)} tone={index.healthImpact > 0.1 ? "warning" : "success"} />
                  <MiniStat label="Migration" value={formatPercent(index.migrationPressure)} tone={index.migrationPressure > 0.08 ? "warning" : "success"} />
                </div>
              </article>
            );
          })}
          {activeDeposits.slice(0, 3).map((deposit) => (
            <article className="rounded-md border border-economy-gold/30 bg-economy-gold/10 p-2" key={deposit.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-stone-50">{deposit.name}</span>
                <span className="text-xs font-bold text-economy-gold">{deposit.status}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <MiniStat label="Qty" value={formatCompactNumber(deposit.quantity)} />
                <MiniStat label="Quality" value={formatPercent(deposit.quality)} />
              </div>
            </article>
          ))}
          {indexes.length === 0 && activeDeposits.length === 0 ? <EmptyState>No ecology or resource layer loaded.</EmptyState> : null}
        </div>

        {discoveries.length > 0 ? <p className="rounded-md border border-economy-teal/30 bg-economy-teal/10 p-2 text-xs text-economy-teal">{discoveries.length} resource discoveries recorded.</p> : null}
      </div>
    </Panel>
  );
}

function CrimePanel({
  bribeMinor,
  data,
  isCreatingIllegalTrade,
  onBribeChange,
  onMarketChange,
  onQuantityChange,
  onSubmit,
  quantity,
  selectedBlackMarketId
}: {
  readonly data: GameData | null;
  readonly bribeMinor: string;
  readonly isCreatingIllegalTrade: boolean;
  readonly quantity: string;
  readonly selectedBlackMarketId: string | null;
  readonly onBribeChange: (value: string) => void;
  readonly onMarketChange: (marketId: string) => void;
  readonly onQuantityChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const markets = data?.crime.markets.filter((market) => market.active) ?? [];
  const trades = data?.crime.illegalTrades ?? [];
  const investigations = data?.investigations.investigations ?? [];
  const fines = data?.investigations.fines ?? [];
  const confiscations = data?.investigations.confiscations ?? [];
  const selectedMarket = markets.find((market) => market.id === selectedBlackMarketId) ?? markets[0] ?? null;
  const products = data?.world.products ?? [];
  const cities = data?.world.cities ?? [];
  const companies = data?.world.companies ?? [];
  const product = products.find((candidate) => candidate.id === selectedMarket?.productId) ?? null;
  const city = cities.find((candidate) => candidate.id === selectedMarket?.cityId) ?? null;
  const seller =
    selectedMarket && data
      ? companies.find(
          (company) =>
            company.legalStatus === "registered" &&
            company.countryId === selectedMarket.countryId &&
            getCompanyInventoryForProduct(data, company.id, selectedMarket.productId) > 0
        ) ?? null
      : null;
  const route =
    selectedMarket && data
      ? data.crime.routes.find(
          (candidate) =>
            candidate.active &&
            !candidate.blocked &&
            candidate.destinationCityId === selectedMarket.cityId &&
            (candidate.productId === null || candidate.productId === selectedMarket.productId)
        ) ?? null
      : null;
  const legalRating =
    data?.reputation.companies.length
      ? data.reputation.companies.reduce((total, company) => total + company.reputation, 0) / data.reputation.companies.length
      : 1;
  const crimeNews = (data?.news ?? [])
    .filter((item) => /black market|shadow|illegal|enforcement|grey/i.test(`${item.headline} ${item.body}`))
    .sort((left, right) => right.tick - left.tick)
    .slice(0, 3);

  return (
    <Panel icon={<Siren className="h-4 w-4" aria-hidden="true" />} title="Grey Markets">
      <div className="grid gap-3" data-testid="crime-panel">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Markets" value={markets.length.toString()} tone={markets.length > 0 ? "warning" : "success"} />
          <MiniStat label="Investigations" value={investigations.length.toString()} tone={investigations.length > 0 ? "danger" : "success"} />
          <MiniStat label="Legality" value={formatPercent(legalRating)} tone={legalRating < 0.5 ? "danger" : legalRating < 0.75 ? "warning" : "success"} />
        </div>

        {markets.length > 0 ? (
          <div className="grid gap-2">
            <select
              className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
              onChange={(event) => onMarketChange(event.target.value)}
              value={selectedBlackMarketId ?? markets[0]?.id ?? ""}
            >
              {markets.slice(0, 20).map((market) => {
                const marketProduct = products.find((candidate) => candidate.id === market.productId);
                const marketCity = cities.find((candidate) => candidate.id === market.cityId);

                return (
                  <option key={market.id} value={market.id}>
                    {marketProduct?.name ?? market.productId} / {marketCity?.name ?? market.cityId}
                  </option>
                );
              })}
            </select>

            {selectedMarket ? (
              <article className="rounded-md border border-amber-400/30 bg-amber-950/20 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-50">{product?.name ?? selectedMarket.productId}</h3>
                    <p className="text-xs text-stone-400">{city?.name ?? selectedMarket.cityId} / trigger {selectedMarket.trigger}</p>
                  </div>
                  <span className="text-xs font-bold text-economy-gold">x{selectedMarket.priceMultiplier.toFixed(2)}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <MiniStat label="Demand" value={formatCompactNumber(selectedMarket.demandQuantity)} />
                  <MiniStat label="Supply" value={formatCompactNumber(selectedMarket.supplyQuantity)} />
                  <MiniStat label="Risk" value={formatPercent(selectedMarket.riskLevel)} tone={selectedMarket.riskLevel > 0.45 ? "danger" : "warning"} />
                </div>
              </article>
            ) : null}

            <form className="grid gap-2 rounded-md border border-[#344239] bg-black/20 p-2" onSubmit={onSubmit}>
              <SubPanelTitle icon={<BadgeDollarSign className="h-4 w-4" aria-hidden="true" />} title="Risky deal" />
              <div className="rounded-md border border-amber-500/30 bg-amber-950/25 p-2 text-xs leading-5 text-amber-100">
                Detection can trigger fines, confiscation, reputation loss, and activity bans in later phases.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
                  min={1}
                  onChange={(event) => onQuantityChange(event.target.value)}
                  type="number"
                  value={quantity}
                />
                <input
                  className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
                  min={0}
                  onChange={(event) => onBribeChange(event.target.value)}
                  type="number"
                  value={bribeMinor}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="Seller" value={seller?.name ?? "none"} tone={seller ? "success" : "danger"} />
                <MiniStat label="Route" value={route ? route.mode : "direct"} tone={route ? "warning" : "danger"} />
              </div>
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-amber-400/70 bg-amber-400 px-3 text-sm font-bold text-[#17110a] transition hover:bg-amber-300 disabled:opacity-60"
                disabled={isCreatingIllegalTrade || !selectedMarket || !seller}
                type="submit"
              >
                {isCreatingIllegalTrade ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldAlert className="h-4 w-4" aria-hidden="true" />}
                Queue trade
              </button>
            </form>
          </div>
        ) : (
          <EmptyState>Grey markets appear after bans, shortage, high taxes, sanctions, war, or corruption.</EmptyState>
        )}

        <SubPanelTitle icon={<Scale className="h-4 w-4" aria-hidden="true" />} title="Enforcement" />
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Fines" value={formatMoneyMinor(fines.reduce((total, fine) => total + fine.amountMinor, 0))} tone={fines.length > 0 ? "danger" : "success"} />
          <MiniStat label="Confiscations" value={confiscations.length.toString()} tone={confiscations.length > 0 ? "danger" : "success"} />
          <MiniStat label="Trades" value={trades.length.toString()} tone={trades.length > 0 ? "warning" : "success"} />
        </div>

        {trades.length > 0 ? (
          <div className="grid max-h-40 gap-2 overflow-auto pr-1">
            {[...trades].reverse().slice(0, 4).map((trade) => {
              const tradeProduct = products.find((candidate) => candidate.id === trade.productId);
              const tradeCompany = companies.find((company) => company.id === trade.sellerCompanyId);

              return (
                <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={trade.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-stone-50">{tradeProduct?.name ?? trade.productId}</span>
                    <span className={illegalTradeStatusClass(trade.status)}>{trade.status}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-stone-400">{tradeCompany?.name ?? trade.sellerCompanyId}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <MiniStat label="Qty" value={formatCompactNumber(trade.quantity)} />
                    <MiniStat label="Risk" value={formatPercent(trade.detectionRisk)} tone={trade.detectionRisk > 0.45 ? "danger" : "warning"} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {crimeNews.length > 0 ? (
          <div className="grid gap-2">
            {crimeNews.map((item) => (
              <p className="rounded-md border border-[#344239] bg-black/20 p-2 text-xs text-stone-300" key={item.id}>
                {item.headline}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function GovernmentPanel({
  data,
  isLobbying,
  isRunningMedia,
  isVoting,
  lobbyingAmountMinor,
  mediaMessage,
  mediaSpendMinor,
  onLobbyingAmountChange,
  onMediaMessageChange,
  onMediaSpendChange,
  onRunMediaCampaign,
  onSelectParty,
  onSubmitLobbying,
  onVote,
  selectedCountryId,
  selectedPartyId
}: {
  readonly data: GameData | null;
  readonly isLobbying: boolean;
  readonly isRunningMedia: boolean;
  readonly isVoting: boolean;
  readonly lobbyingAmountMinor: string;
  readonly mediaMessage: string;
  readonly mediaSpendMinor: string;
  readonly selectedCountryId: string | null;
  readonly selectedPartyId: string | null;
  readonly onLobbyingAmountChange: (value: string) => void;
  readonly onMediaMessageChange: (value: string) => void;
  readonly onMediaSpendChange: (value: string) => void;
  readonly onRunMediaCampaign: (event: FormEvent<HTMLFormElement>) => void;
  readonly onSelectParty: (partyId: string) => void;
  readonly onSubmitLobbying: (event: FormEvent<HTMLFormElement>) => void;
  readonly onVote: () => void;
}) {
  const countryId = selectedCountryId ?? data?.world.countries[0]?.id ?? null;
  const government = data?.governments.governments.find((item) => item.countryId === countryId) ?? null;
  const parties = data?.governments.parties.filter((party) => party.countryId === countryId) ?? [];
  const election = data?.governments.elections.find((item) => item.countryId === countryId && item.status === "active") ?? null;
  const laws = data?.governments.laws.filter((law) => law.countryId === countryId) ?? [];
  const budget =
    [...(data?.world.governmentBudgets ?? [])].filter((item) => item.countryId === countryId).sort((left, right) => right.tick - left.tick)[0] ??
    null;
  const taxPolicy = data?.world.taxPolicies.find((policy) => policy.countryId === countryId) ?? null;
  const protests = data?.governments.protests.filter((protest) => protest.countryId === countryId && protest.status === "active") ?? [];
  const politicalNews = (data?.news ?? [])
    .filter((item) => item.headline.toLowerCase().includes("government") || item.headline.toLowerCase().includes("law"))
    .sort((left, right) => right.tick - left.tick)
    .slice(0, 3);

  return (
    <Panel icon={<Landmark className="h-4 w-4" aria-hidden="true" />} title="Government">
      {government ? (
        <div className="grid gap-3" data-testid="government-panel">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Stability" value={formatPercent(government.stabilityRating)} tone={government.stabilityRating < 0.5 ? "danger" : "success"} />
            <MiniStat label="Legitimacy" value={formatPercent(government.legitimacy)} />
            <MiniStat label="Corruption" value={formatPercent(government.corruptionLevel)} tone={government.corruptionLevel > 0.35 ? "warning" : "success"} />
          </div>

          <SubPanelTitle icon={<ScrollText className="h-4 w-4" aria-hidden="true" />} title="Laws and Taxes" />
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Profit" value={formatPercent(taxPolicy?.profitTaxRate ?? 0)} />
            <MiniStat label="Sales" value={formatPercent(taxPolicy?.salesTaxRate ?? 0)} />
            <MiniStat label="Tariff" value={formatPercent(taxPolicy?.importTariffRate ?? 0)} />
          </div>
          <div className="grid max-h-36 gap-2 overflow-auto pr-1">
            {laws.slice(0, 5).map((law) => (
              <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={law.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-stone-50">{law.name}</span>
                  <span className={lawStatusClass(law.status)}>{law.status}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <MiniStat label="Support" value={formatPercent(law.support)} />
                  <MiniStat label="Impact" value={formatSignedPercent(law.economicImpact)} tone={law.economicImpact < 0 ? "warning" : "success"} />
                </div>
              </article>
            ))}
          </div>

          <SubPanelTitle icon={<Banknote className="h-4 w-4" aria-hidden="true" />} title="Budget" />
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Treasury" value={formatMoneyMinor(budget?.treasuryMinor ?? 0)} />
            <MiniStat label="Revenue" value={formatMoneyMinor(budget?.revenueMinor ?? 0)} />
            <MiniStat label="Spending" value={formatMoneyMinor(budget?.spendingMinor ?? 0)} />
          </div>

          <SubPanelTitle icon={<Users className="h-4 w-4" aria-hidden="true" />} title="Parties and Election" />
          <div className="grid gap-2">
            <select
              className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-sm text-stone-50 outline-none transition focus:border-economy-gold"
              onChange={(event) => onSelectParty(event.target.value)}
              value={selectedPartyId ?? parties[0]?.id ?? ""}
            >
              {parties.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.name}
                </option>
              ))}
            </select>
            {parties.slice(0, 3).map((party) => {
              const result = election?.results.find((item) => item.partyId === party.id);

              return (
                <div className="rounded-md border border-[#344239] bg-black/25 p-2" key={party.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-stone-50">{party.name}</span>
                    <span className="text-xs font-bold text-economy-teal">{formatPercent(party.popularity)}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <MiniStat label="NPC votes" value={formatCompactNumber(result?.npcVotes ?? 0)} />
                    <MiniStat label="Player votes" value={formatCompactNumber(result?.playerVotes ?? 0)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-2">
            <form className="grid grid-cols-[1fr_auto] gap-2" onSubmit={onSubmitLobbying}>
              <input
                className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-sm text-stone-50 outline-none transition focus:border-economy-gold"
                min={1}
                onChange={(event) => onLobbyingAmountChange(event.target.value)}
                type="number"
                value={lobbyingAmountMinor}
              />
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-economy-gold/70 bg-economy-gold px-3 text-sm font-bold text-[#17110a] transition hover:bg-[#efc46c] disabled:opacity-60"
                disabled={isLobbying}
                type="submit"
              >
                {isLobbying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Landmark className="h-4 w-4" aria-hidden="true" />}
                Lobby
              </button>
            </form>
            <form className="grid gap-2" onSubmit={onRunMediaCampaign}>
              <input
                className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-sm text-stone-50 outline-none transition focus:border-economy-gold"
                onChange={(event) => onMediaMessageChange(event.target.value)}
                type="text"
                value={mediaMessage}
              />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-sm text-stone-50 outline-none transition focus:border-economy-gold"
                  min={1}
                  onChange={(event) => onMediaSpendChange(event.target.value)}
                  type="number"
                  value={mediaSpendMinor}
                />
                <button
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-economy-teal/70 bg-economy-teal px-3 text-sm font-bold text-[#06110f] transition hover:bg-[#6bcbbb] disabled:opacity-60"
                  disabled={isRunningMedia}
                  type="submit"
                >
                  {isRunningMedia ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Megaphone className="h-4 w-4" aria-hidden="true" />}
                  Media
                </button>
              </div>
            </form>
            <button
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-[#344239] bg-black/30 px-3 text-sm font-bold text-stone-100 transition hover:border-economy-gold disabled:opacity-60"
              disabled={isVoting || parties.length === 0}
              onClick={onVote}
              type="button"
            >
              {isVoting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Vote className="h-4 w-4" aria-hidden="true" />}
              Vote
            </button>
          </div>

          {protests.length > 0 ? (
            <div className="grid gap-2">
              {protests.map((protest) => (
                <div className="rounded-md border border-rose-500/40 bg-rose-950/25 p-2 text-xs text-rose-100" key={protest.id}>
                  {protest.reason} / intensity {formatPercent(protest.intensity)}
                </div>
              ))}
            </div>
          ) : null}

          {politicalNews.length > 0 ? (
            <div className="grid gap-2">
              {politicalNews.map((item) => (
                <p className="rounded-md border border-[#344239] bg-black/20 p-2 text-xs text-stone-300" key={item.id}>
                  {item.headline}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState>No government data loaded.</EmptyState>
      )}
    </Panel>
  );
}

function FinancePanel({
  data,
  isApplyingLoan,
  isPlacingOrder,
  loanAmountMinor,
  orderPriceMinor,
  orderQuantity,
  selectedLoanCompanyId,
  onApplyForLoan,
  onLoanAmountChange,
  onOrderPriceChange,
  onOrderQuantityChange,
  onPlaceOrder,
  onSelectLoanCompany
}: {
  readonly data: GameData | null;
  readonly isApplyingLoan: boolean;
  readonly isPlacingOrder: boolean;
  readonly loanAmountMinor: string;
  readonly orderPriceMinor: string;
  readonly orderQuantity: string;
  readonly selectedLoanCompanyId: string | null;
  readonly onApplyForLoan: (event: FormEvent<HTMLFormElement>) => void;
  readonly onLoanAmountChange: (value: string) => void;
  readonly onOrderPriceChange: (value: string) => void;
  readonly onOrderQuantityChange: (value: string) => void;
  readonly onPlaceOrder: (event: FormEvent<HTMLFormElement>) => void;
  readonly onSelectLoanCompany: (companyId: string) => void;
}) {
  const centralBank = data?.banks.centralBanks[0] ?? null;
  const bank = data?.banks.commercialBanks[0] ?? null;
  const companies = data?.world.companies.filter((company) => company.legalStatus === "registered") ?? [];
  const activeLoans = data?.loans.filter((loan) => loan.status === "active" || loan.status === "restructured") ?? [];
  const orderBook = data?.exchanges.orderBooks.find((book) => book.assetType === "stock") ?? data?.exchanges.orderBooks[0] ?? null;
  const bestBid = orderBook?.bids.filter((order) => order.status !== "filled").sort((left, right) => right.priceMinor - left.priceMinor)[0] ?? null;
  const bestAsk = orderBook?.asks.filter((order) => order.status !== "filled").sort((left, right) => left.priceMinor - right.priceMinor)[0] ?? null;
  const portfolioCash = data?.portfolio.accounts.reduce((total, account) => total + Math.max(0, account.balanceMinor - account.reservedMinor), 0) ?? 0;
  const financeNews =
    data?.news
      .filter((item) => /bank|loan|credit|exchange|auction|банк|кредит/i.test(`${item.headline} ${item.body}`))
      .sort((left, right) => right.tick - left.tick)
      .slice(0, 3) ?? [];

  return (
    <Panel icon={<Banknote className="h-4 w-4" aria-hidden="true" />} title="Banking & Finance">
      <div className="grid gap-3" data-testid="finance-panel">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Base money" value={formatMoneyMinor(centralBank?.baseMoneyMinor ?? 0, centralBank?.currencyCode ?? "NCR")} />
          <MiniStat label="Loans" value={activeLoans.length.toString()} tone={activeLoans.length > 0 ? "warning" : "success"} />
          <MiniStat label="Cash" value={formatMoneyMinor(portfolioCash, "NCR")} />
        </div>

        {bank ? (
          <article className="rounded-md border border-[#344239] bg-black/25 p-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-stone-50">{bank.name}</h3>
                <p className="text-xs text-stone-400">reserve {formatPercent(bank.reserveRatio)} / risk {formatPercent(bank.riskRating)}</p>
              </div>
              <span className={bank.solvent ? "text-xs font-bold text-economy-teal" : "text-xs font-bold text-rose-300"}>
                {bank.solvent ? "solvent" : "failed"}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <MiniStat label="Capital" value={formatMoneyMinor(bank.capitalMinor, bank.currencyCode)} />
              <MiniStat label="Reserves" value={formatMoneyMinor(bank.reservesMinor, bank.currencyCode)} />
              <MiniStat label="Loan book" value={formatMoneyMinor(bank.loanBookMinor, bank.currencyCode)} />
            </div>
          </article>
        ) : (
          <EmptyState>No commercial bank loaded.</EmptyState>
        )}

        <form className="grid gap-2 rounded-md border border-[#344239] bg-black/20 p-2" onSubmit={onApplyForLoan}>
          <SubPanelTitle icon={<Landmark className="h-4 w-4" aria-hidden="true" />} title="Loan application" />
          <select
            className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
            onChange={(event) => onSelectLoanCompany(event.target.value)}
            value={selectedLoanCompanyId ?? companies[0]?.id ?? ""}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <input
            className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
            min={1}
            onChange={(event) => onLoanAmountChange(event.target.value)}
            type="number"
            value={loanAmountMinor}
          />
          <button
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-economy-teal/70 bg-economy-teal px-3 text-sm font-bold text-[#06110f] transition hover:bg-[#6bcbbb] disabled:opacity-60"
            disabled={isApplyingLoan || !bank || companies.length === 0}
            type="submit"
          >
            {isApplyingLoan ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Banknote className="h-4 w-4" aria-hidden="true" />}
            Apply
          </button>
        </form>

        <SubPanelTitle icon={<ChartCandlestick className="h-4 w-4" aria-hidden="true" />} title="Exchange order book" />
        {orderBook ? (
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="Best bid" value={formatMoneyMinor(bestBid?.priceMinor ?? 0, "NCR")} />
              <MiniStat label="Best ask" value={formatMoneyMinor(bestAsk?.priceMinor ?? 0, "NCR")} />
              <MiniStat label="Trades" value={(data?.exchanges.trades.length ?? 0).toString()} />
            </div>
            <form className="grid grid-cols-[1fr_1fr_auto] gap-2" onSubmit={onPlaceOrder}>
              <input
                className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
                min={1}
                onChange={(event) => onOrderQuantityChange(event.target.value)}
                type="number"
                value={orderQuantity}
              />
              <input
                className="min-h-9 rounded-md border border-[#344239] bg-[#0d130f] px-2 text-sm text-stone-50 outline-none focus:border-economy-gold"
                min={1}
                onChange={(event) => onOrderPriceChange(event.target.value)}
                type="number"
                value={orderPriceMinor}
              />
              <button
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-economy-gold/70 bg-economy-gold px-3 text-sm font-bold text-[#17110a] transition hover:bg-[#efc46c] disabled:opacity-60"
                disabled={isPlacingOrder}
                type="submit"
              >
                {isPlacingOrder ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ChartCandlestick className="h-4 w-4" aria-hidden="true" />}
                Buy
              </button>
            </form>
          </div>
        ) : (
          <EmptyState>No exchange order book loaded.</EmptyState>
        )}

        <SubPanelTitle icon={<WalletCards className="h-4 w-4" aria-hidden="true" />} title="Portfolio" />
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Positions" value={(data?.portfolio.positions.length ?? 0).toString()} />
          <MiniStat label="Open orders" value={(data?.portfolio.openOrders.length ?? 0).toString()} />
        </div>

        <SubPanelTitle icon={<Scale className="h-4 w-4" aria-hidden="true" />} title="Bankruptcies" />
        {(data?.bankruptcies.cases.length ?? 0) > 0 ? (
          <div className="grid gap-2">
            {data?.bankruptcies.cases.slice(-3).map((item) => (
              <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={item.id}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-stone-50">{item.debtorType}</span>
                  <span className="text-xs font-bold text-economy-gold">{item.status}</span>
                </div>
                <p className="mt-1 text-xs text-stone-400">{item.reason}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>No bankruptcies yet.</EmptyState>
        )}

        {financeNews.length > 0 ? (
          <div className="grid gap-2">
            {financeNews.map((item) => (
              <p className="rounded-md border border-[#344239] bg-black/20 p-2 text-xs text-stone-300" key={item.id}>
                {item.headline}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function LogisticsPanel({ data }: { readonly data: GameData | null }) {
  const warehouses = data?.warehouses ?? [];
  const shipments = data?.shipments ?? [];
  const routes = data?.logisticsRoutes ?? [];
  const products = data?.world.products ?? [];
  const cities = data?.world.cities ?? [];
  const companies = data?.transportCompanies ?? [];
  const activeShipmentCount = shipments.filter((shipment) => shipment.status === "in_transit").length;

  return (
    <Panel icon={<Truck className="h-4 w-4" aria-hidden="true" />} title="Logistics">
      <div className="grid gap-3" data-testid="logistics-panel">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Warehouses" value={warehouses.length.toString()} />
          <MiniStat label="Shipments" value={shipments.length.toString()} tone={activeShipmentCount > 0 ? "warning" : "success"} />
          <MiniStat label="Routes" value={routes.length.toString()} />
        </div>

        <SubPanelTitle icon={<WarehouseIcon className="h-4 w-4" aria-hidden="true" />} title="Warehouses" />
        <div className="grid max-h-44 gap-2 overflow-auto pr-1">
          {warehouses.slice(0, 5).map((warehouse) => {
            const city = cities.find((candidate) => candidate.id === warehouse.cityId);
            const stock = (data?.world.inventoryLots ?? [])
              .filter((lot) => lot.warehouseId === warehouse.id)
              .reduce((total, lot) => total + lot.quantity, 0);

            return (
              <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={warehouse.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-stone-50">{warehouse.name}</h3>
                    <p className="text-xs text-stone-400">{city?.name ?? warehouse.cityId} / {warehouse.warehouseType}</p>
                  </div>
                  <span className="text-xs font-bold text-economy-teal">{formatCompactNumber(stock)}</span>
                </div>
              </article>
            );
          })}
        </div>

        <SubPanelTitle icon={<Route className="h-4 w-4" aria-hidden="true" />} title="Shipments" />
        {shipments.length > 0 ? (
          <div className="grid max-h-56 gap-2 overflow-auto pr-1">
            {[...shipments].reverse().slice(0, 5).map((shipment) => {
              const route = routes.find((candidate) => candidate.id === shipment.routeId);
              const product = products.find((candidate) => candidate.id === shipment.productId);
              const company = companies.find((candidate) => candidate.id === shipment.transportCompanyId);

              return (
                <article className="rounded-md border border-[#344239] bg-black/25 p-2" key={shipment.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-stone-50">{product?.name ?? shipment.productId}</h3>
                      <p className="text-xs text-stone-400">{route?.name ?? shipment.routeId}</p>
                      <p className="text-xs text-stone-500">{company?.name ?? shipment.transportCompanyId}</p>
                    </div>
                    <span className={shipmentStatusClass(shipment.status)}>{shipment.status}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <MiniStat label="Cost" value={formatMoneyMinor(shipment.costMinor)} />
                    <MiniStat label="ETA" value={`${shipment.remainingTicks}/${shipment.durationTicks}`} />
                    <MiniStat label="Risk" value={formatPercent(shipment.risk)} tone={shipment.risk > 0.4 ? "warning" : "success"} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState>No shipments yet.</EmptyState>
        )}
      </div>
    </Panel>
  );
}

function CreateCompanyPanel({
  companyName,
  countries,
  isBusy,
  onCountryChange,
  onNameChange,
  onSubmit,
  selectedCountryId
}: {
  readonly companyName: string;
  readonly countries: readonly Country[];
  readonly isBusy: boolean;
  readonly onCountryChange: (countryId: string) => void;
  readonly onNameChange: (name: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly selectedCountryId: string | null;
}) {
  return (
    <Panel icon={<Plus className="h-4 w-4" aria-hidden="true" />} title="Создание компании">
      <form className="grid gap-3" data-testid="company-form" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm text-stone-300">
          Страна
          <select
            className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition focus:border-economy-gold"
            onChange={(event) => onCountryChange(event.target.value)}
            value={selectedCountryId ?? ""}
          >
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-stone-300">
          Название
          <input
            className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition placeholder:text-stone-600 focus:border-economy-gold"
            minLength={2}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Nova Foods"
            type="text"
            value={companyName}
          />
        </label>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-economy-teal/70 bg-economy-teal px-3 text-sm font-bold text-[#06110f] transition hover:bg-[#6bcbbb] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          Зарегистрировать
        </button>
      </form>
    </Panel>
  );
}

function OperationsPanel({
  data,
  isPurchasingLand,
  isPurchasingResource,
  isRunningProduction,
  isUpdatingRetailPrice,
  maxUnitPriceMinor,
  onCompanyChange,
  onMaxUnitPriceChange,
  onProductionQuantityChange,
  onPurchaseLand,
  onRetailPriceChange,
  onResourceOfferChange,
  onResourceQuantityChange,
  onRunProduction,
  onSetRetailPrice,
  onSubmitPurchase,
  productionQuantity,
  retailPriceMinor,
  resourceQuantity,
  selectedCompanyId,
  selectedResourceOfferId
}: {
  readonly data: GameData | null;
  readonly isPurchasingLand: boolean;
  readonly isPurchasingResource: boolean;
  readonly isRunningProduction: boolean;
  readonly isUpdatingRetailPrice: boolean;
  readonly maxUnitPriceMinor: string;
  readonly onCompanyChange: (companyId: string) => void;
  readonly onMaxUnitPriceChange: (value: string) => void;
  readonly onProductionQuantityChange: (value: string) => void;
  readonly onPurchaseLand: (event: FormEvent<HTMLFormElement>) => void;
  readonly onRetailPriceChange: (value: string) => void;
  readonly onResourceOfferChange: (offerId: string) => void;
  readonly onResourceQuantityChange: (value: string) => void;
  readonly onRunProduction: (event: FormEvent<HTMLFormElement>) => void;
  readonly onSetRetailPrice: (event: FormEvent<HTMLFormElement>) => void;
  readonly onSubmitPurchase: (event: FormEvent<HTMLFormElement>) => void;
  readonly productionQuantity: string;
  readonly retailPriceMinor: string;
  readonly resourceQuantity: string;
  readonly selectedCompanyId: string | null;
  readonly selectedResourceOfferId: string | null;
}) {
  const companies = data ? getPlayerCompanies(data.world.companies) : [];
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId) ?? companies[0] ?? null;
  const companyWarehouses = data?.warehouses.filter((warehouse) => warehouse.companyId === selectedCompany?.id) ?? [];
  const companyHasPremise = companyWarehouses.length > 0;
  const companyInventory =
    data?.world.inventoryLots
      .filter((lot) => companyWarehouses.some((warehouse) => warehouse.id === lot.warehouseId) && lot.quantity > 0)
      .slice(0, 5) ?? [];
  const productionPlans = data?.world.productionPlans.filter((plan) => plan.companyId === selectedCompany?.id) ?? [];
  const productionPlan = productionPlans[0] ?? null;
  const outputProduct = data?.world.products.find((product) => product.id === productionPlan?.outputProductId) ?? null;
  const playerRetailOffer =
    data?.retailOffers.find((offer) => offer.companyId === selectedCompany?.id && offer.productId === outputProduct?.id && offer.active) ??
    data?.retailOffers.find((offer) => offer.companyId === selectedCompany?.id && offer.active) ??
    null;
  const lastPriceChange =
    data?.retailPriceChanges
      .filter((change) => change.companyId === selectedCompany?.id)
      .sort((left, right) => right.tick - left.tick)[0] ?? null;
  const retailSales = data?.world.events.filter((event) => event.type === "ProductSoldEvent" && event.entityIds.includes(selectedCompany?.id ?? "")) ?? [];
  const retailRevenueMinor =
    data?.world.financialTransactions
      .filter((transaction) => transaction.type === "RetailSaleTransaction")
      .flatMap((transaction) => transaction.entries)
      .filter((entry) => entry.ownerType === "company" && entry.ownerId === selectedCompany?.id && entry.amountMinor > 0)
      .reduce((total, entry) => total + entry.amountMinor, 0) ?? 0;
  const selectedOffer = data?.resourceOffers.find((offer) => offer.id === selectedResourceOfferId) ?? data?.resourceOffers[0] ?? null;
  const lastPurchase = data?.resourcePurchases.at(-1) ?? null;
  const lastRun = data?.productionRuns.at(-1) ?? null;

  return (
    <Panel icon={<Factory className="h-4 w-4" aria-hidden="true" />} title="Player Operations">
      <div className="grid gap-3" data-testid="operations-panel">
        {companies.length > 0 ? (
          <>
            <label className="grid gap-1 text-sm text-stone-300">
              Company
              <select
                aria-label="Select player company"
                className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition focus:border-economy-gold"
                onChange={(event) => onCompanyChange(event.target.value)}
                value={selectedCompany?.id ?? ""}
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            {!companyHasPremise ? (
              <form className="grid gap-3 rounded-md border border-economy-gold/50 bg-economy-gold/10 p-3" onSubmit={onPurchaseLand}>
                <SubPanelTitle icon={<WarehouseIcon className="h-4 w-4" aria-hidden="true" />} title="Buy / Lease Premise" />
                <p className="text-sm text-stone-300">Компания зарегистрирована. Следующий command/tick шаг создаст склад, bread production plan, retail offer и базовую лицензию.</p>
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-economy-gold/70 bg-economy-gold px-3 text-sm font-bold text-[#17110a] transition hover:bg-[#efc46c] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isPurchasingLand}
                  type="submit"
                >
                  {isPurchasingLand ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <WarehouseIcon className="h-4 w-4" aria-hidden="true" />}
                  Купить помещение
                </button>
              </form>
            ) : null}

            <div className="grid gap-3 xl:grid-cols-3">
              <form className="grid gap-3 rounded-md border border-[#344239] bg-black/25 p-3" onSubmit={onSubmitPurchase}>
                <SubPanelTitle icon={<PackageSearch className="h-4 w-4" aria-hidden="true" />} title="Buy Resource" />
                {data && data.resourceOffers.length > 0 ? (
                  <>
                    <label className="grid gap-1 text-sm text-stone-300">
                      Offer
                      <select
                        aria-label="Select resource offer"
                        className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition focus:border-economy-gold"
                        onChange={(event) => onResourceOfferChange(event.target.value)}
                        value={selectedOffer?.id ?? ""}
                      >
                        {data.resourceOffers.map((offer) => (
                          <option key={offer.id} value={offer.id}>
                            {offer.productName} / {formatMoneyMinor(offer.unitPriceMinor)} / {formatCompactNumber(offer.availableQuantity)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="grid gap-1 text-sm text-stone-300">
                        Quantity
                        <input
                          className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition focus:border-economy-gold"
                          min={1}
                          onChange={(event) => onResourceQuantityChange(event.target.value)}
                          type="number"
                          value={resourceQuantity}
                        />
                      </label>
                      <label className="grid gap-1 text-sm text-stone-300">
                        Max price
                        <input
                          className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition focus:border-economy-gold"
                          min={1}
                          onChange={(event) => onMaxUnitPriceChange(event.target.value)}
                          type="number"
                          value={maxUnitPriceMinor}
                        />
                      </label>
                    </div>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-economy-gold/70 bg-economy-gold px-3 text-sm font-bold text-[#17110a] transition hover:bg-[#efc46c] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isPurchasingResource || !companyHasPremise}
                      type="submit"
                    >
                      {isPurchasingResource ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShoppingBasket className="h-4 w-4" aria-hidden="true" />}
                      Buy
                    </button>
                  </>
                ) : (
                  <EmptyState>No resource offers available.</EmptyState>
                )}
              </form>

              <form className="grid gap-3 rounded-md border border-[#344239] bg-black/25 p-3" onSubmit={onRunProduction}>
                <SubPanelTitle icon={<Boxes className="h-4 w-4" aria-hidden="true" />} title="Produce" />
                {productionPlan && outputProduct ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <MiniStat label="Recipe" value={outputProduct.name} />
                      <MiniStat label="Limit" value={formatCompactNumber(productionPlan.outputQuantityPerTick)} />
                    </div>
                    <label className="grid gap-1 text-sm text-stone-300">
                      Quantity
                      <input
                        className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition focus:border-economy-gold"
                        min={1}
                        onChange={(event) => onProductionQuantityChange(event.target.value)}
                        type="number"
                        value={productionQuantity}
                      />
                    </label>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-economy-teal/70 bg-economy-teal px-3 text-sm font-bold text-[#06110f] transition hover:bg-[#6bcbbb] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isRunningProduction || !companyHasPremise}
                      type="submit"
                    >
                      {isRunningProduction ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Factory className="h-4 w-4" aria-hidden="true" />}
                      Produce
                    </button>
                  </>
                ) : (
                  <EmptyState>Купите или арендуйте помещение, чтобы открыть starter recipe.</EmptyState>
                )}
              </form>

              <form className="grid gap-3 rounded-md border border-[#344239] bg-black/25 p-3" onSubmit={onSetRetailPrice}>
                <SubPanelTitle icon={<BadgeDollarSign className="h-4 w-4" aria-hidden="true" />} title="Retail Sale" />
                {playerRetailOffer ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <MiniStat label="Offer" value={playerRetailOffer.productName} />
                      <MiniStat label="Stock" value={formatCompactNumber(playerRetailOffer.availableQuantity)} tone={playerRetailOffer.availableQuantity > 0 ? "success" : "warning"} />
                    </div>
                    <label className="grid gap-1 text-sm text-stone-300">
                      Unit price
                      <input
                        aria-label="Retail unit price"
                        className="min-h-10 rounded-md border border-[#344239] bg-[#0d130f] px-3 text-stone-50 outline-none transition focus:border-economy-gold"
                        min={1}
                        onChange={(event) => onRetailPriceChange(event.target.value)}
                        type="number"
                        value={retailPriceMinor}
                      />
                    </label>
                    <button
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-economy-gold/70 bg-economy-gold px-3 text-sm font-bold text-[#17110a] transition hover:bg-[#efc46c] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isUpdatingRetailPrice || !companyHasPremise}
                      type="submit"
                    >
                      {isUpdatingRetailPrice ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <BadgeDollarSign className="h-4 w-4" aria-hidden="true" />}
                      Set Price
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <MiniStat label="Revenue" value={formatMoneyMinor(retailRevenueMinor, playerRetailOffer.currencyCode)} />
                      <MiniStat label="Sales ticks" value={retailSales.length.toString()} tone={retailSales.length > 0 ? "success" : "warning"} />
                    </div>
                  </>
                ) : (
                  <EmptyState>Produce a retail product to unlock price controls.</EmptyState>
                )}
              </form>
            </div>

            <div className="grid gap-2 lg:grid-cols-2">
              <div className="rounded-md border border-[#344239] bg-black/20 p-3">
                <SubPanelTitle icon={<WarehouseIcon className="h-4 w-4" aria-hidden="true" />} title="Inventory" />
                {companyInventory.length > 0 ? (
                  <div className="mt-2 grid gap-1.5">
                    {companyInventory.map((lot) => {
                      const product = data?.world.products.find((candidate) => candidate.id === lot.productId);

                      return (
                        <div className="flex items-center justify-between gap-2 text-xs text-stone-300" key={lot.id}>
                          <span>{product?.name ?? lot.productId}</span>
                          <span className="font-bold text-economy-teal">{formatCompactNumber(lot.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState>Warehouse is empty.</EmptyState>
                )}
              </div>

              <div className="rounded-md border border-[#344239] bg-black/20 p-3">
                <SubPanelTitle icon={<ClipboardCheck className="h-4 w-4" aria-hidden="true" />} title="Last Action" />
                {lastPurchase || lastRun || lastPriceChange ? (
                  <div className="mt-2 grid gap-2 text-xs text-stone-300">
                    {lastPurchase ? <p>Purchase: {formatCompactNumber(lastPurchase.quantity)} units for {formatMoneyMinor(lastPurchase.totalPriceMinor)}.</p> : null}
                    {lastRun ? <p>Production: {formatCompactNumber(lastRun.producedQuantity)} units completed.</p> : null}
                    {lastPriceChange ? (
                      <p>
                        Price: {formatMoneyMinor(lastPriceChange.oldPriceMinor, lastPriceChange.currencyCode)} to{" "}
                        {formatMoneyMinor(lastPriceChange.newPriceMinor, lastPriceChange.currencyCode)}.
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <EmptyState>No player operations yet.</EmptyState>
                )}
              </div>
            </div>
          </>
        ) : (
          <EmptyState>Сначала создайте компанию. После регистрации отдельный command/tick шаг покупает или арендует помещение.</EmptyState>
        )}
      </div>
    </Panel>
  );
}

function MarketPanel({
  market,
  markets,
  onSelectMarket
}: {
  readonly market: MarketDto | null;
  readonly markets: readonly MarketDto[];
  readonly onSelectMarket: (marketId: string) => void;
}) {
  return (
    <Panel icon={<ShoppingBasket className="h-4 w-4" aria-hidden="true" />} title="Панель рынка">
      {markets.length > 0 ? (
        <div className="grid gap-3" data-testid="market-panel">
          <div className="grid grid-cols-2 gap-2">
            {markets.map((candidate) => (
              <button
                className={`rounded-md border px-2 py-2 text-left text-xs font-semibold transition ${
                  market?.id === candidate.id
                    ? "border-economy-gold bg-economy-gold text-[#17110a]"
                    : "border-[#344239] bg-black/25 text-stone-200 hover:border-economy-teal"
                }`}
                key={candidate.id}
                onClick={() => onSelectMarket(candidate.id)}
                type="button"
              >
                {labelNeed(candidate.needCategory)}
              </button>
            ))}
          </div>

          {market ? (
            <div className="grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Предложений" value={market.offerCount.toString()} />
                <MiniStat label="Остаток" value={formatCompactNumber(market.availableQuantity)} tone={getMarketTone(market)} />
                <MiniStat label="Средняя цена" value={formatMoneyMinor(market.averagePriceMinor)} />
              </div>
              <div className="grid gap-2">
                {market.offers.map((offer) => (
                  <article className="rounded-md border border-[#344239] bg-black/25 p-3" key={offer.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-stone-50">{offer.productName}</h3>
                        <p className="text-xs text-stone-400">{offer.companyName}</p>
                      </div>
                      <span className="text-sm font-bold text-economy-gold">{formatMoneyMinor(offer.priceMinor)}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-stone-300">
                      <span>Качество {formatPercent(offer.quality)}</span>
                      <span>Доступно {formatCompactNumber(offer.availableQuantity)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState>Рынки пока пусты.</EmptyState>
      )}
    </Panel>
  );
}

function AnalyticsPanel({
  data,
  selectedCountryId,
  selectedMarket
}: {
  readonly data: GameData | null;
  readonly selectedCountryId: string | null;
  readonly selectedMarket: MarketDto | null;
}) {
  const selectedProductId = selectedMarket?.productIds[0] ?? data?.world.products[0]?.id ?? null;
  const selectedProduct = data?.world.products.find((product) => product.id === selectedProductId) ?? null;
  const explanation =
    data?.explanations
      .filter((candidate) => candidate.targetType === "price" && (!selectedProductId || candidate.targetId === selectedProductId))
      .sort((left, right) => right.tick - left.tick)[0] ??
    data?.explanations.filter((candidate) => candidate.targetType === "price").sort((left, right) => right.tick - left.tick)[0] ??
    null;
  const countryId = selectedCountryId ?? data?.world.countries[0]?.id ?? null;
  const reliability = data?.world.dataReliability.find((candidate) => candidate.countryId === countryId) ?? data?.world.dataReliability[0] ?? null;
  const countryStatistics = data?.world.publicStatistics.filter((statistic) => statistic.countryId === countryId) ?? [];
  const latestInflation = latestPublicStatistic(countryStatistics, "inflation.rate");
  const latestUnemployment = latestPublicStatistic(countryStatistics, "unemployment.rate");
  const latestRisk = latestPublicStatistic(countryStatistics, "logistics.risk");
  const forecasts =
    data?.forecasts
      .filter(
        (forecast) =>
          forecast.targetId === selectedProductId ||
          forecast.targetId === countryId ||
          (forecast.targetType === "logistics" && forecast.targetId === countryId)
      )
      .sort((left, right) => right.tick - left.tick)
      .slice(0, 3) ?? [];
  const priceSeries = buildUiPriceSeries(data, selectedProduct?.needCategory ?? selectedMarket?.needCategory ?? "food");
  const categoryCounts = countNewsCategories(data?.news ?? []);

  return (
    <Panel icon={<ChartCandlestick className="h-4 w-4" aria-hidden="true" />} title="Analytics">
      {data ? (
        <div className="grid gap-3" data-testid="analytics-panel">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat
              label="Inflation"
              value={latestInflation ? formatPercent(latestInflation.value) : "-"}
              tone={latestInflation && latestInflation.value > 0.08 ? "warning" : "success"}
            />
            <MiniStat
              label="Unemployment"
              value={latestUnemployment ? formatPercent(latestUnemployment.value) : "-"}
              tone={latestUnemployment && latestUnemployment.value > 0.18 ? "warning" : "success"}
            />
            <MiniStat
              label="Reliability"
              value={reliability ? `${Math.round(reliability.score * 100)}%` : "-"}
              tone={reliability && reliability.grade === "manipulated" ? "danger" : reliability && reliability.score < 0.55 ? "warning" : "success"}
            />
          </div>

          <div className="rounded-md border border-[#344239] bg-black/25 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-stone-50">{selectedProduct?.name ?? selectedMarket?.needCategory ?? "Market"} price</h3>
              {reliability ? <span className={reliabilityClass(reliability.grade)}>{reliability.grade}</span> : null}
            </div>
            <MiniLineChart points={priceSeries} />
          </div>

          {explanation ? (
            <div className="grid gap-2 rounded-md border border-[#344239] bg-black/25 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-stone-50">{explanation.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-stone-400">{explanation.summary}</p>
                </div>
                <span className="text-xs font-bold text-economy-teal">{formatPercent(explanation.confidence)}</span>
              </div>
              <div className="grid gap-1.5">
                {explanation.causes.map((cause) => (
                  <div className="grid gap-1" key={`${explanation.id}-${cause.label}`}>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-stone-400">
                      <span>{cause.label}</span>
                      <span>{formatPercent(cause.weight)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#243029]">
                      <div className="h-full rounded-full bg-economy-gold" style={{ width: `${Math.max(3, cause.weight * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState>Price explanations will appear after the next simulated tick.</EmptyState>
          )}

          <div className="grid gap-2">
            <SubPanelTitle icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />} title="Forecasts" />
            {forecasts.length > 0 ? (
              forecasts.map((forecast) => (
                <div className="rounded-md border border-[#344239] bg-black/25 p-2" key={forecast.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-stone-200">{forecast.metricName}</span>
                    <span className="text-xs font-bold text-economy-teal">{formatPercent(forecast.confidence)}</span>
                  </div>
                  <div className="mt-1 text-xs text-stone-400">
                    {formatCompactNumber(forecast.currentValue)} → {formatCompactNumber(forecast.predictedValue)} / {forecast.horizonTicks} ticks
                  </div>
                </div>
              ))
            ) : (
              <EmptyState>No forecasts yet.</EmptyState>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Logistics risk" value={latestRisk ? formatPercent(latestRisk.value) : "-"} tone={latestRisk && latestRisk.value > 0.4 ? "warning" : "success"} />
            <MiniStat label="News cats" value={Object.keys(categoryCounts).length.toString()} />
            <MiniStat label="Manipulation" value={reliability ? formatPercent(reliability.manipulationRisk) : "-"} tone={reliability && reliability.manipulationRisk > 0.5 ? "danger" : "success"} />
          </div>
        </div>
      ) : (
        <EmptyState>Analytics loading.</EmptyState>
      )}
    </Panel>
  );
}

function NewsFeed({ items }: { readonly items: readonly NewsItem[] }) {
  const visibleItems = [...items].sort((left, right) => right.tick - left.tick).slice(0, 8);

  return (
    <Panel icon={<Newspaper className="h-4 w-4" aria-hidden="true" />} title="Лента новостей">
      {visibleItems.length > 0 ? (
        <div className="grid gap-2" data-testid="news-feed">
          {visibleItems.map((item) => (
            <article className="rounded-md border border-[#344239] bg-black/25 p-3" key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-stone-50">{item.headline}</h3>
                <div className="flex flex-none flex-col items-end gap-1">
                  <span className={severityClass(item.severity)}>{item.severity}</span>
                  <span className="rounded bg-stone-500/15 px-2 py-1 text-[10px] font-bold uppercase text-stone-300">
                    {item.category ?? "economic"}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm leading-5 text-stone-300">{item.body}</p>
              <p className="mt-2 text-xs text-stone-500">tick {item.tick}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Новостей пока нет. Следующий тик оживит рынок.</EmptyState>
      )}
    </Panel>
  );
}

function MetricsPanel({ data }: { readonly data: GameData | null }) {
  const latestMetrics = [...(data?.metrics ?? [])].sort((left, right) => right.tick - left.tick).slice(0, 4);

  return (
    <Panel icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />} title="Метрики мира">
      {data ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Население" value={formatCompactNumber(data.summary.populationTotal)} />
            <MiniStat label="Товары" value={data.summary.products.toString()} />
            <MiniStat label="Спрос" value={data.summary.demandRecords.toString()} />
          </div>
          <div className="grid gap-2 text-xs text-stone-300">
            {latestMetrics.map((metric) => (
              <div className="flex items-center justify-between gap-2 rounded-md border border-[#344239] bg-black/25 px-3 py-2" key={metric.id}>
                <span className="truncate">{metric.name}</span>
                <span className="font-semibold text-economy-teal">{formatCompactNumber(metric.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState>Метрики загружаются.</EmptyState>
      )}
    </Panel>
  );
}

function Panel({ children, icon, title }: { readonly children: ReactNode; readonly icon: ReactNode; readonly title: string }) {
  return (
    <section className="rounded-lg border border-economy-line bg-[#151914]/95 p-3 shadow-xl">
      <div className="mb-3 flex items-center gap-2 border-b border-[#2d372f] pb-2 text-sm font-bold uppercase tracking-wide text-stone-300">
        <span className="text-economy-gold">{icon}</span>
        {title}
      </div>
      {children}
    </section>
  );
}

function HudStat({ icon, label, value }: { readonly icon: ReactNode; readonly label: string; readonly value: string }) {
  return (
    <div className="flex min-h-11 items-center gap-2 rounded-md border border-[#344239] bg-black/25 px-3">
      <span className="text-economy-teal">{icon}</span>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-stone-500">{label}</div>
        <div className="text-sm font-bold text-stone-50">{value}</div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  tone = "success",
  value
}: {
  readonly label: string;
  readonly tone?: "success" | "warning" | "danger";
  readonly value: string;
}) {
  const toneClass = {
    success: "text-economy-teal",
    warning: "text-economy-gold",
    danger: "text-rose-300"
  }[tone];

  return (
    <div className="min-w-0 rounded-md border border-[#344239] bg-black/25 p-2">
      <div className="truncate text-[11px] uppercase tracking-wide text-stone-500">{label}</div>
      <div className={`mt-1 truncate text-sm font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function MapLegend({ icon, label, value }: { readonly icon: ReactNode; readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-[#344239] bg-black/55 px-3 py-2">
      <span className="text-economy-gold">{icon}</span>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-stone-500">{label}</div>
        <div className="text-sm font-semibold text-stone-50">{value}</div>
      </div>
    </div>
  );
}

function MapLayerIcon({ layerId }: { readonly layerId: MapLayerId }) {
  const className = "h-4 w-4 flex-none";

  if (layerId === "economy") {
    return <CircleDollarSign className={className} aria-hidden="true" />;
  }

  if (layerId === "infrastructure") {
    return <Network className={className} aria-hidden="true" />;
  }

  if (layerId === "logistics") {
    return <Route className={className} aria-hidden="true" />;
  }

  if (layerId === "resources") {
    return <Pickaxe className={className} aria-hidden="true" />;
  }

  if (layerId === "war") {
    return <Swords className={className} aria-hidden="true" />;
  }

  return <Leaf className={className} aria-hidden="true" />;
}

function StatusBadge({
  label,
  tone
}: {
  readonly label: string;
  readonly tone: "danger" | "success" | "warning";
}) {
  return <span className={`rounded px-2 py-1 text-[11px] font-bold uppercase ${statusBadgeClass(tone)}`}>{label}</span>;
}

function statusBadgeClass(tone: "danger" | "success" | "warning"): string {
  return {
    danger: "bg-rose-500/20 text-rose-200",
    success: "bg-economy-teal/15 text-economy-teal",
    warning: "bg-economy-gold/15 text-economy-gold"
  }[tone];
}

function statusSurfaceClass(tone: "danger" | "neutral" | "success" | "warning"): string {
  return {
    danger: "border-rose-400/35 bg-rose-950/20",
    neutral: "border-[#344239] bg-black/25",
    success: "border-economy-teal/35 bg-economy-teal/10",
    warning: "border-economy-gold/35 bg-economy-gold/10"
  }[tone];
}

function statusTextClass(tone: "danger" | "neutral" | "success" | "warning"): string {
  return {
    danger: "text-rose-300",
    neutral: "text-stone-300",
    success: "text-economy-teal",
    warning: "text-economy-gold"
  }[tone];
}

function SubPanelTitle({ icon, title }: { readonly icon: ReactNode; readonly title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-400">
      <span className="text-economy-gold">{icon}</span>
      {title}
    </div>
  );
}

function ApiErrorBanner({ message, onRetry }: { readonly message: string; readonly onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-rose-500/50 bg-rose-950/35 p-3 text-rose-100" data-testid="api-error">
      <div className="flex items-start gap-2">
        <CircleAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold">Ошибка API</div>
          <p className="mt-1 break-words text-sm text-rose-100/85">{message}</p>
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-md border border-rose-300/50 px-2 py-1 text-xs font-semibold transition hover:bg-rose-400/15"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Повторить
        </button>
      </div>
    </div>
  );
}

function NoticeBanner({ message, onClose }: { readonly message: string; readonly onClose: () => void }) {
  return (
    <div className="rounded-lg border border-economy-teal/50 bg-economy-teal/15 p-3 text-sm text-stone-100">
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button className="rounded-md border border-economy-teal/40 px-2 py-1 text-xs font-semibold" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </div>
  );
}

function EmptyState({ children }: { readonly children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-[#3a453e] bg-black/20 p-3 text-sm text-stone-400">{children}</div>;
}

function MiniLineChart({ points }: { readonly points: readonly { readonly tick: number; readonly value: number }[] }) {
  if (points.length < 2) {
    return <div className="flex h-24 items-center justify-center rounded-md bg-[#0c130f] text-xs text-stone-500">No chart data</div>;
  }

  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const minValue = Math.min(...points.map((point) => point.value));
  const spread = Math.max(1, maxValue - minValue);
  const polyline = points
    .map((point, index) => {
      const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
      const y = 92 - ((point.value - minValue) / spread) * 76;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-24 w-full rounded-md bg-[#0c130f]" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
      <polyline fill="none" points={polyline} stroke="rgb(215 168 79)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
      {points.map((point, index) => {
        const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
        const y = 92 - ((point.value - minValue) / spread) * 76;

        return <circle cx={x} cy={y} fill="rgb(79 183 165)" key={`${point.tick}-${index}`} r="1.6" />;
      })}
    </svg>
  );
}

function buildUiPriceSeries(data: GameData | null, needCategory: string): readonly { readonly tick: number; readonly value: number }[] {
  const byTick = new Map<number, { spendingMinor: number; purchasedQuantity: number }>();

  for (const record of data?.world.demandRecords ?? []) {
    if (record.needCategory !== needCategory || record.purchasedQuantity <= 0) {
      continue;
    }

    const current = byTick.get(record.tick) ?? { spendingMinor: 0, purchasedQuantity: 0 };
    current.spendingMinor += record.spendingMinor;
    current.purchasedQuantity += record.purchasedQuantity;
    byTick.set(record.tick, current);
  }

  return [...byTick.entries()]
    .sort((left, right) => left[0] - right[0])
    .slice(-12)
    .map(([tick, value]) => ({
      tick,
      value: value.purchasedQuantity > 0 ? Math.round(value.spendingMinor / value.purchasedQuantity) : 0
    }));
}

function latestPublicStatistic(
  statistics: GameData["world"]["publicStatistics"],
  metricName: string
): GameData["world"]["publicStatistics"][number] | null {
  return statistics
    .filter((statistic) => statistic.metricName === metricName)
    .sort((left, right) => right.tick - left.tick)[0] ?? null;
}

function reliabilityClass(grade: string): string {
  const className: Record<string, string> = {
    high: "bg-economy-teal/15 text-economy-teal",
    low: "bg-economy-gold/15 text-economy-gold",
    manipulated: "bg-rose-500/20 text-rose-200",
    medium: "bg-stone-500/20 text-stone-200"
  };

  return `rounded px-2 py-1 text-[11px] font-bold uppercase ${className[grade] ?? className.medium}`;
}

function countNewsCategories(items: readonly NewsItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    const category = item.category ?? "economic";
    counts[category] = (counts[category] ?? 0) + 1;
    return counts;
  }, {});
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 1;
  }

  const value = values.reduce((total, item) => total + item, 0) / values.length;

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function formatSignedMoneyMinor(value: number, currencyCode = "ECO"): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formatted = formatMoneyMinor(Math.abs(safeValue), currencyCode);

  if (safeValue > 0) {
    return `+${formatted}`;
  }

  if (safeValue < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function getCompanyStatusTone(company: ReturnType<typeof getPlayerCompanies>[number]): "danger" | "success" | "warning" {
  if (company.legalStatus === "bankrupt" || company.legalStatus === "suspended" || company.bankruptcyStatus === "auction") {
    return "danger";
  }

  if (company.cashBalanceMinor <= 0 || company.bankruptcyStatus !== "none" || company.reputation < 0.45) {
    return "warning";
  }

  return "success";
}

function formatDate(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

function labelNeed(value: string): string {
  const labels: Record<string, string> = {
    entertainment: "Развлечения",
    food: "Еда",
    housing: "Жилье",
    medicine: "Медицина",
    transport: "Транспорт"
  };

  return labels[value] ?? value;
}

function formatSignedPercent(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const sign = safeValue > 0 ? "+" : "";
  return `${sign}${Math.round(safeValue * 100)}%`;
}

function lawStatusClass(status: string): string {
  const className: Record<string, string> = {
    active: "bg-economy-teal/15 text-economy-teal",
    draft: "bg-economy-gold/15 text-economy-gold",
    expired: "bg-stone-500/20 text-stone-300",
    rejected: "bg-rose-500/20 text-rose-200"
  };

  return `rounded px-2 py-1 text-[11px] font-bold uppercase ${className[status] ?? className.draft}`;
}

function warCellClass(cell: StrategicCell): string {
  if (cell.legalControllerCountryId !== cell.factualControllerCountryId) {
    return "fill-rose-500/45 stroke-rose-200";
  }

  if (cell.contested) {
    return "fill-economy-gold/40 stroke-economy-gold";
  }

  return "fill-economy-teal/22 stroke-economy-teal/70";
}

function severityClass(severity: NewsItem["severity"]): string {
  const className = {
    critical: "bg-rose-500/20 text-rose-200",
    info: "bg-economy-teal/15 text-economy-teal",
    warning: "bg-economy-gold/15 text-economy-gold"
  }[severity];

  return `rounded px-2 py-1 text-[11px] font-bold uppercase ${className}`;
}

function shipmentStatusClass(status: Shipment["status"]): string {
  const className = {
    blocked: "bg-rose-500/20 text-rose-200",
    cancelled: "bg-stone-500/20 text-stone-300",
    delivered: "bg-economy-teal/15 text-economy-teal",
    in_transit: "bg-economy-gold/15 text-economy-gold",
    pending: "bg-stone-500/20 text-stone-300"
  } satisfies Record<Shipment["status"], string>;

  return `rounded px-2 py-1 text-[11px] font-bold uppercase ${className[status]}`;
}

function illegalTradeStatusClass(status: string): string {
  const className: Record<string, string> = {
    cancelled: "bg-stone-500/20 text-stone-300",
    completed: "bg-economy-teal/15 text-economy-teal",
    confiscated: "bg-rose-500/20 text-rose-200",
    detected: "bg-rose-500/20 text-rose-200",
    pending: "bg-economy-gold/15 text-economy-gold"
  };

  return `rounded px-2 py-1 text-[11px] font-bold uppercase ${className[status] ?? className.pending}`;
}

function getCompanyInventoryForProduct(data: GameData, companyId: string, productId: string): number {
  const warehouseIds = new Set(data.warehouses.filter((warehouse) => warehouse.companyId === companyId).map((warehouse) => warehouse.id));

  return data.world.inventoryLots
    .filter((lot) => warehouseIds.has(lot.warehouseId) && lot.productId === productId)
    .reduce((total, lot) => total + lot.quantity, 0);
}
