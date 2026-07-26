/**
 * Gate 3.8 · Pass 3.8.1 — readiness DTO (v1).
 *
 * CONTRACT ONLY — no evaluation implementation exists in this pass.
 * `evaluationStatus: "not_evaluated"` is the value Pass 3.8.2 may expose.
 */
import type { TenantOnboardingReadinessCheckDTO } from "./onboarding-readiness-check.dto";

export type ReadinessEvaluationStatus =
  | "not_evaluated"
  | "evaluating"
  | "evaluated";

export type ReadinessOverallStatus =
  | "not_ready"
  | "ready_with_warnings"
  | "ready";

export interface TenantOnboardingReadinessDTO {
  evaluationStatus: ReadinessEvaluationStatus;
  /** Present only when `evaluationStatus === "evaluated"`. */
  overallStatus: ReadinessOverallStatus | null;
  evaluatedAt: string | null;
  /** Version of the readiness rule set that produced this result. */
  workflowVersion: string;
  checks: TenantOnboardingReadinessCheckDTO[];
  blockingCount: number;
  warningCount: number;
  correlationId: string | null;
}
