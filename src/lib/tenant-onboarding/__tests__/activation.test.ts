/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5B
 *
 * Guarded-activation and readiness-persistence contract tests.
 *
 * No database: a scripted fake client asserts the EXACT statements the
 * services issue. The database owns the readiness verdict; these tests prove
 * the application never supplies, widens or re-derives it.
 */
import { describe, expect, it } from "vitest";

import {
  ONBOARDING_ACTIVATE_TENANT_RPC,
  ONBOARDING_EVALUATE_READINESS_RPC,
  ONBOARDING_PERSIST_READINESS_RPC,
} from "@/lib/tenant-onboarding/readiness";
import {
  activateTenantCommand,
  classifyError,
  refreshOnboardingReadinessCommand,
  type AnyClient,
} from "@/lib/tenant-onboarding/server/command-service.server";
import { getOnboardingReadiness } from "@/lib/tenant-onboarding/server/query-service.server";
import { activateTenantSchema } from "@/lib/tenant-onboarding/schemas";
import { tenantOnboardingKeys } from "@/lib/tenant-onboarding/query-keys";

const TENANT = "11111111-1111-4111-8111-111111111111";
const ACTOR = { userId: "33333333-3333-4333-8333-333333333333" };

type RpcCall = { name: string; args: Record<string, unknown> };

const READY_ENVELOPE = {
  tenant_id: TENANT,
  evaluated_at: "2026-07-27T10:00:00.000Z",
  overall_status: "ready",
  contract_version: "3.8.5",
  observed_workflow_version: 4,
  checks: [],
  blocking_count: 0,
  warning_count: 0,
  applicable_count: 13,
  warning_fingerprint: null,
  correlation_id: "corr-1",
};

function makeClient(rpcResults: Record<string, unknown | (() => unknown)> = {}) {
  const rpcCalls: RpcCall[] = [];
  const updates: { table: string; payload: unknown }[] = [];
  const inserts: { table: string; payload: unknown }[] = [];

  const client: AnyClient = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      const configured = rpcResults[name];
      if (typeof configured === "function") {
        return { data: null, error: (configured as () => unknown)() };
      }
      return { data: configured ?? null, error: null };
    },
    from: (table: string) => {
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        in: () => builder,
        is: () => builder,
        order: () => builder,
        limit: () => Promise.resolve({ data: [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        insert: (payload: unknown) => {
          inserts.push({ table, payload });
          return Promise.resolve({ data: null, error: null });
        },
        update: (payload: unknown) => {
          updates.push({ table, payload });
          return { eq: () => Promise.resolve({ data: null, error: null }) };
        },
        then: (resolve: (v: unknown) => unknown) => resolve({ data: [], error: null }),
      };
      return builder;
    },
  };

  return { client, rpcCalls, updates, inserts };
}

const raise = (code: string) => () => ({ code, message: `db said ${code}` });

/* ------------------------------------------------------- schema contract */

describe("activation input contract", () => {
  it("requires expectedVersion", () => {
    expect(() => activateTenantSchema.parse({ tenantId: TENANT })).toThrow();
  });

  it("rejects a null expectedVersion", () => {
    expect(() =>
      activateTenantSchema.parse({ tenantId: TENANT, expectedVersion: null }),
    ).toThrow();
  });

  it("rejects a negative or fractional expectedVersion", () => {
    expect(() =>
      activateTenantSchema.parse({ tenantId: TENANT, expectedVersion: -1 }),
    ).toThrow();
    expect(() =>
      activateTenantSchema.parse({ tenantId: TENANT, expectedVersion: 1.5 }),
    ).toThrow();
  });

  it("accepts a current expectedVersion and defaults acknowledgement to false", () => {
    const parsed = activateTenantSchema.parse({ tenantId: TENANT, expectedVersion: 4 });
    expect(parsed.expectedVersion).toBe(4);
    expect(parsed.acknowledgeWarnings).toBe(false);
  });

  it("accepts NO warning fingerprint from the client", () => {
    expect(() =>
      activateTenantSchema.parse({
        tenantId: TENANT,
        expectedVersion: 4,
        acknowledgedFingerprint: "a".repeat(64),
      }),
    ).toThrow();
  });
});

/* ------------------------------------------------------------- forwarding */

describe("guarded activation forwarding", () => {
  it("forwards only tenantId, expectedVersion, acknowledgeWarnings and correlationId", async () => {
    const { client, rpcCalls } = makeClient({
      [ONBOARDING_ACTIVATE_TENANT_RPC]: {
        state: "activated",
        version: 5,
        lifecycle_transition_applied: true,
        warnings_acknowledged: false,
      },
    });

    const result = await activateTenantCommand(client, ACTOR, {
      tenantId: TENANT,
      expectedVersion: 4,
      correlationId: "corr-1",
    });

    expect(result.ok).toBe(true);
    const call = rpcCalls.find((c) => c.name === ONBOARDING_ACTIVATE_TENANT_RPC)!;
    expect(Object.keys(call.args).sort()).toEqual([
      "_acknowledge_warnings",
      "_correlation_id",
      "_expected_version",
      "_tenant_id",
    ]);
    expect(call.args._expected_version).toBe(4);
    expect(JSON.stringify(call.args)).not.toMatch(/fingerprint|readiness|lifecycle/i);
  });

  it("never coerces a missing expectedVersion to null", async () => {
    const { client, rpcCalls } = makeClient({
      [ONBOARDING_ACTIVATE_TENANT_RPC]: { state: "activated", version: 5 },
    });
    await activateTenantCommand(client, ACTOR, {
      tenantId: TENANT,
      expectedVersion: 0,
    });
    const call = rpcCalls.find((c) => c.name === ONBOARDING_ACTIVATE_TENANT_RPC)!;
    expect(call.args._expected_version).toBe(0);
    expect(call.args._expected_version).not.toBeNull();
  });

  it("issues NO follow-up lifecycle or workflow write after the atomic RPC", async () => {
    const { client, rpcCalls, updates } = makeClient({
      [ONBOARDING_ACTIVATE_TENANT_RPC]: { state: "activated", version: 5 },
    });
    await activateTenantCommand(client, ACTOR, { tenantId: TENANT, expectedVersion: 4 });

    expect(updates).toEqual([]);
    expect(rpcCalls.map((c) => c.name)).toEqual([ONBOARDING_ACTIVATE_TENANT_RPC]);
  });

  it("performs no audit write on an idempotent replay", async () => {
    const { client, inserts } = makeClient({
      [ONBOARDING_ACTIVATE_TENANT_RPC]: {
        state: "activated",
        version: 5,
        idempotent_replay: true,
      },
    });
    const result = await activateTenantCommand(client, ACTOR, {
      tenantId: TENANT,
      expectedVersion: 5,
    });
    expect(result.idempotentReplay).toBe(true);
    expect(inserts.some((i) => i.table === "audit_logs")).toBe(false);
  });
});

/* --------------------------------------------------------- error mapping */

describe("activation SQLSTATE mapping", () => {
  const cases: [string, string][] = [
    ["P3848", "readiness_blocked"],
    ["P3849", "warning_acknowledgement_required"],
    ["P384B", "lifecycle_state_blocks"],
    ["40001", "version_conflict"],
    ["42501", "permission_denied"],
  ];

  for (const [sqlstate, reasonCode] of cases) {
    it(`maps ${sqlstate} to ${reasonCode}`, async () => {
      const { client } = makeClient({
        [ONBOARDING_ACTIVATE_TENANT_RPC]: raise(sqlstate),
      });
      const result = await activateTenantCommand(client, ACTOR, {
        tenantId: TENANT,
        expectedVersion: 4,
      });
      expect(result.ok).toBe(false);
      expect(result.reasonCode).toBe(reasonCode);
      expect(result.message).not.toContain("db said");
      expect(classifyError({ code: sqlstate }).reasonCode).toBe(reasonCode);
    });
  }

  it("reports no version and no transition for a rejected activation", async () => {
    const { client, updates } = makeClient({
      [ONBOARDING_ACTIVATE_TENANT_RPC]: raise("40001"),
    });
    const result = await activateTenantCommand(client, ACTOR, {
      tenantId: TENANT,
      expectedVersion: 1,
    });
    expect(result.version).toBeNull();
    expect(result.lifecycleTransitionApplied).toBe(false);
    expect(updates).toEqual([]);
  });
});

/* ------------------------------------------------ read vs persist routing */

describe("readiness routing", () => {
  it("the read path uses the READ-ONLY evaluation RPC", async () => {
    const { client, rpcCalls, updates, inserts } = makeClient({
      [ONBOARDING_EVALUATE_READINESS_RPC]: READY_ENVELOPE,
    });
    const readiness = await getOnboardingReadiness(client, TENANT, "corr-1");

    expect(readiness.overallStatus).toBe("ready");
    expect(rpcCalls.map((c) => c.name)).toEqual([ONBOARDING_EVALUATE_READINESS_RPC]);
    expect(updates).toEqual([]);
    expect(inserts).toEqual([]);
  });

  it("the refresh command uses the PERSIST RPC", async () => {
    const { client, rpcCalls } = makeClient({
      [ONBOARDING_PERSIST_READINESS_RPC]: READY_ENVELOPE,
    });
    const readiness = await refreshOnboardingReadinessCommand(client, ACTOR, {
      tenantId: TENANT,
      correlationId: "corr-1",
    });

    expect(readiness.overallStatus).toBe("ready");
    expect(rpcCalls[0].name).toBe(ONBOARDING_PERSIST_READINESS_RPC);
    expect(rpcCalls.some((c) => c.name === ONBOARDING_ACTIVATE_TENANT_RPC)).toBe(false);
  });
});

/* ---------------------------------------------------------- cache scoping */

describe("cache invalidation scope", () => {
  it("readiness and detail live under the module root so one invalidation covers both", () => {
    const root = tenantOnboardingKeys.all as readonly unknown[];
    for (const key of [
      tenantOnboardingKeys.readiness(TENANT),
      tenantOnboardingKeys.detail(TENANT),
    ] as readonly (readonly unknown[])[]) {
      expect(key.slice(0, root.length)).toEqual([...root]);
    }
  });
});
