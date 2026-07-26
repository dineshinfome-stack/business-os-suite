/**
 * SPR-MOD-001-002 — Phase 3 Gate 3.1 · Provisioning validators (pure).
 *
 * Validators never throw and never perform I/O; callers pass already-loaded
 * facts. Slug rules are reused from `src/lib/tenants/slug.ts`.
 */
import { isValidSlug } from "@/lib/tenants/slug";
import type { TenantLifecycleState } from "@/lib/tenants/lifecycle";
import { canTransition, type ProvisioningState } from "./lifecycle";
import { validationError, type ValidationError } from "./errors";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const ok: ValidationResult = { valid: true, errors: [] };
const fail = (e: ValidationError): ValidationResult => ({ valid: false, errors: [e] });

/** Tenant code: 2–16 chars, uppercase alphanumerics plus dash/underscore. */
const TENANT_CODE_FORMAT = /^[A-Z0-9][A-Z0-9_-]{0,14}[A-Z0-9]$/;

export interface TenantFacts {
  id?: string | null;
  slug?: string | null;
  code?: string | null;
  lifecycle_state?: TenantLifecycleState | null;
}

export function validateTenantExists(tenant: TenantFacts | null | undefined): ValidationResult {
  if (!tenant || !tenant.id) {
    return fail(validationError("tenant_not_found", "Tenant does not exist."));
  }
  return ok;
}

export function validateTenantActive(tenant: TenantFacts): ValidationResult {
  if (tenant.lifecycle_state !== "active") {
    return fail(
      validationError("tenant_not_active", "Tenant must be active to be provisioned.", {
        lifecycle_state: tenant.lifecycle_state ?? null,
      }),
    );
  }
  return ok;
}

export function validateTenantNotArchived(tenant: TenantFacts): ValidationResult {
  if (tenant.lifecycle_state === "archived") {
    return fail(
      validationError("tenant_archived", "Archived tenants cannot be provisioned."),
    );
  }
  return ok;
}

export function validateNoActiveJob(activeJobCount: number): ValidationResult {
  if (activeJobCount > 0) {
    return fail(
      validationError("active_job_exists", "Tenant already has a provisioning job in flight.", {
        active_job_count: activeJobCount,
      }),
    );
  }
  return ok;
}

export function validateSlug(slug: string | null | undefined): ValidationResult {
  if (!slug || !isValidSlug(slug)) {
    return fail(validationError("invalid_slug", "Tenant slug is not valid.", { slug: slug ?? null }));
  }
  return ok;
}

export function validateTenantCode(code: string | null | undefined): ValidationResult {
  if (!code || !TENANT_CODE_FORMAT.test(code)) {
    return fail(
      validationError("invalid_tenant_code", "Tenant code is not valid.", { code: code ?? null }),
    );
  }
  return ok;
}

export interface ProviderConfigFacts {
  providerKey?: string | null;
  region?: string | null;
  supportedRegions?: readonly string[];
  credentialsRef?: { name?: string | null } | null;
}

export function validateProviderConfiguration(cfg: ProviderConfigFacts): ValidationResult {
  const errors: ValidationError[] = [];
  if (!cfg.providerKey) {
    errors.push(validationError("provider_missing", "No provisioning provider configured."));
  }
  if (!cfg.region) {
    errors.push(validationError("provider_region_missing", "Provider region is required."));
  } else if (cfg.supportedRegions && !cfg.supportedRegions.includes(cfg.region)) {
    errors.push(
      validationError("provider_region_unsupported", "Region is not supported by the provider.", {
        region: cfg.region,
      }),
    );
  }
  if (!cfg.credentialsRef?.name) {
    errors.push(
      validationError("provider_credentials_missing", "Provider credential reference is required."),
    );
  }
  return errors.length ? { valid: false, errors } : ok;
}

export function validateStateTransition(
  from: ProvisioningState,
  to: ProvisioningState,
): ValidationResult {
  if (!canTransition(from, to)) {
    return fail(
      validationError("illegal_transition", `Illegal provisioning transition: ${from} -> ${to}`, {
        from,
        to,
      }),
    );
  }
  return ok;
}

/** Aggregate eligibility check — combines every precondition for a new job. */
export function validateTenantEligible(input: {
  tenant: TenantFacts | null | undefined;
  activeJobCount: number;
  providerConfig?: ProviderConfigFacts;
}): ValidationResult {
  const exists = validateTenantExists(input.tenant);
  if (!exists.valid) return exists;

  const tenant = input.tenant as TenantFacts;
  const results = [
    validateTenantNotArchived(tenant),
    validateTenantActive(tenant),
    validateSlug(tenant.slug),
    validateTenantCode(tenant.code),
    validateNoActiveJob(input.activeJobCount),
    ...(input.providerConfig ? [validateProviderConfiguration(input.providerConfig)] : []),
  ];

  const errors = results.flatMap((r) => r.errors);
  return errors.length ? { valid: false, errors } : ok;
}
