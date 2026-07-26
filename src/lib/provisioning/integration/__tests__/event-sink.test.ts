import { describe, it, expect } from "vitest";
import { buildProvisioningEvent } from "../../events";
import { createEventSink } from "../event-sink";
import { CORRELATION_ID, JOB_ID, TENANT_ID, createRecordingLogger, type RecordedLog } from "./harness";

const event = (name: Parameters<typeof buildProvisioningEvent>[0], data = {}) =>
  buildProvisioningEvent(name, {
    tenantId: TENANT_ID,
    jobId: JOB_ID,
    actorId: "actor-1",
    correlationId: CORRELATION_ID,
    data,
  });

describe("integration · event sink", () => {
  it("dispatches events to the transport", async () => {
    const received: string[] = [];
    const sink = createEventSink({ transport: async (e) => void received.push(e.event) });

    await sink.emit(event("provisioning.started"));
    await sink.emit(event("provisioning.completed"));

    expect(received).toEqual(["provisioning.started", "provisioning.completed"]);
  });

  it("preserves emission ordering under concurrent emits", async () => {
    const received: string[] = [];
    const sink = createEventSink({
      transport: async (e) => {
        // Slower first event would reorder an unserialized sink.
        const delay = e.data.seq === 0 ? 20 : 0;
        await new Promise((r) => setTimeout(r, delay));
        received.push(String(e.data.seq));
      },
    });

    await Promise.all([
      sink.emit(event("provisioning.step_changed", { seq: 0 })),
      sink.emit(event("provisioning.step_changed", { seq: 1 })),
      sink.emit(event("provisioning.step_changed", { seq: 2 })),
    ]);

    expect(received).toEqual(["0", "1", "2"]);
  });

  it("preserves correlation ids on every dispatched event and log", async () => {
    const logs: RecordedLog[] = [];
    const sink = createEventSink({
      logger: createRecordingLogger(logs),
      transport: async (e) => {
        expect(e.correlation_id).toBe(CORRELATION_ID);
      },
    });

    await sink.emit(event("provisioning.started"));

    expect(logs).not.toHaveLength(0);
    for (const entry of logs) {
      expect(entry.fields.correlationId).toBe(CORRELATION_ID);
      expect(entry.fields.tenantId).toBe(TENANT_ID);
      expect(entry.fields.jobId).toBe(JOB_ID);
    }
  });

  it("surfaces a transport failure without breaking later emits", async () => {
    const logs: RecordedLog[] = [];
    const received: string[] = [];
    let fail = true;
    const sink = createEventSink({
      logger: createRecordingLogger(logs),
      transport: async (e) => {
        if (fail) {
          fail = false;
          throw new Error("transport offline");
        }
        received.push(e.event);
      },
    });

    await expect(sink.emit(event("provisioning.started"))).rejects.toThrow(
      "transport offline",
    );
    await sink.emit(event("provisioning.completed"));

    expect(received).toEqual(["provisioning.completed"]);
    expect(logs.some((l) => l.level === "error")).toBe(true);
  });

  it("logs structurally when no transport is configured", async () => {
    const logs: RecordedLog[] = [];
    const sink = createEventSink({ logger: createRecordingLogger(logs) });
    await sink.emit(event("provisioning.failed"));

    expect(logs.map((l) => l.message)).toContain("event provisioning.failed");
  });

  it("reports dispatched events through the observability hook", async () => {
    const seen: string[] = [];
    const sink = createEventSink({ onEmitted: (e) => seen.push(e.event) });
    await sink.emit(event("provisioning.cancelled"));
    expect(seen).toEqual(["provisioning.cancelled"]);
  });
});
