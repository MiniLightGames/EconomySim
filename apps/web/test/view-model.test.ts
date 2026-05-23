import { createInitialWorldState, type Company } from "@economysim/domain";
import { describe, expect, it } from "vitest";
import {
  PLAYER_ID,
  PLAYER_TREASURY_MINOR,
  MAP_LAYER_IDS,
  MAP_LAYER_LABELS,
  buildOnboardingSteps,
  countEnabledMapLayers,
  createDefaultMapLayers,
  formatMoneyMinor,
  getMapBounds,
  getPlayerCompanies,
  getPlayerMoneyMinor,
  projectGeoPoint
} from "../lib/view-model";

describe("web view model", () => {
  it("keeps player treasury non-negative and includes player company cash", () => {
    const world = createInitialWorldState("web-test");
    const playerCompany: Company = {
      id: "company-player",
      ownerType: "player",
      ownerId: PLAYER_ID,
      countryId: world.countries[0]?.id ?? "country",
      name: "Player Foods",
      legalStatus: "registered",
      cashBalanceMinor: 12_500_00,
      currencyCode: "NCR",
      reputation: 0.5,
      bankruptcyStatus: "none"
    };

    const companies = [...world.companies, playerCompany];

    expect(getPlayerCompanies(companies)).toHaveLength(1);
    expect(getPlayerMoneyMinor(companies)).toBe(PLAYER_TREASURY_MINOR + playerCompany.cashBalanceMinor);
  });

  it("projects cities into the map viewport", () => {
    const world = createInitialWorldState("web-test");
    const bounds = getMapBounds(world.countries, world.cities);

    for (const city of world.cities) {
      const point = projectGeoPoint(city.location, bounds);

      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(100);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(100);
    }
  });

  it("formats invalid and negative money without leaking unsafe numbers", () => {
    expect(formatMoneyMinor(Number.NaN)).not.toContain("NaN");
    expect(formatMoneyMinor(Number.POSITIVE_INFINITY)).not.toContain("Infinity");
    expect(formatMoneyMinor(-100)).not.toContain("-");
  });

  it("tracks first-user onboarding progress from gameplay signals", () => {
    const steps = buildOnboardingSteps({
      hasWorld: true,
      selectedCountryId: "country-1",
      playerCompanyCount: 1,
      resourceSignalCount: 2,
      producedGoodsCount: 0,
      currentTick: 0,
      newsCount: 0
    });

    expect(steps.filter((step) => step.complete).map((step) => step.id)).toEqual([
      "open-map",
      "select-country",
      "create-company",
      "buy-resource"
    ]);
    expect(steps.find((step) => step.id === "produce-good")?.complete).toBe(false);
  });

  it("keeps all strategic map layers enabled by default", () => {
    const layers = createDefaultMapLayers();

    expect(countEnabledMapLayers(layers)).toBe(6);
    expect(layers).toMatchObject({
      economy: true,
      infrastructure: true,
      logistics: true,
      pollution: true,
      resources: true,
      war: true
    });
  });

  it("names every map layer for accessible UI controls", () => {
    const labels = MAP_LAYER_IDS.map((layerId) => MAP_LAYER_LABELS[layerId]);

    expect(labels).toEqual(["Экономика", "Логистика", "Ресурсы", "Война", "Загрязнение", "Инфраструктура"]);
    expect(labels.every((label) => label.length > 0)).toBe(true);
  });
});
