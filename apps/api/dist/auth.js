"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAuthSessionRepository = exports.InMemoryAuthSessionRepository = void 0;
exports.createAuthPreHandler = createAuthPreHandler;
exports.resolvePlayerSession = resolvePlayerSession;
exports.bindCommandToSession = bindCommandToSession;
exports.requireRole = requireRole;
const errors_1 = require("./errors");
const DEMO_USER_ID = "demo-user-1";
const DEMO_SESSION_ID = "demo-session-1";
const DEMO_PLAYER_ID = "player-1";
const DEMO_EXPIRES_AT = "2099-01-01T00:00:00.000Z";
const DEV_SESSIONS = {
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
class InMemoryAuthSessionRepository {
    sessions;
    constructor(sessions = DEV_SESSIONS) {
        this.sessions = sessions;
    }
    async resolveSession(token) {
        const session = this.sessions[token];
        if (!session || isExpired(session.expiresAt)) {
            return null;
        }
        return session;
    }
}
exports.InMemoryAuthSessionRepository = InMemoryAuthSessionRepository;
class PrismaAuthSessionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolveSession(token) {
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
    async close() {
        await this.prisma.$disconnect?.();
    }
}
exports.PrismaAuthSessionRepository = PrismaAuthSessionRepository;
function createAuthPreHandler(repository, options) {
    return async (request, _reply) => {
        rejectForgedIdentity(request);
        const token = readBearerToken(request) ?? readHeader(request, "x-economysim-session-token");
        const session = token ? await repository.resolveSession(token) : null;
        const resolvedSession = session ?? (options.allowDemoFallback ? DEMO_SESSIONS.player : null);
        if (!resolvedSession) {
            throw (0, errors_1.unauthorized)("AUTH_SESSION_REQUIRED", "A valid EconomySim session token is required.");
        }
        if (!resolvedSession.playerId || !resolvedSession.userId || !resolvedSession.sessionId) {
            throw (0, errors_1.unauthorized)("AUTH_SESSION_INVALID", "The session is missing user/player binding.", {
                userId: resolvedSession.userId,
                sessionId: resolvedSession.sessionId,
                playerId: resolvedSession.playerId
            });
        }
        request.authSession = resolvedSession;
    };
}
function resolvePlayerSession(request) {
    if (!request.authSession) {
        throw (0, errors_1.unauthorized)("AUTH_SESSION_NOT_RESOLVED", "Auth preHandler did not resolve a session for this request.");
    }
    return request.authSession;
}
function bindCommandToSession(command, session) {
    return {
        ...withoutPlayerId(command),
        playerId: session.playerId
    };
}
function requireRole(request, acceptedRoles) {
    const session = resolvePlayerSession(request);
    if (!acceptedRoles.some((role) => session.roles.includes(role))) {
        throw (0, errors_1.forbidden)("RBAC_FORBIDDEN", "This operation requires a higher EconomySim role.", {
            requiredRoles: acceptedRoles,
            roles: session.roles
        });
    }
    return session;
}
function rejectForgedIdentity(request) {
    const forbiddenHeaders = ["x-economysim-player-id", "x-economysim-user-id", "x-economysim-session-id"];
    const suppliedForbiddenHeaders = forbiddenHeaders.filter((name) => Boolean(readHeader(request, name)));
    if (suppliedForbiddenHeaders.length > 0) {
        throw (0, errors_1.badRequest)("FORGED_IDENTITY_HEADER", "Identity cannot be supplied through request headers. Use a session token instead.", {
            headers: suppliedForbiddenHeaders
        });
    }
    const bodyPaths = collectPlayerIdPaths(request.body);
    if (bodyPaths.length > 0) {
        throw (0, errors_1.badRequest)("FORGED_PLAYER_ID_BODY", "playerId is derived from the authenticated session and cannot be supplied in request bodies.", {
            paths: bodyPaths
        });
    }
}
function collectPlayerIdPaths(value, prefix = "body") {
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
function withoutPlayerId(command) {
    const { playerId: _playerId, ...rest } = command;
    return rest;
}
function readBearerToken(request) {
    const authorization = readHeader(request, "authorization");
    if (!authorization) {
        return null;
    }
    const match = /^Bearer\s+(.+)$/iu.exec(authorization);
    return match?.[1]?.trim() || null;
}
function readHeader(request, name) {
    const value = request.headers[name];
    if (Array.isArray(value)) {
        return value.find((item) => item.trim().length > 0) ?? null;
    }
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
const DEMO_SESSIONS = {
    player: DEV_SESSIONS["dev-player-session"]
};
function normalizeRoles(value) {
    const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
    const roles = values.filter((role) => role === "player" || role === "developer" || role === "admin");
    return roles.length > 0 ? Array.from(new Set(roles)) : ["player"];
}
function isExpired(expiresAt) {
    return typeof expiresAt === "string" && expiresAt.length > 0 && Date.parse(expiresAt) <= Date.now();
}
function readString(row, key) {
    if (!row) {
        return null;
    }
    const value = row[key];
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=auth.js.map