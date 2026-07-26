/**
 * Gate 3.8 · Pass 3.8.1 — onboarding detail DTO (v1).
 */
import type { OnboardingTransitionIntent } from "../../state-machine";
import type { TenantAdminInvitationDTO } from "./admin-invitation.dto";
import type { TenantAdminMembershipDTO } from "./admin-membership.dto";
import type { OnboardingBranchDTO } from "./onboarding-branch.dto";
import type { OnboardingOrganizationDTO } from "./onboarding-organization.dto";
import type {
  TenantOnboardingBlockerDTO,
  TenantOnboardingProgressDTO,
} from "./onboarding-progress.dto";
import type { TenantOnboardingReadinessDTO } from "./onboarding-readiness.dto";
import type { TenantOnboardingStepDTO } from "./onboarding-step.dto";
import type { TenantOnboardingSummaryDTO } from "./onboarding-summary.dto";

export interface OnboardingAvailableActionDTO {
  intent: OnboardingTransitionIntent;
  label: string;
  enabled: boolean;
  /** Sanitized reason shown when `enabled` is false. */
  disabledReason: string | null;
}

export interface TenantOnboardingDetailDTO {
  summary: TenantOnboardingSummaryDTO;
  organization: OnboardingOrganizationDTO | null;
  primaryBranch: OnboardingBranchDTO | null;
  adminInvitation: TenantAdminInvitationDTO | null;
  adminMembership: TenantAdminMembershipDTO | null;
  steps: TenantOnboardingStepDTO[];
  progress: TenantOnboardingProgressDTO;
  blockers: TenantOnboardingBlockerDTO[];
  readiness: TenantOnboardingReadinessDTO;
  availableActions: OnboardingAvailableActionDTO[];
  /**
   * Optimistic-concurrency token for future command calls. `null` when the
   * workflow is not persisted yet (Pass 3.8.2 synthetic-identity contract) —
   * a non-persisted workflow has no version to guard.
   */
  version: number | null;
  /** `false` when no `tenant_onboarding` row exists for the tenant. */
  persisted: boolean;
}
