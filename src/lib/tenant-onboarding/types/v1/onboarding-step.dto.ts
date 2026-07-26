/**
 * Gate 3.8 · Pass 3.8.1 — onboarding step DTO (v1).
 */
import type {
  OnboardingImplementationPass,
  OnboardingStepKey,
  OnboardingStepRequirement,
  OnboardingStepStatus,
} from "../../contracts";

export interface TenantOnboardingStepDTO {
  stepKey: OnboardingStepKey;
  label: string;
  sequence: number;
  status: OnboardingStepStatus;
  requirement: OnboardingStepRequirement;
  attemptCount: number;
  startedAt: string | null;
  completedAt: string | null;
  /** Stable machine code — never a raw exception. */
  failureCode: string | null;
  /** Sanitized operator-facing summary. */
  failureSummary: string | null;
  /** Action the operator may take next, when one is available. */
  availableAction: string | null;
  /** In-app destination in an owning console; never an external URL. */
  deepLink: string | null;
  implementationPass: OnboardingImplementationPass;
}
