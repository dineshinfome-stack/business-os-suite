import { describe, expect, it, vi } from "vitest";

import {
  parseQueueEnvelope,
  envelopeTenantRow,
  envelopeOnboardingRow,
} from "../server/mappers.server";
import {
  getOnboardingQueue,
  ONBOARDING_QUEUE_RPC,
} from "../server/query-service.server";
import type { OnboardingListFilterDTO } from "../types/v1";

/* ------------------------------------------------------------------ fixtures */

function tenantRow(i: number, overrides: Record<string, unknown> = {}) {
  return {
    result_position: i,
    tenant_id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`,
    display_name: `Tenant ${i}`,
    slug: `tenant-${i}`,
    code: `T${i}`,
    tenant_created_at: "2026-01-01T00:00:00+00:00",
    tenant_updated_at: "2026-01-02T00:00:00+00:00",
    current_step_key: null,
    onboarding: null,
    ...overrides,
  };
}

function envelope(rows: unknown[], total: number, page = 1, pageSize = 25) {
  return { total_count: total, rows, page, page_size: pageSize };
}

function fakeClient(env: unknown, stepRows: unknown[] = []) {
  const rpc = vi.fn().mockResolvedValue({ data: env, error: null });
  const inFn = vi.fn().mockResolvedValue({ data: stepRows, error: null });
  const from = vi.fn().mockReturnValue({
    select: () => ({ in: inFn }),
  });
  return { client: { from, rpc } as never, rpc, from, inFn };
}

const baseFilters = {
  page: 1,
  pageSize: 25,
} as unknown as OnboardingListFilterDTO;

/* ------------------------------------------------------------ envelope schema */

describe("queue envelope contract (REM-382-002)", () => {
  it("accepts a well-formed envelope and coerces numeric strings", () => {
    const parsed = parseQueueEnvelope(
      envelope([tenantRow(1)], "7" as unknown as number),
    );
    expect(parsed.total_count).toBe(7);
    expect(parsed.rows).toHaveLength(1);
  });

  it("accepts an empty page without inventing rows", () => {
    const parsed = parseQueueEnvelope(envelope([], 0));
    expect(parsed.rows).toEqual([]);
    expect(parsed.total_count).toBe(0);
  });

  it("rejects rows: null as a contract violation rather than coercing it", () => {
    expect(() => parseQueueEnvelope(envelope(null as never, 0))).toThrow();
  });

  it("rejects a missing total_count", () => {
    expect(() =>
      parseQueueEnvelope({ rows: [], page: 1, page_size: 25 }),
    ).toThrow();
  });

  it("rejects a negative total_count", () => {
    expect(() => parseQueueEnvelope(envelope([], -1))).toThrow();
  });

  it("rejects a non-positive page or page size", () => {
    expect(() => parseQueueEnvelope(envelope([], 0, 0, 25))).toThrow();
    expect(() => parseQueueEnvelope(envelope([], 0, 1, 0))).toThrow();
  });

  it("projects a row into the tenant shape the DTO mappers consume", () => {
    const [row] = parseQueueEnvelope(envelope([tenantRow(3)], 1)).rows;
    expect(envelopeTenantRow(row)).toMatchObject({
      id: row.tenant_id,
      display_name: "Tenant 3",
      slug: "tenant-3",
      code: "T3",
    });
    expect(envelopeOnboardingRow(row)).toBeNull();
  });
});

/* --------------------------------------------------------------- read service */

describe("getOnboardingQueue (RPC-backed)", () => {
  it("calls the canonical routine and forwards every filter", async () => {
    const { client, rpc } = fakeClient(envelope([], 0));
    await getOnboardingQueue(client, {
      ...baseFilters,
      search: "acme",
      sortBy: "tenantName",
      sortDir: "asc",
    } as OnboardingListFilterDTO);

    expect(rpc).toHaveBeenCalledTimes(1);
    const [fn, args] = rpc.mock.calls[0];
    expect(fn).toBe(ONBOARDING_QUEUE_RPC);
    expect(args).toMatchObject({
      _search: "acme",
      _sort_by: "tenantName",
      _sort_dir: "asc",
      _page: 1,
      _page_size: 25,
    });
    // absent filters are sent as explicit nulls, never as `undefined`
    for (const value of Object.values(args as Record<string, unknown>)) {
      expect(value).not.toBeUndefined();
    }
  });

  it("reports the EXACT server-side total, not the page length", async () => {
    const rows = [tenantRow(1), tenantRow(2)];
    const { client } = fakeClient(envelope(rows, 1205, 1, 2));
    const page = await getOnboardingQueue(client, baseFilters);

    expect(page.total).toBe(1205);
    expect(page.rows).toHaveLength(2);
    expect(page.pageCount).toBe(603);
  });

  it("preserves the server-side ordering of the page", async () => {
    const rows = [tenantRow(9), tenantRow(4), tenantRow(7)];
    const { client } = fakeClient(envelope(rows, 3));
    const page = await getOnboardingQueue(client, baseFilters);
    expect(page.rows.map((r) => r.tenantName)).toEqual([
      "Tenant 9",
      "Tenant 4",
      "Tenant 7",
    ]);
  });

  it("loads step rows only for the tenants on the returned page", async () => {
    const rows = [tenantRow(1), tenantRow(2)];
    const { client, from, inFn } = fakeClient(envelope(rows, 900));
    await getOnboardingQueue(client, baseFilters);

    expect(from).toHaveBeenCalledWith("tenant_onboarding_steps");
    expect(inFn).toHaveBeenCalledWith(
      "tenant_id",
      rows.map((r) => r.tenant_id),
    );
  });

  it("skips the step query entirely for an empty page", async () => {
    const { client, from } = fakeClient(envelope([], 0));
    const page = await getOnboardingQueue(client, baseFilters);
    expect(from).not.toHaveBeenCalled();
    expect(page.rows).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.pageCount).toBe(0);
  });

  it("propagates an authorization failure instead of returning an empty page", async () => {
    const denial = { code: "42501", message: "permission denied" };
    const client = {
      from: vi.fn(),
      rpc: vi.fn().mockResolvedValue({ data: null, error: denial }),
    } as never;
    await expect(getOnboardingQueue(client, baseFilters)).rejects.toEqual(
      denial,
    );
  });

  it("fails loudly when the routine returns a malformed envelope", async () => {
    const { client } = fakeClient({ rows: null, total_count: 5 });
    await expect(getOnboardingQueue(client, baseFilters)).rejects.toThrow();
  });

  it("requires a client that exposes rpc()", async () => {
    await expect(
      getOnboardingQueue({ from: vi.fn() } as never, baseFilters),
    ).rejects.toThrow(/rpc/);
  });
});
