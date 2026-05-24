import type { FastifyReply, FastifyRequest } from "fastify";
import { forbidden, unauthorized, badRequest } from "./errors";

export type AuthRole = "player" | "developer" | "admin";

export interface AuthenticatedPlayerSession {
  readonly userId: string;
  readonly sessionId: string;
  readonly playerId: string;
  readonly roles: readonly AuthRole[];
  readonly expiresAt: string | null;
  readonly source: "repository" | "demo";
}

export interface AuthSessionRepository {
  resolveSession(token: string): Promise<AuthenticatedPlayerSession | null>;
  close?(): Promise<void>;
}

export interface AuthPreHandlerOptions {
  readonly allowDemoFallback: boolean;
}

const DEMO_USER_ID = "demo-user-1";
const DEMO_SESSION_ID = "demo-session-1";
const DEMO_PLAYER_ID = "player-1";
const DEMO_EXPIRES_AT = "2099-01-01T00:00:00.000Z";

const DEV_SESSIONS: Record<string, AuthenticatedPlayerSession> = {
  "dev-player-session": {
    userId: DEMO_USER_ID,
    sessionId: DEMO_SESSION_ID,
    playerId: DEMO_PLAYER_ID,
    roles: ["player"],
    expiresAt: DEMO_EXPIRES_AT,
    source: "demo"
  },
  "dev-no-assets-session": {
    userId: "demo-no-assets-user-1",
    sessionId: "demo-no-assets-session-1",
    playerId: "no-assets",
    roles: ["player"],
    expiresAt: DEMO_EXPIRES_AT,
    source: "demo"
  },
  "dev-developer-session": {
    userId: "demo-developer-user-1",
    sessionId: "demo-developer-session-1",
    playerId: DEMO_PLAYER_ID,
    roles: ["player", "developer"],
    expiresAt: DEMO_EXPIRES_AT,
    source: "demo"
  },
  "dev-admin-session": {
    userId: "demo-admin-user-1",
    sessionId: "demo-admin-session-1",
    playerId: DEMO_PLAYER_ID,
    roles: ["player", "developer", "admin"],
    expiresAt: DEMO_EXPIRES_AT,
    source: "demo"
  }
};

export class InMemoryAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly sessions: Readonly<Record<string, AuthenticatedPlayerSession>> = DEV_SESSIONS) {}

  async resolveSession(token: string): Promise<AuthenticatedPlayerSession | null> {
    const session = this.sessions[token];

    if (!session || isExpired(session.expiresAt)) {
      return null;
    }

    return session;
  }
}

export interface PrismaAuthClientLike {
  readonly session?: {
    findFirst(args: unknown): Promise<unknown | null>;
  };
  $disconnect?(): Promise<void>;
}

export class PrismaAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly prisma: PrismaAuthClientLike) {}

  async resolveSession(token: string): Promise<AuthenticatedPlayerSession | null> {
    const row = await this.prisma.session?.findFirst({
      where: {
        id: token,
        expiresAt: {
          gt: new Date()
        },
        revokedAt: null
      },
      include: {
        user: true,
        player: true
      }
    });

    if (!isRecord(row)) {
      return null;
    }

    const user = isRecord(row.user) ? row.user : null;
    const role = readString(user, "role") ?? readString(row, "role") ?? "player";
    const roles = normalizeRoles(row.roles ?? user?.roles ?? role);
    const expiresAt = row.expiresAt instanceof Date ? row.expiresAt.toISOString() : readString(row, "expiresAt");

    if (isExpired(expiresAt)) {
      return null;
    }

    return {
      userId: readString(row, "userId") ?? readString(user, "id") ?? "",
      sessionId: readString(row, "id") ?? token,
      playerId: readString(row, "playerId") ?? "",
      roles,
      expiresAt,
      source: "repository"
    };
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect?.();
  }
}

export function createAuthPreHandler(repository: AuthSessionRepository, options: AuthPreHandlerOptions) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    rejectForgedIdentity(request);

    const token = readBearerToken(request) ?? readHeader(request, "x-economysim-session-token");
    const session = token ? await repository.resolveSession(token) : null;
    const resolvedSession = session ?? (options.allowDemoFallback ? DEV_SESSIONS["dev-player-session"] : null);

    if (!resolvedSession) {
      throw unauthorized("AUTH_SESSION_REQUIRED", "A valid EconomySim session token is required.");
    }

    if (!resolvedSession.playerId || !resolvedSession.userId || !resolvedSession.sessionId) {
      throw unauthorized("AUTH_SESSION_INVALID", "The session is missing user/player binding.", {
        userId: resolvedSession.userId,
        sessionId: resolvedSession.sessionId,
        playerId: resolvedSession.playerId
      });
    }

    request.authSession = resolvedSession;
  };
}

export function resolvePlayerSession(request: FastifyRequest): AuthenticatedPlayerSession {
  if (!request.authSession) {
    throw unauthorized("AUTH_SESSION_NOT_RESOLVED", "Auth preHandler did not resolve a session for this request.");
  }

  return request.authSession;
}

export function bindCommandToSession<T extends object>(command: T, session: AuthenticatedPlayerSession): Omit<T, "playerId"> & { readonly playerId: string } {
  return {
    ...withoutPlayerId(command),
    playerId: session.playerId
  } as Omit<T, "playerId"> & { readonly playerId: string };
}

export function requireRole(request: FastifyRequest, acceptedRoles: readonly AuthRole[]): AuthenticatedPlayerSession {
  const session = resolvePlayerSession(request);

  if (!acceptedRoles.some((role) => session.roles.includes(role))) {
    throw forbidden("RBAC_FORBIDDEN", "This operation requires a higher EconomySim role.", {
      requiredRoles: acceptedRoles,
      roles: session.roles
    });
  }

  return session;
}

function rejectForgedIdentity(request: FastifyRequest): void {
  const forbiddenHeaders = ["x-economysim-player-id", "x-economysim-user-id", "x-economysim-session-id"];
  const suppliedForbiddenHeaders = forbiddenHeaders.filter((name) => Boolean(readHeader(request, name)));

  if (suppliedForbiddenHeaders.length > 0) {
    throw badRequest("FORGED_IDENTITY_HEADER", "Identity cannot be supplied through request headers. Use a session token instead.", {
      headers: suppliedForbiddenHeaders
    });
  }

  const bodyPaths = collectPlayerIdPaths(request.body);

  if (bodyPaths.length > 0) {
    throw badRequest("FORGED_PLAYER_ID_BODY", "playerId is derived from the authenticated session and cannot be supplied in request bodies.", {
      paths: bodyPaths
    });
  }
}

function collectPlayerIdPaths(value: unknown, prefix = "body"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectPlayerIdPaths(item, `${prefix}[${index}]`));
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const path = `${prefix}.${key}`;
    const current = key === "playerId" ? [path] : [];
    return [...current, ...collectPlayerIdPaths(child, path)];
  });
}

function withoutPlayerId<T extends object>(command: T): Omit<T, "playerId"> {
  const { playerId: _playerId, ...rest } = command as T & { readonly playerId?: unknown };
  return rest as Omit<T, "playerId">;
}

function readBearerToken(request: FastifyRequest): string | null {
  const authorization = readHeader(request, "authorization");

  if (!authorization) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/iu.exec(authorization);
  return match?.[1]?.trim() || null;
}

function readHeader(request: FastifyRequest, name: string): string | null {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value.find((item) => item.trim().length > 0) ?? null;
  }

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

const DEMO_SESSIONS = {
  player: DEV_SESSIONS["dev-player-session"]
} as const;

function normalizeRoles(value: unknown): readonly AuthRole[] {
  const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const roles = values.filter((role): role is AuthRole => role === "player" || role === "developer" || role === "admin");

  return roles.length > 0 ? Array.from(new Set(roles)) : ["player"];
}

function isExpired(expiresAt: string | null | undefined): boolean {
  return typeof expiresAt === "string" && expiresAt.length > 0 && Date.parse(expiresAt) <= Date.now();
}

function readString(row: Record<string, unknown> | null, key: string): string | null {
  if (!row) {
    return null;
  }

  const value = row[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

declare module "fastify" {
  interface FastifyRequest {
    authSession?: AuthenticatedPlayerSession;
  }
}
