/**
 * Gate 3.4 · Presentation boundary test.
 *
 * The dashboard module is presentation-only: it may not import the
 * provisioning domain, orchestrator, providers, repositories, or the
 * `*.server.ts` facade internals. Its only backend surface is
 * `@/lib/provisioning-admin/*.functions`.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src/modules/platform/provisioning");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === "__tests__" ? [] : walk(full);
    }
    return /\.tsx?$/.test(entry) ? [full] : [];
  });
}

const FORBIDDEN = [
  /@\/lib\/provisioning\/domain/,
  /@\/lib\/provisioning\/orchestrator/,
  /@\/lib\/provisioning\/providers/,
  /@\/lib\/provisioning\/repositories/,
  /@\/lib\/provisioning-admin\/[a-z-]+\.server/,
  /@\/integrations\/supabase\/client\.server/,
];

const files = walk(ROOT);

describe("provisioning dashboard boundaries", () => {
  it("finds module source files", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it.each(files)("%s imports no domain or server internals", (file) => {
    const source = readFileSync(file, "utf8");
    for (const pattern of FORBIDDEN) {
      expect(source).not.toMatch(pattern);
    }
  });

  it("only reaches the backend through the admin facade", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      const imports = [...source.matchAll(/from "(@\/lib\/provisioning[^"]*)"/g)].map(
        (m) => m[1],
      );
      for (const specifier of imports) {
        expect(specifier).toMatch(/^@\/lib\/provisioning(-admin\/[a-z-]+\.functions|\/lifecycle)$/);
      }
    }
  });
});
