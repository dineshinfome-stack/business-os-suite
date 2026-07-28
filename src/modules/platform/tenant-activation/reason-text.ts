/**
 * Gate 3.8 — Platform Tenant Activation UI.
 *
 * PRESENTATION-ONLY translation of the stable machine reason codes emitted by
 * the certified backend. This is NOT a second readiness registry: no check
 * set, no statuses, no counts and no eligibility rule live here. The database
 * remains the sole authority; this module turns already-sanitized codes into
 * operator-readable labels and remediation hints.
 */
import type { TenantOnboardingReadinessCheckDTO } from "@/lib/tenant-onboarding/types/v1";

/** Command-level reason codes surfaced by the activation facade. */
export const ACTIVATION_REASON_TEXT: Record<string, string> = {
  readiness_blocked:
    "Activation was refused because one or more blocking readiness checks failed. Resolve them, refresh readiness and try again.",
  warning_acknowledgement_required:
    "Activation requires you to explicitly acknowledge the outstanding warnings before it can proceed.",
  lifecycle_state_blocks:
    "The tenant's current lifecycle state does not permit activation.",
  version_conflict:
    "The tenant state changed since this page was loaded. Readiness has been refreshed — review the current state before retrying. No automatic retry was attempted.",
  permission_denied: "You do not have permission to activate this tenant.",
  workflow_not_started:
    "The onboarding workflow has not been started for this tenant.",
  already_activated: "This tenant has already been activated.",
  command_failed: "The activation could not be completed.",
};

export function activationReasonText(reasonCode: string | null): string {
  if (!reasonCode) return ACTIVATION_REASON_TEXT.command_failed;
  return ACTIVATION_REASON_TEXT[reasonCode] ?? humanize(reasonCode);
}

/** Fallback for any code the backend adds later — never leaks SQLSTATE. */
export function humanize(code: string): string {
  return code.replace(/[_.]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export function checkStatusLabel(
  status: TenantOnboardingReadinessCheckDTO["status"],
): string {
  switch (status) {
    case "pass":
      return "Passed";
    case "warning":
      return "Warning";
    case "blocked":
      return "Blocked";
    case "not_applicable":
      return "Not applicable";
    default:
      return "Not evaluated";
  }
}

export function overallStatusLabel(status: string | null): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "ready_with_warnings":
      return "Ready with warnings";
    case "not_ready":
      return "Not ready";
    default:
      return "Not evaluated";
  }
}

/**
 * Remediation guidance. The backend `explanation` is already sanitized and
 * authoritative; the reason code is only used when no explanation is present.
 */
export function checkRemediation(check: TenantOnboardingReadinessCheckDTO): string {
  return check.explanation || humanize(check.reasonCode);
}
