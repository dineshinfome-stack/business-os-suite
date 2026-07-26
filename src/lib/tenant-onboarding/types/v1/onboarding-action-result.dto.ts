/**
 * Gate 3.8 · Pass 3.8.1 — command result DTOs (v1).
 */
import type { TenantOnboardingState } from "../../state-machine";
import type { OnboardingStepKey } from "../../contracts";

export interface OnboardingActionResultDTO {
  ok: boolean;
  tenantId: string;
  stepKey: OnboardingStepKey | null;
  state: TenantOnboardingState | null;
  /** Stable machine reason code; null on success. */
  reasonCode: string | null;
  /** Sanitized operator message — never a raw error. */
  message: string;
  correlationId: string;
  /** New optimistic-concurrency token. */
  version: number | null;
}
