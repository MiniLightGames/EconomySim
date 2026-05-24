import type { FastifyRequest } from "fastify";

export interface AuthenticatedPlayerSession {
  readonly userId: string;
  readonly sessionId: string;
  readonly playerId: string;
}

const DEMO_USER_ID = "demo-user-1";
const DEMO_SESSION_ID = "demo-session-1";
const DEMO_PLAYER_ID = "player-1";

export function resolvePlayerSession(request: FastifyRequest): AuthenticatedPlayerSession {
  return {
    userId: readHeader(request, "x-economysim-user-id") ?? DEMO_USER_ID,
    sessionId: readHeader(request, "x-economysim-session-id") ?? DEMO_SESSION_ID,
    playerId: readHeader(request, "x-economysim-player-id") ?? DEMO_PLAYER_ID
  };
}

export function bindCommandToSession<T extends object>(command: T, session: AuthenticatedPlayerSession): Omit<T, "playerId"> & { readonly playerId: string } {
  return {
    ...command,
    playerId: session.playerId
  };
}

function readHeader(request: FastifyRequest, name: string): string | null {
  const value = request.headers[name];

  if (Array.isArray(value)) {
    return value.find((item) => item.trim().length > 0) ?? null;
  }

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
