/**
 * Phase 1 — Platform-scoped logger.
 *
 * Thin wrapper over the shared logger that tags every entry with a
 * `platform:` prefix so Platform-originated events are easy to filter.
 */
import { logger } from "@/lib/logger";

const TAG = "platform:";

export const platformLogger = {
  debug: (...args: unknown[]) => logger.debug(TAG, ...args),
  info: (...args: unknown[]) => logger.info(TAG, ...args),
  warn: (...args: unknown[]) => logger.warn(TAG, ...args),
  error: (...args: unknown[]) => logger.error(TAG, ...args),
};
