import { z } from "zod";
export declare const serverEnvSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    REDIS_URL: z.ZodString;
    API_PORT: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    DATABASE_URL: string;
    REDIS_URL: string;
    API_PORT: number;
}, {
    DATABASE_URL: string;
    REDIS_URL: string;
    API_PORT?: number | undefined;
}>;
export declare const publicWebEnvSchema: z.ZodObject<{
    NEXT_PUBLIC_API_BASE_URL: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    NEXT_PUBLIC_API_BASE_URL: string;
}, {
    NEXT_PUBLIC_API_BASE_URL?: string | undefined;
}>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicWebEnv = z.infer<typeof publicWebEnvSchema>;
export declare function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv;
export declare function parsePublicWebEnv(env: NodeJS.ProcessEnv): PublicWebEnv;
//# sourceMappingURL=index.d.ts.map