import { describe, expect, it } from "vitest";

import { logger } from "@lib/logger";

describe("smoke", () => {
  it("test runtime works", () => {
    expect(true).toBe(true);
  });

  it("path aliases resolve under Vitest", () => {
    expect(typeof logger).toBe("object");
  });
});
