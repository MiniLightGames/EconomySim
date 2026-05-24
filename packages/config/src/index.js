"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicWebEnvSchema = exports.serverEnvSchema = void 0;
exports.parseServerEnv = parseServerEnv;
exports.parsePublicWebEnv = parsePublicWebEnv;
const zod_1 = require("zod");
exports.serverEnvSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().url(),
    API_PORT: zod_1.z.coerce.number().int().positive().default(4000)
});
exports.publicWebEnvSchema = zod_1.z.object({
    NEXT_PUBLIC_API_BASE_URL: zod_1.z.string().url().default("http://localhost:4000")
});
function parseServerEnv(env) {
    return exports.serverEnvSchema.parse(env);
}
function parsePublicWebEnv(env) {
    return exports.publicWebEnvSchema.parse(env);
}
//# sourceMappingURL=index.js.map