import { describe, expect, it } from "vitest";
import { parsePublicWebEnv, parseServerEnv } from "../src";

describe("environment schemas", () => {
  it("parses server environment values", () => {
    expect(
      parseServerEnv({
        DATABASE_URL: "postgresql://economysim:economysim@localhost:5432/economysim",
        REDIS_URL: "redis://localhost:6379",
        API_PORT: "4000"
      })
    ).toMatchObject({ API_PORT: 4000 });
  });

  it("defaults the public API base URL", () => {
    expect(parsePublicWebEnv({}).NEXT_PUBLIC_API_BASE_URL).toBe("http://localhost:4000");
  });
});
