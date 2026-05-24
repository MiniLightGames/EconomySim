# P1-TASK-20260524-0028-real-auth-rbac-session

## Контекст

`P1-TASK-20260524-0026` added a session skeleton that binds commands to demo/header session values. It prevents trusting operation body `playerId`, but it is not real authentication.

## Цель

Replace demo/header session binding with real user/session/player binding and permission checks.

## User Story

Как игрок, я хочу, чтобы мои действия были привязаны к моему аккаунту и игроку, а другой клиент не мог подставить мой `playerId`.

## Scope

- Session lookup by signed token/header/cookie.
- User -> Player ownership verification.
- API request decoration with authenticated session.
- RBAC roles for player/admin/dev tools.
- Tests for forged playerId body/header rejection.

## Out of scope

OAuth provider selection and production secrets management.

## Technical Plan

1. Add `AuthSessionRepository` using Prisma `User`, `Player`, `Session`.
2. Add Fastify preHandler that resolves session and attaches it to request.
3. Remove demo header fallback from non-development mode.
4. Add admin/dev role checks for snapshots/rollback/constructor publishing.

## UI Requirements

Show current player identity in dev/debug panel.

## API Requirements

- Reject unauthenticated operation routes outside dev mode.
- Ignore or reject body `playerId` in all player commands.

## Data Changes

Use `User`, `Player`, `Session`; add role table or enum if required.

## Tests

- Valid session accepted.
- Missing session rejected.
- Forged playerId cannot affect another player company.
- Admin-only endpoints reject player sessions.

## Acceptance Criteria

No player operation trusts client-supplied player identity.

## Проверки

API auth tests + manual route checks.

## Risks

Auth changes can block local demo flows if dev fallback is not explicit.

## Follow-up

Add account registration UX after core auth stabilizes.
