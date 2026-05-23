import { parseServerEnv } from "@economysim/config";
import { createApi } from "./server";

async function bootstrap() {
  const fallbackEnv = {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://economysim:economysim@localhost:5432/economysim",
    REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
    API_PORT: process.env.API_PORT ?? process.env.PORT ?? "4000"
  };
  const env = parseServerEnv(fallbackEnv);
  const app = await createApi({ logger: true });

  await app.listen({ host: "0.0.0.0", port: env.API_PORT });
}

void bootstrap();
