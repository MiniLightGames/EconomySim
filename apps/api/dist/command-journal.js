"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveIdempotencyKey = resolveIdempotencyKey;
exports.runJournaledCommand = runJournaledCommand;
exports.runJournaledCommandBatch = runJournaledCommandBatch;
const simulation_core_1 = require("@economysim/simulation-core");
const errors_1 = require("./errors");
const validation_1 = require("./validation");
function resolveIdempotencyKey(request, actionType) {
    const headerValue = readHeader(request, "idempotency-key") ?? readHeader(request, "x-idempotency-key");
    const bodyValue = readBodyIdempotencyKey(request.body);
    const key = (headerValue ?? bodyValue)?.trim();
    if (!key) {
        throw (0, errors_1.badRequest)("IDEMPOTENCY_KEY_REQUIRED", `${actionType} requires an Idempotency-Key header or idempotencyKey body field.`, {
            actionType
        });
    }
    if (key.length > 160) {
        throw (0, errors_1.badRequest)("IDEMPOTENCY_KEY_TOO_LONG", "Idempotency key must be 160 characters or fewer.", {
            actionType,
            length: key.length
        });
    }
    return key;
}
async function runJournaledCommand(input) {
    return runJournaledCommandBatch({
        store: input.store,
        state: input.state,
        commands: [input.command],
        session: input.session,
        seed: input.seed,
        idempotencyKey: input.idempotencyKey,
        actionType: input.actionType
    });
}
async function runJournaledCommandBatch(input) {
    if (input.commands.length === 0) {
        const tickResult = (0, simulation_core_1.runTick)({ state: input.state, commands: [], seed: input.seed });
        await input.store.saveWorld(tickResult.state);
        return {
            state: tickResult.state,
            tickResult,
            commandRecords: [],
            events: tickResult.events,
            metrics: tickResult.metrics,
            financialTransactions: tickResult.state.financialTransactions.filter((transaction) => transaction.tick === tickResult.state.currentTick),
            duplicate: false
        };
    }
    const scopedKeys = input.commands.map((_command, index) => commandScopedIdempotencyKey(input.idempotencyKey, index, input.commands.length));
    const duplicateRecords = scopedKeys
        .map((key) => findCommandByIdempotencyKey(input.state, input.session.playerId, key))
        .filter((record) => Boolean(record));
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
        return {
            state: duplicateState,
            tickResult: null,
            commandRecords: duplicateRecords,
            events: links.events,
            metrics: links.metrics,
            financialTransactions: links.financialTransactions,
            duplicate: true
        };
    }
    const createdAt = new Date().toISOString();
    const receivedRecords = input.commands.map((command, index) => createCommandRecord({
        seed: input.seed,
        command,
        session: input.session,
        idempotencyKey: scopedKeys[index],
        tickReceived: input.state.currentTick,
        createdAt
    }));
    let journaledState = {
        ...input.state,
        playerCommands: [...(input.state.playerCommands ?? []), ...receivedRecords],
        auditLogs: [
            ...(input.state.auditLogs ?? []),
            ...receivedRecords.map((record) => createAuditLog({
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
                    status: record.status
                }
            }))
        ]
    };
    try {
        (0, validation_1.validatePlayerCommandsAgainstWorld)(journaledState, input.commands);
    }
    catch (error) {
        const rejectedState = finalizeCommandRecords(journaledState, receivedRecords, {
            seed: input.seed,
            session: input.session,
            actionType: input.actionType,
            status: "rejected",
            result: "rejected",
            tickApplied: null,
            rejectionCode: getErrorCode(error),
            rejectionMessage: error instanceof Error ? error.message : "Command validation failed.",
            events: [],
            metrics: [],
            financialTransactions: []
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
        metadata: { validation: "backend-world-validation" }
    });
    let tickResult;
    try {
        tickResult = (0, simulation_core_1.runTick)({
            state: journaledState,
            commands: input.commands,
            seed: input.seed
        });
    }
    catch (error) {
        const failedState = finalizeCommandRecords(journaledState, receivedRecords, {
            seed: input.seed,
            session: input.session,
            actionType: input.actionType,
            status: "failed",
            result: "failed",
            tickApplied: null,
            rejectionCode: getErrorCode(error),
            rejectionMessage: error instanceof Error ? error.message : "Command execution failed.",
            events: [],
            metrics: [],
            financialTransactions: []
        });
        await input.store.saveWorld(failedState);
        throw error;
    }
    if (tickResult.rejectedCommands.length > 0) {
        const rejectedState = finalizeCommandRecords(tickResult.state, receivedRecords, {
            seed: input.seed,
            session: input.session,
            actionType: input.actionType,
            status: "rejected",
            result: "rejected",
            tickApplied: tickResult.state.currentTick,
            rejectionCode: tickResult.rejectedCommands[0]?.code ?? "COMMAND_REJECTED",
            rejectionMessage: tickResult.rejectedCommands[0]?.message ?? "Simulation rejected the command.",
            events: tickResult.events,
            metrics: tickResult.metrics,
            financialTransactions: tickResult.state.financialTransactions
        });
        await input.store.saveWorld(rejectedState);
        throw (0, errors_1.badRequest)("COMMAND_REJECTED", "One or more commands were rejected by simulation validation.", {
            rejectedCommands: tickResult.rejectedCommands
        });
    }
    const acceptedState = markCommandRecords(tickResult.state, receivedRecords, {
        seed: input.seed,
        session: input.session,
        actionType: input.actionType,
        status: "accepted",
        result: "accepted",
        metadata: {
            validation: "simulation-core-accepted",
            acceptedCommandCount: tickResult.acceptedCommands.length
        }
    });
    const appliedState = finalizeCommandRecords(acceptedState, receivedRecords, {
        seed: input.seed,
        session: input.session,
        actionType: input.actionType,
        status: "applied",
        result: "applied",
        tickApplied: tickResult.state.currentTick,
        rejectionCode: null,
        rejectionMessage: null,
        events: tickResult.events,
        metrics: tickResult.metrics,
        financialTransactions: tickResult.state.financialTransactions
    });
    await input.store.saveWorld(appliedState);
    const finalRecords = appliedState.playerCommands.filter((record) => receivedRecords.some((created) => created.id === record.id));
    const links = collectRecordsLinks(appliedState, finalRecords);
    return {
        state: appliedState,
        tickResult: {
            ...tickResult,
            state: appliedState
        },
        commandRecords: finalRecords,
        events: links.events,
        metrics: links.metrics,
        financialTransactions: links.financialTransactions,
        duplicate: false
    };
}
function createCommandRecord(input) {
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
function markCommandRecords(state, records, input) {
    const updatedAt = new Date().toISOString();
    const recordIds = new Set(records.map((record) => record.id));
    const updatedRecords = state.playerCommands.map((record) => recordIds.has(record.id)
        ? {
            ...record,
            status: input.status,
            updatedAt
        }
        : record);
    return {
        ...state,
        playerCommands: updatedRecords,
        auditLogs: [
            ...state.auditLogs,
            ...records.map((record) => createAuditLog({
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
            }))
        ]
    };
}
function finalizeCommandRecords(state, records, input) {
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
        };
    });
    const finalizedRecords = updatedRecords.filter((record) => commandIds.has(record.commandId));
    return {
        ...state,
        playerCommands: updatedRecords,
        auditLogs: [
            ...state.auditLogs,
            ...finalizedRecords.map((record) => createAuditLog({
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
            }))
        ]
    };
}
function appendAuditLog(state, input) {
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
function createAuditLog(input) {
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
function collectCommandLinks(state, command) {
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
function collectRecordsLinks(state, records) {
    const eventIds = new Set(records.flatMap((record) => record.resultEventIds));
    const metricIds = new Set(records.flatMap((record) => record.resultMetricIds));
    const financialTransactionIds = new Set(records.flatMap((record) => record.resultFinancialTransactionIds));
    return {
        events: state.events.filter((event) => eventIds.has(event.id)),
        metrics: state.metrics.filter((metric) => metricIds.has(metric.id)),
        financialTransactions: state.financialTransactions.filter((transaction) => financialTransactionIds.has(transaction.id))
    };
}
function findCommandByIdempotencyKey(state, playerId, idempotencyKey) {
    return (state.playerCommands ?? []).find((record) => record.playerId === playerId && record.idempotencyKey === idempotencyKey) ?? null;
}
function commandScopedIdempotencyKey(key, index, count) {
    return count === 1 ? key : `${key}:${index + 1}`;
}
function readHeader(request, name) {
    const value = request.headers[name];
    if (Array.isArray(value)) {
        return value.find((item) => item.trim().length > 0) ?? null;
    }
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function readBodyIdempotencyKey(body) {
    if (!body || typeof body !== "object") {
        return null;
    }
    const value = body.idempotencyKey;
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function getErrorCode(error) {
    if (error instanceof errors_1.ApiError) {
        return error.code;
    }
    if (error instanceof Error && error.message.length > 0) {
        return error.message.split(/\s+/)[0]?.slice(0, 80) ?? "ERROR";
    }
    return "ERROR";
}
function slugify(value) {
    const slug = value
        .toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
    return slug.length > 0 ? slug : "item";
}
function unique(values) {
    return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}
//# sourceMappingURL=command-journal.js.map