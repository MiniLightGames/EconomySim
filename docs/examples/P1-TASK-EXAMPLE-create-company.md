# P1-TASK-EXAMPLE-create-company

## Контекст

Игрок должен уметь начать игру: зарегистрировать компанию в стране и увидеть её в интерфейсе.

## Цель

Сделать вертикальный срез создания компании.

## Scope

- DB table companies.
- CreateCompanyCommand.
- Backend endpoint `/api/commands/create-company`.
- Validation: funds, country rating, legal requirements.
- Audit log.
- UI form.
- Company dashboard list.
- Unit/integration/e2e tests.

## Acceptance Criteria

- Игрок создаёт компанию.
- Деньги списываются.
- Компания видна в UI.
- Событие записано.
- Audit log создан.
- Проверки проходят.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Follow-up

- лицензии;
- налоговое резидентство;
- филиалы;
- менеджеры.
