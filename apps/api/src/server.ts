import cors from "@fastify/cors";
import fastify, { type FastifyInstance } from "fastify";
import { apiErrorHandler } from "./errors";
import { registerRoutes } from "./routes";
import { InMemoryWorldStore, PrismaWorldStore, type PrismaClientLike, type WorldStore } from "./store";

export interface CreateApiOptions {
  readonly store?: WorldStore;
  readonly seed?: string;
  readonly logger?: boolean;
}

export async function createApi(options: CreateApiOptions = {}): Promise<FastifyInstance> {
  const seed = options.seed ?? "api";
  const store = options.store ?? (await createDefaultStore(seed));
  const app = fastify({
    logger: options.logger ?? false
  });

  await app.register(cors, {
    origin: true
  });

  app.decorate("worldStore", store);
  app.setErrorHandler(apiErrorHandler);
  app.addHook("onClose", async () => {
    await store.close();
  });

  await registerRoutes(app, { store, seed });

  return app;
}

async function createDefaultStore(seed: string): Promise<WorldStore> {
  if (process.env.API_STORE === "prisma") {
    const prismaModule = (await import("@prisma/client")) as {
      readonly PrismaClient?: new () => PrismaClientLike;
    };

    if (!prismaModule.PrismaClient) {
      throw new Error("PrismaClient is unavailable. Run `pnpm --dir packages/db exec prisma generate --schema prisma/schema.prisma`.");
    }

    return new PrismaWorldStore(new prismaModule.PrismaClient(), seed);
  }

  return new InMemoryWorldStore();
}
