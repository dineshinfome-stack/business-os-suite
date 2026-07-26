/**
 * Gate 3.4 · SSE stream session — server only.
 *
 * Verifies a bearer access token, then exposes a `read()` that returns the
 * job detail DTO under the caller's own RLS context (no admin client).
 */
import { createClient } from "@supabase/supabase-js";

import { getJobDetail } from "./query-service.server";
import type { ProvisioningJobDetailDTO } from "@/modules/platform/provisioning/types";

export type ProvisioningStreamSession =
  | { ok: false; status: number; message: string }
  | {
      ok: true;
      pollIntervalMs: number;
      read: () => Promise<ProvisioningJobDetailDTO | null>;
    };

function isOpaqueKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export async function openProvisioningStream(
  token: string,
  jobId: string,
): Promise<ProvisioningStreamSession> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return { ok: false, status: 500, message: "Supabase is not configured." };
  }
  if (token.split(".").length !== 3) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isOpaqueKey(key) && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await client.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  const initial = await getJobDetail(client as never, jobId);
  if (!initial) {
    return { ok: false, status: 404, message: "Provisioning job not found." };
  }

  return {
    ok: true,
    pollIntervalMs: initial.pollIntervalMs,
    read: () => getJobDetail(client as never, jobId),
  };
}
