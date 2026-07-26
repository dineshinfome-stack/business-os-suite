/**
 * Gate 3.5 · Live state synchronization + cache invalidation.
 *
 * Confirms the documented invalidation sets fire per command and that the SSE
 * transport degrades to polling exactly as specified.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { invalidateAfterCommand, provisioningKeys } from "../hooks/query-keys";
import { useProvisioningEvents } from "../hooks/useProvisioningEvents";

function keySpy() {
  const client = new QueryClient();
  const calls: string[] = [];
  vi.spyOn(client, "invalidateQueries").mockImplementation((filters?: any) => {
    calls.push(JSON.stringify(filters?.queryKey));
    return Promise.resolve();
  });
  return { client, calls };
}

describe("cache invalidation sets", () => {
  it("start refreshes summary, lists and queue", () => {
    const { client, calls } = keySpy();
    invalidateAfterCommand(client, "start", "job-1");
    expect(calls).toEqual([
      JSON.stringify(provisioningKeys.summary()),
      JSON.stringify(provisioningKeys.lists()),
      JSON.stringify(provisioningKeys.queue()),
    ]);
  });

  it.each(["retry", "advance", "cancel"] as const)(
    "%s refreshes detail, lists, summary and queue",
    (command) => {
      const { client, calls } = keySpy();
      invalidateAfterCommand(client, command, "job-1");
      expect(calls).toEqual([
        JSON.stringify(provisioningKeys.detail("job-1")),
        JSON.stringify(provisioningKeys.lists()),
        JSON.stringify(provisioningKeys.summary()),
        JSON.stringify(provisioningKeys.queue()),
      ]);
    },
  );

  it("rollback refreshes detail, failed and summary", () => {
    const { client, calls } = keySpy();
    invalidateAfterCommand(client, "rollback", "job-1");
    expect(calls).toEqual([
      JSON.stringify(provisioningKeys.detail("job-1")),
      JSON.stringify(provisioningKeys.failed()),
      JSON.stringify(provisioningKeys.summary()),
    ]);
  });

  it("skips the detail key when the command produced no job id", () => {
    const { client, calls } = keySpy();
    invalidateAfterCommand(client, "retry", null);
    expect(calls).not.toContain(JSON.stringify(provisioningKeys.detail("job-1")));
  });

  it("keeps list keys query-scoped so filters do not share a cache entry", () => {
    const a = provisioningKeys.list({ page: 1 });
    const b = provisioningKeys.list({ page: 2 });
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(b));
    expect(a.slice(0, 2)).toEqual(provisioningKeys.lists());
  });
});

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  listeners = new Map<string, ((event: unknown) => void)[]>();
  closed = false;
  constructor(public url: string) {
    FakeEventSource.instances.push(this);
  }
  addEventListener(type: string, handler: (event: unknown) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), handler]);
  }
  emit(type: string, event?: unknown) {
    (this.listeners.get(type) ?? []).forEach((h) => h(event));
  }
  close() {
    this.closed = true;
  }
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("live updates", () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource as unknown as typeof EventSource);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("connects to the job stream and reports live", () => {
    const { result } = renderHook(() => useProvisioningEvents("job-1", true), { wrapper });
    expect(FakeEventSource.instances[0].url).toBe("/api/provisioning/events/job-1");
    act(() => FakeEventSource.instances[0].emit("open"));
    expect(result.current.status).toBe("live");
  });

  it("falls back to polling after five consecutive failures", async () => {
    const { result } = renderHook(() => useProvisioningEvents("job-1", true), { wrapper });
    for (let i = 0; i < 5; i += 1) {
      act(() => FakeEventSource.instances.at(-1)!.emit("error"));
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
    }
    await waitFor(() => expect(result.current.status).toBe("polling"));
    expect(result.current.pollingFallback).toBe(true);
  });

  it("stays closed and opens no stream when disabled", () => {
    const { result } = renderHook(() => useProvisioningEvents("job-1", false), { wrapper });
    expect(FakeEventSource.instances).toHaveLength(0);
    expect(result.current.status).toBe("closed");
  });

  it("closes the stream on unmount (route change / browser navigation)", () => {
    const { unmount } = renderHook(() => useProvisioningEvents("job-1", true), { wrapper });
    const source = FakeEventSource.instances[0];
    unmount();
    expect(source.closed).toBe(true);
  });
});
