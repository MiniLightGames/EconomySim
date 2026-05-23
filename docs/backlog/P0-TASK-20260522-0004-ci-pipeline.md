# P0-TASK-20260522-0004-ci-pipeline

## Контекст

Autonomous agents не должны вливать изменения без проверок.

## Цель

Создать GitHub Actions CI pipeline.

## Scope

- Checkout, Node, pnpm setup.
- `pnpm install --frozen-lockfile`.
- lint/typecheck/test/build.
- Docker build smoke для API и worker.

## Out of scope

- Deployment.
- Release automation.

## Acceptance Criteria

- CI файл находится в `.github/workflows/ci.yml`.
- CI повторяет локальные quality gates.
- Docker smoke показывает, что сервисы можно собрать.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Риски

- GitHub hosted runner versions могут отличаться от локального окружения.

## Follow-up

- Добавить dependency/security scan.
