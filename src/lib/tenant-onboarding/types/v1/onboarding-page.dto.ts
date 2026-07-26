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
