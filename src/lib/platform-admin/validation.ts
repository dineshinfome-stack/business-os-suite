/**
 * Gate 3.7 · Platform settings & feature-control REGISTRY + validation.
 *
 * ── Registry ownership contract ───────────────────────────────────────────
 * Every platform setting surfaced by the administration console MUST declare:
 *   owner            – the subsystem responsible for the value
 *   validation rule  – type + bounds/enum, enforced server-side
 *   default          – fallback when no stored value exists
 *   mutability       – editable | read-only-system | read-only-environment |
 *                      engine-owned
 *   auditRequired    – always true for editable entries
 *   sourceOfTruth    – where the authoritative value lives
 *
 * A key that is absent from this registry is REJECTED by the command layer.
 * This file is browser-safe (pure data + pure functions) so the UI can render
 * labels and input affordances without a second source of truth.
 */
import type {
  PlatformSettingMutability,
  PlatformSurfaceOwner,
} from "@/modules/platform/administration/types";

export interface PlatformSettingSpec {
  key: string;
  label: string;
  description: string;
  category: string;
  owner: PlatformSurfaceOwner;
  dataType: "string" | "number" | "boolean" | "enum";
  defaultValue: string | number | boolean | null;
  allowedValues?: string[];
  min?: number;
  max?: number;
  mutability: PlatformSettingMutability;
  auditRequired: boolean;
  sourceOfTruth: string;
  /** Rendered on the Policies surface in addition to Settings. */
  isPolicy?: boolean;
  policyNote?: string;
}

export const PLATFORM_SETTING_REGISTRY: readonly PlatformSettingSpec[] = [
  {
    key: "platform.default_tenant_region",
    label: "Default tenant region",
    description: "Region pre-selected when provisioning a new tenant.",
    category: "tenancy",
    owner: "platform-admin",
    dataType: "enum",
    defaultValue: "us-east-1",
    allowedValues: [
      "us-east-1",
      "us-west-1",
      "eu-central-1",
      "eu-west-2",
      "ap-south-1",
      "ap-southeast-1",
      "me-central-1",
    ],
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
    isPolicy: true,
  },
  {
    key: "platform.default_locale",
    label: "Default locale",
    description: "Locale applied to newly created tenants.",
    category: "tenancy",
    owner: "platform-admin",
    dataType: "enum",
    defaultValue: "en-IN",
    allowedValues: ["en-IN", "en-GB", "en-US", "ar-AE"],
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
  },
  {
    key: "platform.default_timezone",
    label: "Default timezone",
    description: "Timezone applied to newly created tenants.",
    category: "tenancy",
    owner: "platform-admin",
    dataType: "string",
    defaultValue: "Asia/Kolkata",
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
  },
  {
    key: "platform.default_plan_tier",
    label: "Default plan tier",
    description: "Plan tier assigned to a tenant at creation.",
    category: "tenancy",
    owner: "platform-admin",
    dataType: "enum",
    defaultValue: "standard",
    allowedValues: ["trial", "standard", "professional", "enterprise"],
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
  },
  {
    key: "platform.maintenance_display_threshold_days",
    label: "Maintenance attention threshold (days)",
    description:
      "A tenant in maintenance longer than this appears in the attention queue.",
    category: "operations",
    owner: "tenant-lifecycle",
    dataType: "number",
    defaultValue: 7,
    min: 1,
    max: 90,
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
    isPolicy: true,
  },
  {
    key: "platform.long_running_job_threshold_minutes",
    label: "Long-running job threshold (minutes)",
    description:
      "A provisioning job running longer than this appears in the attention queue.",
    category: "operations",
    owner: "provisioning",
    dataType: "number",
    defaultValue: 30,
    min: 5,
    max: 1440,
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
    isPolicy: true,
  },
  {
    key: "platform.soft_delete_retention_days",
    label: "Soft-delete retention (days)",
    description:
      "Default retention window applied when a tenant deletion is scheduled.",
    category: "operations",
    owner: "tenant-lifecycle",
    dataType: "number",
    defaultValue: 90,
    min: 7,
    max: 365,
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
    isPolicy: true,
    policyNote:
      "Applied at scheduling time. Existing markers keep the value captured when they were scheduled.",
  },
  {
    key: "platform.support_contact",
    label: "Operational support contact",
    description: "Contact surfaced to operators on failure screens.",
    category: "operations",
    owner: "platform-admin",
    dataType: "string",
    defaultValue: "",
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
  },
  {
    key: "platform.tenant_creation_open",
    label: "Tenant creation enabled",
    description: "When disabled, operators cannot start new tenant provisioning.",
    category: "policy",
    owner: "platform-admin",
    dataType: "boolean",
    defaultValue: true,
    mutability: "editable",
    auditRequired: true,
    sourceOfTruth: "setting_values (platform scope)",
    isPolicy: true,
  },
  /* ---------------- engine-owned / environment-owned (display only) ------- */
  {
    key: "platform.export_row_limit",
    label: "Export row limit",
    description: "Maximum rows returned by any administrative CSV export.",
    category: "operations",
    owner: "platform-admin",
    dataType: "number",
    defaultValue: 5000,
    mutability: "read-only-system",
    auditRequired: false,
    sourceOfTruth: "EXPORT_ROW_LIMIT constant",
    isPolicy: true,
  },
  {
    key: "provisioning.retry_policy",
    label: "Provisioning retry policy",
    description: "Attempt ceiling and backoff owned by the retry engine.",
    category: "provisioning",
    owner: "provisioning",
    dataType: "string",
    defaultValue: null,
    mutability: "engine-owned",
    auditRequired: false,
    sourceOfTruth: "src/lib/provisioning/retry.ts",
    isPolicy: true,
    policyNote: "Displayed for transparency. Gate 3.7 does not mutate it.",
  },
  {
    key: "provisioning.rollback_policy",
    label: "Provisioning rollback eligibility",
    description: "Rollback eligibility rules owned by the rollback engine.",
    category: "provisioning",
    owner: "provisioning",
    dataType: "string",
    defaultValue: null,
    mutability: "engine-owned",
    auditRequired: false,
    sourceOfTruth: "src/lib/provisioning/rollback.ts",
    isPolicy: true,
    policyNote: "Displayed for transparency. Gate 3.7 does not mutate it.",
  },
  {
    key: "provisioning.provider_default_region",
    label: "Provider default region",
    description: "Deployment-managed default region for the Supabase provider.",
    category: "provisioning",
    owner: "provisioning",
    dataType: "string",
    defaultValue: null,
    mutability: "read-only-environment",
    auditRequired: false,
    sourceOfTruth: "SUPABASE_DEFAULT_REGION environment variable",
    isPolicy: true,
  },
] as const;

const BY_KEY = new Map(PLATFORM_SETTING_REGISTRY.map((s) => [s.key, s]));

export function findSettingSpec(key: string): PlatformSettingSpec | undefined {
  return BY_KEY.get(key);
}

export function isEditableSetting(key: string): boolean {
  return findSettingSpec(key)?.mutability === "editable";
}

export const POLICY_SPECS = PLATFORM_SETTING_REGISTRY.filter((s) => s.isPolicy);

/* --------------------------------------------------------------- features */

export interface PlatformFeatureSpec {
  key: string;
  displayName: string;
  description: string;
  mutability: PlatformSettingMutability;
}

/**
 * Allow-listed platform-scope feature controls. Keys outside this list are
 * rejected — the browser can never toggle an arbitrary flag.
 */
export const PLATFORM_FEATURE_REGISTRY: readonly PlatformFeatureSpec[] = [
  {
    key: "platform.provisioning_console",
    displayName: "Provisioning console",
    description: "Enables the tenant provisioning console for operators.",
    mutability: "editable",
  },
  {
    key: "platform.lifecycle_console",
    displayName: "Tenant lifecycle console",
    description: "Enables operational lifecycle actions on tenants.",
    mutability: "editable",
  },
  {
    key: "platform.attention_queue",
    displayName: "Attention queue",
    description: "Surfaces derived operator attention items.",
    mutability: "editable",
  },
  {
    key: "platform.audit_explorer",
    displayName: "Global audit explorer",
    description: "Enables the platform-wide audit explorer and CSV export.",
    mutability: "editable",
  },
  {
    key: "platform.notification_operations",
    displayName: "Notification operations",
    description: "Enables the read-only notification operations surface.",
    mutability: "editable",
  },
] as const;

const FEATURE_BY_KEY = new Map(PLATFORM_FEATURE_REGISTRY.map((f) => [f.key, f]));

export function findFeatureSpec(key: string): PlatformFeatureSpec | undefined {
  return FEATURE_BY_KEY.get(key);
}

/* -------------------------------------------------------------- validation */

export type SettingPrimitive = string | number | boolean;

export interface ValidationOk {
  ok: true;
  value: SettingPrimitive;
}
export interface ValidationFail {
  ok: false;
  error: string;
}
export type ValidationResult = ValidationOk | ValidationFail;

/**
 * Validates an incoming (key, value) pair against the registry.
 * Rejects unknown keys, non-editable keys, wrong types and out-of-range values.
 */
export function validateSettingChange(
  key: string,
  value: unknown,
): ValidationResult {
  const spec = findSettingSpec(key);
  if (!spec) return { ok: false, error: `Unknown platform setting: ${key}` };
  if (spec.mutability !== "editable") {
    return { ok: false, error: `Setting ${key} is ${spec.mutability}` };
  }

  switch (spec.dataType) {
    case "boolean":
      if (typeof value !== "boolean") {
        return { ok: false, error: `${key} expects a boolean` };
      }
      return { ok: true, value };
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return { ok: false, error: `${key} expects a number` };
      }
      if (spec.min != null && value < spec.min) {
        return { ok: false, error: `${key} must be at least ${spec.min}` };
      }
      if (spec.max != null && value > spec.max) {
        return { ok: false, error: `${key} must be at most ${spec.max}` };
      }
      return { ok: true, value };
    }
    case "enum": {
      if (typeof value !== "string") {
        return { ok: false, error: `${key} expects a string` };
      }
      if (!spec.allowedValues?.includes(value)) {
        return { ok: false, error: `${key} does not allow value "${value}"` };
      }
      return { ok: true, value };
    }
    case "string": {
      if (typeof value !== "string") {
        return { ok: false, error: `${key} expects a string` };
      }
      if (value.length > 200) {
        return { ok: false, error: `${key} exceeds 200 characters` };
      }
      return { ok: true, value };
    }
  }
}

export function validateFeatureChange(
  key: string,
  enabled: unknown,
): ValidationResult {
  const spec = findFeatureSpec(key);
  if (!spec) return { ok: false, error: `Unknown feature control: ${key}` };
  if (spec.mutability !== "editable") {
    return { ok: false, error: `Feature ${key} is ${spec.mutability}` };
  }
  if (typeof enabled !== "boolean") {
    return { ok: false, error: `${key} expects a boolean` };
  }
  return { ok: true, value: enabled };
}

/* ------------------------------------------------------- secret redaction */

const SECRET_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /api[_-]?key/i,
  /\bkey\b/i,
  /credential/i,
  /connection[_-]?string/i,
  /authorization/i,
  /bearer/i,
  /service[_-]?role/i,
];

/** True when a field name looks like it could carry a secret. */
export function isSecretShapedKey(name: string): boolean {
  return SECRET_PATTERNS.some((re) => re.test(name));
}
