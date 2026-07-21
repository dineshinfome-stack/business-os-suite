/**
 * Sanitize a caller-provided "next" path for post-auth navigation.
 *
 * Accepts only same-origin relative paths that begin with a single '/'.
 * Rejects any value that could redirect the browser off-origin.
 *
 * Rejected:
 *  - protocol-relative (`//evil.com`)
 *  - backslash-escaped (`/\evil.com`)
 *  - absolute URLs / anything containing ':' before the first '/'
 *  - empty / non-string values
 *
 * Falls back to '/dashboard' on any rejection.
 */
export const DEFAULT_NEXT_PATH = "/dashboard";

export function sanitizeNextPath(input: unknown): string {
  if (typeof input !== "string" || input.length === 0) return DEFAULT_NEXT_PATH;
  if (!input.startsWith("/")) return DEFAULT_NEXT_PATH;
  if (input.startsWith("//") || input.startsWith("/\\")) return DEFAULT_NEXT_PATH;
  if (input.includes(":")) return DEFAULT_NEXT_PATH;
  // Trim any embedded whitespace/control characters that could confuse routers.
  if (/[\s\0-\x1f]/.test(input)) return DEFAULT_NEXT_PATH;
  return input;
}
