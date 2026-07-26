/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Supabase provider tests.
 *
 * Deterministic: fake fetch, fake clock, fake SQL. No network, no timers.
 */
import { describe, expect, it } from "vitest";
import { createHttpClient } from "../client";
import { createManagementApi } from "../management-api";
import { applyMigrations } from "../migration";
import { runSeeds } from "../seed";
import { buildProjectName, ensureProject, waitForProjectReady } from "../project";
import { createAdministrator } from "../admin";
import { verifyHealth } from "../health";
import { destroyProject } from "../destroy";
import { createSupabaseProvider } from "../provider";
import { classifyStatus, isProviderFailure } from "../errors";
import type { ProviderCallContext } from "../types";
import {
  fakeAuthAdmin,
  fakeClock,
  fakeFetch,
  fakeSqlExecutor,
  migrationSource,
  seedSource,
  testLogger,
  testSecrets,
} from "./doubles";

const ctx: ProviderCallContext = {
  correlationId: "corr-1",
  tenantId: "tenant-1",
  operation: "test",
};

const readiness = { maxAttempts: 5, baseDelayMs: 10, maxDelayMs: 40, multiplier: 2 };

const api = (routes: Parameters<typeof fakeFetch>[0]) => {
  const clock = fakeClock();
  const http = createHttpClient({
    baseUrl: "https://api.test",
    credentials: { accessToken: "t", organizationId: "org_test" },
    fetch: fakeFetch(routes),
    clock,
    logger: testLogger,
  });
  return { api: createManagementApi({ http, organizationId: "org_test" }), clock };
};

const projectPayload = (status: string) => ({
  id: "abc",
  ref: "abc",
  name: "tenant-acme",
  organization_id: "org_test",
  region: "us-east-1",
  status,
});

describe("error classification", () => {
  it("treats auth failures as permanent and throttling/5xx as transient", () => {
    expect(classifyStatus(401).retryable).toBe(false);
    expect(classifyStatus(403).retryable).toBe(false);
    expect(classifyStatus(400).retryable).toBe(false);
    expect(classifyStatus(429).retryable).toBe(true);
    expect(classifyStatus(503).retryable).toBe(true);
  });
});

describe("http client", () => {
  it("maps 401 to a permanent authentication error", async () => {
    const { api: a } = api([{ match: /projects$/, responses: [{ status: 401, body: {} }] }]);
    await expect(a.listProjects(ctx)).rejects.toMatchObject({
      provisioningError: { code: "supabase_authentication_failed", retryable: false },
    });
  });

  it("maps 429 to a retryable error and captures Retry-After", async () => {
    const { api: a } = api([
      {
        match: /projects$/,
        responses: [{ status: 429, body: {}, headers: { "retry-after": "2" } }],
      },
    ]);
    await a.listProjects(ctx).catch((cause) => {
      expect(isProviderFailure(cause)).toBe(true);
      expect(cause.provisioningError.retryable).toBe(true);
      expect(cause.retryAfterMs).toBe(2000);
    });
  });

  it("treats network failures as transient", async () => {
    const { api: a } = api([{ match: /projects$/, responses: [{ throws: true }] }]);
    await expect(a.listProjects(ctx)).rejects.toMatchObject({
      provisioningError: { retryable: true },
    });
  });

  it("honours the abort signal before dispatch", async () => {
    const controller = new AbortController();
    controller.abort();
    const http = createHttpClient({
      baseUrl: "https://api.test",
      credentials: { accessToken: "t", organizationId: "org" },
      fetch: fakeFetch([{ match: /.*/, responses: [{ body: {} }] }]),
      clock: fakeClock(),
      logger: testLogger,
      signal: controller.signal,
    });
    await expect(
      http.request({ method: "GET", path: "/v1/projects", ctx }),
    ).rejects.toMatchObject({ provisioningError: { code: "supabase_operation_cancelled" } });
  });
});

describe("project creation", () => {
  const deps = (routes: Parameters<typeof fakeFetch>[0], signal?: AbortSignal) => {
    const { api: a, clock } = api(routes);
    return {
      api: a,
      clock,
      logger: testLogger,
      readiness,
      region: "us-east-1",
      passwordFactory: () => "pw",
      ...(signal ? { signal } : {}),
    };
  };

  it("builds a deterministic, sanitised project name", () => {
    expect(buildProjectName("tenant-", "Acme Corp!!")).toBe("tenant-acme-corp-");
  });

  it("adopts an existing project instead of creating a duplicate", async () => {
    const d = deps([
      { match: /\/v1\/projects$/, method: "GET", responses: [{ body: [projectPayload("ACTIVE_HEALTHY")] }] },
    ]);
    const result = await ensureProject(d, { name: "tenant-acme", ctx });
    expect(result.created).toBe(false);
    expect(result.project.reference).toBe("abc");
  });

  it("creates a project when none exists", async () => {
    const d = deps([
      { match: /\/v1\/projects$/, method: "GET", responses: [{ body: [] }] },
      { match: /\/v1\/projects$/, method: "POST", responses: [{ body: projectPayload("COMING_UP") }] },
    ]);
    const result = await ensureProject(d, { name: "tenant-acme", ctx });
    expect(result.created).toBe(true);
    expect(result.databasePassword).toBe("pw");
  });

  it("polls until the project is healthy", async () => {
    const d = deps([
      {
        match: /\/v1\/projects\/abc$/,
        responses: [
          { body: projectPayload("COMING_UP") },
          { body: projectPayload("COMING_UP") },
          { body: projectPayload("ACTIVE_HEALTHY") },
        ],
      },
    ]);
    const project = await waitForProjectReady(d, { reference: "abc", ctx });
    expect(project.status).toBe("ACTIVE_HEALTHY");
    expect(d.clock.sleeps).toEqual([10, 20]);
  });

  it("fails permanently on INIT_FAILED", async () => {
    const d = deps([
      { match: /\/v1\/projects\/abc$/, responses: [{ body: projectPayload("INIT_FAILED") }] },
    ]);
    await expect(waitForProjectReady(d, { reference: "abc", ctx })).rejects.toMatchObject({
      provisioningError: { code: "supabase_project_creation_failed", retryable: false },
    });
  });

  it("raises a retryable timeout when the budget is exhausted", async () => {
    const d = deps([
      { match: /\/v1\/projects\/abc$/, responses: [{ body: projectPayload("COMING_UP") }] },
    ]);
    await expect(waitForProjectReady(d, { reference: "abc", ctx })).rejects.toMatchObject({
      provisioningError: { code: "supabase_project_timeout", retryable: true },
    });
  });

  it("stops polling when cancelled", async () => {
    const controller = new AbortController();
    controller.abort();
    const d = deps(
      [{ match: /\/v1\/projects\/abc$/, responses: [{ body: projectPayload("COMING_UP") }] }],
      controller.signal,
    );
    await expect(waitForProjectReady(d, { reference: "abc", ctx })).rejects.toMatchObject({
      provisioningError: { code: "supabase_operation_cancelled" },
    });
  });
});

describe("migrations", () => {
  const scripts = [
    { version: "002", name: "b", checksum: "cb", sql: "select 2;" },
    { version: "001", name: "a", checksum: "ca", sql: "select 1;" },
  ];

  it("applies pending migrations in version order and records them", async () => {
    const sql = fakeSqlExecutor((input) => (input.label === "ledger_read" ? [] : []));
    const result = await applyMigrations(
      { sql, source: migrationSource(scripts), clock: fakeClock(), logger: testLogger },
      { projectReference: "abc", ctx },
    );
    expect(result.applied.map((m) => m.version)).toEqual(["001", "002"]);
    expect(sql.statements.some((s) => s.includes("'001'"))).toBe(true);
  });

  it("skips migrations already applied with the same checksum", async () => {
    const sql = fakeSqlExecutor((input) =>
      input.label === "ledger_read"
        ? [
            { version: "001", checksum: "ca" },
            { version: "002", checksum: "cb" },
          ]
        : [],
    );
    const result = await applyMigrations(
      { sql, source: migrationSource(scripts), clock: fakeClock(), logger: testLogger },
      { projectReference: "abc", ctx },
    );
    expect(result.applied).toHaveLength(0);
    expect(result.skipped).toHaveLength(2);
  });

  it("fails on checksum drift instead of re-applying", async () => {
    const sql = fakeSqlExecutor((input) =>
      input.label === "ledger_read" ? [{ version: "001", checksum: "different" }] : [],
    );
    await expect(
      applyMigrations(
        { sql, source: migrationSource(scripts), clock: fakeClock(), logger: testLogger },
        { projectReference: "abc", ctx },
      ),
    ).rejects.toMatchObject({
      provisioningError: { kind: "migration", retryable: false, version: "001" },
    });
  });

  it("stops when cancelled mid-run", async () => {
    const controller = new AbortController();
    controller.abort();
    const sql = fakeSqlExecutor(() => []);
    await expect(
      applyMigrations(
        {
          sql,
          source: migrationSource(scripts),
          clock: fakeClock(),
          logger: testLogger,
          signal: controller.signal,
        },
        { projectReference: "abc", ctx },
      ),
    ).rejects.toMatchObject({ provisioningError: { code: "supabase_operation_cancelled" } });
  });
});

describe("seeding", () => {
  const scripts = [{ name: "roles", sql: "insert 1;", verifySql: "select 1;" }];

  it("skips seeds whose verification query already returns rows", async () => {
    const sql = fakeSqlExecutor(() => [{ ok: true }]);
    const result = await runSeeds(
      { sql, source: seedSource(scripts), logger: testLogger },
      { projectReference: "abc", ctx },
    );
    expect(result.skipped).toEqual(["roles"]);
  });

  it("applies and confirms a missing seed", async () => {
    let ran = false;
    const sql = fakeSqlExecutor((input) => {
      if (input.label === "seed_roles") {
        ran = true;
        return [];
      }
      return ran ? [{ ok: true }] : [];
    });
    const result = await runSeeds(
      { sql, source: seedSource(scripts), logger: testLogger },
      { projectReference: "abc", ctx },
    );
    expect(result.executed).toEqual(["roles"]);
  });

  it("fails when a seed does not verify after running", async () => {
    const sql = fakeSqlExecutor(() => []);
    await expect(
      runSeeds(
        { sql, source: seedSource(scripts), logger: testLogger },
        { projectReference: "abc", ctx },
      ),
    ).rejects.toMatchObject({ provisioningError: { code: "supabase_seed_failed" } });
  });
});

describe("administrator", () => {
  const keysRoute = {
    match: /api-keys$/,
    responses: [
      { body: [{ name: "anon", api_key: "anon" }, { name: "service_role", api_key: "svc" }] },
    ],
  };

  it("adopts an existing administrator", async () => {
    const { api: a } = api([keysRoute]);
    const result = await createAdministrator(
      { api: a, authAdmin: fakeAuthAdmin("user_existing"), logger: testLogger },
      { projectReference: "abc", email: "a@b.com", ctx },
    );
    expect(result).toEqual({ userId: "user_existing", created: false });
  });

  it("creates the administrator when absent", async () => {
    const { api: a } = api([keysRoute]);
    const result = await createAdministrator(
      { api: a, authAdmin: fakeAuthAdmin(null), logger: testLogger },
      { projectReference: "abc", email: "a@b.com", ctx },
    );
    expect(result).toEqual({ userId: "user_created", created: true });
  });

  it("rejects an invalid email without calling the API", async () => {
    const { api: a } = api([keysRoute]);
    await expect(
      createAdministrator(
        { api: a, authAdmin: fakeAuthAdmin(null), logger: testLogger },
        { projectReference: "abc", email: "nope", ctx },
      ),
    ).rejects.toMatchObject({ provisioningError: { code: "supabase_administrator_failed" } });
  });
});

describe("health", () => {
  it("is healthy only when status, SQL probe and ledger all pass", async () => {
    const { api: a, clock } = api([
      { match: /\/v1\/projects\/abc$/, responses: [{ body: projectPayload("ACTIVE_HEALTHY") }] },
    ]);
    const sql = fakeSqlExecutor((input) =>
      input.label === "health_ledger" ? [{ present: true }] : [{ ok: 1 }],
    );
    const result = await verifyHealth({ api: a, sql, clock, logger: testLogger }, {
      projectReference: "abc",
      ctx,
    });
    expect(result.healthy).toBe(true);
    expect(result.checks).toHaveLength(3);
  });

  it("reports unhealthy when the SQL probe fails", async () => {
    const { api: a, clock } = api([
      { match: /\/v1\/projects\/abc$/, responses: [{ body: projectPayload("ACTIVE_HEALTHY") }] },
    ]);
    const sql = fakeSqlExecutor(() => {
      throw new Error("db unreachable");
    });
    const result = await verifyHealth({ api: a, sql, clock, logger: testLogger }, {
      projectReference: "abc",
      ctx,
    });
    expect(result.healthy).toBe(false);
    expect(result.checks.find((c) => c.name === "database_query")?.ok).toBe(false);
  });
});

describe("destroy", () => {
  it("is a no-op when the project is already gone", async () => {
    const { api: a, clock } = api([
      { match: /\/v1\/projects\/abc$/, method: "GET", responses: [{ status: 404 }] },
    ]);
    const result = await destroyProject({ api: a, clock, logger: testLogger }, {
      projectReference: "abc",
      ctx,
    });
    expect(result).toMatchObject({ deleted: true, verified: true, orphans: [] });
  });

  it("verifies deletion and reports an orphan when the project persists", async () => {
    const { api: a, clock } = api([
      {
        match: /\/v1\/projects\/abc$/,
        method: "GET",
        responses: [{ body: projectPayload("ACTIVE_HEALTHY") }, { body: projectPayload("ACTIVE_HEALTHY") }],
      },
      { match: /\/v1\/projects\/abc$/, method: "DELETE", responses: [{ body: {} }] },
    ]);
    const result = await destroyProject({ api: a, clock, logger: testLogger }, {
      projectReference: "abc",
      ctx,
    });
    expect(result.verified).toBe(false);
    expect(result.orphans[0].kind).toBe("supabase_project");
  });
});

describe("provider assembly", () => {
  const build = (routes: Parameters<typeof fakeFetch>[0]) =>
    createSupabaseProvider({
      config: {
        apiBaseUrl: "https://api.test",
        organizationId: "org_test",
        defaultRegion: "us-east-1",
        readiness,
        projectNamePrefix: "tenant-",
      },
      secrets: testSecrets,
      fetch: fakeFetch(routes),
      clock: fakeClock(),
      logger: testLogger,
      migrations: migrationSource([]),
      seeds: seedSource([]),
      authAdmin: fakeAuthAdmin(null),
      passwordFactory: () => "pw",
    });

  it("advertises Gate 3.3 capabilities", () => {
    const provider = build([]);
    expect(provider.capabilities).toMatchObject({
      key: "supabase",
      supportsMigrations: true,
      supportsRollback: true,
      supportsSqlExecution: true,
      supportsAdminCreation: true,
    });
  });

  it("returns a project resource keyed for the create_project step", async () => {
    const provider = build([
      { match: /\/v1\/projects$/, method: "GET", responses: [{ body: [] }] },
      { match: /\/v1\/projects$/, method: "POST", responses: [{ body: projectPayload("COMING_UP") }] },
      { match: /\/v1\/projects\/abc$/, responses: [{ body: projectPayload("ACTIVE_HEALTHY") }] },
    ]);
    const result = await provider.createProject({
      tenantId: "tenant-1",
      correlationId: "corr-1",
      slug: "acme",
      region: "us-east-1",
      credentials: { name: "SUPABASE_MANAGEMENT_TOKEN", scope: "platform" },
    });
    expect(result.reference).toBe("abc");
    expect(result.resources[0]).toMatchObject({ kind: "project", step_key: "create_project" });
  });

  it("surfaces typed provisioning errors, never raw HTTP failures", async () => {
    const provider = build([
      { match: /\/v1\/projects$/, method: "GET", responses: [{ status: 500, body: {} }] },
    ]);
    await provider
      .createProject({
        tenantId: "tenant-1",
        correlationId: "corr-1",
        slug: "acme",
        region: "us-east-1",
        credentials: { name: "SUPABASE_MANAGEMENT_TOKEN", scope: "platform" },
      })
      .catch((cause) => {
        expect(isProviderFailure(cause)).toBe(true);
        expect(cause.provisioningError.providerKey).toBe("supabase");
        expect(cause.provisioningError.retryable).toBe(true);
      });
  });
});
