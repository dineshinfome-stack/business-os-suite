/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Typed Management API operations.
 *
 * Every operation returns a typed model. Raw payload shapes stay inside this
 * module.
 */
import { apiError, fail } from "./errors";
import type { HttpClient } from "./client";
import type {
  CreateProjectRequest,
  DatabaseConnection,
  ProjectApiKeys,
  ProjectInfo,
  ProjectStatus,
  ProviderCallContext,
  SqlResult,
  SqlRow,
} from "./types";

interface RawProject {
  id?: string;
  ref?: string;
  name?: string;
  organization_id?: string;
  region?: string;
  status?: string;
  created_at?: string;
  database?: { host?: string; version?: string };
}

const STATUSES: readonly ProjectStatus[] = [
  "COMING_UP",
  "ACTIVE_HEALTHY",
  "ACTIVE_UNHEALTHY",
  "INIT_FAILED",
  "REMOVED",
];

const toStatus = (value: string | undefined): ProjectStatus =>
  STATUSES.includes(value as ProjectStatus) ? (value as ProjectStatus) : "UNKNOWN";

function toProjectInfo(raw: RawProject, ctx: ProviderCallContext): ProjectInfo {
  const reference = raw.ref ?? raw.id;
  if (!reference || !raw.name) {
    fail(
      apiError("Management API returned a project without a reference or name.", {
        retryable: false,
        details: { operation: ctx.operation },
      }),
    );
  }
  return {
    id: raw.id ?? reference,
    reference,
    name: raw.name,
    organizationId: raw.organization_id ?? "",
    region: raw.region ?? "",
    status: toStatus(raw.status),
    createdAt: raw.created_at ?? null,
  };
}

export interface ManagementApi {
  createProject(input: CreateProjectRequest, ctx: ProviderCallContext): Promise<ProjectInfo>;
  getProject(reference: string, ctx: ProviderCallContext): Promise<ProjectInfo | null>;
  listProjects(ctx: ProviderCallContext): Promise<ProjectInfo[]>;
  deleteProject(reference: string, ctx: ProviderCallContext): Promise<boolean>;
  getDatabaseConnection(
    reference: string,
    password: string,
    ctx: ProviderCallContext,
  ): Promise<DatabaseConnection>;
  getApiKeys(reference: string, ctx: ProviderCallContext): Promise<ProjectApiKeys>;
  runQuery(reference: string, sql: string, ctx: ProviderCallContext): Promise<SqlResult>;
}

export interface ManagementApiDeps {
  http: HttpClient;
  organizationId: string;
}

export function createManagementApi(deps: ManagementApiDeps): ManagementApi {
  const { http, organizationId } = deps;

  return {
    async createProject(input, ctx) {
      const raw = await http.request<RawProject>({
        method: "POST",
        path: "/v1/projects",
        ctx,
        body: {
          name: input.name,
          region: input.region,
          organization_id: organizationId,
          db_pass: input.databasePassword,
        },
      });
      if (!raw) {
        fail(
          apiError("Management API returned an empty project creation response.", {
            retryable: false,
            details: { operation: ctx.operation },
          }),
        );
      }
      return toProjectInfo(raw, ctx);
    },

    async getProject(reference, ctx) {
      const raw = await http.request<RawProject>({
        method: "GET",
        path: `/v1/projects/${reference}`,
        ctx,
        notFoundAsNull: true,
      });
      return raw ? toProjectInfo(raw, ctx) : null;
    },

    async listProjects(ctx) {
      const raw = (await http.request<RawProject[]>({
        method: "GET",
        path: "/v1/projects",
        ctx,
      })) ?? [];
      return raw
        .filter((p) => !p.organization_id || p.organization_id === organizationId)
        .map((p) => toProjectInfo(p, ctx));
    },

    async deleteProject(reference, ctx) {
      await http.request<unknown>({
        method: "DELETE",
        path: `/v1/projects/${reference}`,
        ctx,
        notFoundAsNull: true,
      });
      return true;
    },

    async getDatabaseConnection(reference, password, ctx) {
      const raw = await http.request<{
        db_host?: string;
        db_port?: number;
        db_name?: string;
        db_user?: string;
      }>({
        method: "GET",
        path: `/v1/projects/${reference}/postgrest`,
        ctx,
        notFoundAsNull: true,
      });

      const host = raw?.db_host ?? `db.${reference}.supabase.co`;
      return {
        host,
        port: raw?.db_port ?? 5432,
        database: raw?.db_name ?? "postgres",
        username: raw?.db_user ?? "postgres",
        password,
        sslMode: "require",
      };
    },

    async getApiKeys(reference, ctx) {
      const raw =
        (await http.request<Array<{ name?: string; api_key?: string }>>({
          method: "GET",
          path: `/v1/projects/${reference}/api-keys`,
          ctx,
        })) ?? [];

      const find = (name: string) => raw.find((k) => k.name === name)?.api_key;
      const anonKey = find("anon");
      const serviceRoleKey = find("service_role");
      if (!serviceRoleKey) {
        fail(
          apiError("Management API did not return a service role key.", {
            retryable: true,
            details: { operation: ctx.operation },
          }),
        );
      }
      return {
        anonKey: anonKey ?? "",
        serviceRoleKey,
        projectUrl: `https://${reference}.supabase.co`,
      };
    },

    async runQuery(reference, sql, ctx) {
      const raw = await http.request<SqlRow[] | { result?: SqlRow[] }>({
        method: "POST",
        path: `/v1/projects/${reference}/database/query`,
        ctx,
        body: { query: sql },
      });
      if (!raw) return { rows: [] };
      const rows = Array.isArray(raw) ? raw : (raw.result ?? []);
      return { rows };
    },
  };
}
