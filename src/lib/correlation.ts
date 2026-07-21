/**
 * Correlation ID utilities.
 *
 * See `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md` for the
 * platform-wide precedence rules. Every audit event and every warn/error log
 * emitted within an auth flow MUST carry the flow's correlation id.
 *
 * Precedence (applied by getOrCreateCorrelationId):
 *   1. Inbound HTTP request id (`x-request-id` header, when in a server ctx)
 *   2. Ambient request-scoped store (already-set id for this call chain)
 *   3. Caller-provided id (explicit argument)
 *   4. Newly generated id (crypto.randomUUID with fallback)
 */

export function newCorrelationId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Monotonic random hex fallback — only reachable on runtimes without WebCrypto.
  const t = Date.now().toString(16).padStart(12, "0");
  const r = Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, "0");
  return `${t}${r}`;
}

export interface CorrelationSource {
  requestId?: string | null;
  ambientId?: string | null;
  callerId?: string | null;
}

/**
 * Resolve a correlation id from the documented precedence order, generating
 * one only if none of the higher-priority sources provided a value.
 */
export function getOrCreateCorrelationId(source?: CorrelationSource): string {
  const requestId = source?.requestId?.trim();
  if (requestId) return requestId;
  const ambientId = source?.ambientId?.trim();
  if (ambientId) return ambientId;
  const callerId = source?.callerId?.trim();
  if (callerId) return callerId;
  return newCorrelationId();
}
