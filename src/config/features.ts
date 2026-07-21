/**
 * Feature flags.
 *
 * - Env-derived flags (VITE_FEATURE_*) are read at build time and are
 *   READ-ONLY in production.
 * - `enableFeature` / `disableFeature` provide dev-only runtime overrides
 *   for local testing; they no-op with a warning in production builds.
 */

type FlagKey = string;

function readEnvFlags(): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(import.meta.env)) {
    if (!key.startsWith("VITE_FEATURE_")) continue;
    const flag = key.replace(/^VITE_FEATURE_/, "").toLowerCase();
    out[flag] = value === "true" || value === true || value === "1";
  }
  return out;
}

const envFlags = readEnvFlags();
const overrides = new Map<FlagKey, boolean>();

export function isFeatureEnabled(key: FlagKey): boolean {
  const normalized = key.toLowerCase();
  if (overrides.has(normalized)) return overrides.get(normalized)!;
  return envFlags[normalized] ?? false;
}

export function enableFeature(key: FlagKey): void {
  if (import.meta.env.PROD) {
    console.warn("[features] Runtime enableFeature is dev-only and was ignored in production.");
    return;
  }
  overrides.set(key.toLowerCase(), true);
}

export function disableFeature(key: FlagKey): void {
  if (import.meta.env.PROD) {
    console.warn("[features] Runtime disableFeature is dev-only and was ignored in production.");
    return;
  }
  overrides.set(key.toLowerCase(), false);
}
