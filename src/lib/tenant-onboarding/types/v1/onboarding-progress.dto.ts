/**
 * Gate 3.8 · Pass 3.8.1 — progress + blocker DTOs (v1).
 */
import type { OnboardingStepKey } from "../../contracts";

export interface TenantOnboardingProgressDTO {
  completedSteps: number;
  applicableSteps: number;
  skippedSteps: number;
  blockedSteps: number;
  failedSteps: number;
  /** 0–100, server-computed. */
  percent: number;
  currentStepKey: OnboardingStepKey | null;
}

export type OnboardingBlockerSeverity = "blocker" | "warning";

export interface TenantOnboardingBlockerDTO {
  /** Stable synthetic id: `${stepKey ?? reasonCode}:${reasonCode}`. */
  id: string;
  severity: OnboardingBlockerSeverity;
  stepKey: OnboardingStepKey | null;
  /** Stable machine reason code. */
  reasonCode: string;
  /** Safe structured values only — no raw payloads. */
  reasonParams: Record<string, string | number | boolean>;
  /** Sanitized operator explanation. */
  explanation: string;
  owningModule: string;
  deepLink: string | null;
  detectedAt: string;
}
