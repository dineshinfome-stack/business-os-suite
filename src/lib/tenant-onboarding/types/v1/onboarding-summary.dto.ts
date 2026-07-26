/**
 * Gate 3.8 · Pass 3.8.1 — onboarding summary DTO (v1).
 */
import type { OnboardingStepKey } from "../../contracts";
import type { TenantOnboardingState } from "../../state-machine";
import type { OnboardingInvitationStatus } from "./admin-invitation.dto";
import type {
  ReadinessEvaluationStatus,
  ReadinessOverallStatus,
} from "./onboarding-readiness.dto";

export interface TenantOnboardingSummaryDTO {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantCode: string | null;
  state: TenantOnboardingState;
  /** 0–100, server-computed. */
  progressPercent: number;
  currentStepKey: OnboardingStepKey | null;
  blockerCount: number;
  /** Sanitized single-line summary of the highest-precedence blocker. */
  blockerSummary: string | null;
  invitationStatus: OnboardingInvitationStatus | "none";
  readinessEvaluationStatus: ReadinessEvaluationStatus;
  readinessOverallStatus: ReadinessOverallStatus | null;
  startedAt: string | null;
  updatedAt: string;
  readyAt: string | null;
  activatedAt: string | null;
  /**
   * Pass 3.8.2 synthetic-identity contract: `false` when no
   * `tenant_onboarding` row exists yet. Such a workflow is projected as
   * `not_started` with NO fabricated id, version or timestamps.
   */
  persisted: boolean;
}
