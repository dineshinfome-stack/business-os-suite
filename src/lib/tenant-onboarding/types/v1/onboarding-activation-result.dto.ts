/**
 * Gate 3.8 · Pass 3.8.1 — activation result DTO (v1).
 */
import type { TenantOnboardingState } from "../../state-machine";

export interface OnboardingActivationResultDTO {
  ok: boolean;
  tenantId: string;
  state: TenantOnboardingState | null;
  activatedAt: string | null;
  /** True when the tenant lifecycle `created → active` transition was applied. */
  lifecycleTransitionApplied: boolean;
  /** True when activation was a no-op replay of an earlier successful run. */
  idempotentReplay: boolean;
  blockingCount: number;
  warningCount: number;
  reasonCode: string | null;
  message: string;
  correlationId: string;
}
