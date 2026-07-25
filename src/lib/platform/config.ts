/**
 * Phase 1 — Platform configuration accessor.
 *
 * Thin wrapper over the existing env + feature-flag providers. No new
 * configuration framework is introduced.
 */
import { env } from "@/config/env";
import { isFeatureEnabled } from "@/config/features";
import { PLATFORM_FEATURE_FLAGS, type PlatformFeatureFlag } from "./constants";

export const platformConfig = {
  appName: env.APP_NAME,
  mode: env.MODE,
  isDev: env.DEV,
  isProd: env.PROD,
} as const;

export function isPlatformFeatureEnabled(flag: PlatformFeatureFlag): boolean {
  return isFeatureEnabled(flag);
}

export { PLATFORM_FEATURE_FLAGS };
