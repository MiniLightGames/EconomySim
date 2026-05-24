# P1-TASK-20260524-0029-command-batch-dependencies

## Контекст

The API first player loop currently applies one operation per tick. A multi-command `/simulation/tick` request cannot create a company and buy its premise in the same batch unless the second command already knows a post-create id and validation can see prior command effects.

## Цель

Support dependent command batches without breaking deterministic tick processing.

## User Story

Как разработчик сценариев, я хочу отправить batch команд с temporary refs, чтобы один тик мог создать компанию и выполнить зависящие от неё стартовые действия.

## Scope

- Temporary command refs, e.g. `companyRef: "new-company"`.
- Command pre-validation split into static validation and staged validation after prior command effects.
- Deterministic ID reservation for created entities.
- Rejected command should not partially apply later dependent commands.

## Out of scope

Distributed queue and concurrent multiplayer conflict resolution.

## Technical Plan

1. Add command dependency graph/resolution phase.
2. Reserve entity ids before apply phase.
3. Apply commands in dependency order.
4. Add rollback/rejection behavior for dependency failure.

## UI Requirements

None initially.

## API Requirements

`/simulation/tick` accepts optional refs in commands after schema update.

## Data Changes

Command journal should store refs and resolved ids.

## Tests

- create company + buy premise in one tick.
- create + buy + produce dependency failure cancels dependent commands safely.
- duplicate refs rejected.

## Acceptance Criteria

Dependent command batches are deterministic and atomic at dependency-chain level.

## Проверки

Simulation-core command tests.

## Risks

Over-complex batching may hide clear player feedback; keep UI one-step route unless needed.

## Follow-up

Wire command journal persistence after batch model settles.
