import { z } from "zod";
export declare const serverEnvSchema: any;
export declare const publicWebEnvSchema: any;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicWebEnv = z.infer<typeof publicWebEnvSchema>;
export declare function parseServerEnv(env: NodeJS.ProcessEnv): ServerEnv;
export declare function parsePublicWebEnv(env: NodeJS.ProcessEnv): PublicWebEnv;
//# sourceMappingURL=index.d.ts.map