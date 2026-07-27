/**
 * Gate 3.8 · Pass 3.8.3 — bootstrap command assertions.
 *
 * Covers RPC delegation, registry allow-listing, sanitized failure mapping,
 * tenant isolation of the adoption path and step recording. No database:
 * a scripted fake client asserts the exact statements the service issues.
 */
import { describe, expect, it } from "vitest";

import {
  ONBOARDING_RECORD_STEP_RPC,
  ONBOARDING_START_RPC,
  classifyError,
  initializeFinancialYearCommand,
  initializeSettingsCommand,
  savePrimaryBranchCommand,
  saveOrganizationProfileCommand,
  startOnboardingCommand,
  verifyProvisioningCommand,
  type AnyClient,
} from "@/lib/tenant-onboarding/server/command-service.server";
import { ONBOARDING_REQUIRED_SETTINGS } from "@/lib/tenant-onboarding";

const TENANT = "11111111-1111-4111-8111-111111111111";
const ORG = "22222222-2222-4222-8222-222222222222";
const ACTOR = { userId: "33333333-3333-4333-8333-333333333333" };

type RpcCall = { name: string; args: Record<string, unknown> };

interface FakeOptions {
  rpc?: Record<string, unknown | (() => never)>;
  rows?: Record<string, unknown>;
}

function makeClient(options: FakeOptions = {}) {
  const rpcCalls: RpcCall[] = [];
  const inserts: { table: string; payload: unknown }[] = [];
  const updates: { table: string; payload: unknown }[] = [];

  const stepResult = {
    state: "in_progress",
    status: "completed",
    version: 1,
    attempt_count: 1,
  };

  const client: AnyClient = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      const configured = options.rpc?.[name];
      if (typeof configured === "function") {
        return { data: null, error: (configured as () => unknown)() };
      }
      if (name === ONBOARDING_RECORD_STEP_RPC) {
        return {
          data: { ...stepResult, status: args._status, state: "in_progress" },
          error: null,
        };
      }
      if (name === ONBOARDING_START_RPC) {
        return { data: { state: "in_progress", version: 1 }, error: null };
      }
      return { data: configured ?? null, error: null };
    },
    from: (table: string) => {
      const rows = (options.rows?.[table] ?? []) as unknown[];
      const builder: any = {
        select: () => builder,
        eq: () => builder,
        in: () => builder,
        is: () => builder,
        order: () => builder,
        limit: () => Promise.resolve({ data: rows, error: null }),
        maybeSingle: () => Promise.resolve({ data: rows[0] ?? null, error: null }),
        insert: (payload: unknown) => {
          inserts.push({ table, payload });
          return Promise.resolve({ data: null, error: null });
        },
        update: (payload: unknown) => {
          updates.push({ table, payload });
          return { eq: () => Promise.resolve({ data: null, error: null }) };
        },
        then: (resolve: (v: unknown) => unknown) =>
          resolve({ data: rows, error: null }),
      };
      return builder;
    },
  };

  return { client, rpcCalls, inserts, updates };
}

const denied = () => ({ code: "42501", message: "permission denied" });

describe("onboarding bootstrap commands", () => {
  it("starts the workflow through the permission-gated routine", async () => {
    const { client, rpcCalls } = makeClient();
    const result = await startOnboardingCommand(client, ACTOR, { tenantId: TENANT });

    expect(result.ok).toBe(true);
    expect(result.state).toBe("in_progress");
    expect(rpcCalls[0].name).toBe(ONBOARDING_START_RPC);
    expect(rpcCalls[0].args._tenant_id).toBe(TENANT);
    expect(typeof result.correlationId).toBe("string");
  });

  it("maps a database permission denial to a sanitized rejection", async () => {
    const { client } = makeClient({ rpc: { [ONBOARDING_START_RPC]: denied } });
    const result = await startOnboardingCommand(client, ACTOR, { tenantId: TENANT });

    expect(result.ok).toBe(false);
    expect(result.reasonCode).toBe("permission_denied");
    expect(result.message).not.toMatch(/permission denied/);
    expect(result.message).not.toMatch(/select|insert|sql/i);
  });

  it("creates the organization through the owning company RPC", async () => {
    const { client, rpcCalls } = makeClient({ rpc: { fn_create_company: ORG } });
    const result = await saveOrganizationProfileCommand(client, ACTOR, {
      tenantId: TENANT,
      name: "Acme",
      slug: "acme",
    });

    expect(result.ok).toBe(true);
    expect(result.entityId).toBe(ORG);
    expect(result.stepKey).toBe("organization_profile");
    expect(rpcCalls.map((c) => c.name)).toEqual([
      "fn_create_company",
      ONBOARDING_RECORD_STEP_RPC,
    ]);
  });

  it("rejects adopting an organization that is not visible for the tenant", async () => {
    const { client, rpcCalls } = makeClient({ rows: { organizations: [] } });
    const result = await saveOrganizationProfileCommand(client, ACTOR, {
      tenantId: TENANT,
      organizationId: ORG,
      name: "Acme",
      slug: "acme",
    });

    expect(result.ok).toBe(false);
    expect(result.reasonCode).toBe("not_found");
    // The failed attempt is still recorded on the workflow.
    const recorded = rpcCalls.find((c) => c.name === ONBOARDING_RECORD_STEP_RPC);
    expect(recorded?.args._status).toBe("failed");
    expect(rpcCalls.some((c) => c.name === "fn_create_company")).toBe(false);
  });

  it("records provisioning as blocked when no completed job exists", async () => {
    const { client, rpcCalls } = makeClient({
      rows: { provisioning_jobs: [{ id: "job-1", state: "running" }] },
    });
    const result = await verifyProvisioningCommand(client, ACTOR, { tenantId: TENANT });

    expect(result.ok).toBe(false);
    expect(result.reasonCode).toBe("provisioning_incomplete");
    expect(rpcCalls[0].args._status).toBe("blocked");
  });

  it("records provisioning as verified for a completed job", async () => {
    const { client } = makeClient({
      rows: { provisioning_jobs: [{ id: "job-1", state: "completed" }] },
    });
    const result = await verifyProvisioningCommand(client, ACTOR, { tenantId: TENANT });

    expect(result.ok).toBe(true);
    expect(result.entityId).toBe("job-1");
    expect(result.stepStatus).toBe("completed");
  });

  it("creates the primary branch and records the step", async () => {
    const { client, rpcCalls } = makeClient({ rpc: { fn_create_branch: "branch-1" } });
    const result = await savePrimaryBranchCommand(client, ACTOR, {
      tenantId: TENANT,
      organizationId: ORG,
      name: "Head Office",
      code: "HO",
      setAsDefault: true,
    });

    expect(result.ok).toBe(true);
    expect(result.entityId).toBe("branch-1");
    expect(rpcCalls[0].args._is_default).toBe(true);
  });

  it("rejects setting keys outside the onboarding registry", async () => {
    const { client, rpcCalls } = makeClient();
    const result = await initializeSettingsCommand(client, ACTOR, {
      tenantId: TENANT,
      organizationId: ORG,
      values: [{ key: "platform.security.master_key", value: "x" }],
    });

    expect(result.ok).toBe(false);
    expect(result.reasonCode).toBe("invalid_input");
    expect(rpcCalls[0].args._status).toBe("failed");
  });

  it("writes an allow-listed setting value scoped to the organization", async () => {
    const key = ONBOARDING_REQUIRED_SETTINGS[0].key;
    const { client, inserts } = makeClient({
      rows: {
        setting_definitions: [
          {
            id: "def-1",
            key,
            scope: "organization",
            data_type: "string",
            validation_schema: {},
            is_system: false,
            is_sensitive: false,
          },
        ],
        setting_values: [],
      },
    });

    const result = await initializeSettingsCommand(client, ACTOR, {
      tenantId: TENANT,
      organizationId: ORG,
      values: [{ key, value: "Asia/Kolkata" }],
    });

    expect(result.ok).toBe(true);
    const settingInsert = inserts.find((i) => i.table === "setting_values");
    expect(settingInsert?.payload).toMatchObject({
      definition_id: "def-1",
      organization_id: ORG,
      value: "Asia/Kolkata",
    });
  });

  it("refuses to write a framework-owned setting definition", async () => {
    const key = ONBOARDING_REQUIRED_SETTINGS[0].key;
    const { client, inserts } = makeClient({
      rows: {
        setting_definitions: [
          {
            id: "def-1",
            key,
            scope: "organization",
            data_type: "string",
            validation_schema: {},
            is_system: true,
            is_sensitive: false,
          },
        ],
      },
    });

    const result = await initializeSettingsCommand(client, ACTOR, {
      tenantId: TENANT,
      organizationId: ORG,
      values: [{ key, value: "Asia/Kolkata" }],
    });

    expect(result.ok).toBe(false);
    expect(inserts.some((i) => i.table === "setting_values")).toBe(false);
  });

  it("creates the financial year through the owning RPC", async () => {
    const { client, rpcCalls } = makeClient({ rpc: { fn_create_financial_year: "fy-1" } });
    const result = await initializeFinancialYearCommand(client, ACTOR, {
      tenantId: TENANT,
      organizationId: ORG,
      code: "FY26",
      startDate: "2026-04-01",
      endDate: "2027-03-31",
      setAsDefault: true,
    });

    expect(result.ok).toBe(true);
    expect(result.entityId).toBe("fy-1");
    expect(rpcCalls[0].name).toBe("fn_create_financial_year");
  });

  it("classifies concurrency and validation errors distinctly", () => {
    expect(classifyError({ code: "40001" }).reasonCode).toBe("version_conflict");
    expect(classifyError({ code: "22023" }).reasonCode).toBe("invalid_input");
    expect(classifyError({ code: "23505" }).reasonCode).toBe("conflict");
    expect(classifyError(new Error("boom")).reasonCode).toBe("command_failed");
    expect(classifyError(new Error("boom")).message).not.toContain("boom");
  });
});
