# P1-TASK-20260522-0008-create-company-vertical

## Контекст

Первое осмысленное действие игрока — регистрация компании.

## Цель

Сделать вертикальный срез создания компании.

## Scope

- Prisma model and repository for company creation.
- `CreateCompanyCommand` DTO and backend validation.
- Registration fee through ledger transaction.
- Audit log record.
- `POST /api/commands/create-company`.
- Player company list in UI.
- Unit, integration, e2e tests.

## Out of scope

- Лицензии, филиалы, сложное налоговое резидентство.

## Acceptance Criteria

- Игрок создаёт компанию только через command endpoint.
- Деньги списываются через balanced ledger.
- Company appears in player dashboard.
- Event and audit log are written.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Риски

- Нельзя допустить прямого изменения money fields без ledger.

## Follow-up

- Добавить менеджеров и legal requirements по странам.
