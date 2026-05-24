import type { FastifyRequest } from "fastify";
import type { CommandBatchFailurePolicy, DomainEvent, FinancialTransaction, Metric, PlayerCommand, PlayerCommandRecord, PlayerCommandRecordStatus, WorldState } from "@economysim/domain";
import type { RejectedCommand, TickResult } from "@economysim/simulation-core";
import type { AuthenticatedPlayerSession } from "./auth";
import type { WorldStore } from "./store";
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
export declare function resolveIdempotencyKey(request: FastifyRequest, actionType: string): string;
export declare function runJournaledCommand(input: {
    readonly store: WorldStore;
    readonly state: WorldState;
    readonly command: PlayerCommand;
    readonly session: AuthenticatedPlayerSession;
    readonly seed: string;
    readonly idempotencyKey: string;
    readonly actionType: string;
    readonly failurePolicy?: CommandBatchFailurePolicy;
}): Promise<JournaledCommandExecution>;
export declare function runJournaledCommandBatch(input: {
    readonly store: WorldStore;
    readonly state: WorldState;
    readonly commands: readonly PlayerCommand[];
    readonly session: AuthenticatedPlayerSession;
    readonly seed: string;
    readonly idempotencyKey: string;
    readonly actionType: string;
    readonly failurePolicy?: CommandBatchFailurePolicy;
}): Promise<JournaledCommandExecution>;
export declare function prepareDependentCommandBatch(input: {
    readonly state: WorldState;
    readonly commands: readonly PlayerCommand[];
    readonly seed: string;
}): PreparedCommandBatch;
export {};
//# sourceMappingURL=command-journal.d.ts.map