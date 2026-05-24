# Real Auth Session and RBAC Skeleton

Stage 3 replaces the earlier demo/header identity binding with a backend-owned session contract.

## Goals

- `playerId` is never trusted from request bodies or identity headers.
- Every request gets an authenticated session in Fastify `preHandler`.
- Player commands are bound to `session.playerId` before validation and tick execution.
- Developer/admin-only routes have explicit RBAC gates.

## Runtime Model

`apps/api/src/auth.ts` now owns auth/session resolution:

- `AuthSessionRepository` resolves an opaque session token.
- `PrismaAuthSessionRepository` loads `Session`, `User`, and `Player` using Prisma.
- `InMemoryAuthSessionRepository` supports fixed dev/demo sessions.
- `createAuthPreHandler()` attaches `request.authSession`.
- `resolvePlayerSession()` reads only `request.authSession`.
- `bindCommandToSession()` strips any command-side identity and injects the session `playerId`.
- `requireRole()` enforces role gates.

## Dev Demo Auth

The local demo fallback is fixed to `player-1`; it does not read arbitrary `playerId` headers.

Explicit dev tokens are available for local tests:

- `Authorization: Bearer dev-player-session`
- `Authorization: Bearer dev-developer-session`
- `Authorization: Bearer dev-admin-session`
- `Authorization: Bearer dev-no-assets-session`

Demo fallback is disabled when `NODE_ENV=production` or `ECONOMYSIM_DEMO_AUTH=false`.

## Forgery Protection

Requests are rejected when they include:

- `x-economysim-player-id`
- `x-economysim-user-id`
- `x-economysim-session-id`
- any nested request-body field named `playerId`

This includes direct operation bodies and `simulation/tick.commands[*].playerId`.

## RBAC

Roles are currently string roles:

- `player`
- `developer`
- `admin`

Developer/admin gates now protect:

- `GET /persistence/consistency`
- `GET /commands`
- `GET /audit-logs`

The same guard should be reused for future rollback, snapshot, admin, and constructor-publish routes.

## Prisma Contract

The schema now includes:

- `User.role String @default("player")`
- `Session.revokedAt DateTime?`

The Prisma auth repository checks active, non-expired, non-revoked sessions and returns user/player binding.

## Remaining Work

- Real login/registration endpoints.
- Token hashing or signed token validation.
- Secure cookie/header policy.
- Session rotation and revocation endpoints.
- Migration files and regenerated Prisma client when infrastructure work resumes.
