/**
 * SPR-MOD-001-003 — Phase 3 Gate 3.2.1 · Lifecycle state ↔ step key map.
 *
 * Orchestration metadata only. Ordering and legality remain owned by
 * `lifecycle.ts` and `constants.ts`; nothing here redefines them.
 */
import { PROVISIONING_STEP_SEQUENCE } from "../constants";
import type { ProvisioningState } from "../lifecycle";
import type { ProvisioningStepKey } from "../types";

/** States that execute a provider-backed step. Other states are transitions only. */
const STATE_TO_STEP: Readonly<Partial<Record<ProvisioningState, ProvisioningStepKey>>> =
  Object.freeze({
    validating: "validate",
    provisioning_infrastructure: "create_project",
    running_migrations: "apply_migrations",
    seeding: "seed_database",
    creating_admin: "create_administrator",
    verifying: "verify_health",
  } as const);

const STEP_TO_STATE: Readonly<Record<ProvisioningStepKey, ProvisioningState>> =
  Object.freeze(
    Object.entries(STATE_TO_STEP).reduce<Record<string, ProvisioningState>>(
      (acc, [state, step]) => {
        acc[step as string] = state as ProvisioningState;
        return acc;
      },
      {},
    ),
  ) as Readonly<Record<ProvisioningStepKey, ProvisioningState>>;

/** The step executed while the job sits in `state`, or `null` for pure transitions. */
export function stepForState(state: ProvisioningState): ProvisioningStepKey | null {
  return STATE_TO_STEP[state] ?? null;
}

/** The lifecycle state during which `step` executes. */
export function stateForStep(step: ProvisioningStepKey): ProvisioningState {
  return STEP_TO_STATE[step];
}

export function sequenceForStep(step: ProvisioningStepKey): number {
  return PROVISIONING_STEP_SEQUENCE[step];
}

export function isStepState(state: ProvisioningState): boolean {
  return stepForState(state) !== null;
}
