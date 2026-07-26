/**
 * Gate 3.4 · Provisioning live-update stream (SSE).
 *
 * Raw HTTP endpoint: emits `snapshot` frames with the job detail DTO plus
 * periodic `heartbeat` comments, and closes once the job reaches a terminal
 * state. The caller MUST send `Authorization: Bearer <supabase access token>`;
 * browsers' native `EventSource` cannot set headers, so this endpoint is for
 * fetch-based or server-to-server consumers.
 */
import { createFileRoute } from "@tanstack/react-router";

const HEARTBEAT_MS = 15_000;
const MAX_STREAM_MS = 10 * 60_000;

export const Route = createFileRoute("/api/provisioning/events/$jobId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { openProvisioningStream } = await import(
          "@/lib/provisioning-admin/events.server"
        );

        let session;
        try {
          session = await openProvisioningStream(
            authHeader.slice("Bearer ".length),
            params.jobId,
          );
        } catch {
          return new Response("Unauthorized", { status: 401 });
        }
        if (!session.ok) {
          return new Response(session.message, { status: session.status });
        }

        const encoder = new TextEncoder();
        const startedAt = Date.now();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (event: string, payload: unknown) =>
              controller.enqueue(
                encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
              );

            let closed = false;
            const close = () => {
              if (closed) return;
              closed = true;
              clearInterval(heartbeat);
              clearInterval(poller);
              try {
                controller.close();
              } catch {
                /* already closed */
              }
            };

            request.signal.addEventListener("abort", close);

            const push = async () => {
              if (closed) return;
              const detail = await session.read().catch(() => null);
              if (!detail) return;
              send("snapshot", detail);
              if (detail.terminal || Date.now() - startedAt > MAX_STREAM_MS) close();
            };

            const heartbeat = setInterval(() => {
              if (!closed) controller.enqueue(encoder.encode(": heartbeat\n\n"));
            }, HEARTBEAT_MS);

            const poller = setInterval(() => void push(), session.pollIntervalMs);

            await push();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
