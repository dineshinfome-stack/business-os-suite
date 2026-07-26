/**
 * Gate 3.2.1 · Architecture boundary guard.
 *
 * Turns the pre-Gate-3.2.2 compliance checklist into a standing regression
 * control: the orchestrator core must remain pure coordination over ports.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ORCHESTRATOR_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Only the logger adapter may reach outside `src/lib/provisioning/`. */
const EXTERNAL_IMPORT_ALLOWLIST = new Set(["logger.ts"]);

const FORBIDDEN_IMPORTS = [
  /from\s+["'][^"']*supabase/i,
  /from\s+["']@\/integrations\//,
  /from\s+["']axios["']/,
  /from\s+["']node-fetch["']/,
  /from\s+["']@tanstack\/react-start["']/,
  /createServerFn/,
];

function coreFiles(): { name: string; source: string }[] {
  return readdirSync(ORCHESTRATOR_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".ts"))
    .map((e) => ({
      name: e.name,
      source: readFileSync(join(ORCHESTRATOR_DIR, e.name), "utf8"),
    }));
}

/** Strips line and block comments so invariant notes don't trip the scans. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const FILES = coreFiles();

describe("orchestrator · architecture boundaries", () => {
  it("contains the expected core modules", () => {
    const names = FILES.map((f) => f.name).sort();
    expect(names).toContain("orchestrator.ts");
    expect(names).toContain("executor.ts");
    expect(names).toContain("types.ts");
    expect(FILES.length).toBeGreaterThan(5);
  });

  it.each(FILES.map((f) => f.name))(
    "%s imports no infrastructure, SDK or server-function module",
    (name) => {
      const source = stripComments(FILES.find((f) => f.name === name)!.source);
      for (const pattern of FORBIDDEN_IMPORTS) {
        expect(source, `${name} violates ${pattern}`).not.toMatch(pattern);
      }
    },
  );

  it.each(FILES.map((f) => f.name))("%s performs no direct network I/O", (name) => {
    const source = stripComments(FILES.find((f) => f.name === name)!.source);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/XMLHttpRequest|WebSocket\s*\(/);
  });

  it.each(FILES.map((f) => f.name))(
    "%s never writes tenants.provisioning_status (Risk D1)",
    (name) => {
      const source = stripComments(FILES.find((f) => f.name === name)!.source);
      expect(source).not.toContain("provisioning_status");
      expect(source).not.toMatch(/\bfrom\(["']tenants["']\)/);
    },
  );

  it("keeps every core module inside the provisioning domain", () => {
    for (const { name, source } of FILES) {
      if (EXTERNAL_IMPORT_ALLOWLIST.has(name)) continue;
      const specifiers = [...stripComments(source).matchAll(/from\s+["']([^"']+)["']/g)].map(
        (m) => m[1],
      );
      for (const spec of specifiers) {
        expect(
          spec.startsWith(".") || spec.startsWith("node:"),
          `${name} imports "${spec}" from outside src/lib/provisioning/`,
        ).toBe(true);
        expect(spec.startsWith("../../"), `${name} escapes the domain via "${spec}"`).toBe(
          false,
        );
      }
    }
  });

  it("delegates retry and rollback instead of duplicating them", () => {
    const executor = FILES.find((f) => f.name === "executor.ts")!.source;
    const orchestrator = FILES.find((f) => f.name === "orchestrator.ts")!.source;

    expect(executor).toMatch(/import\s*{[^}]*shouldRetry[^}]*}\s*from\s*["']\.\.\/retry["']/);
    expect(orchestrator).toMatch(/from\s*["']\.\.\/rollback["']/);

    for (const { name, source } of FILES) {
      const body = stripComments(source);
      expect(body, `${name} recomputes backoff`).not.toMatch(/Math\.pow\s*\(/);
      expect(body, `${name} recomputes backoff`).not.toMatch(/\*\*\s*attempt/);
      expect(body, `${name} reorders a rollback plan`).not.toMatch(/\.reverse\s*\(\)/);
    }
  });

  it("keeps provider access type-only in the core", () => {
    for (const { name, source } of FILES) {
      if (name === "index.ts") continue;
      const matches = [...source.matchAll(/^import\s+(type\s+)?{[^}]*ProvisioningProvider/gm)];
      for (const m of matches) {
        expect(m[1], `${name} imports ProvisioningProvider as a value`).toBeDefined();
      }
    }
  });
});
