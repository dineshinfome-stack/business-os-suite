/**
 * Gate 3.2.2 · Integration-layer architecture boundary guard.
 *
 * Complements the orchestrator core guard: infrastructure access is permitted
 * ONLY in the Supabase data-client binding, and no module may write
 * `tenants.provisioning_status` (Risk D1).
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const INTEGRATION_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORCHESTRATOR_DIR = join(INTEGRATION_DIR, "..", "orchestrator");

/** Only the Supabase binding may reference an infrastructure client. */
const INFRA_ALLOWLIST = new Set(["supabase-data-client.ts"]);

const FORBIDDEN_EVERYWHERE = [
  /from\s+["']@tanstack\/react-start["']/,
  /createServerFn/,
  /process\.env/,
  /import\.meta\.env/,
];

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function filesIn(dir: string): { name: string; source: string }[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".ts"))
    .map((e) => ({ name: e.name, source: readFileSync(join(dir, e.name), "utf8") }));
}

const FILES = filesIn(INTEGRATION_DIR);

describe("integration · architecture boundaries", () => {
  it("contains the expected integration modules", () => {
    const names = FILES.map((f) => f.name).sort();
    expect(names).toEqual([
      "data-client.ts",
      "event-sink.ts",
      "factory.ts",
      "index.ts",
      "repository-adapter.ts",
      "service.ts",
      "supabase-data-client.ts",
      "writer-adapter.ts",
    ]);
  });

  it.each(FILES.map((f) => f.name))(
    "%s reads no environment and declares no server function",
    (name) => {
      const source = stripComments(FILES.find((f) => f.name === name)!.source);
      for (const pattern of FORBIDDEN_EVERYWHERE) {
        expect(source, `${name} violates ${pattern}`).not.toMatch(pattern);
      }
    },
  );

  it.each(FILES.map((f) => f.name))(
    "%s keeps infrastructure access inside the Supabase binding",
    (name) => {
      if (INFRA_ALLOWLIST.has(name)) return;
      const source = stripComments(FILES.find((f) => f.name === name)!.source);
      expect(source).not.toMatch(/from\s+["'][^"']*supabase/i);
      expect(source).not.toMatch(/from\s+["']@\/integrations\//);
      expect(source).not.toMatch(/\bfetch\s*\(/);
    },
  );

  it.each(FILES.map((f) => f.name))(
    "%s never writes tenants.provisioning_status (Risk D1)",
    (name) => {
      const source = stripComments(FILES.find((f) => f.name === name)!.source);
      expect(source).not.toContain("provisioning_status");
      expect(source).not.toMatch(/\bfrom\(["']tenants["']\)/);
    },
  );

  it("does not re-export the Supabase binding from the barrel", () => {
    const index = FILES.find((f) => f.name === "index.ts")!.source;
    expect(index).not.toMatch(/export\s+\*\s+from\s+["']\.\/supabase-data-client["']/);
  });

  it("keeps the orchestrator core free of integration imports", () => {
    for (const { name, source } of filesIn(ORCHESTRATOR_DIR)) {
      expect(stripComments(source), `${name} imports the integration layer`).not.toMatch(
        /from\s+["']\.\.\/integration/,
      );
    }
  });

  it("reuses the orchestrator ports instead of redefining them", () => {
    const repository = FILES.find((f) => f.name === "repository-adapter.ts")!.source;
    const writer = FILES.find((f) => f.name === "writer-adapter.ts")!.source;
    const sink = FILES.find((f) => f.name === "event-sink.ts")!.source;

    expect(repository).toMatch(/JobRepository[^;]*from\s+["']\.\.\/orchestrator\/types["']/s);
    expect(writer).toMatch(/from\s+["']\.\.\/orchestrator\/types["']/);
    expect(sink).toMatch(/from\s+["']\.\.\/orchestrator\/types["']/);
    expect(writer).not.toMatch(/interface\s+JobWriter/);
    expect(repository).not.toMatch(/interface\s+JobRepository/);
  });
});
