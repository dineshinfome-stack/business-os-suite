/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.1 (Architecture & Contracts)
 *
 * Onboarding REQUIRED-SETTINGS REGISTRY (G38-POL-010).
 *
 * Allow-listed and repository-owned: a key absent from this registry MUST be
 * rejected by the Pass 3.8.3 command layer. Every entry below was verified
 * against `public.setting_definitions` during Pass 3.8.1; speculative keys are
 * documented as *proposed* in `PHASE3_GATE38_ONBOARDING_MATRIX.md` instead of
 * being added here.
 *
 * Purity contract: definitions only. No settings service calls, no database
 * imports, no environment reads, no value resolution.
 */

export type OnboardingSettingRequirement = "required" | "conditional" | "optional";

export type OnboardingSettingScope = "platform" | "organization";

export type OnboardingSettingType = "string" | "integer" | "boolean" | "enum";

export type OnboardingSettingReadinessImpact = "block" | "warning" | "none";

export interface OnboardingSettingSpec {
  key: string;
  /** Subsystem responsible for the value. */
  owner: string;
  scope: OnboardingSettingScope;
  type: OnboardingSettingType;
  /** Where the validation rule is enforced. */
  validationSource: string;
  /** Where the fallback value comes from. */
  defaultSource: string;
  requirement: OnboardingSettingRequirement;
  editableDuringOnboarding: boolean;
  sensitivity: "sensitive" | "non-sensitive";
  readinessImpact: OnboardingSettingReadinessImpact;
  auditRequired: boolean;
  sourceOfTruth: string;
  /** Present when `requirement === "conditional"`. */
  conditionNote?: string;
}

export const ONBOARDING_REQUIRED_SETTINGS: readonly OnboardingSettingSpec[] = [
  {
    key: "platform.locale.default_timezone",
    owner: "settings/locale",
    scope: "organization",
    type: "string",
    validationSource: "setting_definitions.validation_schema (required, max 64)",
    defaultSource: "setting_definitions.default_value (UTC)",
    requirement: "required",
    editableDuringOnboarding: true,
    sensitivity: "non-sensitive",
    readinessImpact: "block",
    auditRequired: true,
    sourceOfTruth: "setting_values (organization scope)",
  },
  {
    key: "platform.locale.default_language",
    owner: "settings/locale",
    scope: "organization",
    type: "enum",
    validationSource: "setting_definitions.validation_schema (enum)",
    defaultSource: "setting_definitions.default_value (en)",
    requirement: "required",
    editableDuringOnboarding: true,
    sensitivity: "non-sensitive",
    readinessImpact: "block",
    auditRequired: true,
    sourceOfTruth: "setting_values (organization scope)",
  },
  {
    key: "platform.branding.product_name",
    owner: "settings/branding",
    scope: "organization",
    type: "string",
    validationSource: "setting_definitions.validation_schema (required, 1..80)",
    defaultSource: "setting_definitions.default_value (Business OS)",
    requirement: "required",
    editableDuringOnboarding: true,
    sensitivity: "non-sensitive",
    readinessImpact: "block",
    auditRequired: true,
    sourceOfTruth: "setting_values (organization scope)",
  },
  {
    key: "platform.branding.support_email",
    owner: "settings/branding",
    scope: "organization",
    type: "string",
    validationSource: "setting_definitions.validation_schema (regex, max 255)",
    defaultSource: "setting_definitions.default_value (empty)",
    requirement: "optional",
    editableDuringOnboarding: true,
    sensitivity: "non-sensitive",
    readinessImpact: "none",
    auditRequired: true,
    sourceOfTruth: "setting_values (organization scope)",
  },
  {
    key: "platform.security.session_timeout_minutes",
    owner: "settings/security",
    scope: "organization",
    type: "integer",
    validationSource: "setting_definitions.validation_schema (5..1440)",
    defaultSource: "setting_definitions.default_value (60)",
    requirement: "optional",
    editableDuringOnboarding: true,
    sensitivity: "non-sensitive",
    readinessImpact: "none",
    auditRequired: true,
    sourceOfTruth: "setting_values (organization scope)",
  },
] as const;

const INDEX: ReadonlyMap<string, OnboardingSettingSpec> = new Map(
  ONBOARDING_REQUIRED_SETTINGS.map((s) => [s.key, s]),
);

export function isOnboardingSettingKey(value: unknown): boolean {
  return typeof value === "string" && INDEX.has(value);
}

export function getOnboardingSetting(
  key: string,
): OnboardingSettingSpec | undefined {
  return INDEX.get(key);
}

/** Keys whose absence blocks activation (see readiness matrix). */
export function blockingSettingKeys(): readonly string[] {
  return ONBOARDING_REQUIRED_SETTINGS.filter(
    (s) => s.readinessImpact === "block",
  ).map((s) => s.key);
}
