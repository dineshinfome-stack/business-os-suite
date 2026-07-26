/**
 * SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.1 (Architecture & Contracts)
 *
 * PURE Zod validation schemas for the future onboarding queries and commands.
 * Contracts only — no server function, no database, no environment access.
 * Strict objects: unknown keys are rejected.
 */
import { z } from "zod";

import { ONBOARDING_STEP_KEYS, ONBOARDING_STEP_STATUSES } from "./contracts";
import { TENANT_ONBOARDING_STATES } from "./state-machine";
import { ONBOARDING_REQUIRED_SETTINGS } from "./required-settings.registry";

/* ------------------------------------------------------------- primitives */

export const tenantIdSchema = z.string().uuid();
export const organizationIdSchema = z.string().uuid();
export const correlationIdSchema = z.string().min(8).max(128);
export const versionSchema = z.number().int().nonnegative();

export const onboardingStateSchema = z.enum(TENANT_ONBOARDING_STATES);
export const onboardingStepKeySchema = z.enum(ONBOARDING_STEP_KEYS);
export const onboardingStepStatusSchema = z.enum(ONBOARDING_STEP_STATUSES);

export const onboardingSettingKeySchema = z.enum(
  ONBOARDING_REQUIRED_SETTINGS.map((s) => s.key) as [string, ...string[]],
);

const isoDate = z.string().datetime({ offset: true });

/* ------------------------------------------------------------ query input */

export const onboardingPaginationSchema = z
  .object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(25),
  })
  .strict();

export const onboardingListFilterSchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    state: z.union([onboardingStateSchema, z.literal("all")]).optional(),
    currentStep: z.union([onboardingStepKeySchema, z.literal("all")]).optional(),
    hasBlockers: z.boolean().optional(),
    invitationStatus: z
      .enum(["pending", "accepted", "revoked", "expired", "none", "all"])
      .optional(),
    readinessStatus: z
      .enum([
        "not_ready",
        "ready_with_warnings",
        "ready",
        "not_evaluated",
        "all",
      ])
      .optional(),
    createdFrom: isoDate.optional(),
    createdTo: isoDate.optional(),
    sortBy: z.enum(["updatedAt", "startedAt", "tenantName", "state"]).optional(),
    sortDir: z.enum(["asc", "desc"]).optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
  })
  .strict()
  .refine(
    (v) =>
      !v.createdFrom ||
      !v.createdTo ||
      Date.parse(v.createdFrom) <= Date.parse(v.createdTo),
    { message: "createdFrom must be on or before createdTo", path: ["createdTo"] },
  );

export const onboardingDetailQuerySchema = z
  .object({ tenantId: tenantIdSchema })
  .strict();

/* ---------------------------------------------------------- command input */

const tenantScoped = { tenantId: tenantIdSchema, expectedVersion: versionSchema.optional() };

export const startOnboardingSchema = z.object({ ...tenantScoped }).strict();

export const resumeOnboardingSchema = z.object({ ...tenantScoped }).strict();

export const saveOrganizationProfileSchema = z
  .object({
    ...tenantScoped,
    /** Existing organization to adopt, when one already exists. */
    organizationId: organizationIdSchema.optional(),
    name: z.string().trim().min(2).max(160),
    legalName: z.string().trim().min(2).max(200).optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(63)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case"),
    region: z.string().trim().min(2).max(32).optional(),
    timezone: z.string().trim().min(1).max(64).optional(),
    defaultLocale: z.string().trim().min(2).max(16).optional(),
  })
  .strict();

export const createOrSelectBranchSchema = z
  .object({
    ...tenantScoped,
    organizationId: organizationIdSchema,
    branchId: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(160).optional(),
    code: z.string().trim().min(1).max(32).optional(),
    timezone: z.string().trim().min(1).max(64).optional(),
    setAsDefault: z.boolean().default(true),
  })
  .strict()
  .refine((v) => Boolean(v.branchId) || Boolean(v.name && v.code), {
    message: "Provide branchId, or both name and code",
    path: ["branchId"],
  });

export const assignRequiredRolesSchema = z
  .object({
    ...tenantScoped,
    organizationId: organizationIdSchema,
    /** Role names from the globally seeded catalogue — never created here. */
    roleNames: z.array(z.string().trim().min(1).max(64)).min(1).max(10),
  })
  .strict();

export const initializeSettingsSchema = z
  .object({
    ...tenantScoped,
    organizationId: organizationIdSchema,
    values: z
      .array(
        z
          .object({
            key: onboardingSettingKeySchema,
            value: z.union([z.string(), z.number(), z.boolean()]),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const initializeFinancialYearSchema = z
  .object({
    ...tenantScoped,
    organizationId: organizationIdSchema,
    code: z.string().trim().min(2).max(32),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    setAsDefault: z.boolean().default(true),
  })
  .strict()
  .refine((v) => Date.parse(v.startDate) < Date.parse(v.endDate), {
    message: "startDate must precede endDate",
    path: ["endDate"],
  });

export const runReadinessSchema = z.object({ ...tenantScoped }).strict();

export const activateWorkspaceSchema = z
  .object({
    ...tenantScoped,
    /** Operator acknowledgement of outstanding warning-level conditions. */
    acknowledgeWarnings: z.boolean().default(false),
  })
  .strict();

export const cancelOnboardingSchema = z
  .object({ ...tenantScoped, reason: z.string().trim().min(5).max(500) })
  .strict();

export const restartOnboardingSchema = z
  .object({ ...tenantScoped, reason: z.string().trim().min(5).max(500) })
  .strict();

/* -------------------------------------------------- settings registry spec */

export const onboardingSettingSpecSchema = z
  .object({
    key: z.string().min(3).max(120),
    owner: z.string().min(2).max(64),
    scope: z.enum(["platform", "organization"]),
    type: z.enum(["string", "integer", "boolean", "enum"]),
    validationSource: z.string().min(2),
    defaultSource: z.string().min(2),
    requirement: z.enum(["required", "conditional", "optional"]),
    editableDuringOnboarding: z.boolean(),
    sensitivity: z.enum(["sensitive", "non-sensitive"]),
    readinessImpact: z.enum(["block", "warning", "none"]),
    auditRequired: z.boolean(),
    sourceOfTruth: z.string().min(2),
    conditionNote: z.string().min(2).optional(),
  })
  .strict()
  .refine((v) => v.requirement !== "conditional" || Boolean(v.conditionNote), {
    message: "conditional entries must document conditionNote",
    path: ["conditionNote"],
  });
