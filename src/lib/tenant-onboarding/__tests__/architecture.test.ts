import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import * as onboarding from "@/lib/tenant-onboarding";
import { TENANT_ONBOARDING_DTO_VERSION } from "@/lib/tenant-onboarding/types/v1";

const ROOT = path.resolve(process.cwd(), "src/lib/tenant-onboarding");
const DTO_DIR = path.join(ROOT, "types/v1");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === "__tests__" ? [] : walk(full);
    }
    return full.endsWith(".ts") ? [full] : [];
  });
}

const DTO_FILES = walk(DTO_DIR);
const ALL_FILES = walk(ROOT);

/**
 * Pass 3.8.3 boundary evolution: the module gains a WRITE layer on top of the
 * Pass 3.8.2 read layer. Exactly five files may reach the server; every other
 * file in the module stays pure.
 */
const SERVER_ALLOW_LIST = [
  "queries.functions.ts",
  "commands.functions.ts",
  path.join("server", "query-service.server.ts"),
  path.join("server", "mappers.server.ts"),
  path.join("server", "command-service.server.ts"),
].map((rel) => path.join(ROOT, rel));

/** The read layer must stay write-free; the write layer must not. */
const READ_ONLY_FILES = [
  "queries.functions.ts",
  path.join("server", "query-service.server.ts"),
  path.join("server", "mappers.server.ts"),
].map((rel) => path.join(ROOT, rel));

const SERVER_ALLOW_SET = new Set(SERVER_ALLOW_LIST);

/** Every module file that is NOT an allow-listed server file. */
const MODULE_FILES = ALL_FILES.filter((f) => !SERVER_ALLOW_SET.has(f));

/** Property-name fragments that must never appear in a DTO contract. */
const FORBIDDEN = [
  "token",
  "password",
  "secret",
  "api_key",
  "apikey",
  "service_role",
  "serviceRole",
  "private_key",
  "privateKey",
  "connection_string",
  "connectionString",
  "stack",
  "sql",
  "provider_payload",
  "providerPayload",
];

/** Narrow allow-list for legitimate identifiers containing a fragment. */
const ALLOWED_IDENTIFIERS = new Set(["invitedRole"]);

describe("DTO security + architecture boundaries", () => {
  it("pins the v1 namespace", () => {
    expect(TENANT_ONBOARDING_DTO_VERSION).toBe("v1");
    expect(DTO_FILES.length).toBeGreaterThan(5);
  });

  it("exposes stable runtime exports from the module barrel", () => {
    expect(Object.keys(onboarding)).toEqual(
      expect.arrayContaining([
        "ONBOARDING_STEP_KEYS",
        "ONBOARDING_STEP_STATUSES",
        "TENANT_ONBOARDING_STATES",
        "ONBOARDING_TRANSITION_INTENTS",
        "applyOnboardingTransition",
        "tenantOnboardingKeys",
        "ONBOARDING_REQUIRED_SETTINGS",
      ]),
    );
  });

  it("declares no sensitive property names in any DTO", () => {
    for (const file of DTO_FILES) {
      const source = readFileSync(file, "utf8");
      // property declarations only, e.g. `  fooBar: string;`
      const props = [...source.matchAll(/^\s{2}([A-Za-z_][A-Za-z0-9_]*)\??:/gm)].map(
        (m) => m[1],
      );
      for (const prop of props) {
        if (ALLOWED_IDENTIFIERS.has(prop)) continue;
        const lower = prop.toLowerCase();
        for (const fragment of FORBIDDEN) {
          expect(
            lower.includes(fragment.toLowerCase()),
            `${path.basename(file)} declares forbidden property "${prop}"`,
          ).toBe(false);
        }
      }
    }
  });

  it("keeps invitation and activity DTOs free of tokens and raw metadata", () => {
    const invitation = readFileSync(
      path.join(DTO_DIR, "admin-invitation.dto.ts"),
      "utf8",
    );
    expect(invitation).not.toMatch(/^\s{2}token/m);
    expect(invitation).not.toContain("tokenHash");
    expect(invitation).not.toContain("token_hash:");

    const activity = readFileSync(
      path.join(DTO_DIR, "onboarding-activity.dto.ts"),
      "utf8",
    );
    expect(activity).not.toContain("oldValues");
    expect(activity).not.toContain("newValues");
    expect(activity).not.toContain("metadata:");
  });

  it("imports no database, Supabase, server or UI modules", () => {
    for (const file of MODULE_FILES) {
      const source = readFileSync(file, "utf8");
      const imports = [...source.matchAll(/from\s+"([^"]+)"/g)].map((m) => m[1]);
      for (const spec of imports) {
        expect(spec, `${path.relative(ROOT, file)} imports ${spec}`).not.toMatch(
          /supabase|@\/integrations|\.server|@\/modules|@\/components|@tanstack\/react-start|react/,
        );
      }
      expect(source).not.toContain("process.env");
      expect(source).not.toContain("import.meta.env");
    }
  });

  it("allow-lists exactly the five server files", () => {
    const present = ALL_FILES.filter((f) => SERVER_ALLOW_SET.has(f)).sort();
    expect(present).toEqual([...SERVER_ALLOW_LIST].sort());

    const serverLike = ALL_FILES.filter(
      (f) => f.endsWith(".server.ts") || f.endsWith(".functions.ts"),
    ).sort();
    expect(serverLike).toEqual([...SERVER_ALLOW_LIST].sort());
  });

  it("keeps the server layer free of the service-role client and env access", () => {
    for (const file of SERVER_ALLOW_LIST) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain("client.server");
      expect(source, file).not.toContain("supabaseAdmin");
      expect(source, file).not.toContain("SERVICE_ROLE");
      expect(source, file).not.toContain("process.env");
    }
  });

  it("keeps the read layer free of persistence writes", () => {
    for (const file of READ_ONLY_FILES) {
      const source = readFileSync(file, "utf8");
      for (const write of [".insert(", ".update(", ".upsert(", ".delete("]) {
        expect(source.includes(write), `${file} performs ${write}`).toBe(false);
      }
    }
  });

  it("contains no server files, routes, UI or migrations", () => {
    for (const file of MODULE_FILES) {
      expect(file).not.toMatch(/\.server\.tsx?$/);
      expect(file).not.toMatch(/\.tsx$/);
      expect(file).not.toMatch(/\.sql$/);
    }
  });

  it("defines no roles, permissions or company abstraction", () => {
    for (const file of MODULE_FILES) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("PERMISSIONS.");
      expect(source).not.toContain("CompanyDTO");
      expect(source).not.toMatch(/export const ROLES\b/);
    }
  });
});
