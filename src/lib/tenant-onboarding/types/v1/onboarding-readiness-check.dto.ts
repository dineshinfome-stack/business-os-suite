/**
 * Gate 3.8 · Pass 3.8.1 — readiness check DTO (v1).
 *
 * CONTRACT ONLY. Readiness evaluation is owned exclusively by Pass 3.8.5
 * (G38-POL-009).
 */
import type { OnboardingStepKey } from "../../contracts";

export type ReadinessCheckClassification =
  | "mandatory"
  | "conditional"
  | "warning";

export type ReadinessCheckStatus =
  | "not_evaluated"
  | "pass"
  | "warning"
  | "blocked"
  | "not_applicable";

export interface TenantOnboardingReadinessCheckDTO {
  /** Stable machine identifier, e.g. `provisioning_completed`. */
  checkKey: string;
  label: string;
  classification: ReadinessCheckClassification;
  status: ReadinessCheckStatus;
  owningModule: string;
  stepKey: OnboardingStepKey | null;
  /** Stable machine reason code for the current status. */
  reasonCode: string;
  /** Safe structured values only. */
  reasonParams: Record<string, string | number | boolean>;
  /** Sanitized operator explanation. */
  explanation: string;
  deepLink: string | null;
  evaluatedAt: string | null;
}
