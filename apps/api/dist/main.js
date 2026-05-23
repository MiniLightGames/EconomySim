"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@economysim/config");
const server_1 = require("./server");
async function bootstrap() {
    const fallbackEnv = {
        DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://economysim:economysim@localhost:5432/economysim",
        REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
        API_PORT: process.env.API_PORT ?? process.env.PORT ?? "4000"
    };
    const env = (0, config_1.parseServerEnv)(fallbackEnv);
    const app = await (0, server_1.createApi)({ logger: true });
    await app.listen({ host: "0.0.0.0", port: env.API_PORT });
}
void bootstrap();
//# sourceMappingURL=main.js.map