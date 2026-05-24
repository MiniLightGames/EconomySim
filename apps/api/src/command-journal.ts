import type { FastifyRequest } from "fastify";
import type {
  AuditLog,
  AuditLogResult,
  CommandBatchFailurePolicy,
  DomainEvent,
  FinancialTransaction,
  Metric,
  PlayerCommand,
  PlayerCommandRecord,
  PlayerCommandRecordStatus,
  WorldState
} from "@economysim/domain";
import { runTick } from "@economysim/simulation-core";
import type { RejectedCommand, TickResult } from "@economysim/simulation-core";
import { ApiError, badRequest } from "./errors";
import type { AuthenticatedPlayerSession } from "./auth";
import type { WorldStore } from "./store";
import { validatePlayerCommandsAgainstWorld } from "./validation";

export interface CommandExecutionResult {
  readonly commandId: string;
  readonly commandType: PlayerCommand["type"];
  readonly status: PlayerCommandRecordStatus;
  readonly idempotencyKey: string;
  readonly temporaryRef: string | null;
  readonly rejectionCode: string | null;
  readonly rejectionMessage: string | null;
  readonly createdCompanyId: string | null;
  readonly warehouseId: string | null;
  readonly productionPlanId: string | null;
  readonly retailOfferId: string | null;
  readonly resourcePurchaseId: string | null;
  readonly productionRunId: string | null;
  readonly retailPriceChangeId: string | null;
  readonly eventIds: readonly string[];
  readonly metricIds: readonly string[];
  readonly financialTransactionIds: readonly string[];
}

export interface JournaledCommandBatchSummary {
  readonly idempotencyKey: string;
  readonly failurePolicy: CommandBatchFailurePolicy;
  readonly status: "applied" | "partial" | "rejected" | "failed" | "duplicate" | "ticked";
  readonly commandResults: readonly CommandExecutionResult[];
  readonly dependencyOrder: readonly string[];
  readonly temporaryRefs: Readonly<Record<string, string>>;
  readonly rejectedCommands: readonly RejectedCommand[];
}

export interface JournaledCommandExecution {
  readonly state: WorldState;
  readonly tickResult: TickResult | null;
  readonly commandRecords: readonly PlayerCommandRecord[];
  readonly events: readonly DomainEvent[];
  readonly metrics: readonly Metric[];
  readonly financialTransactions: readonly FinancialTransaction[];
  readonly duplicate: boolean;
  readonly batch: JournaledCommandBatchSummary;
}

interface PreparedCommandBatch {
  readonly commands: readonly PlayerCommand[];
  readonly dependencyOrder: readonly string[];
  readonly temporaryRefs: Readonly<Record<string, string>>;
  readonly hasIntraBatchDependencies: boolean;
}

export function resolveIdempotencyKey(request: FastifyRequest, actionType: string): string {
  const headerValue = readHeader(request, "idempotency-key") ?? readHeader(request, "x-idempotency-key");
  const bodyValue = readBodyIdempotencyKey(request.body);
  const key = (headerValue ?? bodyValue)?.trim();

  if (!key) {
    throw badRequest("IDEMPOTENCY_KEY_REQUIRED", `${actionType} requires an Idempotency-Key header or idempotencyKey body field.`, {
      actionType
    });
  }

  if (key.length > 160) {
    throw badRequest("IDEMPOTENCY_KEY_TOO_LONG", "Idempotency key must be 160 characters or fewer.", {
      actionType,
      length: key.length
    });
  }

  return key;
}

export async function runJournaledCommand(input: {
  readonly store: WorldStore;
  readonly state: WorldState;
  readonly command: PlayerCommand;
  readonly session: AuthenticatedPlayerSession;
  readonly seed: string;
  readonly idempotencyKey: string;
  readonly actionType: string;
  readonly failurePolicy?: CommandBatchFailurePolicy;
}): Promise<JournaledCommandExecution> {
  return runJournaledCommandBatch({
    store: input.store,
    state: input.state,
    commands: [input.command],
    session: input.session,
    seed: input.seed,
    idempotencyKey: input.idempotencyKey,
    actionType: input.actionType,
    failurePolicy: input.failurePolicy ?? "all_or_nothing"
  });
}

export async function runJournaledCommandBatch(input: {
  readonly store: WorldStore;
  readonly state: WorldState;
  readonly commands: readonly PlayerCommand[];
  readonly session: AuthenticatedPlayerSession;
  readonly seed: string;
  readonly idempotencyKey: string;
  readonly actionType: string;
  readonly failurePolicy?: CommandBatchFailurePolicy;
}): Promise<JournaledCommandExecution> {
  const failurePolicy = input.failurePolicy ?? "all_or_nothing";

  if (input.commands.length === 0) {
    const tickResult = runTick({ state: input.state, commands: [], seed: input.seed });
    await input.store.saveWorld(tickResult.state);

    return {
      state: tickResult.state,
      tickResult,
      commandRecords: [],
      events: tickResult.events,
      metrics: tickResult.metrics,
      financialTransactions: tickResult.state.financialTransactions.filter((transaction) => transaction.tick === tickResult.state.currentTick),
      duplicate: false,
      batch: {
        idempotencyKey: input.idempotencyKey,
        failurePolicy,
        status: "ticked",
        commandResults: [],
        dependencyOrder: [],
        temporaryRefs: {},
        rejectedCommands: []
      }
    };
  }

  const prepared = prepareDependentCommandBatch({
    state: input.state,
    commands: input.commands,
    seed: input.seed
  });
  const commands = prepared.commands;
  const scopedKeys = commands.map((_command, index) => commandScopedIdempotencyKey(input.idempotencyKey, index, commands.length));
  const duplicateRecords = scopedKeys
    .map((key) => findCommandByIdempotencyKey(input.state, input.session.playerId, key))
    .filter((record): record is PlayerCommandRecord => Boolean(record));

  if (duplicateRecords.length > 0) {
    const duplicateState = appendAuditLog(input.state, {
      seed: input.seed,
      tick: input.state.currentTick,
      session: input.session,
      actionType: input.actionType,
      commandId: duplicateRecords[0]?.commandId ?? null,
      idempotencyKey: input.idempotencyKey,
      result: "duplicate",
      affectedEntityIds: unique(duplicateRecords.flatMap((record) => record.affectedEntityIds)),
      eventIds: unique(duplicateRecords.flatMap((record) => record.resultEventIds)),
      metricIds: unique(duplicateRecords.flatMap((record) => record.resultMetricIds)),
      financialTransactionIds: unique(duplicateRecords.flatMap((record) => record.resultFinancialTransactionIds)),
      metadata: {
        duplicateRecordCount: duplicateRecords.length,
        firstDuplicateStatus: duplicateRecords[0]?.status ?? null
      }
    });
    await input.store.saveWorld(duplicateState);

    const links = collectRecordsLinks(duplicateState, duplicateRecords);
    const commandResults = buildCommandResults(duplicateState, duplicateRecords);

    return {
      state: duplicateState,
      tickResult: null,
      commandRecords: duplicateRecords,
      events: links.events,
      metrics: links.metrics,
      financialTransactions: links.financialTransactions,
      duplicate: true,
      batch: {
        idempotencyKey: input.idempotencyKey,
        failurePolicy,
        status: "duplicate",
        commandResults,
        dependencyOrder: duplicateRecords.map((record) => record.commandId),
        temporaryRefs: prepared.temporaryRefs,
        rejectedCommands: []
      }
    };
  }

  const createdAt = new Date().toISOString();
  const receivedRecords = commands.map((command, index) =>
    createCommandRecord({
      seed: input.seed,
      command,
      session: input.session,
      idempotencyKey: scopedKeys[index],
      tickReceived: input.state.currentTick,
      createdAt
    })
  );
  let journaledState: WorldState = {
    ...input.state,
    playerCommands: [...(input.state.playerCommands ?? []), ...receivedRecords],
    auditLogs: [
      ...(input.state.auditLogs ?? []),
      ...receivedRecords.map((record) =>
        createAuditLog({
          seed: input.seed,
          tick: input.state.currentTick,
          session: input.session,
          actionType: input.actionType,
          commandId: record.commandId,
          idempotencyKey: record.idempotencyKey,
          result: "received",
          affectedEntityIds: [record.playerId],
          eventIds: [],
          metricIds: [],
          financialTransactionIds: [],
          metadata: {
            commandType: record.commandType,
            status: record.status,
            failurePolicy
          }
        })
      )
    ]
  };

  try {
    if (!prepared.hasIntraBatchDependencies) {
      validatePlayerCommandsAgainstWorld(journaledState, commands);
    } else {
      validatePreparedBatchShape(commands);
    }
  } catch (error) {
    const rejectedState = finalizeCommandRecords(journaledState, receivedRecords, {
      seed: input.seed,
      session: input.session,
      actionType: input.actionType,
      status: "rejected",
      result: "rejected",
      tickApplied: null,
      rejectionCode: getErrorCode(error),
      rejectionMessage: error instanceof Error ? error.message : "Command validation failed."
    });
    await input.store.saveWorld(rejectedState);
    throw error;
  }

  journaledState = markCommandRecords(journaledState, receivedRecords, {
    seed: input.seed,
    session: input.session,
    actionType: input.actionType,
    status: "validated",
    result: "validated",
    metadata: {
      validation: prepared.hasIntraBatchDependencies ? "backend-batch-reference-validation" : "backend-world-validation",
      failurePolicy,
      dependencyOrder: prepared.dependencyOrder.join(",")
    }
  });

  let tickResult: TickResult;

  try {
    tickResult = runTick({
      state: journaledState,
      commands,
      seed: input.seed
    });
  } catch (error) {
    const failedState = finalizeCommandRecords(journaledState, receivedRecords, {
      seed: input.seed,
      session: input.session,
      actionType: input.actionType,
      status: "failed",
      result: "failed",
      tickApplied: null,
      rejectionCode: getErrorCode(error),
      rejectionMessage: error instanceof Error ? error.message : "Command execution failed."
    });
    await input.store.saveWorld(failedState);
    throw error;
  }

  const acceptedRecords = receivedRecords.filter((record) => tickResult.acceptedCommands.includes(record.commandId));
  const rejectedRecords = receivedRecords.filter((record) => tickResult.rejectedCommands.some((rejection) => rejection.commandId === record.commandId));

  if (tickResult.rejectedCommands.length > 0 && failurePolicy === "all_or_nothing") {
    const rejectedState = finalizeCommandRecords(journaledState, receivedRecords, {
      seed: input.seed,
      session: input.session,
      actionType: input.actionType,
      status: "rejected",
      result: "rejected",
      tickApplied: null,
      rejectionCode: tickResult.rejectedCommands[0]?.code ?? "COMMAND_BATCH_REJECTED",
      rejectionMessage: tickResult.rejectedCommands[0]?.message ?? "Simulation rejected the batch; all commands were rolled back."
    });
    await input.store.saveWorld(rejectedState);

    throw badRequest("COMMAND_BATCH_REJECTED", "One or more commands were rejected; all_or_nothing batch was rolled back.", {
      failurePolicy,
      rejectedCommands: tickResult.rejectedCommands,
      dependencyOrder: prepared.dependencyOrder
    });
  }

  let finalState = tickResult.state;

  if (acceptedRecords.length > 0) {
    finalState = markCommandRecords(finalState, acceptedRecords, {
      seed: input.seed,
      session: input.session,
      actionType: input.actionType,
      status: "accepted",
      result: "accepted",
      metadata: {
        validation: "simulation-core-accepted",
        acceptedCommandCount: tickResult.acceptedCommands.length,
        failurePolicy
      }
    });
    finalState = finalizeCommandRecords(finalState, acceptedRecords, {
      seed: input.seed,
      session: input.session,
      actionType: input.actionType,
      status: "applied",
      result: "applied",
      tickApplied: tickResult.state.currentTick,
      rejectionCode: null,
      rejectionMessage: null
    });
  }

  if (rejectedRecords.length > 0) {
    finalState = finalizeRejectedCommandRecords(finalState, rejectedRecords, tickResult.rejectedCommands, {
      seed: input.seed,
      session: input.session,
      actionType: input.actionType,
      tickApplied: tickResult.state.currentTick
    });
  }

  await input.store.saveWorld(finalState);

  const finalRecords = finalState.playerCommands.filter((record) => receivedRecords.some((created) => created.id === record.id));
  const links = collectRecordsLinks(finalState, finalRecords);
  const commandResults = buildCommandResults(finalState, finalRecords);
  const batchStatus: JournaledCommandBatchSummary["status"] = rejectedRecords.length > 0 ? "partial" : "applied";

  return {
    state: finalState,
    tickResult: {
      ...tickResult,
      state: finalState
    },
    commandRecords: finalRecords,
    events: links.events,
    metrics: links.metrics,
    financialTransactions: links.financialTransactions,
    duplicate: false,
    batch: {
      idempotencyKey: input.idempotencyKey,
      failurePolicy,
      status: batchStatus,
      commandResults,
      dependencyOrder: prepared.dependencyOrder,
      temporaryRefs: prepared.temporaryRefs,
      rejectedCommands: tickResult.rejectedCommands
    }
  };
}

export function prepareDependentCommandBatch(input: {
  readonly state: WorldState;
  readonly commands: readonly PlayerCommand[];
  readonly seed: string;
}): PreparedCommandBatch {
  const commandById = new Map<string, PlayerCommand>();
  const producerByTemporaryRef = new Map<string, PlayerCommand>();
  const scheduledTick = input.state.currentTick + 1;
  const initialTemporaryRefs: Record<string, string> = {};

  for (const command of input.commands) {
    if (commandById.has(command.commandId)) {
      throw badRequest("DUPLICATE_COMMAND_ID", "Command batch contains duplicate commandId values.", { commandId: command.commandId });
    }

    commandById.set(command.commandId, command);

    if (command.temporaryRef) {
      assertTemporaryRef(command.temporaryRef);
      const aliases = predictCommandResultAliases({ command, seed: input.seed, scheduledTick });

      for (const temporaryRef of Object.keys(aliases)) {
        if (producerByTemporaryRef.has(temporaryRef)) {
          throw badRequest("DUPLICATE_TEMPORARY_REF", "Command batch contains duplicate temporaryRef values.", {
            temporaryRef
          });
        }

        producerByTemporaryRef.set(temporaryRef, command);
        initialTemporaryRefs[temporaryRef] = aliases[temporaryRef];
      }
    }
  }

  const dependenciesByCommandId = new Map<string, Set<string>>();

  for (const command of input.commands) {
    const dependencies = new Set<string>();

    for (const dependency of command.dependsOn ?? []) {
      const producer = producerByTemporaryRef.get(dependency) ?? commandById.get(dependency);

      if (!producer) {
        throw badRequest("UNKNOWN_BATCH_DEPENDENCY", "Command batch dependency does not point to a commandId or temporaryRef in the same batch.", {
          commandId: command.commandId,
          dependency
        });
      }

      if (producer.commandId !== command.commandId) {
        dependencies.add(producer.commandId);
      }
    }

    for (const reference of collectTemporaryReferences(command)) {
      const producer = producerByTemporaryRef.get(reference);

      if (!producer) {
        throw badRequest("UNKNOWN_TEMPORARY_REFERENCE", "Command uses a temporary reference that is not produced in this batch.", {
          commandId: command.commandId,
          reference
        });
      }

      if (producer.commandId !== command.commandId) {
        dependencies.add(producer.commandId);
      }
    }

    dependenciesByCommandId.set(command.commandId, dependencies);
  }

  const orderedCommandIds = topologicalSort(input.commands.map((command) => command.commandId), dependenciesByCommandId);
  const orderedCommands = orderedCommandIds.map((commandId) => commandById.get(commandId)).filter((command): command is PlayerCommand => Boolean(command));
  const resolvedTemporaryRefs: Record<string, string> = { ...initialTemporaryRefs };
  const resolvedCommands: PlayerCommand[] = [];

  for (const command of orderedCommands) {
    const resolvedCommand = resolveCommandReferences(command, resolvedTemporaryRefs);
    resolvedCommands.push(resolvedCommand);
    Object.assign(resolvedTemporaryRefs, predictCommandResultAliases({ command: resolvedCommand, seed: input.seed, scheduledTick }));
  }

  return {
    commands: resolvedCommands,
    dependencyOrder: orderedCommandIds,
    temporaryRefs: resolvedTemporaryRefs,
    hasIntraBatchDependencies: Array.from(dependenciesByCommandId.values()).some((dependencies) => dependencies.size > 0)
  };
}

function createCommandRecord(input: {
  readonly seed: string;
  readonly command: PlayerCommand;
  readonly session: AuthenticatedPlayerSession;
  readonly idempotencyKey: string;
  readonly tickReceived: number;
  readonly createdAt: string;
}): PlayerCommandRecord {
  return {
    id: `${input.seed}-player-command-${slugify(input.idempotencyKey)}-${slugify(input.command.commandId)}`,
    commandId: input.command.commandId,
    idempotencyKey: input.idempotencyKey,
    status: "received",
    commandType: input.command.type,
    command: input.command,
    userId: input.session.userId,
    playerId: input.session.playerId,
    tickReceived: input.tickReceived,
    tickScheduled: input.tickReceived + 1,
    tickApplied: null,
    resultEventIds: [],
    resultMetricIds: [],
    resultFinancialTransactionIds: [],
    affectedEntityIds: [input.session.playerId],
    rejectionCode: null,
    rejectionMessage: null,
    createdAt: input.createdAt,
    updatedAt: input.createdAt
  };
}

function markCommandRecords(
  state: WorldState,
  records: readonly PlayerCommandRecord[],
  input: {
    readonly seed: string;
    readonly session: AuthenticatedPlayerSession;
    readonly actionType: string;
    readonly status: PlayerCommandRecordStatus;
    readonly result: AuditLogResult;
    readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  }
): WorldState {
  const updatedAt = new Date().toISOString();
  const recordIds = new Set(records.map((record) => record.id));
  const updatedRecords = state.playerCommands.map((record) =>
    recordIds.has(record.id)
      ? {
          ...record,
          status: input.status,
          updatedAt
        }
      : record
  );

  return {
    ...state,
    playerCommands: updatedRecords,
    auditLogs: [
      ...state.auditLogs,
      ...records.map((record) =>
        createAuditLog({
          seed: input.seed,
          tick: state.currentTick,
          session: input.session,
          actionType: input.actionType,
          commandId: record.commandId,
          idempotencyKey: record.idempotencyKey,
          result: input.result,
          affectedEntityIds: [record.playerId],
          eventIds: [],
          metricIds: [],
          financialTransactionIds: [],
          metadata: input.metadata
        })
      )
    ]
  };
}

function finalizeCommandRecords(
  state: WorldState,
  records: readonly PlayerCommandRecord[],
  input: {
    readonly seed: string;
    readonly session: AuthenticatedPlayerSession;
    readonly actionType: string;
    readonly status: PlayerCommandRecordStatus;
    readonly result: AuditLogResult;
    readonly tickApplied: number | null;
    readonly rejectionCode: string | null;
    readonly rejectionMessage: string | null;
  }
): WorldState {
  const updatedAt = new Date().toISOString();
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const commandIds = new Set(records.map((record) => record.commandId));
  const updatedRecords = state.playerCommands.map((record) => {
    const original = recordsById.get(record.id);

    if (!original) {
      return record;
    }

    const links = collectCommandLinks(state, original.command);

    return {
      ...record,
      status: input.status,
      tickApplied: input.tickApplied,
      resultEventIds: links.eventIds,
      resultMetricIds: links.metricIds,
      resultFinancialTransactionIds: links.financialTransactionIds,
      affectedEntityIds: links.affectedEntityIds,
      rejectionCode: input.rejectionCode,
      rejectionMessage: input.rejectionMessage,
      updatedAt
    } satisfies PlayerCommandRecord;
  });
  const finalizedRecords = updatedRecords.filter((record) => commandIds.has(record.commandId));

  return {
    ...state,
    playerCommands: updatedRecords,
    auditLogs: [
      ...state.auditLogs,
      ...finalizedRecords.map((record) =>
        createAuditLog({
          seed: input.seed,
          tick: input.tickApplied ?? state.currentTick,
          session: input.session,
          actionType: input.actionType,
          commandId: record.commandId,
          idempotencyKey: record.idempotencyKey,
          result: input.result,
          affectedEntityIds: record.affectedEntityIds,
          eventIds: record.resultEventIds,
          metricIds: record.resultMetricIds,
          financialTransactionIds: record.resultFinancialTransactionIds,
          metadata: {
            commandType: record.commandType,
            status: record.status,
            rejectionCode: record.rejectionCode
          }
        })
      )
    ]
  };
}

function finalizeRejectedCommandRecords(
  state: WorldState,
  records: readonly PlayerCommandRecord[],
  rejectedCommands: readonly RejectedCommand[],
  input: {
    readonly seed: string;
    readonly session: AuthenticatedPlayerSession;
    readonly actionType: string;
    readonly tickApplied: number;
  }
): WorldState {
  let nextState = state;

  for (const record of records) {
    const rejection = rejectedCommands.find((candidate) => candidate.commandId === record.commandId) ?? null;
    nextState = finalizeCommandRecords(nextState, [record], {
      seed: input.seed,
      session: input.session,
      actionType: input.actionType,
      status: "rejected",
      result: "rejected",
      tickApplied: input.tickApplied,
      rejectionCode: rejection?.code ?? "COMMAND_REJECTED",
      rejectionMessage: rejection?.message ?? "Simulation rejected the command."
    });
  }

  return nextState;
}

function appendAuditLog(
  state: WorldState,
  input: {
    readonly seed: string;
    readonly tick: number;
    readonly session: AuthenticatedPlayerSession;
    readonly actionType: string;
    readonly commandId: string | null;
    readonly idempotencyKey: string | null;
    readonly result: AuditLogResult;
    readonly affectedEntityIds: readonly string[];
    readonly eventIds: readonly string[];
    readonly metricIds: readonly string[];
    readonly financialTransactionIds: readonly string[];
    readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
  }
): WorldState {
  return {
    ...state,
    auditLogs: [
      ...(state.auditLogs ?? []),
      createAuditLog({
        seed: input.seed,
        tick: input.tick,
        session: input.session,
        actionType: input.actionType,
        commandId: input.commandId,
        idempotencyKey: input.idempotencyKey,
        result: input.result,
        affectedEntityIds: input.affectedEntityIds,
        eventIds: input.eventIds,
        metricIds: input.metricIds,
        financialTransactionIds: input.financialTransactionIds,
        metadata: input.metadata
      })
    ]
  };
}

function createAuditLog(input: {
  readonly seed: string;
  readonly tick: number;
  readonly session: AuthenticatedPlayerSession;
  readonly actionType: string;
  readonly commandId: string | null;
  readonly idempotencyKey: string | null;
  readonly result: AuditLogResult;
  readonly affectedEntityIds: readonly string[];
  readonly eventIds: readonly string[];
  readonly metricIds: readonly string[];
  readonly financialTransactionIds: readonly string[];
  readonly metadata: Readonly<Record<string, string | number | boolean | null>>;
}): AuditLog {
  const createdAt = new Date().toISOString();
  const commandPart = input.commandId ? slugify(input.commandId) : slugify(input.actionType);
  const sequencePart = `${input.result}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

  return {
    id: `${input.seed}-audit-${input.tick}-${commandPart}-${sequencePart}`,
    tick: input.tick,
    userId: input.session.userId,
    playerId: input.session.playerId,
    actionType: input.actionType,
    commandId: input.commandId,
    idempotencyKey: input.idempotencyKey,
    result: input.result,
    affectedEntityIds: unique(input.affectedEntityIds),
    eventIds: unique(input.eventIds),
    metricIds: unique(input.metricIds),
    financialTransactionIds: unique(input.financialTransactionIds),
    metadata: input.metadata,
    createdAt
  };
}

function buildCommandResults(state: WorldState, records: readonly PlayerCommandRecord[]): readonly CommandExecutionResult[] {
  return records.map((record) => {
    const linkedEvents = state.events.filter((event) => record.resultEventIds.includes(event.id));
    const companyEvent = linkedEvents.find((event) => event.type === "CompanyRegisteredEvent") ?? null;
    const premiseEvent = linkedEvents.find((event) => event.type === "LandPremiseAcquiredEvent") ?? null;
    const purchaseEvent = linkedEvents.find((event) => event.type === "ResourcePurchasedEvent") ?? null;
    const productionEvent = linkedEvents.find((event) => event.type === "ManualProductionRunEvent") ?? null;
    const priceEvent = linkedEvents.find((event) => event.type === "RetailPriceChangedEvent") ?? null;

    return {
      commandId: record.commandId,
      commandType: record.commandType,
      status: record.status,
      idempotencyKey: record.idempotencyKey,
      temporaryRef: record.command.temporaryRef ?? null,
      rejectionCode: record.rejectionCode,
      rejectionMessage: record.rejectionMessage,
      createdCompanyId: readMetadataString(companyEvent, "companyId"),
      warehouseId: readMetadataString(premiseEvent, "warehouseId"),
      productionPlanId: readMetadataString(premiseEvent, "productionPlanId"),
      retailOfferId: readMetadataString(premiseEvent, "retailOfferId"),
      resourcePurchaseId: readMetadataString(purchaseEvent, "purchaseId"),
      productionRunId: readMetadataString(productionEvent, "productionRunId"),
      retailPriceChangeId: readMetadataString(priceEvent, "priceChangeId"),
      eventIds: record.resultEventIds,
      metricIds: record.resultMetricIds,
      financialTransactionIds: record.resultFinancialTransactionIds
    };
  });
}

function collectCommandLinks(
  state: WorldState,
  command: PlayerCommand
): {
  readonly eventIds: readonly string[];
  readonly metricIds: readonly string[];
  readonly financialTransactionIds: readonly string[];
  readonly affectedEntityIds: readonly string[];
} {
  const eventIds = state.events
    .filter((event) => event.metadata.commandId === command.commandId || event.id.includes(command.commandId))
    .map((event) => event.id);
  const metricIds = state.metrics.filter((metric) => metric.id.includes(command.commandId)).map((metric) => metric.id);
  const financialTransactionIds = state.financialTransactions
    .filter((transaction) => transaction.id.includes(command.commandId))
    .map((transaction) => transaction.id);
  const affectedEntityIds = unique([
    command.playerId,
    ...state.events
      .filter((event) => eventIds.includes(event.id))
      .flatMap((event) => event.entityIds),
    ...state.financialTransactions
      .filter((transaction) => financialTransactionIds.includes(transaction.id))
      .flatMap((transaction) => transaction.entries.map((entry) => entry.ownerId))
  ]);

  return {
    eventIds: unique(eventIds),
    metricIds: unique(metricIds),
    financialTransactionIds: unique(financialTransactionIds),
    affectedEntityIds
  };
}

function collectRecordsLinks(
  state: WorldState,
  records: readonly PlayerCommandRecord[]
): {
  readonly events: readonly DomainEvent[];
  readonly metrics: readonly Metric[];
  readonly financialTransactions: readonly FinancialTransaction[];
} {
  const eventIds = new Set(records.flatMap((record) => record.resultEventIds));
  const metricIds = new Set(records.flatMap((record) => record.resultMetricIds));
  const financialTransactionIds = new Set(records.flatMap((record) => record.resultFinancialTransactionIds));

  return {
    events: state.events.filter((event) => eventIds.has(event.id)),
    metrics: state.metrics.filter((metric) => metricIds.has(metric.id)),
    financialTransactions: state.financialTransactions.filter((transaction) => financialTransactionIds.has(transaction.id))
  };
}

function findCommandByIdempotencyKey(state: WorldState, playerId: string, idempotencyKey: string): PlayerCommandRecord | null {
  return (state.playerCommands ?? []).find((record) => record.playerId === playerId && record.idempotencyKey === idempotencyKey) ?? null;
}

function validatePreparedBatchShape(commands: readonly PlayerCommand[]): void {
  if (commands.length === 0) {
    return;
  }

  for (const command of commands) {
    if (command.commandId.trim().length === 0) {
      throw badRequest("INVALID_COMMAND_ID", "Command batch contains an empty commandId.", { commandType: command.type });
    }

    if (command.type === "CreateCompanyCommand" && command.name.trim().length < 2) {
      throw badRequest("INVALID_COMPANY_NAME", "CreateCompanyCommand in batch has an invalid company name.", { commandId: command.commandId });
    }
  }
}

function collectTemporaryReferences(command: PlayerCommand): readonly string[] {
  const candidates: string[] = [];

  if (command.type === "BuyLandCommand") {
    candidates.push(command.companyId);
  }

  if (command.type === "BuyResourceCommand") {
    candidates.push(command.buyerCompanyId, command.buyerWarehouseId ?? "");
  }

  if (command.type === "RunManualProductionCommand") {
    candidates.push(command.companyId, command.productionPlanId);
  }

  if (command.type === "SetRetailPriceCommand") {
    candidates.push(command.companyId);
  }

  return candidates.filter(isTemporaryRef);
}

function resolveCommandReferences(command: PlayerCommand, refs: Readonly<Record<string, string>>): PlayerCommand {
  if (command.type === "BuyLandCommand") {
    return { ...command, companyId: resolveMaybeRef(command.companyId, refs) };
  }

  if (command.type === "BuyResourceCommand") {
    return {
      ...command,
      buyerCompanyId: resolveMaybeRef(command.buyerCompanyId, refs),
      buyerWarehouseId: command.buyerWarehouseId ? resolveMaybeRef(command.buyerWarehouseId, refs) : undefined
    };
  }

  if (command.type === "RunManualProductionCommand") {
    return {
      ...command,
      companyId: resolveMaybeRef(command.companyId, refs),
      productionPlanId: resolveMaybeRef(command.productionPlanId, refs)
    };
  }

  if (command.type === "SetRetailPriceCommand") {
    return { ...command, companyId: resolveMaybeRef(command.companyId, refs) };
  }

  return command;
}

function resolveMaybeRef(value: string, refs: Readonly<Record<string, string>>): string {
  if (!isTemporaryRef(value)) {
    return value;
  }

  const resolved = refs[value];

  if (!resolved) {
    throw badRequest("UNRESOLVED_TEMPORARY_REFERENCE", "Could not resolve temporary reference in command batch.", { reference: value });
  }

  return resolved;
}

function predictPrimaryCommandResultId(input: { readonly command: PlayerCommand; readonly seed: string; readonly scheduledTick: number }): string {
  const aliases = predictCommandResultAliases(input);
  const firstAlias = input.command.temporaryRef ? aliases[input.command.temporaryRef] : null;

  if (firstAlias) {
    return firstAlias;
  }

  if (input.command.type === "CreateCompanyCommand") {
    return `${input.seed}-company-${input.scheduledTick}-${slugify(input.command.name.trim())}`;
  }

  return input.command.commandId;
}

function predictCommandResultAliases(input: { readonly command: PlayerCommand; readonly seed: string; readonly scheduledTick: number }): Record<string, string> {
  const refs: Record<string, string> = {};
  const temporaryRef = input.command.temporaryRef;

  if (input.command.type === "CreateCompanyCommand") {
    const companyId = `${input.seed}-company-${input.scheduledTick}-${slugify(input.command.name.trim())}`;

    if (temporaryRef) {
      refs[temporaryRef] = companyId;
      refs[`${temporaryRef}:company`] = companyId;
    }

    return refs;
  }

  if (input.command.type === "BuyLandCommand") {
    const warehouseId = `${input.seed}-warehouse-${input.scheduledTick}-${input.command.companyId}-starter`;
    const productionPlanId = `${input.seed}-production-${input.scheduledTick}-${input.command.companyId}-bread`;
    const retailOfferId = `${input.seed}-offer-${input.scheduledTick}-${input.command.companyId}-bread`;

    if (temporaryRef) {
      refs[temporaryRef] = warehouseId;
      refs[`${temporaryRef}:warehouse`] = warehouseId;
      refs[`${temporaryRef}:productionPlan`] = productionPlanId;
      refs[`${temporaryRef}:retailOffer`] = retailOfferId;
    }

    return refs;
  }

  if (input.command.type === "BuyResourceCommand" && temporaryRef) {
    refs[temporaryRef] = `${input.seed}-resource-purchase-${input.scheduledTick}-${input.command.commandId}`;
  }

  if (input.command.type === "RunManualProductionCommand" && temporaryRef) {
    refs[temporaryRef] = `${input.seed}-production-run-${input.scheduledTick}-${input.command.commandId}`;
  }

  return refs;
}

function topologicalSort(commandIds: readonly string[], dependenciesByCommandId: ReadonlyMap<string, ReadonlySet<string>>): readonly string[] {
  const result: string[] = [];
  const remaining = new Set(commandIds);

  while (remaining.size > 0) {
    const ready = [...remaining].find((commandId) => [...(dependenciesByCommandId.get(commandId) ?? new Set())].every((dependency) => result.includes(dependency)));

    if (!ready) {
      throw badRequest("COMMAND_BATCH_DEPENDENCY_CYCLE", "Command batch has a circular or unsatisfied dependency graph.", {
        remaining: [...remaining].join(",")
      });
    }

    result.push(ready);
    remaining.delete(ready);
  }

  return result;
}

function assertTemporaryRef(value: string): void {
  if (!isTemporaryRef(value)) {
    throw badRequest("INVALID_TEMPORARY_REF", "Temporary references must start with '$' and include an entity namespace.", { temporaryRef: value });
  }
}

function isTemporaryRef(value: string): boolean {
  return /^\$[a-z][a-z0-9-]*:[a-z0-9][a-z0-9-]*(?::[a-z][a-z0-9-]*)?$/i.test(value.trim());
}

function commandScopedIdempotencyKey(key: string, index: number, count: number): string {
  return count === 1 ? key : `${key}:${index + 1}`;
}

function readMetadataString(event: DomainEvent | null, key: string): string | null {
  const value = event?.metadata[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readHeader(request: FastifyRequest, name: string): string | null {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value.find((item) => item.trim().length > 0) ?? null;
  }

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readBodyIdempotencyKey(body: unknown): string | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const value = (body as { readonly idempotencyKey?: unknown }).idempotencyKey;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getErrorCode(error: unknown): string {
  if (error instanceof ApiError) {
    return error.code;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message.split(/\s+/)[0]?.slice(0, 80) ?? "ERROR";
  }

  return "ERROR";
}

function slugify(value: string): string {
  const slug = value
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug.length > 0 ? slug : "item";
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}
