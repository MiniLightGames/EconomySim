"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApi = createApi;
const cors_1 = require("@fastify/cors");
const fastify_1 = require("fastify");
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
        const prismaModule = (await Promise.resolve().then(() => require("@prisma/client")));
        if (!prismaModule.PrismaClient) {
            throw new Error("PrismaClient is unavailable. Run `pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma`.");
        }
        return new store_1.PrismaWorldStore(new prismaModule.PrismaClient(), seed);
    }
    return new store_1.InMemoryWorldStore();
}
async function createDefaultAuthRepository() {
    if (process.env.API_STORE === "prisma") {
        const prismaModule = (await Promise.resolve().then(() => require("@prisma/client")));
        if (!prismaModule.PrismaClient) {
            throw new Error("PrismaClient is unavailable. Run `pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma`.");
        }
        return new auth_1.PrismaAuthSessionRepository(new prismaModule.PrismaClient());
    }
    return new auth_1.InMemoryAuthSessionRepository();
}
//# sourceMappingURL=server.js.map