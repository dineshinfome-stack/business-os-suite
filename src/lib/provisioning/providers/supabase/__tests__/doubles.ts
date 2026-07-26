/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Shared test doubles.
 *
 * Every dependency is a controllable fake: no network, no timers, no clock
 * drift, no filesystem.
 */
import type {
  AuthAdminApi,
  FetchLike,
  HttpResponseLike,
  MigrationScript,
  ProviderClock,
  SecretResolver,
  SeedScript,
  SqlExecutor,
  SqlQueryInput,
  SqlResult,
  SqlRow,
} from "../types";
import { nullProviderLogger } from "../logger";

export const testLogger = nullProviderLogger;

export function fakeClock(startIso = "2026-01-01T00:00:00.000Z"): ProviderClock & {
  sleeps: number[];
} {
  const sleeps: number[] = [];
  return {
    sleeps,
    nowMs: () => Date.parse(startIso),
    nowIso: () => startIso,
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  };
}

export interface FakeResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  throws?: boolean;
}

export interface RecordedCall {
  url: string;
  method: string;
  body?: string;
}

export function fakeFetch(
  routes: Array<{ match: RegExp; method?: string; responses: FakeResponse[] }>,
): FetchLike & { calls: RecordedCall[] } {
  const calls: RecordedCall[] = [];
  const cursors = new Map<number, number>();

  const impl = (async (url, init) => {
    const method = init?.method ?? "GET";
    calls.push({ url, method, body: init?.body });
    const index = routes.findIndex(
      (r) => r.match.test(url) && (!r.method || r.method === method),
    );
    if (index === -1) throw new Error(`unrouted request: ${method} ${url}`);
    const route = routes[index];
    const cursor = cursors.get(index) ?? 0;
    const spec = route.responses[Math.min(cursor, route.responses.length - 1)];
    cursors.set(index, cursor + 1);
    if (spec.throws) throw new Error("network down");
    const status = spec.status ?? 200;
    const headers = spec.headers ?? {};
    const response: HttpResponseLike = {
      status,
      ok: status >= 200 && status < 300,
      headers: { get: (name) => headers[name.toLowerCase()] ?? null },
      text: async () => (spec.body === undefined ? "" : JSON.stringify(spec.body)),
    };
    return response;
  }) as FetchLike & { calls: RecordedCall[] };

  impl.calls = calls;
  return impl;
}

export const testSecrets: SecretResolver = {
  resolve: async () => ({ accessToken: "sbp_test_token", organizationId: "org_test" }),
};

export function fakeSqlExecutor(
  handler: (input: SqlQueryInput) => SqlRow[] | Promise<SqlRow[]>,
): SqlExecutor & { statements: string[] } {
  const statements: string[] = [];
  return {
    statements,
    async execute(input): Promise<SqlResult> {
      statements.push(input.sql);
      return { rows: await handler(input) };
    },
  };
}

export const migrationSource = (scripts: MigrationScript[]) => ({
  list: async () => scripts,
});

export const seedSource = (scripts: SeedScript[]) => ({ list: async () => scripts });

export const fakeAuthAdmin = (existing: string | null = null): AuthAdminApi => ({
  findUserByEmail: async () => (existing ? { userId: existing } : null),
  createUser: async () => ({ userId: "user_created" }),
});
