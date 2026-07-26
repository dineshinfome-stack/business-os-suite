/**
 * SPR-MOD-001-003 · Gate 3.6 — Multi-Tenant Lifecycle Management
 *
 * Pure operational lifecycle state machine. Mirrors
 * `private.fn_assert_lifecycle_transition` (post-3.6 matrix). The database is
 * the enforcer; this module gives client + server one shared truth for gating.
 *
 * This module is INDEPENDENT of provisioning: provisioning drives a job's
 * state, lifecycle drives a tenant's operational state.
 */
import { PERMISSIONS, type PermissionKey } from "@/lib/generated/permission-keys";

export const TENANT_LIFECYCLE_STATES = [
  "created",
  "active",
  "suspended",
  "maintenance",
  "archived",
  "pending_deletion",
  "deleted",
] as const;

export type TenantLifecycleState = (typeof TENANT_LIFECYCLE_STATES)[number];

/** Terminal state — no outbound transitions. Physical purge is deferred. */
export const TERMINAL_STATES: ReadonlySet<TenantLifecycleState> = new Set([
  "deleted",
]);

/** Transition matrix — must stay identical to the DB matrix. */
const ALLOWED: Record<TenantLifecycleState, ReadonlySet<TenantLifecycleState>> = {
  created: new Set(["active"]),
  active: new Set(["suspended", "archived", "maintenance"]),
  suspended: new Set(["active", "archived"]),
  maintenance: new Set(["active", "suspended", "archived"]),
  archived: new Set(["active", "pending_deletion"]),
  pending_deletion: new Set(["archived", "deleted"]),
  deleted: new Set([]),
};

export function canTransition(
  from: TenantLifecycleState,
  to: TenantLifecycleState,
): boolean {
  if (from === to) return false;
  return ALLOWED[from].has(to);
}

export function assertTransition(
  from: TenantLifecycleState,
  to: TenantLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal tenant lifecycle transition: ${from} -> ${to}`);
  }
}

export function nextStates(
  from: TenantLifecycleState,
): readonly TenantLifecycleState[] {
  return [...ALLOWED[from]];
}

export function isTerminal(state: TenantLifecycleState): boolean {
  return TERMINAL_STATES.has(state);
}

// ── Operations ───────────────────────────────────────────────────────────
export const LIFECYCLE_OPERATIONS = [
  "enter_maintenance",
  "exit_maintenance",
  "restore",
  "schedule_deletion",
  "cancel_deletion",
  "delete",
] as const;

export type LifecycleOperation = (typeof LIFECYCLE_OPERATIONS)[number];

export interface LifecycleOperationSpec {
  readonly operation: LifecycleOperation;
  readonly label: string;
  readonly target: TenantLifecycleState;
  readonly permission: PermissionKey;
  /** States the operation may be invoked from. */
  readonly from: readonly TenantLifecycleState[];
  readonly requiresReason: boolean;
  readonly destructive: boolean;
}

export const OPERATION_SPECS: Record<LifecycleOperation, LifecycleOperationSpec> = {
  enter_maintenance: {
    operation: "enter_maintenance",
    label: "Enter maintenance",
    target: "maintenance",
    permission: PERMISSIONS.PLATFORM_TENANT_MAINTENANCE,
    from: ["active"],
    requiresReason: true,
    destructive: false,
  },
  exit_maintenance: {
    operation: "exit_maintenance",
    label: "Exit maintenance",
    target: "active",
    permission: PERMISSIONS.PLATFORM_TENANT_MAINTENANCE,
    from: ["maintenance"],
    requiresReason: false,
    destructive: false,
  },
  restore: {
    operation: "restore",
    label: "Restore tenant",
    target: "active",
    permission: PERMISSIONS.PLATFORM_TENANT_RESTORE,
    from: ["archived"],
    requiresReason: false,
    destructive: false,
  },
  schedule_deletion: {
    operation: "schedule_deletion",
    label: "Schedule deletion",
    target: "pending_deletion",
    permission: PERMISSIONS.PLATFORM_TENANT_DELETE_SCHEDULE,
    from: ["archived"],
    requiresReason: true,
    destructive: true,
  },
  cancel_deletion: {
    operation: "cancel_deletion",
    label: "Cancel deletion",
    target: "archived",
    permission: PERMISSIONS.PLATFORM_TENANT_DELETE_SCHEDULE,
    from: ["pending_deletion"],
    requiresReason: true,
    destructive: false,
  },
  delete: {
    operation: "delete",
    label: "Delete tenant",
    target: "deleted",
    permission: PERMISSIONS.PLATFORM_TENANT_DELETE,
    from: ["pending_deletion"],
    requiresReason: true,
    destructive: true,
  },
};

/** Operation is structurally available from `state` (permissions checked separately). */
export function isOperationAvailable(
  operation: LifecycleOperation,
  state: TenantLifecycleState,
): boolean {
  const spec = OPERATION_SPECS[operation];
  return spec.from.includes(state) && canTransition(state, spec.target);
}

export function availableOperations(
  state: TenantLifecycleState,
): readonly LifecycleOperationSpec[] {
  return LIFECYCLE_OPERATIONS.filter((op) => isOperationAvailable(op, state)).map(
    (op) => OPERATION_SPECS[op],
  );
}

// ── Presentation helpers ─────────────────────────────────────────────────
export const STATE_LABELS: Record<TenantLifecycleState, string> = {
  created: "Created",
  active: "Active",
  suspended: "Suspended",
  maintenance: "Maintenance",
  archived: "Archived",
  pending_deletion: "Pending deletion",
  deleted: "Deleted",
};

export type StateTone = "neutral" | "positive" | "warning" | "danger";

export const STATE_TONES: Record<TenantLifecycleState, StateTone> = {
  created: "neutral",
  active: "positive",
  suspended: "warning",
  maintenance: "warning",
  archived: "neutral",
  pending_deletion: "danger",
  deleted: "danger",
};

export const DEFAULT_RETENTION_DAYS = 90;

export function isLifecycleState(value: string): value is TenantLifecycleState {
  return (TENANT_LIFECYCLE_STATES as readonly string[]).includes(value);
}
