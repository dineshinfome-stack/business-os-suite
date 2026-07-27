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

  /* ------------------------------------- Pass 3.8.5 additive v1 fields --- */
  /** Tenant the evaluation belongs to; null when never evaluated. */
  tenantId: string | null;
  /** Checks whose status is not `not_applicable`. */
  applicableCount: number;
  /**
   * Database-computed fingerprint of the CURRENT warning set. Acknowledging
   * warnings is only valid against the fingerprint that produced them.
   */
  warningFingerprint: string | null;
  /** `tenant_onboarding.version` observed at evaluation time. */
  observedWorkflowVersion: number | null;
  /** Readiness rule-set contract version emitted by the evaluator. */
  contractVersion: string;
}

