# P1-TASK-20260524-0028-real-auth-rbac-session

## Статус

Done — реализовано в stage 3.

## Контекст

`P1-TASK-20260524-0026` added a session skeleton that bound commands to demo/header session values. `P1-TASK-20260524-0031` then added command journal, idempotency, and audit. The remaining auth risk was that arbitrary request headers could still impersonate another player.

## Цель

Replace demo/header player identity with repository-backed user/session/player binding and minimum RBAC gates.

## User Story

Как игрок, я хочу, чтобы мои действия были привязаны к моему аккаунту и игроку, а другой клиент не мог подставить мой `playerId`.

## Scope Implemented

- Added `AuthSessionRepository` contract in `apps/api/src/auth.ts`.
- Added `InMemoryAuthSessionRepository` for explicit dev/demo tokens.
- Added `PrismaAuthSessionRepository` over `Session -> User -> Player` lookup.
- Added Fastify global `preHandler` that attaches `request.authSession`.
- Removed trust in `x-economysim-player-id`, `x-economysim-user-id`, and `x-economysim-session-id`.
- Rejects any `playerId` nested in request bodies, including `simulation/tick.commands[*].playerId`.
- Keeps dev fallback as fixed demo player when `ECONOMYSIM_DEMO_AUTH !== "false"` and `NODE_ENV !== "production"`.
- Added explicit dev tokens:
  - `Authorization: Bearer dev-player-session`
  - `Authorization: Bearer dev-developer-session`
  - `Authorization: Bearer dev-admin-session`
  - `Authorization: Bearer dev-no-assets-session` for tests.
- Added RBAC roles: `player`, `developer`, `admin`.
- Added `requireRole()` guard.
- Protected debug persistence/command/audit endpoints with `developer/admin`.
- Extended Prisma `User` with `role` and `Session` with `revokedAt`.
- Updated DB persistence contract notes.

## Out of scope

- OAuth provider selection.
- Password login/registration UX.
- Signed/hashed production tokens.
- Cookie/session storage policy.
- Migration files and generated Prisma client refresh.

## API Requirements

- Player operation routes derive `playerId` only from `request.authSession`.
- Forged identity headers return `FORGED_IDENTITY_HEADER`.
- Forged body `playerId` returns `FORGED_PLAYER_ID_BODY`.
- Missing/invalid sessions return auth errors when demo fallback is disabled.
- Debug persistence/command/audit endpoints require `developer` or `admin`.

## Data Changes

- `User.role String @default("player")`.
- `Session.revokedAt DateTime?`.

## Acceptance Criteria

- No player operation trusts client-supplied player identity.
- Session lookup binds `userId`, `sessionId`, `playerId`, and roles server-side.
- Dev fallback cannot choose arbitrary `playerId` through request headers.
- RBAC guards exist for developer/admin-only operations.

## Проверки

- Targeted API/domain/db TypeScript source check with local stubs: passed.
- Emitted API/db JS and declaration files from changed sources: passed.
- `node --check` on changed emitted JS: passed.
- Integration test sources updated for forged header/body rejection and RBAC behavior.

## Risks

- Production auth still needs real token issuance, hashing/signing, cookie/header policy, and migrations.
- Full runtime DB auth needs regenerated Prisma client after schema changes.

## Follow-up

- Add registration/login UX once core gameplay auth stabilizes.
- Add DB unique constraints/indexes for production-grade sessions and command idempotency when infrastructure/migrations enter scope.
