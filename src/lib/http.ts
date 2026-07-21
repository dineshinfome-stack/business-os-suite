/**
 * Shared HTTP client stub.
 *
 * This is the ONE place future services should extend when calling
 * external APIs. Interceptor slots and auth injection are placeholders in
 * Sprint 0.1 — no real endpoints are wired.
 */
import { logger } from "@/lib/logger";

export interface HttpRequestInit extends RequestInit {
  baseURL?: string;
  query?: Record<string, string | number | boolean | undefined>;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: unknown,
  ) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "HttpError";
  }
}

type RequestInterceptor = (init: HttpRequestInit) => HttpRequestInit | Promise<HttpRequestInit>;
type ResponseInterceptor = (res: Response) => Response | Promise<Response>;

const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export function addRequestInterceptor(fn: RequestInterceptor) {
  requestInterceptors.push(fn);
}
export function addResponseInterceptor(fn: ResponseInterceptor) {
  responseInterceptors.push(fn);
}

// Placeholder — real auth token injection will hook in here.
export function setAuthHeader(_token: string | null): void {
  /* no-op in Sprint 0.1 */
}

function buildUrl(path: string, base?: string, query?: HttpRequestInit["query"]): string {
  const url = base ? new URL(path, base) : new URL(path, "http://placeholder");
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return base ? url.toString() : url.pathname + url.search;
}

export async function http<T = unknown>(path: string, init: HttpRequestInit = {}): Promise<T> {
  let finalInit: HttpRequestInit = { ...init };
  for (const i of requestInterceptors) finalInit = await i(finalInit);

  const url = buildUrl(path, finalInit.baseURL, finalInit.query);
  let res = await fetch(url, finalInit);
  for (const i of responseInterceptors) res = await i(res);

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    logger.error("http error", res.status, url, body);
    throw new HttpError(res.status, res.statusText, body);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}
