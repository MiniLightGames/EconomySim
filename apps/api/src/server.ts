import cors from "@fastify/cors";
import fastify, { type FastifyInstance } from "fastify";
import { apiErrorHandler } from "./errors";
import { registerRoutes } from "./routes";
import {
  createAuthPreHandler,
  InMemoryAuthSessionRepository,
  PrismaAuthSessionRepository,
  type AuthSessionRepository,
  type PrismaAuthClientLike
} from "./auth";
import { InMemoryWorldStore, PrismaWorldStore, type PrismaClientLike, type WorldStore } from "./store";

export interface CreateApiOptions {
  readonly store?: WorldStore;
  readonly authRepository?: AuthSessionRepository;
  readonly seed?: string;
  readonly logger?: boolean;
  readonly allowDemoAuth?: boolean;
}

export async function createApi(options: CreateApiOptions = {}): Promise<FastifyInstance> {
  const seed = options.seed ?? "api";
  const store = options.store ?? (await createDefaultStore(seed));
  const authRepository = options.authRepository ?? (await createDefaultAuthRepository());
  const allowDemoFallback = options.allowDemoAuth ?? (process.env.ECONOMYSIM_DEMO_AUTH !== "false" && process.env.NODE_ENV !== "production");
  const app = fastify({
    logger: options.logger ?? false
  });

  await app.register(cors, {
    origin: true
  });

  app.decorate("worldStore", store);
  app.decorate("authRepository", authRepository);
  app.setErrorHandler(apiErrorHandler);
  app.addHook("preHandler", createAuthPreHandler(authRepository, { allowDemoFallback }));
  app.addHook("onClose", async () => {
    await store.close();
    await authRepository.close?.();
  });

  await registerRoutes(app, { store, seed });

  return app;
}

async function createDefaultStore(seed: string): Promise<WorldStore> {
  if (process.env.API_STORE === "prisma") {
    const prismaModule = (await import("@prisma/client")) as unknown as {
      readonly PrismaClient?: new () => PrismaClientLike;
    };

    if (!prismaModule.PrismaClient) {
      throw new Error("PrismaClient is unavailable. Run `pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma`.");
    }

    return new PrismaWorldStore(new prismaModule.PrismaClient(), seed);
  }

  return new InMemoryWorldStore();
}

async function createDefaultAuthRepository(): Promise<AuthSessionRepository> {
  if (process.env.API_STORE === "prisma") {
    const prismaModule = (await import("@prisma/client")) as unknown as {
      readonly PrismaClient?: new () => PrismaAuthClientLike;
    };

    if (!prismaModule.PrismaClient) {
      throw new Error("PrismaClient is unavailable. Run `pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma`.");
    }

    return new PrismaAuthSessionRepository(new prismaModule.PrismaClient());
  }

  return new InMemoryAuthSessionRepository();
}

declare module "fastify" {
  interface FastifyInstance {
    worldStore: WorldStore;
    authRepository: AuthSessionRepository;
  }
}
