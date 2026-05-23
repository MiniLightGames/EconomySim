# P0-TASK-20260522-0002-quality-gates

## Контекст

AGENTS.md требует обязательные команды качества для каждого coding task.

## Цель

Сделать `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` доступными с первого bootstrap.

## Scope

- ESLint flat config.
- TypeScript strict config.
- Vitest tests and pass-with-no-tests fallback.
- Turbo task graph with dependency builds.

## Out of scope

- Полный e2e suite.
- Load/performance tests.

## Acceptance Criteria

- Команды запускаются из root.
- Ошибки проверок не скрываются.
- Есть первые unit/scenario smoke tests.

## Проверки

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm sim:test
```

## Риски

- Next/Nest/toolchain version drift может потребовать pinning.

## Follow-up

- Добавить Playwright e2e после первого интерактивного vertical slice.
