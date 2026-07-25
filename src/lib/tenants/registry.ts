/**
 * SPR-MOD-001-001 Phase 2 — Tenant Registry validators.
 *
 * Registry OWNS metadata only. Provisioning infrastructure fields
 * (dedicated_database_ref, subscription_ref) are opaque handles owned by
 * the Provisioning Engine (Phase 3) — validated as free strings here.
 */
import { z } from "zod";

// Case-insensitive short business code, e.g. "ACME", "acme-01".
export const TenantCodeSchema = z
  .string()
  .trim()
  .min(2)
  .max(32)
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*[A-Za-z0-9]$/, {
    message: "Code must be 2–32 chars: letters, digits, . _ -; edges alphanumeric",
  });

// RFC-5321-ish; keep permissive, Postgres CITEXT is not used here.
export const EmailSchema = z.string().trim().email().max(320);

// E.164-ish, permissive: digits, spaces, +, -, parens.
export const PhoneSchema = z
  .string()
  .trim()
  .min(4)
  .max(32)
  .regex(/^[+()\-.\s0-9]+$/, { message: "Invalid phone number" });

// Bare hostname, no scheme, no path.
export const DomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(253)
  .regex(
    /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/,
    { message: "Invalid domain" },
  );

export const ProvisioningStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "provisioned",
  "failed",
]);

const nullableString = (schema: z.ZodString) =>
  schema.nullish().transform((v) => (v === "" || v == null ? null : v));

/** Fields the Registry can patch. Lifecycle fields are excluded on purpose. */
export const UpdateTenantMetadataSchema = z
  .object({
    displayName: z.string().trim().min(1).max(200).optional(),
    region: z.string().trim().min(1).max(64).optional(),
    defaultLocale: z.string().trim().min(2).max(16).optional(),
    timezone: z.string().trim().min(1).max(64).optional(),
    planTier: z.string().trim().min(1).max(32).optional(),
    code: nullableString(TenantCodeSchema).optional(),
    primaryContactName: nullableString(z.string().trim().min(1).max(200)).optional(),
    primaryContactEmail: nullableString(EmailSchema).optional(),
    primaryContactPhone: nullableString(PhoneSchema).optional(),
    billingEmail: nullableString(EmailSchema).optional(),
    primaryDomain: nullableString(DomainSchema).optional(),
    notes: nullableString(z.string().trim().max(2000)).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateTenantMetadataInput = z.infer<typeof UpdateTenantMetadataSchema>;

export const SearchTenantsSchema = z
  .object({
    query: z.string().trim().max(200).optional(),
    lifecycleState: z
      .enum(["created", "active", "suspended", "archived"])
      .optional(),
    provisioningStatus: ProvisioningStatusSchema.optional(),
    limit: z.number().int().min(1).max(200).default(50),
    offset: z.number().int().min(0).default(0),
  })
  .strict();

export type SearchTenantsInput = z.infer<typeof SearchTenantsSchema>;

/** Map camelCase patch keys → snake_case DB columns. Registry columns only. */
export function toTenantColumnPatch(
  input: UpdateTenantMetadataInput,
): Record<string, string | null> {
  const map: Record<keyof UpdateTenantMetadataInput, string> = {
    displayName: "display_name",
    region: "region",
    defaultLocale: "default_locale",
    timezone: "timezone",
    planTier: "plan_tier",
    code: "code",
    primaryContactName: "primary_contact_name",
    primaryContactEmail: "primary_contact_email",
    primaryContactPhone: "primary_contact_phone",
    billingEmail: "billing_email",
    primaryDomain: "primary_domain",
    notes: "notes",
  };
  const out: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    out[map[k as keyof UpdateTenantMetadataInput]] = v as string | null;
  }
  return out;
}
