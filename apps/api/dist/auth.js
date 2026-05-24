"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePlayerSession = resolvePlayerSession;
exports.bindCommandToSession = bindCommandToSession;
const DEMO_USER_ID = "demo-user-1";
const DEMO_SESSION_ID = "demo-session-1";
const DEMO_PLAYER_ID = "player-1";
function resolvePlayerSession(request) {
    return {
        userId: readHeader(request, "x-economysim-user-id") ?? DEMO_USER_ID,
        sessionId: readHeader(request, "x-economysim-session-id") ?? DEMO_SESSION_ID,
        playerId: readHeader(request, "x-economysim-player-id") ?? DEMO_PLAYER_ID
    };
}
function bindCommandToSession(command, session) {
    return {
        ...command,
        playerId: session.playerId
    };
}
function readHeader(request, name) {
    const value = request.headers[name];
    if (Array.isArray(value)) {
        return value.find((item) => item.trim().length > 0) ?? null;
    }
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
//# sourceMappingURL=auth.js.map