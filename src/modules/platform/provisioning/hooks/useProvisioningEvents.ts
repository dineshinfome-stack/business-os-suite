/**
 * Gate 3.4 · Live update transport.
 *
 * SSE lifecycle (spec): one stream per open detail view, server heartbeat,
 * exponential client reconnect (1s → 30s), fall back to polling after 5
 * consecutive failures, and close the stream on unmount/navigation.
 */
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { ProvisioningJobDetailDTO } from "../types";
import { provisioningKeys } from "./query-keys";

const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;
const MAX_FAILURES = 5;

export type LiveStatus = "connecting" | "live" | "polling" | "closed";

export function useProvisioningEvents(jobId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState<LiveStatus>("connecting");

  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setStatus("closed");
      return;
    }

    let source: EventSource | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      setStatus((prev) => (prev === "polling" ? prev : "connecting"));
      source = new EventSource(`/api/provisioning/events/${jobId}`);

      source.addEventListener("open", () => {
        failures = 0;
        setStatus("live");
      });

      source.addEventListener("snapshot", (event) => {
        try {
          const detail = JSON.parse((event as MessageEvent).data) as ProvisioningJobDetailDTO;
          queryClient.setQueryData(provisioningKeys.detail(jobId), detail);
          if (detail.terminal) {
            source?.close();
            setStatus("closed");
            cancelled = true;
          }
        } catch {
          /* malformed frame — the next snapshot or a refetch corrects it */
        }
      });

      source.addEventListener("error", () => {
        source?.close();
        source = null;
        if (cancelled) return;
        failures += 1;
        if (failures >= MAX_FAILURES) {
          setStatus("polling");
          return;
        }
        const delay = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (failures - 1));
        timer = setTimeout(connect, delay);
      });
    };

    connect();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      source?.close();
      setStatus("closed");
    };
  }, [jobId, enabled, queryClient]);

  return { status, pollingFallback: status !== "live" };
}
