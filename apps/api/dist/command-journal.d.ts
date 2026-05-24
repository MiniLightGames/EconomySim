import type { FastifyRequest } from "fastify";
import type { DomainEvent, FinancialTransaction, Metric, PlayerCommand, PlayerCommandRecord, WorldState } from "@economysim/domain";
import type { TickResult } from "@economysim/simulation-core";
import type { AuthenticatedPlayerSession } from "./auth";
import type { WorldStore } from "./store";
export interface JournaledCommandExecution {
    readonly state: WorldState;
    readonly tickResult: TickResult | null;
    readonly commandRecords: readonly PlayerCommandRecord[];
    readonly events: readonly DomainEvent[];
    readonly metrics: readonly Metric[];
    readonly financialTransactions: readonly FinancialTransaction[];
    readonly duplicate: boolean;
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
}): Promise<JournaledCommandExecution>;
export declare function runJournaledCommandBatch(input: {
    readonly store: WorldStore;
    readonly state: WorldState;
    readonly commands: readonly PlayerCommand[];
    readonly session: AuthenticatedPlayerSession;
    readonly seed: string;
    readonly idempotencyKey: string;
    readonly actionType: string;
}): Promise<JournaledCommandExecution>;
//# sourceMappingURL=command-journal.d.ts.map