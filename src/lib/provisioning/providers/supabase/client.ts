/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.3 · Typed Management API HTTP client.
 *
 * Credentials, fetch, clock, logger and abort signal are all injected. No env
 * reads, no globals, no hardcoded tokens. No raw JSON leaves this module:
 * every failure becomes a typed provider error carrying `retryable`.
 */
import {
  apiError,
  authenticationError,
  cancellationError,
  classifyStatus,
  fail,
} from "./errors";
import type {
  FetchLike,
  ProviderCallContext,
  ProviderClock,
  ProviderLogger,
  SupabaseCredentials,
} from "./types";

export interface HttpClientDeps {
  baseUrl: string;
  credentials: SupabaseCredentials;
  fetch: FetchLike;
  clock: ProviderClock;
  logger: ProviderLogger;
  signal?: AbortSignal;
}

export interface RequestOptions {
  method: "GET" | "POST" | "DELETE" | "PATCH";
  path: string;
  body?: unknown;
  ctx: ProviderCallContext;
  /** Statuses treated as "absent" rather than errors. */
  notFoundAsNull?: boolean;
  signal?: AbortSignal;
}

export interface HttpClient {
  request<T>(options: RequestOptions): Promise<T | null>;
}

const parseRetryAfterMs = (raw: string | null): number | undefined => {
  if (!raw) return undefined;
  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.round(seconds * 1000);
  const at = Date.parse(raw);
  return Number.isNaN(at) ? undefined : Math.max(0, at - Date.now());
};

export function createHttpClient(deps: HttpClientDeps): HttpClient {
  const { baseUrl, credentials, logger } = deps;

  if (!credentials.accessToken) {
    fail(authenticationError("Management API access token is missing."));
  }

  return {
    async request<T>(options: RequestOptions): Promise<T | null> {
      const signal = options.signal ?? deps.signal;
      if (signal?.aborted) {
        fail(cancellationError("Request cancelled before dispatch.", {
          operation: options.ctx.operation,
        }));
      }

      const url = `${baseUrl.replace(/\/$/, "")}${options.path}`;
      logger.debug("management api request", { ...options.ctx, method: options.method });

      let response;
      try {
        response = await deps.fetch(url, {
          method: options.method,
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
          ...(signal ? { signal } : {}),
        });
      } catch (cause) {
        if (signal?.aborted) {
          fail(cancellationError("Request cancelled in flight.", {
            operation: options.ctx.operation,
          }));
        }
        // Network-level failures are transient by definition.
        fail(
          apiError(
            `Network failure calling the Management API (${options.ctx.operation}).`,
            { retryable: true, details: { operation: options.ctx.operation } },
          ),
        );
      }

      if (response.status === 404 && options.notFoundAsNull) return null;

      if (!response.ok) {
        const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
        const body = await response.text().catch(() => "");
        const summary = body.slice(0, 200);

        if (response.status === 401 || response.status === 403) {
          logger.error("management api authentication failure", {
            ...options.ctx,
            status: response.status,
          });
          fail(
            authenticationError(
              `Management API rejected the credentials (${response.status}).`,
              { operation: options.ctx.operation, status: response.status },
            ),
          );
        }

        const { retryable } = classifyStatus(response.status);
        logger.warn("management api error response", {
          ...options.ctx,
          status: response.status,
          retryable,
        });
        fail(
          apiError(`Management API responded ${response.status} (${options.ctx.operation}).`, {
            status: response.status,
            retryable,
            details: { operation: options.ctx.operation, body: summary },
          }),
          retryAfterMs,
        );
      }

      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text) as T;
      } catch {
        fail(
          apiError("Management API returned a malformed JSON payload.", {
            status: response.status,
            retryable: false,
            details: { operation: options.ctx.operation },
          }),
        );
      }
    },
  };
}
