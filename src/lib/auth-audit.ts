import { logAuthEventFn } from "./auth.functions";
import { getOrCreateCorrelationId } from "./correlation";
import { logger } from "./logger";

/**
 * Whitelisted authentication audit actions. Past-tense verb form per
 * `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`. New actions in
 * later sprints extend this union; the naming convention itself must not
 * be redefined.
 */
export type AuthAuditAction =
  | "user_logged_in"
  | "user_logged_out"
  | "password_reset_requested"
  | "password_reset_completed";

interface LogAuthEventOptions {
  correlationId?: string;
  entityId?: string;
}

/**
 * Fire-and-forget audit write. Auth flows MUST NOT fail because audit failed:
 * this function never throws and never returns a rejected promise. Failures
 * are logged via logger.warn with the correlation id for later reconciliation.
 */
export function logAuthEvent(action: AuthAuditAction, options: LogAuthEventOptions = {}): string {
  const correlationId = getOrCreateCorrelationId({ callerId: options.correlationId });
  void logAuthEventFn({ data: { action, correlationId, entityId: options.entityId } }).catch(
    (err: unknown) => {
      logger.warn("auth-audit write failed", { action, correlationId, error: String(err) });
    },
  );
  return correlationId;
}
