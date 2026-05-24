"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApi = createApi;
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_1 = __importDefault(require("fastify"));
const errors_1 = require("./errors");
const routes_1 = require("./routes");
const auth_1 = require("./auth");
const store_1 = require("./store");
async function createApi(options = {}) {
    const seed = options.seed ?? "api";
    const store = options.store ?? (await createDefaultStore(seed));
    const authRepository = options.authRepository ?? (await createDefaultAuthRepository());
    const allowDemoFallback = options.allowDemoAuth ?? (process.env.ECONOMYSIM_DEMO_AUTH !== "false" && process.env.NODE_ENV !== "production");
    const app = (0, fastify_1.default)({
        logger: options.logger ?? false
    });
    await app.register(cors_1.default, {
        origin: true
    });
    app.decorate("worldStore", store);
    app.decorate("authRepository", authRepository);
    app.setErrorHandler(errors_1.apiErrorHandler);
    app.addHook("preHandler", (0, auth_1.createAuthPreHandler)(authRepository, { allowDemoFallback }));
    app.addHook("onClose", async () => {
        await store.close();
        await authRepository.close?.();
    });
    await (0, routes_1.registerRoutes)(app, { store, seed });
    return app;
}
async function createDefaultStore(seed) {
    if (process.env.API_STORE === "prisma") {
        const prismaModule = (await Promise.resolve().then(() => __importStar(require("@prisma/client"))));
        if (!prismaModule.PrismaClient) {
            throw new Error("PrismaClient is unavailable. Run `pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma`.");
        }
        return new store_1.PrismaWorldStore(new prismaModule.PrismaClient(), seed);
    }
    return new store_1.InMemoryWorldStore();
}
async function createDefaultAuthRepository() {
    if (process.env.API_STORE === "prisma") {
        const prismaModule = (await Promise.resolve().then(() => __importStar(require("@prisma/client"))));
        if (!prismaModule.PrismaClient) {
            throw new Error("PrismaClient is unavailable. Run `pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma`.");
        }
        return new auth_1.PrismaAuthSessionRepository(new prismaModule.PrismaClient());
    }
    return new auth_1.InMemoryAuthSessionRepository();
}
//# sourceMappingURL=server.js.map