import { z } from "zod";

export const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  API_PORT: z.coerce.number().int().positive().default(4000)
});

export const publicWebEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000")
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicWebEnv = z.infer<typeof publicWebEnvSchema>;

export function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv {
  return serverEnvSchema.parse(env);
}

export function parsePublicWebEnv(env: NodeJS.ProcessEnv): PublicWebEnv {
  return publicWebEnvSchema.parse(env);
}
