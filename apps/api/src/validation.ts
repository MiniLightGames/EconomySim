import type { PlayerCommand, WorldState } from "@economysim/domain";
import { badRequest } from "./errors";

export function validatePlayerCommandsAgainstWorld(state: WorldState, commands: readonly PlayerCommand[]): void {
  const commandIds = new Set<string>();

  for (const command of commands) {
    if (commandIds.has(command.commandId)) {
      throw badRequest("DUPLICATE_COMMAND_ID", "Command ids must be unique per tick request.", {
        commandId: command.commandId
      });
    }

    commandIds.add(command.commandId);

    if (command.type === "CreateCompanyCommand") {
      if (!state.countries.some((country) => country.id === command.countryId)) {
        throw badRequest("UNKNOWN_COUNTRY", "CreateCompanyCommand references an unknown country.", {
          commandId: command.commandId,
          countryId: command.countryId
        });
      }
    }

    if (command.type === "BuyLandCommand") {
      const city = state.cities.find((candidate) => candidate.id === command.cityId);
      const company = state.companies.find((candidate) => candidate.id === command.companyId);

      if (!city) {
        throw badRequest("UNKNOWN_CITY", "BuyLandCommand references an unknown city.", {
          commandId: command.commandId,
          cityId: command.cityId
        });
      }

      if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
        throw badRequest("PLAYER_COMPANY_REQUIRED", "BuyLandCommand can only acquire premises for a registered player company.", {
          commandId: command.commandId,
          companyId: command.companyId
        });
      }

      if (city && city.countryId !== company?.countryId) {
        throw badRequest("CITY_COMPANY_COUNTRY_MISMATCH", "BuyLandCommand city must be in the company's country.", {
          commandId: command.commandId,
          cityId: command.cityId,
          companyId: command.companyId
        });
      }
    }

    if (command.type === "BuyResourceCommand") {
      const company = state.companies.find((candidate) => candidate.id === command.buyerCompanyId);
      const offer = state.resourceOffers.find((candidate) => candidate.id === command.resourceOfferId);

      if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
        throw badRequest("PLAYER_COMPANY_REQUIRED", "BuyResourceCommand can only buy for a registered player company.", {
          commandId: command.commandId,
          buyerCompanyId: command.buyerCompanyId
        });
      }

      if (!offer || !offer.active) {
        throw badRequest("UNKNOWN_OR_INACTIVE_RESOURCE_OFFER", "BuyResourceCommand references no active resource offer.", {
          commandId: command.commandId,
          resourceOfferId: command.resourceOfferId
        });
      }

      if (command.deliveryMode === "delivery") {
        const buyerWarehouse = command.buyerWarehouseId
          ? state.warehouses.find((warehouse) => warehouse.id === command.buyerWarehouseId && warehouse.companyId === company?.id)
          : state.warehouses.find((warehouse) => warehouse.companyId === company?.id);
        const route = buyerWarehouse
          ? state.logisticsRoutes.find(
              (candidate) =>
                candidate.originWarehouseId === offer?.warehouseId &&
                candidate.destinationWarehouseId === buyerWarehouse.id &&
                (!command.routeId || candidate.id === command.routeId) &&
                (!command.transportCompanyId || candidate.transportCompanyId === command.transportCompanyId)
            )
          : null;

        if (!buyerWarehouse) {
          throw badRequest("BUYER_WAREHOUSE_REQUIRED", "Delivery resource purchase needs a buyer warehouse.", {
            commandId: command.commandId,
            buyerCompanyId: command.buyerCompanyId
          });
        }

        if (!route || !route.active) {
          throw badRequest("LOGISTICS_ROUTE_REQUIRED", "Delivery resource purchase requires an active route from seller to buyer warehouse.", {
            commandId: command.commandId,
            resourceOfferId: command.resourceOfferId,
            buyerWarehouseId: buyerWarehouse.id
          });
        }

        if (route.blockedReason) {
          throw badRequest("LOGISTICS_ROUTE_BLOCKED", "Delivery resource purchase route is currently blocked.", {
            commandId: command.commandId,
            routeId: route.id,
            reason: route.blockedReason
          });
        }
      }
    }

    if (command.type === "RunManualProductionCommand") {
      const company = state.companies.find((candidate) => candidate.id === command.companyId);
      const plan = state.productionPlans.find((candidate) => candidate.id === command.productionPlanId && candidate.companyId === command.companyId);

      if (!company || company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
        throw badRequest("PLAYER_COMPANY_REQUIRED", "RunManualProductionCommand requires a registered player company.", {
          commandId: command.commandId,
          companyId: command.companyId
        });
      }

      if (!plan) {
        throw badRequest("UNKNOWN_PRODUCTION_PLAN", "RunManualProductionCommand references an unknown production plan.", {
          commandId: command.commandId,
          productionPlanId: command.productionPlanId
        });
      }
    }

    if (command.type === "SetRetailPriceCommand") {
      const company = state.companies.find((candidate) => candidate.id === command.companyId);

      if (!company) {
        throw badRequest("UNKNOWN_COMPANY", "SetRetailPriceCommand references an unknown company.", {
          commandId: command.commandId,
          companyId: command.companyId
        });
      }

      if (company.ownerType !== "player" || company.ownerId !== command.playerId || company.legalStatus !== "registered") {
        throw badRequest("PLAYER_COMPANY_REQUIRED", "SetRetailPriceCommand can only update a registered player company.", {
          commandId: command.commandId,
          companyId: command.companyId
        });
      }

      if (company.currencyCode !== command.currencyCode) {
        throw badRequest("PRICE_CURRENCY_MISMATCH", "SetRetailPriceCommand currency must match the company currency.", {
          commandId: command.commandId,
          currencyCode: command.currencyCode,
          companyCurrencyCode: company.currencyCode
        });
      }

      if (!state.products.some((product) => product.id === command.productId)) {
        throw badRequest("UNKNOWN_PRODUCT", "SetRetailPriceCommand references an unknown product.", {
          commandId: command.commandId,
          productId: command.productId
        });
      }

      const offer = state.retailOffers.find(
        (candidate) => candidate.companyId === command.companyId && candidate.productId === command.productId && candidate.active
      );

      if (!offer) {
        throw badRequest("UNKNOWN_RETAIL_OFFER", "SetRetailPriceCommand references no active company retail offer.", {
          commandId: command.commandId,
          companyId: command.companyId,
          productId: command.productId
        });
      }

      const warehouse = state.warehouses.find((candidate) => candidate.id === offer.warehouseId);

      if (warehouse?.companyId !== company.id) {
        throw badRequest("RETAIL_OFFER_WAREHOUSE_REQUIRED", "Retail offer warehouse must belong to the player company.", {
          commandId: command.commandId,
          retailOfferId: offer.id
        });
      }
    }
  }
}
