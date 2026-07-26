/**
 * Gate 3.8 · Pass 3.8.1 — pagination + filter DTOs (v1).
 */
import type { OnboardingStepKey } from "../../contracts";
import type { TenantOnboardingState } from "../../state-machine";
import type { OnboardingInvitationStatus } from "./admin-invitation.dto";
import type { ReadinessOverallStatus } from "./onboarding-readiness.dto";

export interface OnboardingPageDTO<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface OnboardingListFilterDTO {
  search?: string;
  state?: TenantOnboardingState | "all";
  currentStep?: OnboardingStepKey | "all";
  hasBlockers?: boolean;
  invitationStatus?: OnboardingInvitationStatus | "none" | "all";
  readinessStatus?: ReadinessOverallStatus | "not_evaluated" | "all";
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "updatedAt" | "startedAt" | "tenantName" | "state";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

/**
 * Contract co-location closure (Pass 3.8.1 amendment).
 *
 * The governing spec names this contract `TenantOnboardingFilterDTO`; the
 * repository's canonical declaration is `OnboardingListFilterDTO`, co-located
 * with the pagination contract it parameterises. This is a TYPE-ONLY alias:
 * no duplicate interface and no runtime artifact is introduced.
 */
export type TenantOnboardingFilterDTO = OnboardingListFilterDTO;
