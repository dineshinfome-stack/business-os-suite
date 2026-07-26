/**
 * Gate 3.8 · Pass 3.8.1 — composed activity DTO (v1).
 *
 * G38-POL-008: the timeline is a sanitized composition over `audit_logs` and
 * `tenant_onboarding_steps`. No duplicate event-history table exists, and raw
 * audit metadata (`old_values` / `new_values`) never crosses this boundary.
 */
import type { OnboardingStepKey } from "../../contracts";

export type OnboardingActivitySource = "audit_log" | "onboarding_step";

export interface TenantOnboardingActivityDTO {
  /** Stable synthetic id: `${source}:${sourceId}`. */
  id: string;
  source: OnboardingActivitySource;
  occurredAt: string;
  /** Stable machine action, e.g. `onboarding.step.completed`. */
  action: string;
  label: string;
  /** Sanitized description composed from persisted values. */
  description: string;
  tone: "neutral" | "success" | "warning" | "danger";
  stepKey: OnboardingStepKey | null;
  actorId: string | null;
  correlationId: string | null;
}
