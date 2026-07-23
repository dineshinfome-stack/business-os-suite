/**
 * SPR-MOD-001-001 — slug normalization.
 * Mirrors private.fn_normalize_slug: lowercase, non-alnum→dash, collapse, trim.
 */

const SLUG_FORMAT = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return SLUG_FORMAT.test(slug);
}
