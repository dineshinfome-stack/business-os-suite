/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Provisioning lifecycle state machine (pure).
 *
 * Mirrors the `public.provisioning_job_state` enum. The database is the ultimate
 * enforcer of persisted state; this module lets client + server share one truth.
 *
 * Mirrors the structure of `src/lib/tenants/lifecycle.ts` by design — do not
 * invent a second state-machine pattern.
 */

export const PROVISIONING_STATES = [
  "pending",
  "validating",
  "queued",
  "provisioning_infrastructure",
  "running_migrations",
  "seeding",
  "creating_admin",
  "verifying",
  "completed",
  "failed",
  "retrying",
  "rolled_back",
  "cancelled",
] as const;

export type ProvisioningState = (typeof PROVISIONING_STATES)[number];

/** Happy-path ordering used by `nextState`. */
export const PROVISIONING_HAPPY_PATH = [
  "pending",
  "validating",
  "queued",
  "provisioning_infrastructure",
  "running_migrations",
  "seeding",
  "creating_admin",
  "verifying",
  "completed",
] as const satisfies readonly ProvisioningState[];

const IN_FLIGHT: readonly ProvisioningState[] = [
  "validating",
  "queued",
  "provisioning_infrastructure",
  "running_migrations",
  "seeding",
  "creating_admin",
  "verifying",
];

/** Allowed forward transitions per ADR-018. */
export const ALLOWED_TRANSITIONS: Readonly<
  Record<ProvisioningState, ReadonlySet<ProvisioningState>>
> = Object.freeze({
  pending: new Set<ProvisioningState>(["validating", "cancelled", "failed"]),
  validating: new Set<ProvisioningState>(["queued", "failed", "cancelled"]),
  queued: new Set<ProvisioningState>([
    "provisioning_infrastructure",
    "failed",
    "cancelled",
  ]),
  provisioning_infrastructure: new Set<ProvisioningState>([
    "running_migrations",
    "failed",
    "retrying",
    "cancelled",
  ]),
  running_migrations: new Set<ProvisioningState>([
    "seeding",
    "failed",
    "retrying",
    "cancelled",
  ]),
  seeding: new Set<ProvisioningState>([
    "creating_admin",
    "failed",
    "retrying",
    "cancelled",
  ]),
  creating_admin: new Set<ProvisioningState>([
    "verifying",
    "failed",
    "retrying",
    "cancelled",
  ]),
  verifying: new Set<ProvisioningState>([
    "completed",
    "failed",
    "retrying",
    "cancelled",
  ]),
  // Retrying re-enters any in-flight step, or gives up.
  retrying: new Set<ProvisioningState>([...IN_FLIGHT, "failed", "cancelled"]),
  // Failed may be retried or rolled back; it is not terminal on its own.
  failed: new Set<ProvisioningState>(["retrying", "rolled_back", "cancelled"]),
  completed: new Set<ProvisioningState>([]),
  rolled_back: new Set<ProvisioningState>([]),
  cancelled: new Set<ProvisioningState>([]),
});

const TERMINAL: ReadonlySet<ProvisioningState> = new Set<ProvisioningState>([
  "completed",
  "rolled_back",
  "cancelled",
]);

const FAILURE: ReadonlySet<ProvisioningState> = new Set<ProvisioningState>([
  "failed",
  "retrying",
  "rolled_back",
  "cancelled",
]);

export function isProvisioningState(value: string): value is ProvisioningState {
  return (PROVISIONING_STATES as readonly string[]).includes(value);
}

export function canTransition(from: ProvisioningState, to: ProvisioningState): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].has(to);
}

export function assertTransition(from: ProvisioningState, to: ProvisioningState): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal provisioning lifecycle transition: ${from} -> ${to}`);
  }
}

/** Terminal = no outgoing transitions remain. */
export function isTerminal(state: ProvisioningState): boolean {
  return TERMINAL.has(state);
}

/** Failure = the job left the happy path (includes recoverable failure states). */
export function isFailure(state: ProvisioningState): boolean {
  return FAILURE.has(state);
}

/** The next happy-path state, or `null` when there is none. */
export function nextState(state: ProvisioningState): ProvisioningState | null {
  const path = PROVISIONING_HAPPY_PATH as readonly ProvisioningState[];
  const i = path.indexOf(state);
  if (i < 0 || i === path.length - 1) return null;
  return path[i + 1];
}
