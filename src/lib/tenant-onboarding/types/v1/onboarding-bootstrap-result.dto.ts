/**
 * Gate 3.8 · Pass 3.8.3 — bootstrap command result DTO (v1, additive).
 *
 * A bootstrap command coordinates a domain write (organization, branch,
 * settings, financial year) and then records the onboarding step. The result
 * carries the onboarding action outcome plus the identifier of the domain
 * entity the command created or adopted. No row shapes, no raw errors.
 */
import type { OnboardingActionResultDTO } from "./onboarding-action-result.dto";

export interface OnboardingBootstrapResultDTO extends OnboardingActionResultDTO {
  /** Domain entity created or adopted by the command; null when none. */
  entityId: string | null;
  /** Recorded step status after the command. */
  stepStatus:
    | "not_started"
    | "in_progress"
    | "completed"
    | "blocked"
    | "failed"
    | "skipped"
    | null;
}
